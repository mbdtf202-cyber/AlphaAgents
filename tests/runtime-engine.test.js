import assert from "node:assert/strict";
import test from "node:test";

import { executeRuntimeCommand } from "../lib/alphaagents/runtime-engine.js";
import { createTempStateFile, loadRuntimeState, resetRuntimeState, saveRuntimeState } from "../lib/alphaagents/runtime-state.js";

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

function readyBuyerOrg(stateFile) {
  const result = executeRuntimeCommand(
    "buyer-org.setup",
    runtimeEnvelope("buyer", {
      buyerOrgId: "org_demo_001",
      requesterUserId: "user_demo_buyer_owner",
      acceptanceOwnerUserId: "user_demo_acceptance_owner",
      financeContactUserId: "user_demo_finance_owner",
      legalContactUserId: "user_demo_legal_owner",
      authorizedPayerId: "payer_demo_001",
      signerIds: ["signer_demo_001"],
      invoiceReadiness: "ready",
      scopeAcknowledgement: "accepted",
      contractingEntity: "NorthStar Beauty LLC",
      collectionEntity: "AlphaAgents Platform Ops LLC",
      invoiceIssuer: "AlphaAgents Platform Ops LLC",
      refundRemitter: "AlphaAgents Platform Ops LLC",
      subprocessors: ["Harbor Growth Studio"]
    }),
    { stateFile }
  );
  assert.equal(result.ok, true);
  return result;
}

test("runtime engine persists a real golden path flow", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);
  readyBuyerOrg(stateFile);

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
    runtimeEnvelope(
      "seller",
      {
        rfpId: rfpDraft.dto.id,
        sellerId: "seller_harbor_growth_sandbox",
        agentId: "agent_mira_competitor_intel_sandbox",
        priceAmountMinor: 198000,
        deliveryHours: 48,
        includedScope: ["5 competitors", "15 topic ideas"],
        evidenceStandard: "Every key claim maps to evidence",
        responsibleOwner: "project-owner@harbor-growth.example",
        capacityReservedUntil: "2026-05-10T18:00:00+08:00"
      },
      { expectedVersion: rfpPublished.newVersion }
    ),
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
    runtimeEnvelope(
      "buyer",
      {
        orderId: order.dto.id,
        paymentRef: "sandbox_payment_ref_001",
        receivedAt: "2026-05-08T20:00:00+08:00",
        receivedBy: "user_finance_sandbox_001"
      },
      { expectedVersion: order.newVersion }
    ),
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
    runtimeEnvelope(
      "seller",
      {
        orderId: order.dto.id,
        permissionGrantIds: [grant.id]
      },
      { expectedVersion: funded.newVersion }
    ),
    { stateFile }
  );
  assert.equal(run.ok, true);

  const delivery = executeRuntimeCommand(
    "delivery.submit",
    runtimeEnvelope(
      "seller",
      {
        orderId: order.dto.id,
        executionRunIds: [run.dto.id],
        artifactRefs: ["ev_sandbox_delivery_pdf_001"],
        evidenceRefs: ["ev_sandbox_delivery_pdf_001"],
        criteriaMapping: ["competitor_coverage"],
        knownLimitations: ["sandbox only"]
      },
      { expectedVersion: run.newVersion + 2 }
    ),
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
    runtimeEnvelope(
      "buyer",
      {
        orderId: order.dto.id,
        deliveryPackageId: delivery.dto.id,
        criteriaConfirmations: ["competitor_coverage", "evidence_traceability", "topic_actionability"],
        criteriaScores: {
          competitor_coverage: 20,
          evidence_traceability: 25,
          topic_actionability: 20
        },
        decisionReason: "buyer accepted"
      },
      { expectedVersion: qaPassed.newVersion }
    ),
    { stateFile }
  );
  assert.equal(accepted.ok, true);

  const released = executeRuntimeCommand(
    "escrow.release",
    runtimeEnvelope(
      "operator",
      {
        orderId: order.dto.id,
        releaseReason: "accepted",
        financeEvidenceRef: "ev_sandbox_delivery_pdf_001"
      },
      { expectedVersion: accepted.newVersion }
    ),
    { stateFile }
  );
  assert.equal(released.ok, true);
  assert.equal(released.dto.ledgerStatus, "released");

  const rated = executeRuntimeCommand(
    "rating.submit",
    runtimeEnvelope(
      "buyer",
      {
        orderId: order.dto.id,
        subjectType: "agent",
        subjectId: "agent_mira_competitor_intel_sandbox",
        agentVersion: "1.0.0",
        categoryIds: ["social_media_operations", "intelligence_research"],
        ratingBreakdown: { outcome: 5, evidence: 5, speed: 4 },
        deliveryOutcome: "accepted"
      },
      { expectedVersion: released.newVersion }
    ),
    { stateFile }
  );
  assert.equal(rated.ok, true);

  const finalState = loadRuntimeState(stateFile);
  assert.equal(finalState.orders.length, 1);
  assert.equal(finalState.reputations.length, 1);
  assert.equal(finalState.reputations[0].sourceOrderId, order.dto.id);
  assert.equal(finalState.reputations[0].agentVersion, "1.0.0");
  assert.deepEqual(finalState.reputations[0].categoryIds, ["social_media_operations", "intelligence_research"]);
  assert.equal(finalState.reputations[0].subjectId, "agent_mira_competitor_intel_sandbox");
  assert.equal(finalState.eventLog.length >= 12, true);

  const duplicate = executeRuntimeCommand(
    "rating.submit",
    runtimeEnvelope(
      "buyer",
      {
        orderId: order.dto.id,
        subjectType: "agent",
        subjectId: "agent_mira_competitor_intel_sandbox",
        agentVersion: "1.0.0",
        categoryIds: ["social_media_operations", "intelligence_research"],
        ratingBreakdown: { outcome: 5, evidence: 5, speed: 4 },
        deliveryOutcome: "accepted"
      },
      { expectedVersion: released.newVersion }
    ),
    { stateFile }
  );
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.errorCode, "DUPLICATE_RATING");
});

test("rating.submit rejects category provenance that does not match the order supply", () => {
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

  const proposal = executeRuntimeCommand(
    "proposal.submit",
    runtimeEnvelope("seller", {
      rfpId: rfpDraft.dto.id,
      sellerId: "seller_harbor_growth_sandbox",
      agentId: "agent_mira_competitor_intel_sandbox",
      priceAmountMinor: 198000,
      deliveryHours: 48,
      includedScope: ["5 competitors"],
      evidenceStandard: "Every key claim maps to evidence",
      responsibleOwner: "project-owner@harbor-growth.example",
      capacityReservedUntil: "2026-05-10T18:00:00+08:00"
    }),
    { stateFile }
  );
  assert.equal(proposal.ok, false);

  const state = loadRuntimeState(stateFile);
  state.rfps[0].rfpStatus = "published";
  state.proposals.push({
    id: "proposal_manual_001",
    tenantId: "org_demo_001",
    proposalStatus: "selected",
    rfpId: rfpDraft.dto.id,
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    priceAmountMinor: 198000,
    currency: "CNY",
    version: 1
  });
  state.orders.push({
    id: "order_manual_released_001",
    tenantId: "org_demo_001",
    rfpId: rfpDraft.dto.id,
    proposalId: "proposal_manual_001",
    buyerOrgId: "org_demo_001",
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    orderStatus: "released",
    ledgerStatus: "released",
    acceptanceStatus: "accepted",
    amountMinor: 198000,
    currency: "CNY",
    version: 1
  });
  saveRuntimeState(state, stateFile);

  const mismatched = executeRuntimeCommand(
    "rating.submit",
    runtimeEnvelope("buyer", {
      orderId: "order_manual_released_001",
      subjectType: "agent",
      subjectId: "agent_mira_competitor_intel_sandbox",
      agentVersion: "1.0.0",
      categoryIds: ["finance"],
      ratingBreakdown: { outcome: 5, evidence: 5, speed: 4 },
      deliveryOutcome: "accepted"
    }),
    { stateFile }
  );
  assert.equal(mismatched.ok, false);
  assert.equal(mismatched.errorCode, "VALIDATION_FAILED");
});

test("write commands reject stale expectedVersion before mutating shared state", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);

  const rfpDraft = executeRuntimeCommand(
    "rfp.create",
    runtimeEnvelope(
      "buyer",
      {
        sku: "cross_border_competitor_topic_pack",
        packageTier: "trial",
        category: "US TikTok Shop sensitive-skin skincare",
        market: "US",
        channels: ["tiktok_shop_public"],
        language: "zh-CN analysis with English source labels",
        budgetAmountMinor: 198000,
        currency: "CNY",
        deliverableFormat: ["pdf", "csv"]
      },
      { expectedVersion: 0 }
    ),
    { stateFile }
  );
  assert.equal(rfpDraft.ok, true);

  const stalePublish = executeRuntimeCommand(
    "rfp.publish",
    runtimeEnvelope(
      "buyer",
      {
        rfpId: rfpDraft.dto.id,
        acceptanceTemplateId: "acceptance_template_trial_v1",
        competitorsOrDiscoveryRule: "Use 5 named competitors",
        prohibitedSources: ["production_account_login"],
        deadlineAt: "2026-05-10T18:00:00+08:00"
      },
      { expectedVersion: 0 }
    ),
    { stateFile }
  );
  assert.equal(stalePublish.ok, false);
  assert.equal(stalePublish.errorCode, "VERSION_CONFLICT");

  const state = loadRuntimeState(stateFile);
  assert.equal(state.rfps[0].rfpStatus, "draft");
  assert.equal(state.rfps[0].version, 1);
  assert.ok(state.eventLog.some((entry) => entry.eventName === "OptimisticLockRejected"));
});

test("rating.submit rejects seller self-rating attempts", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);

  const state = loadRuntimeState(stateFile);
  state.proposals.push({
    id: "proposal_self_rating_001",
    tenantId: "org_demo_001",
    proposalStatus: "selected",
    rfpId: "rfp_self_rating_001",
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    priceAmountMinor: 198000,
    currency: "CNY",
    version: 1
  });
  state.orders.push({
    id: "order_self_rating_001",
    tenantId: "org_demo_001",
    rfpId: "rfp_self_rating_001",
    proposalId: "proposal_self_rating_001",
    buyerOrgId: "org_demo_001",
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    orderStatus: "released",
    ledgerStatus: "released",
    acceptanceStatus: "accepted",
    amountMinor: 198000,
    currency: "CNY",
    version: 1
  });
  saveRuntimeState(state, stateFile);

  const selfRating = executeRuntimeCommand(
    "rating.submit",
    runtimeEnvelope("seller", {
      orderId: "order_self_rating_001",
      subjectType: "agent",
      subjectId: "agent_mira_competitor_intel_sandbox",
      agentVersion: "1.0.0",
      categoryIds: ["social_media_operations", "intelligence_research"],
      ratingBreakdown: { outcome: 5, evidence: 5, speed: 5 },
      deliveryOutcome: "accepted"
    }),
    { stateFile }
  );

  assert.equal(selfRating.ok, false);
  assert.equal(selfRating.errorCode, "ACTOR_FORBIDDEN");
  assert.equal(loadRuntimeState(stateFile).reputations.length, 0);
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
    runtimeEnvelope(
      "operator",
      {
        listingId: "listing_new_001",
        agentId: "agent_mira_competitor_intel_sandbox",
        categoryIds: ["social_media_operations"],
        priceAmountMinor: 198000,
        acceptanceTemplateId: "acceptance_social_result_v1",
        permissionTemplateId: "perm_social_readonly_v1",
        deliveryHours: 48,
        capacityAvailable: 1
      },
      { expectedVersion: 0 }
    ),
    { stateFile }
  );
  assert.equal(blocked.ok, false);
  assert.equal(blocked.errorCode, "STATE_CONFLICT");
});

test("proposal.submit rejects sellers below admission score 80", () => {
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
  assert.equal(draft.ok, true);

  const published = executeRuntimeCommand(
    "rfp.publish",
    runtimeEnvelope("buyer", {
      rfpId: draft.dto.id,
      acceptanceTemplateId: "acceptance_template_trial_v1",
      competitorsOrDiscoveryRule: "Use 5 named competitors",
      prohibitedSources: ["production_account_login"],
      deadlineAt: "2026-05-10T18:00:00+08:00"
    }),
    { stateFile }
  );
  assert.equal(published.ok, true);

  const state = loadRuntimeState(stateFile);
  state.sellers.push({
    id: "seller_under_80",
    legalEntity: "Under Threshold Ops",
    admissionScore: 79,
    admissionStatus: "approved",
    approved: true,
    payoutReadiness: "ready",
    capacityAvailable: 1,
    version: 1
  });
  saveRuntimeState(state, stateFile);

  const blocked = executeRuntimeCommand(
    "proposal.submit",
    runtimeEnvelope(
      "seller",
      {
        rfpId: draft.dto.id,
        sellerId: "seller_under_80",
        agentId: "agent_mira_competitor_intel_sandbox",
        priceAmountMinor: 198000,
        deliveryHours: 48,
        includedScope: ["5 competitors"],
        evidenceStandard: "Every key claim maps to evidence",
        responsibleOwner: "under-threshold@example.com",
        capacityReservedUntil: "2026-05-10T18:00:00+08:00"
      },
      { expectedVersion: published.newVersion }
    ),
    { stateFile }
  );

  assert.equal(blocked.ok, false);
  assert.equal(blocked.errorCode, "SELLER_NOT_APPROVED");
});

test("permission approval rejects denied high-risk tools", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);
  readyBuyerOrg(stateFile);

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
    runtimeEnvelope(
      "seller",
      {
        rfpId: draft.dto.id,
        sellerId: "seller_harbor_growth_sandbox",
        agentId: "agent_mira_competitor_intel_sandbox",
        priceAmountMinor: 198000,
        deliveryHours: 48,
        includedScope: ["5 competitors", "15 topic ideas"],
        evidenceStandard: "Every key claim maps to evidence",
        responsibleOwner: "project-owner@harbor-growth.example",
        capacityReservedUntil: "2026-05-10T18:00:00+08:00"
      },
      { expectedVersion: 2 }
    ),
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
    runtimeEnvelope(
      "buyer",
      {
        orderId: order.dto.id,
        paymentRef: "sandbox_payment_ref_001",
        receivedAt: "2026-05-08T20:00:00+08:00",
        receivedBy: "user_finance_sandbox_001"
      },
      { expectedVersion: order.newVersion }
    ),
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

test("proposal.accept blocks orders when buyer org lacks procurement signability", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);

  const state = loadRuntimeState(stateFile);
  state.rfps.push({
    id: "rfp_procurement_block_001",
    tenantId: "org_demo_001",
    buyerOrgId: "org_demo_001",
    rfpStatus: "quoting",
    category: "US TikTok Shop sensitive-skin skincare",
    version: 1
  });
  state.proposals.push({
    id: "proposal_procurement_block_001",
    tenantId: "org_demo_001",
    proposalStatus: "submitted",
    rfpId: "rfp_procurement_block_001",
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    priceAmountMinor: 198000,
    currency: "CNY",
    includedScope: ["5 competitors", "15 topic ideas"],
    version: 1
  });
  saveRuntimeState(state, stateFile);

  const blocked = executeRuntimeCommand(
    "proposal.accept",
    runtimeEnvelope("buyer", {
      proposalId: "proposal_procurement_block_001",
      termsSnapshot: "trial_v1_terms"
    }),
    { stateFile }
  );

  assert.equal(blocked.ok, false);
  assert.equal(blocked.errorCode, "BUYER_NOT_PROCUREMENT_READY");
  assert.equal(loadRuntimeState(stateFile).orders.length, 0);
});

test("escrow.fund blocks existing orders with incomplete finance profile", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);

  const state = loadRuntimeState(stateFile);
  state.orders.push({
    id: "order_missing_finance_001",
    tenantId: "org_demo_001",
    rfpId: "rfp_missing_finance_001",
    proposalId: "proposal_missing_finance_001",
    buyerOrgId: "org_demo_001",
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    orderStatus: "created",
    ledgerStatus: "not_funded",
    acceptanceStatus: "not_ready",
    amountMinor: 198000,
    currency: "CNY",
    contractingEntity: "",
    collectionEntity: "",
    invoiceIssuer: "",
    refundRemitter: "",
    version: 1
  });
  saveRuntimeState(state, stateFile);

  const blocked = executeRuntimeCommand(
    "escrow.fund",
    runtimeEnvelope("buyer", {
      orderId: "order_missing_finance_001",
      paymentRef: "sandbox_payment_ref_blocked",
      receivedAt: "2026-05-08T20:00:00+08:00",
      receivedBy: "user_finance_sandbox_001"
    }),
    { stateFile }
  );

  assert.equal(blocked.ok, false);
  assert.equal(blocked.errorCode, "BUYER_NOT_PROCUREMENT_READY");
  assert.equal(loadRuntimeState(stateFile).orders[0].ledgerStatus, "not_funded");
});

test("agent-listing publish fails closed when passport, templates, or pricing are incomplete", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);

  const missingPassport = executeRuntimeCommand(
    "agent-listing publish",
    runtimeEnvelope(
      "operator",
      {
        listingId: "listing_missing_passport_001",
        agentId: "agent_missing_passport",
        categoryIds: ["social_media_operations"],
        priceAmountMinor: 198000,
        acceptanceTemplateId: "acceptance_social_result_v1",
        permissionTemplateId: "perm_social_readonly_v1",
        deliveryHours: 48,
        capacityAvailable: 1
      },
      { expectedVersion: 0 }
    ),
    { stateFile }
  );
  assert.equal(missingPassport.ok, false);
  assert.equal(missingPassport.errorCode, "VALIDATION_FAILED");

  const missingTemplates = executeRuntimeCommand(
    "agent-listing publish",
    runtimeEnvelope(
      "operator",
      {
        listingId: "listing_missing_templates_001",
        agentId: "agent_mira_competitor_intel_sandbox",
        categoryIds: ["social_media_operations"],
        priceAmountMinor: 198000
      },
      { expectedVersion: 0 }
    ),
    { stateFile }
  );
  assert.equal(missingTemplates.ok, false);
  assert.equal(missingTemplates.errorCode, "VALIDATION_FAILED");

  const invalidPrice = executeRuntimeCommand(
    "agent-listing publish",
    runtimeEnvelope(
      "operator",
      {
        listingId: "listing_invalid_price_001",
        agentId: "agent_mira_competitor_intel_sandbox",
        categoryIds: ["social_media_operations"],
        priceAmountMinor: 0,
        acceptanceTemplateId: "acceptance_social_result_v1",
        permissionTemplateId: "perm_social_readonly_v1",
        deliveryHours: 48,
        capacityAvailable: 1
      },
      { expectedVersion: 0 }
    ),
    { stateFile }
  );
  assert.equal(invalidPrice.ok, false);
  assert.equal(invalidPrice.errorCode, "VALIDATION_FAILED");
});

test("acceptance.request-revision rejects fixes that expand beyond frozen proposal scope", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);

  const state = loadRuntimeState(stateFile);
  state.proposals.push({
    id: "proposal_revision_scope_001",
    tenantId: "org_demo_001",
    proposalStatus: "selected",
    rfpId: "rfp_revision_scope_001",
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    priceAmountMinor: 198000,
    currency: "CNY",
    includedScope: ["5 competitors", "15 topic ideas"],
    version: 1
  });
  state.orders.push({
    id: "order_revision_scope_001",
    tenantId: "org_demo_001",
    rfpId: "rfp_revision_scope_001",
    proposalId: "proposal_revision_scope_001",
    buyerOrgId: "org_demo_001",
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    orderStatus: "ready_for_acceptance",
    ledgerStatus: "locked",
    acceptanceStatus: "ready",
    amountMinor: 198000,
    currency: "CNY",
    includedScope: ["5 competitors", "15 topic ideas"],
    version: 1
  });
  saveRuntimeState(state, stateFile);

  const blocked = executeRuntimeCommand(
    "acceptance.request-revision",
    runtimeEnvelope("buyer", {
      orderId: "order_revision_scope_001",
      deliveryPackageId: "delivery_revision_scope_001",
      failedCriteria: ["topic_actionability"],
      requestedFixes: ["add 3 net-new competitor teardown reports"],
      decisionReason: "new work requested"
    }),
    { stateFile }
  );

  assert.equal(blocked.ok, false);
  assert.equal(blocked.errorCode, "SCOPE_EXPANSION_REQUIRED");
  assert.equal(loadRuntimeState(stateFile).reviews.length, 0);
});
