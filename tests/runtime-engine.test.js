import assert from "node:assert/strict";
import test from "node:test";

import { executeRuntimeCommand } from "../lib/alphaagents/runtime-engine.js";
import { createTempStateFile, loadRuntimeState, resetRuntimeState } from "../lib/alphaagents/runtime-state.js";

function runtimeEnvelope(actorRole, payload, overrides = {}) {
  return {
    commandId: `cmd_${Math.random().toString(36).slice(2, 10)}`,
    actorId:
      actorRole === "operator"
        ? "user_operator_001"
        : actorRole === "seller"
          ? "user_seller_001"
          : "user_buyer_001",
    actorRole,
    sourceChannel: "api",
    tenantId: "org_demo_001",
    tokenScopes: [
      "buyer:rfps.write",
      "buyer:orders.write",
      "buyer:acceptance.write",
      "buyer:disputes.write",
      "buyer:ratings.write",
      "seller:proposals.write",
      "seller:runs.write",
      "seller:deliveries.write",
      "runtime:runs.write",
      "runtime:deliveries.write",
      "operator:qa.write",
      "operator:disputes.write",
      "operator:acceptance.write",
      "operator:permissions.write",
      "operator:runs.write",
      "finance:ledger.write",
      "evidence:read",
      "evidence:export",
      "evidence:delete",
      "reputation:read"
    ],
    idempotencyKey: `idem_${Math.random().toString(36).slice(2, 10)}`,
    correlationId: `corr_${Math.random().toString(36).slice(2, 10)}`,
    expectedVersion: 1,
    payload,
    ...overrides
  };
}

test("runtime engine persists a real golden path flow", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);

  const rfpDraft = executeRuntimeCommand(
    "rfp.create",
    runtimeEnvelope("buyer", {
      sku: "cross_border_competitor_topic_pack",
      packageTier: "trial",
      category: "US TikTok Shop sensitive-skin skincare",
      market: "US",
      channels: ["tiktok_shop_public"],
      language: "zh-CN analysis with English source labels",
      budgetAmountMinor: 198000,
      currency: "CNY",
      deliverableFormat: ["pdf", "csv"]
    }, { expectedVersion: 0 }),
    { stateFile }
  );
  assert.equal(rfpDraft.ok, true);

  const rfpPublished = executeRuntimeCommand(
    "rfp.publish",
    runtimeEnvelope("buyer", {
      rfpId: rfpDraft.dto.id,
      acceptanceTemplateId: "acceptance_template_trial_v1",
      competitorsOrDiscoveryRule: "Use 5 named competitors",
      prohibitedSources: ["production_account_login", "paid_account", "private_group", "ad_account", "fund_movement"],
      deadlineAt: "2026-05-10T18:00:00+08:00"
    }),
    { stateFile }
  );
  assert.equal(rfpPublished.ok, true);

  const proposal = executeRuntimeCommand(
    "proposal.submit",
    runtimeEnvelope("seller", {
      rfpId: rfpDraft.dto.id,
      sellerId: "seller_harbor_growth_sandbox",
      agentId: "agent_mira_competitor_intel_sandbox",
      priceAmountMinor: 198000,
      deliveryHours: 48,
      includedScope: ["5 competitors", "15 topic ideas"],
      evidenceStandard: "Every key claim maps to evidence",
      responsibleOwner: "project-owner@harbor-growth.example",
      capacityReservedUntil: "2026-05-10T18:00:00+08:00"
    }),
    { stateFile }
  );
  assert.equal(proposal.ok, true);

  const order = executeRuntimeCommand(
    "proposal.accept",
    runtimeEnvelope("buyer", {
      proposalId: proposal.dto.id,
      termsSnapshot: "trial_v1_terms"
    }),
    { stateFile }
  );
  assert.equal(order.ok, true);

  const funded = executeRuntimeCommand(
    "escrow.fund",
    runtimeEnvelope("buyer", {
      orderId: order.dto.id,
      paymentRef: "sandbox_payment_ref_001",
      receivedAt: "2026-05-08T20:00:00+08:00",
      receivedBy: "user_finance_sandbox_001"
    }),
    { stateFile }
  );
  assert.equal(funded.ok, true);

  const stateAfterFunding = loadRuntimeState(stateFile);
  const grant = stateAfterFunding.grants[0];
  assert.ok(grant);

  const approvedGrant = executeRuntimeCommand(
    "permission.approve",
    runtimeEnvelope("operator", {
      grantId: grant.id,
      toolAllowlist: ["read_public_url", "write_generated_artifact"],
      expiresAt: "2026-05-10T18:00:00+08:00",
      approvalReason: "trial lane"
    }),
    { stateFile }
  );
  assert.equal(approvedGrant.ok, true);

  const run = executeRuntimeCommand(
    "run.start",
    runtimeEnvelope("seller", {
      orderId: order.dto.id,
      permissionGrantIds: [grant.id]
    }),
    { stateFile }
  );
  assert.equal(run.ok, true);

  const delivery = executeRuntimeCommand(
    "delivery.submit",
    runtimeEnvelope("seller", {
      orderId: order.dto.id,
      executionRunIds: [run.dto.id],
      artifactRefs: ["ev_sandbox_delivery_pdf_001"],
      evidenceRefs: ["ev_sandbox_delivery_pdf_001"],
      criteriaMapping: ["competitor_coverage"],
      knownLimitations: ["sandbox only"]
    }),
    { stateFile }
  );
  assert.equal(delivery.ok, true);

  const qaPassed = executeRuntimeCommand(
    "delivery.qa_pass",
    runtimeEnvelope("operator", {
      deliveryPackageId: delivery.dto.id,
      qaChecklistId: "qa_trial_001",
      sampledFacts: ["fact_01"]
    }),
    { stateFile }
  );
  assert.equal(qaPassed.ok, true);
  assert.equal(qaPassed.dto.acceptanceStatus, "ready");

  const accepted = executeRuntimeCommand(
    "acceptance.accept",
    runtimeEnvelope("buyer", {
      orderId: order.dto.id,
      deliveryPackageId: delivery.dto.id,
      criteriaConfirmations: ["competitor_coverage", "evidence_traceability", "topic_actionability"],
      criteriaScores: {
        competitor_coverage: 20,
        evidence_traceability: 25,
        topic_actionability: 20
      },
      decisionReason: "buyer accepted"
    }),
    { stateFile }
  );
  assert.equal(accepted.ok, true);

  const released = executeRuntimeCommand(
    "escrow.release",
    runtimeEnvelope("operator", {
      orderId: order.dto.id,
      releaseReason: "accepted",
      financeEvidenceRef: "ev_sandbox_delivery_pdf_001"
    }),
    { stateFile }
  );
  assert.equal(released.ok, true);
  assert.equal(released.dto.ledgerStatus, "released");

  const rated = executeRuntimeCommand(
    "rating.submit",
    runtimeEnvelope("buyer", {
      orderId: order.dto.id,
      subjectType: "agent",
      subjectId: "agent_mira_competitor_intel_sandbox",
      agentVersion: "1.0.0",
      ratingBreakdown: { outcome: 5, evidence: 5, speed: 4 },
      deliveryOutcome: "accepted"
    }),
    { stateFile }
  );
  assert.equal(rated.ok, true);

  const finalState = loadRuntimeState(stateFile);
  assert.equal(finalState.orders.length, 1);
  assert.equal(finalState.reputations.length, 1);
  assert.equal(finalState.eventLog.length >= 12, true);
});

test("archived category blocks listing publish", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);

  const archived = executeRuntimeCommand(
    "agent-category archive",
    runtimeEnvelope("operator", {
      categoryId: "social_media_operations",
      archiveReason: "cleanup"
    }),
    { stateFile }
  );
  assert.equal(archived.ok, true);

  const blocked = executeRuntimeCommand(
    "agent-listing publish",
    runtimeEnvelope("operator", {
      listingId: "listing_new_001",
      agentId: "agent_mira_competitor_intel_sandbox",
      categoryIds: ["social_media_operations"],
      priceAmountMinor: 198000
    }),
    { stateFile }
  );
  assert.equal(blocked.ok, false);
  assert.equal(blocked.errorCode, "STATE_CONFLICT");
});

test("permission approval rejects denied high-risk tools", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);

  const draft = executeRuntimeCommand(
    "rfp.create",
    runtimeEnvelope("buyer", {
      sku: "cross_border_competitor_topic_pack",
      packageTier: "trial",
      category: "US TikTok Shop sensitive-skin skincare",
      market: "US",
      channels: ["tiktok_shop_public"],
      language: "zh-CN analysis with English source labels",
      budgetAmountMinor: 198000,
      currency: "CNY",
      deliverableFormat: ["pdf", "csv"]
    }, { expectedVersion: 0 }),
    { stateFile }
  );

  executeRuntimeCommand(
    "rfp.publish",
    runtimeEnvelope("buyer", {
      rfpId: draft.dto.id,
      acceptanceTemplateId: "acceptance_template_trial_v1",
      competitorsOrDiscoveryRule: "Use 5 named competitors",
      prohibitedSources: ["production_account_login", "paid_account", "private_group", "ad_account", "fund_movement"],
      deadlineAt: "2026-05-10T18:00:00+08:00"
    }),
    { stateFile }
  );

  const proposal = executeRuntimeCommand(
    "proposal.submit",
    runtimeEnvelope("seller", {
      rfpId: draft.dto.id,
      sellerId: "seller_harbor_growth_sandbox",
      agentId: "agent_mira_competitor_intel_sandbox",
      priceAmountMinor: 198000,
      deliveryHours: 48,
      includedScope: ["5 competitors", "15 topic ideas"],
      evidenceStandard: "Every key claim maps to evidence",
      responsibleOwner: "project-owner@harbor-growth.example",
      capacityReservedUntil: "2026-05-10T18:00:00+08:00"
    }),
    { stateFile }
  );

  const order = executeRuntimeCommand(
    "proposal.accept",
    runtimeEnvelope("buyer", {
      proposalId: proposal.dto.id,
      termsSnapshot: "trial_v1_terms"
    }),
    { stateFile }
  );

  executeRuntimeCommand(
    "escrow.fund",
    runtimeEnvelope("buyer", {
      orderId: order.dto.id,
      paymentRef: "sandbox_payment_ref_001",
      receivedAt: "2026-05-08T20:00:00+08:00",
      receivedBy: "user_finance_sandbox_001"
    }),
    { stateFile }
  );

  const grant = loadRuntimeState(stateFile).grants[0];

  const denied = executeRuntimeCommand(
    "permission.approve",
    runtimeEnvelope("operator", {
      grantId: grant.id,
      toolAllowlist: ["account_login"],
      expiresAt: "2026-05-10T18:00:00+08:00",
      approvalReason: "should fail"
    }),
    { stateFile }
  );

  assert.equal(denied.ok, false);
  assert.equal(denied.errorCode, "PERMISSION_DENIED");
});
