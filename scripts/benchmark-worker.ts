import { runDemoBenchmark } from "@openclaw/alpha-agents-runner";

import { getStorageMode } from "../lib/server/env";
import { getRepositoryBundle } from "../lib/server/repositories";

async function processQueuedBenchmarks() {
  if (getStorageMode() === "sample") {
    throw new Error("Benchmark worker requires memory or postgres storage.");
  }

  const bundle = await getRepositoryBundle();
  const queued = await bundle.benchmarkRepository.listQueuedRequests();

  for (const request of queued) {
    const claimed = await bundle.benchmarkRepository.claimQueuedRequest(request.id);
    if (!claimed) {
      continue;
    }

    const run = runDemoBenchmark({
      agentSlug: claimed.agentId,
      suiteSlug: claimed.suiteSlug,
      versionId: claimed.versionId,
      objective: claimed.objective,
      initiatedBy: "benchmark-worker",
    });

    await bundle.benchmarkRepository.completeRequest(claimed.id, {
      bundleHash: run.artifactBundle.bundleHash,
      transcriptUrl: run.artifactBundle.transcript,
      toolTraceUrl: run.artifactBundle.toolTrace.join("\n"),
      finalArtifactUrl: run.artifactBundle.finalArtifact,
      screenshotUrl: run.artifactBundle.screenshotPath,
      rubric: run.artifactBundle.rubric,
    });
  }
}

async function main() {
  await processQueuedBenchmarks();
  if (process.argv.includes("--watch")) {
    setInterval(async () => {
      await processQueuedBenchmarks();
    }, 4000);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
