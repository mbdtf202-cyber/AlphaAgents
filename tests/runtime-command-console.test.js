import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("../components/alphaagents/runtime-command-console.tsx", import.meta.url), "utf8");

test("runtime command console confirms writes before executing command handlers", () => {
  assert.match(source, /function requestCommandConfirmation/);
  assert.match(source, /function requestWorkflowConfirmation/);
  assert.match(source, /onClick=\{\(event\) => requestCommandConfirmation\(definition, event\.currentTarget\)\}/);
  assert.match(source, /onClick=\{\(event\) => requestWorkflowConfirmation\(definition, event\.currentTarget\)\}/);
  assert.doesNotMatch(source, /onClick=\{\(\) => void runCommand\(definition\)\}/);
  assert.doesNotMatch(source, /onClick=\{\(\) => void runWorkflow\(definition\)\}/);
});

test("runtime command console requires second acknowledgement for dangerous actions", () => {
  for (const token of [
    '["permission.approve"',
    '["escrow.refund"',
    '["escrow.partial-release"',
    '["agent-category archive"',
    '["custom-project.create-change-order"',
    "Danger confirmation required.",
    "I understand the risk",
    "disabled={Boolean(pendingConfirmation.dangerBody && !pendingConfirmation.dangerConfirmed)}"
  ]) {
    assert.ok(source.includes(token), `runtime command console missing ${token}`);
  }
});

test("runtime command confirmation dialog is accessible and returns focus", () => {
  for (const token of [
    'role="dialog"',
    'aria-modal="true"',
    'aria-labelledby="runtime-confirmation-title"',
    'aria-describedby="runtime-confirmation-body"',
    'event.key === "Escape"',
    "confirmationPrimaryRef.current?.focus()",
    "confirmationTriggerRef.current?.focus()"
  ]) {
    assert.ok(source.includes(token), `runtime command confirmation missing ${token}`);
  }
});
