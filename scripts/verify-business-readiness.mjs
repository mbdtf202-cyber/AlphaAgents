import fs from "node:fs";
import path from "node:path";
import { buildSamplePayload } from "../lib/alphaagents/commands.js";
import { executeRuntimeCommand } from "../lib/alphaagents/runtime-engine.js";
import { createTempStateFile, loadRuntimeState, resetRuntimeState } from "../lib/alphaagents/runtime-state.js";

const root = process.cwd();

function fail(message) {
  throw new Error(`[business] ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const readme = read("README.md");
const operations = read("docs/operations.md");
const acceptance = read("docs/acceptance.md");

assert(readme.includes("Default first purchase"), "README must state a default first purchase");
assert(readme.includes("US TikTok Shop beauty and personal-care"), "README must narrow the first ICP");
assert(readme.includes("conditional release"), "README must explain buyer-facing conditional release language");
assert(operations.includes("sandbox_verified"), "operations must include sandbox_verified status");
assert(operations.includes("Validated Evidence Gap"), "operations must state validated evidence gap honestly");
assert(operations.includes("What we can claim now"), "operations must define current claim boundary");
assert(operations.includes("不能声称已有真实付费客户"), "operations must forbid fake customer traction claims");
assert(operations.includes("Buyer Acceptance Mini Terms"), "operations must include buyer acceptance mini terms");
assert(operations.includes("AA-SANDBOX-TRIAL-001"), "operations must reference sandbox package");
assert(operations.includes("Default Trial Gate"), "operations must include default Trial gate");
assert(acceptance.includes("Evidence artifact gates"), "acceptance must include evidence artifact gates");

const stateFile = createTempStateFile("alphaagents-business-readiness-");
resetRuntimeState(stateFile);

function envelope(actorRole, payload, overrides = {}) {
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
      "seller:proposals.write",
      "seller:runs.write",
      "seller:deliveries.write",
      "runtime:runs.write",
      "operator:qa.write",
      "operator:permissions.write",
      "operator:acceptance.write",
      "finance:ledger.write"
    ],
    idempotencyKey: `idem_${Math.random().toString(36).slice(2, 10)}`,
    correlationId: `corr_${Math.random().toString(36).slice(2, 10)}`,
    expectedVersion: 1,
    payload,
    ...overrides
  };
}

function execute(commandName, actorRole, payload, overrides = {}) {
  const result = executeRuntimeCommand(commandName, envelope(actorRole, payload, overrides), { stateFile });
  assert(result.ok, `runtime readiness ${commandName} failed: ${result.errorCode ?? result.message}`);
  return result;
}

execute("buyer-org.setup", "buyer", buildSamplePayload("buyer-org.setup"));
const rfp = execute("rfp.create", "buyer", buildSamplePayload("rfp.create"), { expectedVersion: 0 });
const published = execute(
  "rfp.publish",
  "buyer",
  {
    ...buildSamplePayload("rfp.publish"),
    rfpId: rfp.dto.id
  },
  { expectedVersion: rfp.newVersion }
);
const proposal = execute(
  "proposal.submit",
  "seller",
  {
    ...buildSamplePayload("proposal.submit"),
    rfpId: rfp.dto.id
  },
  { expectedVersion: published.newVersion }
);
const order = execute(
  "proposal.accept",
  "buyer",
  {
    ...buildSamplePayload("proposal.accept"),
    proposalId: proposal.dto.id
  },
  { expectedVersion: proposal.newVersion }
);
const funded = execute(
  "escrow.fund",
  "buyer",
  {
    ...buildSamplePayload("escrow.fund"),
    orderId: order.dto.id
  },
  { expectedVersion: order.newVersion }
);
const grant = loadRuntimeState(stateFile).grants.at(-1);
execute(
  "permission.approve",
  "operator",
  {
    ...buildSamplePayload("permission.approve"),
    grantId: grant.id
  },
  { expectedVersion: grant.version }
);
const appInstall = execute("agent-app.install", "buyer", buildSamplePayload("agent-app.install"), { expectedVersion: 0 });
execute(
  "agent-app.record-usage",
  "buyer",
  {
    ...buildSamplePayload("agent-app.record-usage"),
    installId: appInstall.dto.id
  },
  { expectedVersion: appInstall.newVersion }
);
const allocated = execute("program.allocate-credit", "operator", buildSamplePayload("program.allocate-credit"));
execute("program.record-drawdown", "operator", buildSamplePayload("program.record-drawdown"), { expectedVersion: allocated.newVersion });

const snapshot = loadRuntimeState(stateFile);
assert(snapshot.orders.some((entry) => entry.id === funded.dto.id && entry.ledgerStatus === "escrowed"), "runtime business readiness must create a funded order");
assert(snapshot.grants.some((entry) => entry.grantStatus === "approved"), "runtime business readiness must approve a permission grant");
assert(snapshot.appUsageRuns.some((entry) => entry.executionRunId && entry.acceptanceReviewId && entry.financeEvidenceRefs?.length), "runtime business readiness must produce Agent App usage proof");
assert(snapshot.programWorkspaces.some((entry) => entry.id === "program_northstar_growth_001" && entry.activeCreditMinor > 0), "runtime business readiness must mutate program credit state");

console.log("business readiness verification passed");
