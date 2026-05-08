#!/usr/bin/env node

import { buildSamplePayload, createDemoEnvelope } from "../lib/alphaagents/commands.js";
import { runQuery } from "../lib/alphaagents/queries.js";
import { executeRuntimeCommand } from "../lib/alphaagents/runtime-engine.js";
import { getRuntimeSnapshot } from "../lib/alphaagents/runtime-queries.js";
import { loadRuntimeState, resetRuntimeState, resolveStateFile } from "../lib/alphaagents/runtime-state.js";

const args = process.argv.slice(2);
const command = args.join(" ");
const stateFile = resolveStateFile();

if (command === "agent-category list") {
  console.log(JSON.stringify(loadRuntimeState(stateFile).categories, null, 2));
  process.exit(0);
}

if (command === "agent-listing search") {
  console.log(JSON.stringify(loadRuntimeState(stateFile).listings, null, 2));
  process.exit(0);
}

if (command === "runtime snapshot") {
  console.log(JSON.stringify(getRuntimeSnapshot({ stateFile }), null, 2));
  process.exit(0);
}

if (command === "runtime reset") {
  resetRuntimeState(stateFile);
  console.log(JSON.stringify({ ok: true, stateFile }, null, 2));
  process.exit(0);
}

if (command === "reputation show") {
  console.log(JSON.stringify(runQuery("reputation.show", { subjectId: "agent_mira_competitor_intel_sandbox" }), null, 2));
  process.exit(0);
}

if (command === "evidence show") {
  console.log(JSON.stringify(runQuery("evidence.show", { evidenceId: "ev_sandbox_delivery_pdf_001" }), null, 2));
  process.exit(0);
}

const commandMap = {
  "agent-category create": "agent-category create",
  "agent-category update": "agent-category update",
  "agent-category archive": "agent-category archive",
  "agent-category restore": "agent-category restore",
  "agent-passport create": "agent-passport create",
  "agent-passport update": "agent-passport update",
  "agent-passport suspend": "agent-passport suspend",
  "agent-listing publish": "agent-listing publish",
  "agent-listing update": "agent-listing update",
  "agent-listing archive": "agent-listing archive",
  "rfp create": "rfp.create",
  "rfp publish": "rfp.publish",
  "rfp cancel": "rfp.cancel",
  "proposal submit": "proposal.submit",
  "proposal accept": "proposal.accept",
  "proposal withdraw": "proposal.withdraw",
  "escrow fund": "escrow.fund",
  "escrow release": "escrow.release",
  "escrow partial-release": "escrow.partial-release",
  "escrow refund": "escrow.refund",
  "permission approve": "permission.approve",
  "permission deny": "permission.deny",
  "permission revoke": "permission.revoke",
  "run start": "run.start",
  "run cancel": "run.cancel",
  "delivery submit": "delivery.submit",
  "delivery qa-pass": "delivery.qa_pass",
  "delivery qa-reject": "delivery.qa_reject",
  "acceptance accept": "acceptance.accept",
  "acceptance request-revision": "acceptance.request-revision",
  "dispute open": "dispute.open",
  "dispute resolve": "dispute.resolve",
  "rating submit": "rating.submit",
  "evidence export": "evidence.export",
  "evidence delete": "evidence.delete"
};

const actorRoleMap = {
  "agent-category create": "operator",
  "agent-category update": "operator",
  "agent-category archive": "operator",
  "agent-category restore": "operator",
  "agent-passport create": "operator",
  "agent-passport update": "operator",
  "agent-passport suspend": "operator",
  "agent-listing publish": "operator",
  "agent-listing update": "operator",
  "agent-listing archive": "operator",
  "proposal.submit": "seller",
  "proposal.withdraw": "seller",
  "permission.approve": "operator",
  "permission.deny": "operator",
  "permission.revoke": "operator",
  "run.start": "seller",
  "run.cancel": "seller",
  "delivery.submit": "seller",
  "delivery.qa_pass": "operator",
  "delivery.qa_reject": "operator",
  "dispute.resolve": "operator",
  "escrow.release": "operator",
  "escrow.partial-release": "operator",
  "escrow.refund": "operator"
};

const contractCommand = commandMap[command];
if (contractCommand) {
  const actorRole = actorRoleMap[contractCommand] ?? "buyer";
  const result = executeRuntimeCommand(
    contractCommand,
    {
      ...createDemoEnvelope(actorRole, buildSamplePayload(contractCommand)),
      sourceChannel: "cli"
    },
    { stateFile }
  );
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

console.error("Unsupported command. Try:");
console.error("  node scripts/alphaagents.mjs runtime reset");
console.error("  node scripts/alphaagents.mjs runtime snapshot");
console.error("  node scripts/alphaagents.mjs agent-category list");
console.error("  node scripts/alphaagents.mjs agent-category create");
console.error("  node scripts/alphaagents.mjs agent-listing search");
console.error("  node scripts/alphaagents.mjs agent-listing publish");
console.error("  node scripts/alphaagents.mjs rfp create");
console.error("  node scripts/alphaagents.mjs rfp publish");
console.error("  node scripts/alphaagents.mjs proposal submit");
console.error("  node scripts/alphaagents.mjs proposal accept");
console.error("  node scripts/alphaagents.mjs escrow fund");
console.error("  node scripts/alphaagents.mjs permission approve");
console.error("  node scripts/alphaagents.mjs run start");
console.error("  node scripts/alphaagents.mjs delivery submit");
console.error("  node scripts/alphaagents.mjs acceptance accept");
console.error("  node scripts/alphaagents.mjs dispute open");
console.error("  node scripts/alphaagents.mjs dispute resolve");
console.error("  node scripts/alphaagents.mjs rating submit");
console.error("  node scripts/alphaagents.mjs reputation show");
console.error("  node scripts/alphaagents.mjs evidence show");
process.exit(1);
