import crypto from "node:crypto";

import { benchmarkRequestSchema, getAgentBySlug, getBenchmarkSuiteBySlug, latestVersion } from "@openclaw/alpha-agents-core";
import { PgBoss } from "pg-boss";
import { z } from "zod";

export const benchmarkJobSchema = benchmarkRequestSchema.extend({
  requestId: z.string().min(1),
  agentSlug: z.string().min(1),
  initiatedBy: z.string().min(1).default("system"),
});

export type BenchmarkJob = z.infer<typeof benchmarkJobSchema>;
export type BenchmarkWorkerHandler = (job: BenchmarkJob) => Promise<unknown> | unknown;

export interface BenchmarkArtifactBundle {
  bundleHash: string;
  transcript: string;
  toolTrace: string[];
  finalArtifact: string;
  rubric: Record<string, number | string>;
  screenshotPath: string;
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableStringify(nested)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function computeBundleHash(input: Record<string, unknown>): string {
  return `sha256:${crypto.createHash("sha256").update(stableStringify(input)).digest("hex").slice(0, 24)}`;
}

export function runDemoBenchmark(jobInput: BenchmarkJob) {
  const job = benchmarkJobSchema.parse(jobInput);
  const agent = getAgentBySlug(job.agentSlug);
  const suite = getBenchmarkSuiteBySlug(job.suiteSlug) ?? {
    slug: job.suiteSlug,
    title: {
      en: job.suiteSlug,
      "zh-CN": job.suiteSlug,
    },
  };

  const version = agent ? agent.versions.find((entry) => entry.id === job.versionId) ?? latestVersion(agent) : undefined;
  if (agent && (!version || version.id !== job.versionId)) {
    throw new Error(`Unknown agent version: ${job.versionId}`);
  }
  const baseline = version?.benchmarkRuns.find((run) => run.suiteSlug === suite.slug);
  const agentName = agent?.name ?? job.agentSlug;
  const versionId = version?.id ?? job.versionId;
  const bundleHash = computeBundleHash({
    agentSlug: job.agentSlug,
    versionId,
    suiteSlug: suite.slug,
    objective: job.objective ?? "",
  });

  const artifactBundle: BenchmarkArtifactBundle = {
    bundleHash,
    transcript: `Simulated transcript for ${agentName} on ${suite.slug}.`,
    toolTrace: [
      "load agent metadata",
      "hydrate benchmark inputs",
      "execute run inside guarded OpenClaw environment",
      "score rubric and publish artifact pointers",
    ],
    finalArtifact: `${agentName} completed ${suite.title.en} with demo evidence.`,
    rubric: {
      publicRank: baseline?.publicRank ?? 0,
      peerGroupSize: baseline?.peerGroupSize ?? 0,
      costPerSuccessfulRun: baseline?.costPerSuccessfulRun ?? 0,
      medianLatencySeconds: baseline?.medianLatencySeconds ?? 0,
      stability: baseline?.stability ?? 0,
      freshnessDays: baseline?.freshnessDays ?? 0,
      overall: baseline?.scorecard.overall ?? 0,
      taskSuccess: baseline?.scorecard.taskSuccess ?? 0,
      reliability: baseline?.scorecard.reliability ?? 0,
      costEfficiency: baseline?.scorecard.costEfficiency ?? 0,
      latency: baseline?.scorecard.latency ?? 0,
      safetyFootprint: baseline?.scorecard.safetyFootprint ?? 0,
      setupFriction: baseline?.scorecard.setupFriction ?? 0,
      operatorBurden: baseline?.scorecard.operatorBurden ?? 0,
      domainFit: baseline?.scorecard.domainFit ?? 0,
      note: baseline?.notes.en ?? `No benchmark baseline available for ${job.agentSlug}.`,
      noteZh: baseline?.notes["zh-CN"] ?? `${job.agentSlug} 暂无 benchmark 基线。`,
    },
    screenshotPath: `/artifacts/${job.agentSlug}-${suite.slug}.png`,
  };

  return {
    job,
    requestId: job.requestId,
    agentSlug: job.agentSlug,
    suiteSlug: suite.slug,
    versionId,
    artifactBundle,
    baseline,
  };
}

declare global {
  var __alphaAgentsBosses: Map<string, Promise<PgBoss>> | undefined;
}

export async function ensureBoss(databaseUrl: string) {
  if (!globalThis.__alphaAgentsBosses) {
    globalThis.__alphaAgentsBosses = new Map();
  }

  const existing = globalThis.__alphaAgentsBosses.get(databaseUrl);
  if (existing) {
    return existing;
  }

  const bossPromise = (async () => {
    const boss = new PgBoss({ connectionString: databaseUrl });
    await boss.start();
    await boss.createQueue("benchmark-runs", {
      retryLimit: 2,
      retryDelay: 5,
      heartbeatSeconds: 30,
    });
    return boss;
  })();

  globalThis.__alphaAgentsBosses.set(databaseUrl, bossPromise);
  return bossPromise;
}

export async function enqueueBenchmarkJob(databaseUrl: string, jobInput: BenchmarkJob) {
  const boss = await ensureBoss(databaseUrl);
  const job = benchmarkJobSchema.parse(jobInput);
  const jobId = await boss.send("benchmark-runs", job, {
    id: job.requestId,
    singletonKey: job.requestId,
    retryLimit: 2,
    retryDelay: 5,
  });
  return jobId ?? job.requestId;
}

export async function stopBoss(databaseUrl?: string) {
  if (!globalThis.__alphaAgentsBosses) {
    return;
  }

  const targets = databaseUrl
    ? [...globalThis.__alphaAgentsBosses.entries()].filter(([key]) => key === databaseUrl)
    : [...globalThis.__alphaAgentsBosses.entries()];

  for (const [key, promise] of targets) {
    const boss = await promise;
    await boss.stop();
    globalThis.__alphaAgentsBosses.delete(key);
  }
}

export async function startBenchmarkWorker(
  databaseUrl: string,
  handler: BenchmarkWorkerHandler = async (job) => runDemoBenchmark(job),
) {
  const boss = await ensureBoss(databaseUrl);
  const workerId = await boss.work<BenchmarkJob>("benchmark-runs", { batchSize: 1, pollingIntervalSeconds: 1 }, async (jobs) => {
    const job = jobs[0];
    if (!job) {
      return null;
    }
    return handler(job.data);
  });

  return {
    boss,
    workerId,
  };
}

export async function fetchBenchmarkJob(databaseUrl: string, requestId: string) {
  const boss = await ensureBoss(databaseUrl);
  const [job] = await boss.findJobs<BenchmarkJob>("benchmark-runs", { id: requestId });
  return job ?? null;
}

export async function runBenchmarkWorkerOnce(databaseUrl: string, handler: BenchmarkWorkerHandler) {
  const boss = await ensureBoss(databaseUrl);
  const jobs = await boss.fetch<BenchmarkJob>("benchmark-runs", { batchSize: 1, includeMetadata: false });
  const job = jobs[0];
  if (!job) {
    return null;
  }
  try {
    const result = await handler(job.data);
    await boss.complete("benchmark-runs", job.id);
    return result;
  } catch (error) {
    await boss.fail("benchmark-runs", job.id, {
      error: error instanceof Error ? error.message : "benchmark_job_failed",
    });
    throw error;
  }
}

export async function getBenchmarkQueueStats(databaseUrl: string) {
  const boss = await ensureBoss(databaseUrl);
  return boss.getQueueStats("benchmark-runs");
}

export async function getBenchmarkQueue(databaseUrl: string) {
  const boss = await ensureBoss(databaseUrl);
  return boss;
}
