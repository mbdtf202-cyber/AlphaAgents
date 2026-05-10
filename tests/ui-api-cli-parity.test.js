import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

import { buildSamplePayload, createDemoEnvelope } from "../lib/alphaagents/commands.js";
import { executeRuntimeCommand } from "../lib/alphaagents/runtime-engine.js";
import { createTempStateFile, loadRuntimeState, resetRuntimeState } from "../lib/alphaagents/runtime-state.js";
import { getOrdersIndexModel, getRfpsModel, getRiskFinanceModel } from "../lib/alphaagents/view-models.js";

const cliPath = new URL("../scripts/alphaagents.mjs", import.meta.url).pathname;

function apiEnvelope(actorRole, payload, overrides = {}) {
  return {
    ...createDemoEnvelope(actorRole, payload),
    commandId: `cmd_api_${Math.random().toString(36).slice(2, 10)}`,
    idempotencyKey: `idem_api_${Math.random().toString(36).slice(2, 10)}`,
    correlationId: `corr_api_${Math.random().toString(36).slice(2, 10)}`,
    sourceChannel: "api",
    ...overrides,
    payload
  };
}

function runApiEquivalent(commandName, actorRole, payload, stateFile, overrides = {}) {
  return executeRuntimeCommand(commandName, apiEnvelope(actorRole, payload, overrides), { stateFile });
}

function runCli(args, stateFile) {
  return execFileSync(process.execPath, [cliPath, ...args, "--json"], {
    encoding: "utf8",
    env: {
      ...process.env,
      ALPHAAGENTS_STATE_FILE: stateFile
    }
  }).trim();
}

test("UI/API/CLI state parity covers RFP, proposal, escrow, run, delivery, acceptance, dispute, and rating actions", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);

  const buyerSetup = runApiEquivalent("buyer-org.setup", "buyer", buildSamplePayload("buyer-org.setup"), stateFile);
  assert.equal(buyerSetup.ok, true);

  const cliRfpCreate = JSON.parse(runCli(["rfp", "create"], stateFile));
  assert.equal(cliRfpCreate.ok, true);

  const cliRfpPublish = JSON.parse(runCli(["rfp", "publish"], stateFile));
  assert.equal(cliRfpPublish.ok, true);

  const rfpModel = getRfpsModel({ stateFile });
  assert.equal(rfpModel.runtimeRfps.at(-1).rfpStatus, "published");
  assert.equal(loadRuntimeState(stateFile).eventLog.at(-1).eventName, "RfpPublished");

  const rfpId = cliRfpPublish.dto.id;
  const proposal = runApiEquivalent(
    "proposal.submit",
    "seller",
    {
      ...buildSamplePayload("proposal.submit"),
      rfpId
    },
    stateFile,
    { expectedVersion: cliRfpPublish.newVersion }
  );
  assert.equal(proposal.ok, true);
  assert.equal(getRfpsModel({ stateFile }).runtimeProposals.at(-1).proposalStatus, "submitted");

  const accepted = runApiEquivalent(
    "proposal.accept",
    "buyer",
    {
      ...buildSamplePayload("proposal.accept"),
      proposalId: proposal.dto.id
    },
    stateFile,
    { expectedVersion: proposal.newVersion }
  );
  assert.equal(accepted.ok, true);

  const funded = runApiEquivalent(
    "escrow.fund",
    "buyer",
    {
      ...buildSamplePayload("escrow.fund"),
      orderId: accepted.dto.id
    },
    stateFile,
    { expectedVersion: accepted.newVersion }
  );
  assert.equal(funded.ok, true);
  assert.equal(getRiskFinanceModel({ stateFile }).runtimeFinanceRows.at(-1).paymentRef, "sandbox_payment_ref_001");

  const grant = loadRuntimeState(stateFile).grants.at(-1);
  const approved = runApiEquivalent(
    "permission.approve",
    "operator",
    {
      ...buildSamplePayload("permission.approve"),
      grantId: grant.id
    },
    stateFile,
    { expectedVersion: grant.version }
  );
  assert.equal(approved.ok, true);

  const run = runApiEquivalent(
    "run.start",
    "seller",
    {
      ...buildSamplePayload("run.start"),
      orderId: accepted.dto.id,
      permissionGrantIds: [grant.id]
    },
    stateFile,
    { expectedVersion: loadRuntimeState(stateFile).orders.at(-1).version }
  );
  assert.equal(run.ok, true);

  const delivery = runApiEquivalent(
    "delivery.submit",
    "seller",
    {
      ...buildSamplePayload("delivery.submit"),
      orderId: accepted.dto.id,
      executionRunIds: [run.dto.id]
    },
    stateFile,
    { expectedVersion: loadRuntimeState(stateFile).orders.at(-1).version }
  );
  assert.equal(delivery.ok, true);

  const qa = runApiEquivalent(
    "delivery.qa_pass",
    "operator",
    {
      ...buildSamplePayload("delivery.qa_pass"),
      deliveryPackageId: delivery.dto.id
    },
    stateFile,
    { expectedVersion: delivery.newVersion }
  );
  assert.equal(qa.ok, true);

  const acceptedDelivery = runApiEquivalent(
    "acceptance.accept",
    "buyer",
    {
      ...buildSamplePayload("acceptance.accept"),
      orderId: accepted.dto.id,
      deliveryPackageId: delivery.dto.id
    },
    stateFile,
    { expectedVersion: qa.newVersion }
  );
  assert.equal(acceptedDelivery.ok, true);

  const released = runApiEquivalent(
    "escrow.release",
    "operator",
    {
      ...buildSamplePayload("escrow.release"),
      orderId: accepted.dto.id
    },
    stateFile,
    { expectedVersion: acceptedDelivery.newVersion }
  );
  assert.equal(released.ok, true);

  const rating = runApiEquivalent(
    "rating.submit",
    "buyer",
    {
      ...buildSamplePayload("rating.submit"),
      orderId: accepted.dto.id
    },
    stateFile,
    { expectedVersion: released.newVersion }
  );
  assert.equal(rating.ok, true);

  const cliSnapshot = JSON.parse(runCli(["runtime", "snapshot"], stateFile));
  const uiOrders = getOrdersIndexModel({ stateFile });
  const orderFromCli = cliSnapshot.orders.find((order) => order.id === accepted.dto.id);
  const orderFromUi = uiOrders.runtimeOrders.find((order) => order.id === accepted.dto.id);
  const eventNames = cliSnapshot.events.map((event) => event.eventName);

  assert.equal(orderFromCli.orderStatus, "released");
  assert.equal(orderFromUi.orderStatus, orderFromCli.orderStatus);
  assert.equal(cliSnapshot.reputations.at(-1).subjectId, "agent_mira_competitor_intel_sandbox");
  assert.ok(eventNames.includes("RfpPublished"));
  assert.ok(eventNames.includes("ProposalSubmitted"));
  assert.ok(eventNames.includes("EscrowFunded"));
  assert.ok(eventNames.includes("RunStarted"));
  assert.ok(eventNames.includes("DeliverySubmitted"));
  assert.ok(eventNames.includes("AcceptanceAccepted"));
  assert.ok(eventNames.includes("EscrowReleased"));
  assert.ok(eventNames.includes("ReputationPublished"));

  const disputeStateFile = createTempStateFile();
  resetRuntimeState(disputeStateFile);
  runApiEquivalent("buyer-org.setup", "buyer", buildSamplePayload("buyer-org.setup"), disputeStateFile);
  JSON.parse(runCli(["rfp", "create"], disputeStateFile));
  const published = JSON.parse(runCli(["rfp", "publish"], disputeStateFile));
  const submitted = runApiEquivalent(
    "proposal.submit",
    "seller",
    { ...buildSamplePayload("proposal.submit"), rfpId: published.dto.id },
    disputeStateFile,
    { expectedVersion: published.newVersion }
  );
  const order = runApiEquivalent(
    "proposal.accept",
    "buyer",
    { ...buildSamplePayload("proposal.accept"), proposalId: submitted.dto.id },
    disputeStateFile,
    { expectedVersion: submitted.newVersion }
  );
  const fund = runApiEquivalent(
    "escrow.fund",
    "buyer",
    { ...buildSamplePayload("escrow.fund"), orderId: order.dto.id },
    disputeStateFile,
    { expectedVersion: order.newVersion }
  );
  const requestedGrant = loadRuntimeState(disputeStateFile).grants.at(-1);
  runApiEquivalent(
    "permission.approve",
    "operator",
    { ...buildSamplePayload("permission.approve"), grantId: requestedGrant.id },
    disputeStateFile,
    { expectedVersion: requestedGrant.version }
  );
  const disputeRun = runApiEquivalent(
    "run.start",
    "seller",
    { ...buildSamplePayload("run.start"), orderId: order.dto.id, permissionGrantIds: [requestedGrant.id] },
    disputeStateFile,
    { expectedVersion: fund.newVersion }
  );
  const disputeDelivery = runApiEquivalent(
    "delivery.submit",
    "seller",
    { ...buildSamplePayload("delivery.submit"), orderId: order.dto.id, executionRunIds: [disputeRun.dto.id] },
    disputeStateFile,
    { expectedVersion: loadRuntimeState(disputeStateFile).orders.at(-1).version }
  );
  const disputeQa = runApiEquivalent(
    "delivery.qa_pass",
    "operator",
    { ...buildSamplePayload("delivery.qa_pass"), deliveryPackageId: disputeDelivery.dto.id },
    disputeStateFile,
    { expectedVersion: disputeDelivery.newVersion }
  );
  const openedDispute = runApiEquivalent(
    "dispute.open",
    "buyer",
    { ...buildSamplePayload("dispute.open"), orderId: order.dto.id, deliveryPackageId: disputeDelivery.dto.id },
    disputeStateFile,
    { expectedVersion: disputeQa.newVersion }
  );
  assert.equal(openedDispute.ok, true);
  assert.equal(getOrdersIndexModel({ stateFile: disputeStateFile }).runtimeOrders.at(-1).orderStatus, "disputed");
  assert.ok(JSON.parse(runCli(["runtime", "snapshot"], disputeStateFile)).events.some((event) => event.eventName === "DisputeOpened"));
});
