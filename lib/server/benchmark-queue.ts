import { randomUUID } from "node:crypto";

import {
  enqueueBenchmarkJob,
  runDemoBenchmark,
  startBenchmarkWorker as startQueueWorker,
  stopBoss,
  type BenchmarkJob,
} from "@openclaw/alpha-agents-runner";
import type { BenchmarkRequestRecord } from "@openclaw/alpha-agents-core";

import { BENCHMARK_WORKER_SERVICE_NAME } from "./health";
import { logError, logEvent } from "./log";
import { incrementBenchmarkRequest, incrementBenchmarkRun } from "./metrics";
import { captureException, initializeMonitoring } from "./monitoring";
import { getDatabaseUrl, validateRuntimeConfig } from "./env";
import { getRepositoryBundle } from "./repositories";
import { upsertServiceHeartbeat } from "./service-heartbeats";

const WORKER_HEARTBEAT_INTERVAL_MS = 30_000;

export async function enqueuePersistedBenchmarkRequest(request: BenchmarkRequestRecord) {
  const queueJobId = await enqueueBenchmarkJob(getDatabaseUrl(), {
    requestId: request.id,
    agentSlug: request.agentSlug,
    suiteSlug: request.suiteSlug,
    versionId: request.versionId,
    objective: request.objective,
    initiatedBy: request.createdByUserId,
  });

  incrementBenchmarkRequest("queued");
  logEvent("info", "benchmark_request_enqueued", {
    requestId: request.id,
    queueJobId,
    agentSlug: request.agentSlug,
    suiteSlug: request.suiteSlug,
  });

  return queueJobId;
}

export async function processBenchmarkRequestJob(job: BenchmarkJob) {
  const bundle = await getRepositoryBundle();
  const claimed = await bundle.benchmarkRepository.claimQueuedRequest(job.requestId);
  if (!claimed) {
    logEvent("warn", "benchmark_request_claim_skipped", {
      requestId: job.requestId,
    });
    return null;
  }

  try {
    const run = runDemoBenchmark(job);
    const artifactBundle = {
      bundleHash: run.artifactBundle.bundleHash,
      transcriptUrl: run.artifactBundle.transcript,
      toolTraceUrl: run.artifactBundle.toolTrace.join("\n"),
      finalArtifactUrl: run.artifactBundle.finalArtifact,
      screenshotUrl: run.artifactBundle.screenshotPath,
      rubric: run.artifactBundle.rubric,
    };
    await bundle.benchmarkRepository.completeRequest(claimed.id, artifactBundle);
    incrementBenchmarkRun("completed");
    logEvent("info", "benchmark_request_completed", {
      requestId: claimed.id,
      agentSlug: claimed.agentSlug,
      suiteSlug: claimed.suiteSlug,
    });
    return artifactBundle;
  } catch (error) {
    const failureReason = error instanceof Error ? error.message : "benchmark_request_failed";
    await bundle.benchmarkRepository.failRequest(claimed.id, failureReason);
    incrementBenchmarkRun("failed");
    logError("benchmark_request_failed", error, {
      requestId: claimed.id,
      agentSlug: claimed.agentSlug,
      suiteSlug: claimed.suiteSlug,
    });
    captureException(error, {
      requestId: claimed.id,
      agentSlug: claimed.agentSlug,
      suiteSlug: claimed.suiteSlug,
    });
    throw error;
  }
}

async function recordWorkerHeartbeat(instanceId: string, metadata?: Record<string, unknown>) {
  await upsertServiceHeartbeat({
    serviceName: BENCHMARK_WORKER_SERVICE_NAME,
    instanceId,
    metadata: {
      pid: process.pid,
      ...metadata,
    },
  });
}

export async function startManagedBenchmarkWorker() {
  validateRuntimeConfig("worker");
  initializeMonitoring(BENCHMARK_WORKER_SERVICE_NAME);

  const instanceId = `worker-${process.pid}-${randomUUID().slice(0, 8)}`;
  await recordWorkerHeartbeat(instanceId, { phase: "starting" });

  const heartbeatTimer = setInterval(() => {
    void recordWorkerHeartbeat(instanceId, { phase: "running" });
  }, WORKER_HEARTBEAT_INTERVAL_MS);
  heartbeatTimer.unref();

  const { boss, workerId } = await startQueueWorker(getDatabaseUrl(), processBenchmarkRequestJob);
  logEvent("info", "benchmark_worker_started", { instanceId, workerId });

  return {
    boss,
    workerId,
    instanceId,
    async stop() {
      clearInterval(heartbeatTimer);
      await recordWorkerHeartbeat(instanceId, { phase: "stopping" });
      await stopBoss(getDatabaseUrl());
    },
  };
}
