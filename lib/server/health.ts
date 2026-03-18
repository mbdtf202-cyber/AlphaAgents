import { getRepositoryBundle } from "./repositories";
import { checkDbConnection } from "./db";
import { getSentryConfig, getStorageMode, validateRuntimeConfig } from "./env";
import { getLatestServiceHeartbeat } from "./service-heartbeats";
import { setQueueBacklogGauge, setReadinessStateGauge, setWorkerHeartbeatAgeSecondsGauge } from "./metrics";

export const BENCHMARK_WORKER_SERVICE_NAME = "benchmark-worker";
const MAX_WORKER_HEARTBEAT_AGE_SECONDS = 90;
const MAX_QUEUED_REQUEST_AGE_SECONDS = 300;

export async function getHealthSnapshot() {
  return {
    status: "ok" as const,
    timestamp: new Date().toISOString(),
    storageMode: getStorageMode(),
    release: getSentryConfig().release ?? "development",
  };
}

export async function getReadinessSnapshot() {
  const checks: Record<string, unknown> = {};
  let ready = true;

  try {
    validateRuntimeConfig("web");
    checks.config = { ok: true };
  } catch (error) {
    ready = false;
    checks.config = { ok: false, error: error instanceof Error ? error.message : "invalid_config" };
  }

  if (getStorageMode() === "postgres") {
    try {
      await checkDbConnection();
      checks.database = { ok: true };
    } catch (error) {
      ready = false;
      checks.database = { ok: false, error: error instanceof Error ? error.message : "db_unavailable" };
    }

    const bundle = await getRepositoryBundle();
    const queued = await bundle.benchmarkRepository.listQueuedRequests();
    const queueBacklog = queued.length;
    const oldestQueuedAgeSeconds =
      queued.length > 0
        ? Math.max(
            ...queued.map((request) => Math.max(0, Math.floor((Date.now() - new Date(request.queuedAt).getTime()) / 1000))),
          )
        : 0;
    setQueueBacklogGauge(queueBacklog);
    checks.queue = {
      ok: oldestQueuedAgeSeconds <= MAX_QUEUED_REQUEST_AGE_SECONDS,
      backlog: queueBacklog,
      oldestQueuedAgeSeconds,
    };
    if (oldestQueuedAgeSeconds > MAX_QUEUED_REQUEST_AGE_SECONDS) {
      ready = false;
    }

    const heartbeat = await getLatestServiceHeartbeat(BENCHMARK_WORKER_SERVICE_NAME);
    const workerHeartbeatAgeSeconds = heartbeat
      ? Math.max(0, Math.floor((Date.now() - new Date(heartbeat.lastHeartbeatAt).getTime()) / 1000))
      : Number.POSITIVE_INFINITY;
    setWorkerHeartbeatAgeSecondsGauge(Number.isFinite(workerHeartbeatAgeSeconds) ? workerHeartbeatAgeSeconds : 0);
    checks.worker = {
      ok: heartbeat ? workerHeartbeatAgeSeconds <= MAX_WORKER_HEARTBEAT_AGE_SECONDS : false,
      lastHeartbeatAt: heartbeat?.lastHeartbeatAt ?? null,
      heartbeatAgeSeconds: Number.isFinite(workerHeartbeatAgeSeconds) ? workerHeartbeatAgeSeconds : null,
      instanceId: heartbeat?.instanceId ?? null,
    };
    if (!heartbeat || workerHeartbeatAgeSeconds > MAX_WORKER_HEARTBEAT_AGE_SECONDS) {
      ready = false;
    }
  }

  setReadinessStateGauge(ready ? 1 : 0);

  return {
    ready,
    timestamp: new Date().toISOString(),
    storageMode: getStorageMode(),
    checks,
  };
}
