import assert from "node:assert/strict";
import test from "node:test";

import { createDemoEnvelope, runCommand } from "../lib/alphaagents/commands.js";

test("rfp.publish returns a published RFP DTO with matching event", () => {
  const result = runCommand(
    "rfp.publish",
    createDemoEnvelope("buyer", {
      acceptanceTemplateId: "acceptance_template_trial_v1",
      competitorsOrDiscoveryRule: "Use 5 named competitors",
      deadlineAt: "2026-05-10T18:00:00+08:00",
      packageTier: "trial"
    })
  );

  assert.equal(result.ok, true);
  assert.equal(result.dto.rfpStatus, "published");
  assert.deepEqual(result.events.map((event) => event.eventName), ["RfpPublished"]);
});

test("proposal.submit rejects wrong actor role", () => {
  const result = runCommand(
    "proposal.submit",
    createDemoEnvelope("buyer", {
      rfpId: "rfp_demo_trial_001",
      sellerId: "seller_harbor_growth_sandbox",
      agentId: "agent_mira_competitor_intel_sandbox"
    })
  );

  assert.equal(result.ok, false);
  assert.equal(result.errorCode, "ACTOR_FORBIDDEN");
});

test("acceptance.accept returns accepted order state with buyer-facing next action", () => {
  const result = runCommand(
    "acceptance.accept",
    createDemoEnvelope("buyer", {
      orderId: "order_sandbox_trial_001",
      deliveryPackageId: "delivery_sandbox_trial_001",
      criteriaConfirmations: ["competitor_coverage", "evidence_traceability", "topic_actionability"],
      criteriaScores: {
        competitor_coverage: 20,
        evidence_traceability: 24,
        topic_actionability: 18
      },
      decisionReason: "buyer accepted"
    })
  );

  assert.equal(result.ok, true);
  assert.equal(result.dto.acceptanceStatus, "accepted");
  assert.equal(result.dto.nextAction.command, "alphaagents escrow release");
});

test("dispute.open returns disputed order state", () => {
  const result = runCommand(
    "dispute.open",
    createDemoEnvelope("buyer", {
      orderId: "order_sandbox_dispute_003",
      deliveryPackageId: "delivery_sandbox_dispute_003",
      disputeReason: "seven topics required buyer-side rewriting",
      evidenceRefs: ["ev_sandbox_dispute_001"]
    })
  );

  assert.equal(result.ok, true);
  assert.equal(result.dto.orderStatus, "disputed");
  assert.equal(result.dto.acceptanceStatus, "disputed");
});
