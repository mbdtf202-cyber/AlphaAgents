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

test("agent-app install and usage commands return structured AaaS lifecycle data", () => {
  const install = runCommand(
    "agent-app.install",
    createDemoEnvelope("buyer", {
      appId: "agent_app_harbor_growth_workbench",
      buyerOrgId: "org_demo_001",
      authorizedBy: "user_demo_buyer_owner",
      usageMode: "subscription"
    })
  );
  assert.equal(install.ok, true);
  assert.equal(install.dto.installStatus, "active");

  const usage = runCommand(
    "agent-app.record-usage",
    createDemoEnvelope("buyer", {
      installId: "app_install_demo_001",
      appId: "agent_app_harbor_growth_workbench",
      usageSummary: "weekly content sync completed with buyer-safe evidence",
      evidenceRefs: ["ev_sandbox_delivery_pdf_001"]
    })
  );
  assert.equal(usage.ok, true);
  assert.equal(usage.dto.usageStatus, "recorded");
});

test("program ops commands return credit and qbr mutations", () => {
  const allocate = runCommand(
    "program.allocate-credit",
    createDemoEnvelope("operator", {
      programId: "program_northstar_growth_001",
      creditAmountMinor: 320000,
      reason: "quarterly top-up"
    })
  );
  assert.equal(allocate.ok, true);
  assert.equal(allocate.dto.activeCreditMinor, 2120000);

  const qbr = runCommand(
    "program.update-qbr",
    createDemoEnvelope("operator", {
      programId: "program_northstar_growth_001",
      qbrStatus: "ready_for_review"
    })
  );
  assert.equal(qbr.ok, true);
  assert.equal(qbr.dto.qbrStatus, "ready_for_review");
});
