import { describe, expect, it } from "vitest";

import { computeBundleHash, runAttestedBenchmark, verifyBenchmarkArtifactBundle } from "./index";

describe("alpha-agents runner", () => {
  it("builds deterministic bundle hashes", () => {
    const a = computeBundleHash({ foo: "bar", baz: 1 });
    const b = computeBundleHash({ baz: 1, foo: "bar" });

    expect(a).toBe(b);
  });

  it("returns an attested benchmark artifact bundle", () => {
    const run = runAttestedBenchmark({
      requestId: "benchmark-request-1",
      agentSlug: "swe-copilot-forge",
      suiteSlug: "coding-command",
      versionId: "ver-swe-copilot-forge-1-4-2",
      objective: "Confirm coding benchmark wiring.",
      initiatedBy: "test",
    });

    expect(run.agentSlug).toBe("swe-copilot-forge");
    expect(run.versionId).toBe("ver-swe-copilot-forge-1-4-2");
    expect(run.artifactBundle.execution.executorId).toBeTruthy();
    expect(run.artifactBundle.artifactManifest).toHaveLength(5);
    expect(verifyBenchmarkArtifactBundle(run.artifactBundle).status).toBe("verified");
  });
});
