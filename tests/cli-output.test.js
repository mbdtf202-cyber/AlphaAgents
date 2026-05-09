import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import test from "node:test";

import { createTempStateFile, resetRuntimeState } from "../lib/alphaagents/runtime-state.js";

const cliPath = new URL("../scripts/alphaagents.mjs", import.meta.url).pathname;

function runCli(args, stateFile) {
  return execFileSync(process.execPath, [cliPath, ...args], {
    encoding: "utf8",
    env: {
      ...process.env,
      ALPHAAGENTS_STATE_FILE: stateFile
    }
  }).trim();
}

test("CLI supports default human output and --json machine output", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);

  const human = runCli(["agent-category", "list"], stateFile);
  assert.match(human, /Agent categories/);
  assert.match(human, /social_media_operations/);
  assert.throws(() => JSON.parse(human), SyntaxError);

  const json = runCli(["agent-category", "list", "--json"], stateFile);
  const parsed = JSON.parse(json);
  assert.ok(Array.isArray(parsed));
  assert.ok(parsed.some((category) => category.categoryId === "social_media_operations"));
});

test("CLI write commands also support human output and --json result envelopes", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);

  const human = runCli(["agent-category", "archive"], stateFile);
  assert.match(human, /Command agent-category archive succeeded/);
  assert.match(human, /AgentCategoryArchived/);
  assert.throws(() => JSON.parse(human), SyntaxError);

  resetRuntimeState(stateFile);
  const json = runCli(["agent-category", "archive", "--json"], stateFile);
  const parsed = JSON.parse(json);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.events[0].eventName, "AgentCategoryArchived");
});
