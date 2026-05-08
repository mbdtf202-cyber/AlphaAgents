import assert from "node:assert/strict";
import test from "node:test";

import { loadEvidencePackageSummaries, runQuery } from "../lib/alphaagents/queries.js";

test("reputation.show returns summary for the primary sandbox agent", () => {
  const result = runQuery("reputation.show", {
    subjectId: "agent_mira_competitor_intel_sandbox"
  });

  assert.equal(result.subjectId, "agent_mira_competitor_intel_sandbox");
  assert.ok(result.averageRating > 0);
  assert.ok(result.reviewCount >= 1);
});

test("evidence.show returns visible evidence metadata", () => {
  const result = runQuery("evidence.show", {
    evidenceId: "ev_sandbox_delivery_pdf_001"
  });

  assert.equal(result.id, "ev_sandbox_delivery_pdf_001");
  assert.ok(result.hash.startsWith("sha256:"));
  assert.ok(["buyer", "seller", "operator", "public_anonymized"].includes(result.visibility));
});

test("all three sandbox packages are loaded into the delivery surfaces", () => {
  const packages = loadEvidencePackageSummaries();

  assert.equal(packages.length, 3);
  assert.deepEqual(
    packages.map((entry) => entry.packageId),
    ["AA-SANDBOX-TRIAL-001", "AA-SANDBOX-REVISION-002", "AA-SANDBOX-DISPUTE-003"]
  );
});
