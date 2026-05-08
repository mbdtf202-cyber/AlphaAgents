import assert from "node:assert/strict";
import test from "node:test";

import { executeRuntimeCommand } from "../lib/alphaagents/runtime-engine.js";
import { createTempStateFile, resetRuntimeState } from "../lib/alphaagents/runtime-state.js";
import {
  getAgentAppDetailModel,
  getProgramOpsModel,
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
    runtimeEnvelope("buyer", {
      installId: install.dto.id,
      appId: "agent_app_harbor_growth_workbench",
      usageSummary: "weekly content sync completed with buyer-safe evidence",
      evidenceRefs: ["ev_sandbox_delivery_pdf_001"]
    }),
    { stateFile }
  );
  assert.equal(usage.ok, true);

  const exit = executeRuntimeCommand(
    "agent-app.exit",
    runtimeEnvelope("buyer", {
      installId: install.dto.id,
      exitReason: "quarterly review complete"
    }),
    { stateFile }
  );
  assert.equal(exit.ok, true);

  const model = getAgentAppDetailModel("harbor-growth-workbench-app", { stateFile });

  assert.ok(model.runtimeInstalls.length >= 1);
  assert.ok(model.runtimeUsageRuns.length >= 1);
  assert.equal(model.latestInstall.installStatus, "exited");
  assert.equal(model.activeInstallCount, 0);
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
    runtimeEnvelope("operator", {
      programId: "program_northstar_growth_001",
      drawdownMinor: 120000,
      reason: "managed delivery batch 01"
    }),
    { stateFile }
  );
  assert.equal(drawdown.ok, true);

  const qbr = executeRuntimeCommand(
    "program.update-qbr",
    runtimeEnvelope("operator", {
      programId: "program_northstar_growth_001",
      qbrStatus: "ready_for_review"
    }),
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
    runtimeEnvelope("seller", {
      rfpId: rfp.dto.id,
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

  const model = getRiskFinanceModel({ stateFile });

  assert.ok(model.runtimeOrders.length >= 1);
  assert.ok(model.runtimeGrants.length >= 1);
  assert.equal(model.runtimeOrders[0].ledgerStatus, "escrowed");
  assert.ok(model.runtimeEvents.some((entry) => entry.eventName === "EscrowFunded"));
});
