import crypto from "node:crypto";

import { benchmarkRequestSchema, getAgentBySlug, getBenchmarkSuiteBySlug, latestVersion } from "@openclaw/agent-ledger-core";
import { PgBoss } from "pg-boss";
import { z } from "zod";

export const benchmarkJobSchema = benchmarkRequestSchema.extend({
  agentSlug: z.string().min(1),
  initiatedBy: z.string().min(1).default("system"),
});

export type BenchmarkJob = z.infer<typeof benchmarkJobSchema>;

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
  const suite = getBenchmarkSuiteBySlug(job.suiteSlug);

  if (!agent || !suite) {
    throw new Error("Unknown agent or benchmark suite.");
  }

  const version = agent.versions.find((entry) => entry.id === job.versionId) ?? latestVersion(agent);
  if (!version || version.id !== job.versionId) {
    throw new Error(`Unknown agent version: ${job.versionId}`);
  }
  const baseline = version.benchmarkRuns.find((run) => run.suiteSlug === suite.slug);
  const bundleHash = computeBundleHash({
    agentSlug: agent.slug,
    versionId: version.id,
    suiteSlug: suite.slug,
    objective: job.objective ?? "",
  });

  const artifactBundle: BenchmarkArtifactBundle = {
    bundleHash,
    transcript: `Simulated transcript for ${agent.name} on ${suite.slug}.`,
    toolTrace: [
      "load agent metadata",
      "hydrate benchmark inputs",
      "execute run inside guarded OpenClaw environment",
      "score rubric and publish artifact pointers",
    ],
    finalArtifact: `${agent.name} completed ${suite.title.en} with demo evidence.`,
    rubric: {
      overall: baseline?.scorecard.overall ?? 0,
      taskSuccess: baseline?.scorecard.taskSuccess ?? 0,
      reliability: baseline?.scorecard.reliability ?? 0,
      note: baseline?.notes.en ?? "No benchmark baseline available.",
    },
    screenshotPath: `/artifacts/${agent.slug}-${suite.slug}.png`,
  };

  return {
    job,
    agentSlug: agent.slug,
    suiteSlug: suite.slug,
    versionId: version.id,
    artifactBundle,
    baseline,
  };
}

export async function ensureBoss(databaseUrl: string) {
  const boss = new PgBoss({ connectionString: databaseUrl });
  await boss.start();
  await boss.createQueue("benchmark-runs");
  return boss;
}

export async function startBenchmarkWorker(databaseUrl: string) {
  const boss = await ensureBoss(databaseUrl);

  await boss.work<BenchmarkJob>("benchmark-runs", async (jobs) => {
    const job = jobs[0];
    if (!job) {
      return null;
    }
    return runDemoBenchmark(job.data);
  });

  return boss;
}
