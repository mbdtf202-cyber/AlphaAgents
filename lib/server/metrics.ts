import { Counter, Gauge, Registry, collectDefaultMetrics } from "prom-client";

declare global {
  var __alphaAgentsMetricsRegistry: Registry | undefined;
  var __alphaAgentsMetricsInitialized: boolean | undefined;
  var __alphaAgentsMetricHandles:
    | {
        registry: Registry;
        magicLinkDeliveries: Counter<"provider" | "result">;
        benchmarkRequests: Counter<"result">;
        benchmarkRuns: Counter<"result">;
        rateLimitRejections: Counter<"scope">;
        requestErrors: Counter<"error_name">;
        queueBacklog: Gauge<string>;
        workerHeartbeatAgeSeconds: Gauge<string>;
        readinessState: Gauge<string>;
      }
    | undefined;
}

function createMetricHandles() {
  const registry = new Registry();
  if (!globalThis.__alphaAgentsMetricsInitialized) {
    collectDefaultMetrics({ prefix: "alpha_agents_", register: registry });
    globalThis.__alphaAgentsMetricsInitialized = true;
  }

  return {
    registry,
    magicLinkDeliveries: new Counter({
      name: "alpha_agents_magic_link_deliveries_total",
      help: "Magic link delivery attempts by provider and result.",
      labelNames: ["provider", "result"],
      registers: [registry],
    }),
    benchmarkRequests: new Counter({
      name: "alpha_agents_benchmark_requests_total",
      help: "Benchmark request outcomes.",
      labelNames: ["result"],
      registers: [registry],
    }),
    benchmarkRuns: new Counter({
      name: "alpha_agents_benchmark_runs_total",
      help: "Benchmark run outcomes.",
      labelNames: ["result"],
      registers: [registry],
    }),
    rateLimitRejections: new Counter({
      name: "alpha_agents_rate_limit_rejections_total",
      help: "Rate limit rejections by scope.",
      labelNames: ["scope"],
      registers: [registry],
    }),
    requestErrors: new Counter({
      name: "alpha_agents_request_errors_total",
      help: "Request errors grouped by error name.",
      labelNames: ["error_name"],
      registers: [registry],
    }),
    queueBacklog: new Gauge({
      name: "alpha_agents_benchmark_queue_backlog",
      help: "Number of queued benchmark requests.",
      registers: [registry],
    }),
    workerHeartbeatAgeSeconds: new Gauge({
      name: "alpha_agents_worker_heartbeat_age_seconds",
      help: "Age in seconds of the latest benchmark worker heartbeat.",
      registers: [registry],
    }),
    readinessState: new Gauge({
      name: "alpha_agents_readiness_state",
      help: "Current readiness state of the web service.",
      registers: [registry],
    }),
  };
}

function getMetricHandles() {
  if (!globalThis.__alphaAgentsMetricHandles) {
    globalThis.__alphaAgentsMetricHandles = createMetricHandles();
  }
  return globalThis.__alphaAgentsMetricHandles;
}

export function recordMagicLinkDelivery(provider: string, result: "sent" | "failed") {
  getMetricHandles().magicLinkDeliveries.inc({ provider, result });
}

export function incrementBenchmarkRequest(result: "queued" | "failed") {
  getMetricHandles().benchmarkRequests.inc({ result });
}

export function incrementBenchmarkRun(result: "completed" | "failed") {
  getMetricHandles().benchmarkRuns.inc({ result });
}

export function incrementRateLimitRejection(scope: string) {
  getMetricHandles().rateLimitRejections.inc({ scope });
}

export function incrementErrorCount(errorName: string) {
  getMetricHandles().requestErrors.inc({ error_name: errorName });
}

export function setQueueBacklogGauge(value: number) {
  getMetricHandles().queueBacklog.set(value);
}

export function setWorkerHeartbeatAgeSecondsGauge(value: number) {
  getMetricHandles().workerHeartbeatAgeSeconds.set(value);
}

export function setReadinessStateGauge(value: number) {
  getMetricHandles().readinessState.set(value);
}

export async function renderMetrics() {
  return getMetricHandles().registry.metrics();
}
