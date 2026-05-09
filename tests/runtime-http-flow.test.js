import assert from "node:assert/strict";
import test from "node:test";

import { resetRuntimeState } from "../lib/alphaagents/runtime-state.js";
import { executeRuntimeCommand } from "../lib/alphaagents/runtime-engine.js";
import { createDemoEnvelope, buildSamplePayload } from "../lib/alphaagents/commands.js";

test("runtime command engine advances a draft RFP to funded order with shared state", () => {
  resetRuntimeState();

  const rfpCreate = executeRuntimeCommand(
    "rfp.create",
    { ...createDemoEnvelope("buyer", buildSamplePayload("rfp.create")), sourceChannel: "api", expectedVersion: 0 }
  );
  assert.equal(rfpCreate.ok, true);

  const rfpPublish = executeRuntimeCommand(
    "rfp.publish",
    {
      ...createDemoEnvelope("buyer", {
        ...buildSamplePayload("rfp.publish"),
        rfpId: rfpCreate.dto.id
      }),
      sourceChannel: "api",
      expectedVersion: 1
    }
  );
  assert.equal(rfpPublish.ok, true);
  assert.equal(rfpPublish.dto.rfpStatus, "published");

  const proposal = executeRuntimeCommand(
    "proposal.submit",
    {
      ...createDemoEnvelope("seller", {
        ...buildSamplePayload("proposal.submit"),
        rfpId: rfpCreate.dto.id
      }),
      sourceChannel: "api",
      expectedVersion: rfpPublish.newVersion
    }
  );
  assert.equal(proposal.ok, true);

  const accepted = executeRuntimeCommand(
    "proposal.accept",
    {
      ...createDemoEnvelope("buyer", {
        ...buildSamplePayload("proposal.accept"),
        proposalId: proposal.dto.id
      }),
      sourceChannel: "api"
    }
  );
  assert.equal(accepted.ok, true);
  assert.equal(accepted.dto.orderStatus, "created");

  const funded = executeRuntimeCommand(
    "escrow.fund",
    {
      ...createDemoEnvelope("buyer", {
        ...buildSamplePayload("escrow.fund"),
        orderId: accepted.dto.id
      }),
      sourceChannel: "api",
      expectedVersion: accepted.newVersion
    }
  );
  assert.equal(funded.ok, true);
  assert.equal(funded.dto.ledgerStatus, "escrowed");
});
