import assert from "node:assert/strict";
import test from "node:test";

import contract from "../contracts/alphaagents.contract.json" with { type: "json" };
import { buildSamplePayload, createDemoEnvelope, runCommand } from "../lib/alphaagents/commands.js";

test("every contract command is executable with a valid sample payload", () => {
  for (const [commandName, spec] of Object.entries(contract.commands)) {
    const actorRole = spec.actorRoles[0];
    const result = runCommand(commandName, createDemoEnvelope(actorRole, buildSamplePayload(commandName)));
    assert.equal(result.ok, true, commandName);
  }
});

test("catalog control-plane commands return structured results", () => {
  const commands = [
    "agent-category create",
    "agent-category update",
    "agent-category archive",
    "agent-category restore",
    "agent-passport create",
    "agent-passport update",
    "agent-passport suspend",
    "agent-listing publish",
    "agent-listing update",
    "agent-listing archive"
  ];

  for (const commandName of commands) {
    const result = runCommand(commandName, createDemoEnvelope("operator", buildSamplePayload(commandName)));
    assert.equal(result.ok, true, commandName);
    assert.ok(result.dto);
    assert.ok(Array.isArray(result.events));
  }
});

test("agent app and program commands use their canonical actor roles", () => {
  const actorMap = {
    "buyer-org.setup": "buyer",
    "custom-project.request": "buyer",
    "custom-project.confirm-milestone": "operator",
    "custom-project.submit-uat": "seller",
    "custom-project.create-change-order": "buyer",
    "agent-app.install": "buyer",
    "agent-app.record-usage": "buyer",
    "agent-app.exit": "buyer",
    "program.allocate-credit": "operator",
    "program.record-drawdown": "operator",
    "program.update-qbr": "operator"
  };

  for (const [commandName, actorRole] of Object.entries(actorMap)) {
    const result = runCommand(commandName, createDemoEnvelope(actorRole, buildSamplePayload(commandName)));
    assert.equal(result.ok, true, commandName);
    assert.ok(result.dto);
    assert.ok(Array.isArray(result.events));
  }
});
