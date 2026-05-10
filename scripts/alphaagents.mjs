#!/usr/bin/env node

import { buildSamplePayload, createDemoEnvelope, runCommand } from "../lib/alphaagents/commands.js";
import { runQuery } from "../lib/alphaagents/queries.js";
import { executeRuntimeCommand } from "../lib/alphaagents/runtime-engine.js";
import { getRuntimeSnapshot } from "../lib/alphaagents/runtime-queries.js";
import { loadRuntimeState, resetRuntimeState, resolveStateFile } from "../lib/alphaagents/runtime-state.js";

const rawArgs = process.argv.slice(2);
const jsonOutput = rawArgs.includes("--json");
const args = rawArgs.filter((arg) => arg !== "--json");
const command = args.join(" ");
const stateFile = resolveStateFile();

if (command === "agent-category list") {
  printOutput(loadRuntimeState(stateFile).categories, (categories) =>
    [
      `Agent categories (${categories.length})`,
      ...categories.map(
        (category) =>
          `- ${category.categoryId} | ${category.name?.en ?? category.categoryId} / ${category.name?.["zh-CN"] ?? category.categoryId} | ${category.categoryStatus} | risk=${category.riskLevel} | v${category.version}`
      )
    ].join("\n")
  );
  process.exit(0);
}

if (command === "agent-listing search") {
  printOutput(loadRuntimeState(stateFile).listings, (listings) =>
    [
      `Agent listings (${listings.length})`,
      ...listings.map(
        (listing) =>
          `- ${listing.listingId} | ${listing.title} | ${listing.listingStatus ?? "published"} | ${listing.billingMode} | capacity=${listing.capacityAvailable}`
      )
    ].join("\n")
  );
  process.exit(0);
}

if (command === "runtime snapshot") {
  printOutput(getRuntimeSnapshot({ stateFile }), (snapshot) =>
    [
      "Runtime snapshot",
      `- rfps=${snapshot.rfps.length}`,
      `- proposals=${snapshot.proposals.length}`,
      `- orders=${snapshot.orders.length}`,
      `- grants=${snapshot.grants.length}`,
      `- runs=${snapshot.runs.length}`,
      `- deliveries=${snapshot.deliveries.length}`,
      `- events=${snapshot.events.length}`
    ].join("\n")
  );
  process.exit(0);
}

if (command === "runtime reset") {
  resetRuntimeState(stateFile);
  printOutput({ ok: true, stateFile }, (result) => `Runtime reset succeeded\n- stateFile=${result.stateFile}`);
  process.exit(0);
}

if (command === "reputation show") {
  printOutput(runQuery("reputation.show", { subjectId: "agent_mira_competitor_intel_sandbox" }), (result) =>
    `Reputation ${result.subjectId}\n- averageRating=${result.averageRating}\n- reviewCount=${result.reviewCount}\n- disputeRate=${result.disputeRate}`
  );
  process.exit(0);
}

if (command === "evidence show") {
  printOutput(runQuery("evidence.show", { evidenceId: "ev_sandbox_delivery_pdf_001" }), (result) =>
    `Evidence ${result.id}\n- visibility=${result.visibility}\n- redactionStatus=${result.redactionStatus}\n- hash=${result.hash}`
  );
  process.exit(0);
}

const commandMap = {
  "custom-project request": "custom-project.request",
  "custom-project confirm-milestone": "custom-project.confirm-milestone",
  "custom-project submit-uat": "custom-project.submit-uat",
  "custom-project create-change-order": "custom-project.create-change-order",
  "agent-app install": "agent-app.install",
  "agent-app record-usage": "agent-app.record-usage",
  "agent-app exit": "agent-app.exit",
  "program allocate-credit": "program.allocate-credit",
  "program record-drawdown": "program.record-drawdown",
  "program update-qbr": "program.update-qbr",
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
  "custom-project.confirm-milestone": "operator",
  "custom-project.submit-uat": "seller",
  "custom-project.create-change-order": "buyer",
  "program.allocate-credit": "operator",
  "program.record-drawdown": "operator",
  "program.update-qbr": "operator",
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
  const result = runCommand(
    contractCommand,
    {
      ...createDemoEnvelope(actorRole, buildSamplePayload(contractCommand)),
      sourceChannel: "cli"
    },
    { stateFile }
  );
  printOutput(result, (value) => formatCommandResult(contractCommand, value));
  process.exit(0);
}

console.error("Unsupported command. Try:");
console.error("  node scripts/alphaagents.mjs runtime reset");
console.error("  node scripts/alphaagents.mjs runtime snapshot");
console.error("  node scripts/alphaagents.mjs custom-project request");
console.error("  node scripts/alphaagents.mjs custom-project confirm-milestone");
console.error("  node scripts/alphaagents.mjs custom-project submit-uat");
console.error("  node scripts/alphaagents.mjs custom-project create-change-order");
console.error("  node scripts/alphaagents.mjs agent-app install");
console.error("  node scripts/alphaagents.mjs agent-app record-usage");
console.error("  node scripts/alphaagents.mjs agent-app exit");
console.error("  node scripts/alphaagents.mjs agent-category list");
console.error("  node scripts/alphaagents.mjs agent-category create");
console.error("  node scripts/alphaagents.mjs agent-listing search");
console.error("  node scripts/alphaagents.mjs agent-listing publish");
console.error("  node scripts/alphaagents.mjs program allocate-credit");
console.error("  node scripts/alphaagents.mjs program record-drawdown");
console.error("  node scripts/alphaagents.mjs program update-qbr");
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

function printOutput(value, humanFormatter) {
  console.log(jsonOutput ? JSON.stringify(value, null, 2) : humanFormatter(value));
}

function formatCommandResult(commandName, result) {
  if (!result.ok) {
    return [
      `Command ${commandName} failed`,
      `- errorCode=${result.errorCode}`,
      `- message=${result.message}`
    ].join("\n");
  }

  const events = (result.events ?? []).map((event) => event.eventName).join(", ") || "none";
  return [
    `Command ${commandName} succeeded`,
    `- aggregateId=${result.aggregateId}`,
    `- newVersion=${result.newVersion}`,
    `- events=${events}`
  ].join("\n");
}
