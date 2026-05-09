import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import { executeRuntimeCommand } from "../lib/alphaagents/runtime-engine.js";
import { createTempStateFile, resetRuntimeState } from "../lib/alphaagents/runtime-state.js";
import {
  getAgentDetailModel,
  getAgentAppDetailModel,
  getAgentAppsIndexModel,
  getBuyerOrgSetupModel,
  getCatalogModel,
  getCustomAgentModel,
  getOrderWorkspaceModel,
  getOrdersIndexModel,
  getProviderProofModel,
  getProgramOpsModel,
  getReputationModel,
  getRiskFinanceModel
} from "../lib/alphaagents/view-models.js";

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

test("agent app detail model includes live install, usage, and exit proof", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);

  const install = executeRuntimeCommand(
    "agent-app.install",
    runtimeEnvelope(
      "buyer",
      {
        appId: "agent_app_harbor_growth_workbench",
        buyerOrgId: "org_demo_001",
        authorizedBy: "user_demo_buyer_owner",
        usageMode: "subscription"
      },
      { expectedVersion: 0 }
    ),
    { stateFile }
  );
  assert.equal(install.ok, true);

  const usage = executeRuntimeCommand(
    "agent-app.record-usage",
    runtimeEnvelope(
      "buyer",
      {
        installId: install.dto.id,
        appId: "agent_app_harbor_growth_workbench",
        usageSummary: "weekly content sync completed with buyer-safe evidence",
        evidenceRefs: ["ev_sandbox_delivery_pdf_001"]
      },
      { expectedVersion: install.newVersion }
    ),
    { stateFile }
  );
  assert.equal(usage.ok, true);

  const exit = executeRuntimeCommand(
    "agent-app.exit",
    runtimeEnvelope(
      "buyer",
      {
        installId: install.dto.id,
        exitReason: "quarterly review complete"
      },
      { expectedVersion: install.newVersion }
    ),
    { stateFile }
  );
  assert.equal(exit.ok, true);

  const model = getAgentAppDetailModel("harbor-growth-workbench-app", { stateFile });

  assert.ok(model.runtimeInstalls.length >= 1);
  assert.ok(model.runtimeUsageRuns.length >= 1);
  assert.equal(model.latestInstall.installStatus, "exited");
  assert.equal(model.activeInstallCount, 0);
});

test("agent app index links to AgentAppPassport detail slugs instead of listing slugs", () => {
  const model = getAgentAppsIndexModel();
  const app = model.apps.find((entry) => entry.agentId === "agent_app_harbor_growth_workbench");

  assert.ok(app);
  assert.equal(app.slug, "harbor-growth-workbench");
  assert.equal(app.detailSlug, "harbor-growth-workbench-app");
  assert.ok(getAgentAppDetailModel(app.detailSlug));
});

test("detail and reputation models expose order-version-category rating provenance", () => {
  const agent = getAgentDetailModel("mira-competitor-intel-agent");
  const reputation = getReputationModel();

  assert.ok(agent.reputationEvents.length >= 1);
  assert.equal(agent.reputationEvents[0].sourceOrderId.startsWith("order_sandbox_"), true);
  assert.ok(agent.reputationEvents[0].agentVersion);
  assert.ok(agent.reputationEvents[0].categories.includes("社媒运营"));

  assert.ok(reputation.provenanceRows.length >= 3);
  assert.equal(reputation.provenanceRows[0].eventStatus, "published");
  assert.ok(reputation.provenanceRows[0].categories.includes("情报"));
});

test("agent detail model exposes UI-22 reputation and performance completeness", () => {
  const agent = getAgentDetailModel("mira-competitor-intel-agent");

  assert.ok(agent.historicalOrderRows.length >= 3);
  assert.deepEqual(
    agent.ratingDistributionBuckets.map((bucket) => [bucket.rating, bucket.count]),
    [
      [5, 2],
      [4, 1],
      [3, 0],
      [2, 0],
      [1, 0]
    ]
  );
  assert.equal(agent.performanceMetrics.onTimeDeliveryRate, "100%");
  assert.equal(agent.performanceMetrics.reworkRevisionRate, "33%");
  assert.equal(agent.performanceMetrics.disputeRate, "33%");

  assert.ok(agent.performanceHistory.length >= 3);
  assert.ok(agent.performanceHistory.every((entry) => entry.reviewScore >= 0));

  const revisionRow = agent.historicalOrderRows.find((row) => row.orderId === "order_sandbox_revision_002");
  const disputeRow = agent.historicalOrderRows.find((row) => row.orderId === "order_sandbox_dispute_003");

  assert.equal(revisionRow.reworkRevisionFlag, "yes");
  assert.equal(disputeRow.disputeFlag, "yes");
  assert.equal(disputeRow.deliveryOutcome, "partially_released");
});

test("agent detail page renders UI-22 reputation and performance sections", () => {
  const pageSource = fs.readFileSync(new URL("../app/agents/[slug]/page.tsx", import.meta.url), "utf8");

  assert.match(pageSource, /performanceMetrics/);
  assert.match(pageSource, /historicalOrderRows/);
  assert.match(pageSource, /ratingDistributionBuckets/);
  assert.match(pageSource, /performanceHistory/);
});

test("catalog and finance models expose seller admission and category unit economics", () => {
  const catalog = getCatalogModel();
  const providerProof = getProviderProofModel();
  const riskFinance = getRiskFinanceModel();

  assert.ok(catalog.categoryUnitEconomics.length >= 1);
  assert.ok(catalog.categoryUnitEconomics[0].averageGmv.startsWith("¥"));
  assert.ok(catalog.categoryUnitEconomics[0].contributionMargin.endsWith("%"));

  assert.ok(providerProof.sellers.every((seller) => seller.admissionScore >= 80));
  assert.ok(providerProof.sellers.some((seller) => seller.gate === "Can receive proposals"));

  assert.ok(riskFinance.sellerAdmissions.length >= 1);
  assert.ok(riskFinance.sellerAdmissions.every((seller) => seller.gate === "pass"));
  assert.ok(riskFinance.categoryUnitEconomics.some((entry) => entry.categoryId === "social_media_operations"));
});

test("program ops model reflects runtime credit, drawdown, and qbr state", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);

  const allocated = executeRuntimeCommand(
    "program.allocate-credit",
    runtimeEnvelope("operator", {
      programId: "program_northstar_growth_001",
      creditAmountMinor: 320000,
      reason: "quarterly top-up"
    }),
    { stateFile }
  );
  assert.equal(allocated.ok, true);

  const drawdown = executeRuntimeCommand(
    "program.record-drawdown",
    runtimeEnvelope(
      "operator",
      {
        programId: "program_northstar_growth_001",
        drawdownMinor: 120000,
        reason: "managed delivery batch 01"
      },
      { expectedVersion: allocated.newVersion }
    ),
    { stateFile }
  );
  assert.equal(drawdown.ok, true);

  const qbr = executeRuntimeCommand(
    "program.update-qbr",
    runtimeEnvelope(
      "operator",
      {
        programId: "program_northstar_growth_001",
        qbrStatus: "ready_for_review"
      },
      { expectedVersion: drawdown.newVersion }
    ),
    { stateFile }
  );
  assert.equal(qbr.ok, true);

  const model = getProgramOpsModel({ stateFile });

  assert.equal(model.program.activeCreditMinor, 2000000);
  assert.equal(model.program.qbrStatus, "ready_for_review");
  assert.ok(model.programEvents.length >= 3);
});

test("risk finance model exposes live runtime finance rows", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);

  const buyerSetup = executeRuntimeCommand(
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
  assert.equal(buyerSetup.ok, true);

  const rfp = executeRuntimeCommand(
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
  assert.equal(rfp.ok, true);

  const published = executeRuntimeCommand(
    "rfp.publish",
    runtimeEnvelope("buyer", {
      rfpId: rfp.dto.id,
      acceptanceTemplateId: "acceptance_template_trial_v1",
      competitorsOrDiscoveryRule: "Use 5 named competitors",
      prohibitedSources: ["production_account_login", "paid_account", "private_group", "ad_account", "fund_movement"],
      deadlineAt: "2026-05-10T18:00:00+08:00"
    }),
    { stateFile }
  );
  assert.equal(published.ok, true);

  const proposal = executeRuntimeCommand(
    "proposal.submit",
    runtimeEnvelope(
      "seller",
      {
        rfpId: rfp.dto.id,
        sellerId: "seller_harbor_growth_sandbox",
        agentId: "agent_mira_competitor_intel_sandbox",
        priceAmountMinor: 198000,
        deliveryHours: 48,
        includedScope: ["5 competitors", "15 topic ideas"],
        evidenceStandard: "Every key claim maps to evidence",
        responsibleOwner: "project-owner@harbor-growth.example",
        capacityReservedUntil: "2026-05-10T18:00:00+08:00"
      },
      { expectedVersion: published.newVersion }
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

  const model = getRiskFinanceModel({ stateFile });

  assert.ok(model.runtimeOrders.length >= 1);
  assert.ok(model.runtimeGrants.length >= 1);
  assert.equal(model.runtimeOrders[0].ledgerStatus, "escrowed");
  assert.equal(model.runtimeFinanceRows[0].paymentRef, "sandbox_payment_ref_001");
  assert.equal(model.runtimeFinanceRows[0].contractingEntity, "NorthStar Beauty LLC");
  assert.equal(model.runtimeFinanceRows[0].invoiceStatus, "requested");
  assert.equal(model.runtimeFinanceRows[0].reconciliationStatus, "payment_recorded");
  assert.ok(model.runtimeEvents.some((entry) => entry.eventName === "EscrowFunded"));
  assert.ok(model.financeEvidenceRows.every((entry) => entry.contractingEntity === "NorthStar Beauty LLC"));
  assert.ok(model.financeEvidenceRows.every((entry) => entry.reconciliationExport.endsWith("12-finance-ledger.json")));
  assert.ok(model.roiRows.every((entry) => entry.cycleTimeSavedHours > 0));
  assert.ok(model.roiRows.every((entry) => entry.repurchaseSignal));
});

test("orders, programs, reputation, and workspace models expose finance and ROI review rows", () => {
  const orders = getOrdersIndexModel();
  const program = getProgramOpsModel();
  const reputation = getReputationModel();
  const workspace = getOrderWorkspaceModel();

  assert.ok(orders.sampleFinanceRows.length >= 3);
  assert.ok(orders.roiRows.every((entry) => entry.renewalSignal));
  assert.ok(program.roiRows.some((entry) => entry.contributionMarginEstimate.endsWith("%")));
  assert.ok(reputation.roiRows.some((entry) => entry.refundCostMinor >= 0));
  assert.ok(workspace.financeRows.every((entry) => entry.invoiceStatus));
  assert.ok(workspace.roiRows.every((entry) => entry.usableResultRate));
});

test("custom agent model reflects intake, milestone, UAT, and change order runtime state", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);

  const intake = executeRuntimeCommand(
    "custom-project.request",
    runtimeEnvelope(
      "buyer",
      {
        projectId: "custom_project_northstar_launch_001",
        buyerOrgId: "org_demo_001",
        projectTitle: "NorthStar launch workflow agent",
        categoryId: "custom_agent_app",
        targetOutcome: "launch-ready managed workflow agent with buyer UAT",
        requestedBy: "user_demo_buyer_owner"
      },
      { expectedVersion: 0 }
    ),
    { stateFile }
  );
  assert.equal(intake.ok, true);

  const milestone = executeRuntimeCommand(
    "custom-project.confirm-milestone",
    runtimeEnvelope(
      "operator",
      {
        projectId: intake.dto.id,
        milestoneId: "milestone_design_freeze_001",
        milestoneName: "Design freeze",
        dueAt: "2026-05-20T18:00:00+08:00"
      },
      { expectedVersion: intake.newVersion }
    ),
    { stateFile }
  );
  assert.equal(milestone.ok, true);

  const uat = executeRuntimeCommand(
    "custom-project.submit-uat",
    runtimeEnvelope(
      "seller",
      {
        projectId: intake.dto.id,
        milestoneId: "milestone_design_freeze_001",
        executionSummary: "sandbox UAT flow completed",
        evidenceRefs: ["ev_sandbox_delivery_pdf_001"]
      },
      { expectedVersion: milestone.newVersion }
    ),
    { stateFile }
  );
  assert.equal(uat.ok, true);

  const change = executeRuntimeCommand(
    "custom-project.create-change-order",
    runtimeEnvelope(
      "buyer",
      {
        projectId: intake.dto.id,
        changeOrderId: "change_scope_001",
        requestedChange: "add private deployment checklist",
        impactSummary: "one extra review cycle"
      },
      { expectedVersion: uat.newVersion }
    ),
    { stateFile }
  );
  assert.equal(change.ok, true);

  const model = getCustomAgentModel({ stateFile });

  assert.equal(model.runtimeProjects.length, 1);
  assert.equal(model.runtimeProjects[0].projectStatus, "change_requested");
  assert.equal(model.runtimeProjects[0].milestones.length, 1);
  assert.equal(model.runtimeProjects[0].uatStatus, "submitted");
  assert.equal(model.runtimeProjects[0].changeOrders.length, 1);
});

test("buyer org model requires procurement signability fields for high-risk readiness", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);

  const updated = executeRuntimeCommand(
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
  assert.equal(updated.ok, true);

  const model = getBuyerOrgSetupModel({ stateFile });
  assert.equal(model.readiness.find((entry) => entry.label === "Authority chain")?.status, "Pass");
  assert.equal(model.readiness.find((entry) => entry.label === "Invoice readiness")?.status, "ready");
  assert.equal(model.readiness.find((entry) => entry.label === "Scope acknowledgement")?.status, "accepted");
  assert.equal(model.readiness.find((entry) => entry.label === "Contracting entity")?.status, "Pass");
  assert.equal(model.readiness.find((entry) => entry.label === "Collection entity")?.status, "Pass");
  assert.equal(model.readiness.find((entry) => entry.label === "Invoice issuer")?.status, "Pass");
  assert.equal(model.readiness.find((entry) => entry.label === "Refund remitter")?.status, "Pass");
  assert.equal(model.readiness.find((entry) => entry.label === "Legal contact")?.status, "Pass");
  assert.equal(model.readiness.find((entry) => entry.label === "Subprocessors")?.status, "Pass");
});

test("risk finance model exposes high-risk authorization preview audit and revoke path", () => {
  const model = getRiskFinanceModel();

  assert.ok(model.riskActionChecklist.length >= 4);
  assert.deepEqual(
    model.riskActionChecklist.map((item) => item.gate),
    ["explicit_authorization", "action_preview", "audit_event", "revoke_path"]
  );
  assert.ok(model.riskActionChecklist.every((item) => item.command.startsWith("alphaagents ")));
  assert.ok(model.riskActionChecklist.some((item) => item.command.includes("permission revoke")));

  assert.ok(model.highRiskPermissionPreview.deniedTools.includes("account_login"));
  assert.ok(model.highRiskPermissionPreview.previewFields.includes("toolAllowlist"));
  assert.ok(model.highRiskPermissionPreview.previewFields.includes("expiresAt"));
  assert.ok(model.highRiskPermissionPreview.auditEvents.includes("PermissionApproved"));
  assert.ok(model.highRiskPermissionPreview.auditEvents.includes("PermissionDenied"));
  assert.ok(model.highRiskPermissionPreview.auditEvents.includes("PermissionRevoked"));
});
