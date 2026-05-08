import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const contractPath = path.join(root, "contracts", "alphaagents.contract.json");
const contract = JSON.parse(fs.readFileSync(contractPath, "utf8"));

function fail(message) {
  throw new Error(`[contract] ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

assert(contract.metadata?.sourceOfTruth === true, "contract must declare sourceOfTruth");
assert(contract.defaultFirstPurchase?.packageTier === "trial", "default first purchase must be Trial");
assert(contract.evidenceStatuses.includes("sandbox_verified"), "sandbox_verified evidence status is required");
assert(contract.evidenceStatuses.includes("validated"), "validated evidence status is required");

for (const key of Object.keys(contract.statuses)) {
  assert(key !== "status", "generic status field is forbidden");
  assert(Array.isArray(contract.statuses[key]) && contract.statuses[key].length > 0, `${key} must define states`);
}

const requiredCommands = [
  "buyer-org.setup",
  "custom-project.request",
  "custom-project.confirm-milestone",
  "custom-project.submit-uat",
  "custom-project.create-change-order",
  "agent-app.install",
  "agent-app.record-usage",
  "agent-app.exit",
  "program.allocate-credit",
  "program.record-drawdown",
  "program.update-qbr",
  "rfp.create",
  "rfp.publish",
  "rfp.cancel",
  "proposal.submit",
  "proposal.accept",
  "proposal.withdraw",
  "escrow.fund",
  "escrow.release",
  "escrow.partial-release",
  "escrow.refund",
  "permission.approve",
  "permission.deny",
  "permission.revoke",
  "run.start",
  "run.cancel",
  "delivery.submit",
  "delivery.qa_pass",
  "delivery.qa_reject",
  "acceptance.accept",
  "acceptance.request-revision",
  "dispute.open",
  "dispute.resolve",
  "rating.submit",
  "evidence.export",
  "evidence.delete"
];

const requiredQueries = ["reputation.show", "evidence.show"];
const requiredDtos = [
  "RfpDto",
  "ProposalDto",
  "OrderDto",
  "GrantDto",
  "RunDto",
  "DeliveryDto",
  "EvidenceDto",
  "EvidenceExportDto",
  "EvidenceDeletionDto",
  "BuyerOrgProfileDto",
  "CustomProjectDto",
  "AgentAppInstallDto",
  "AgentAppUsageDto",
  "ProgramWorkspaceDto",
  "ReputationDto",
  "ReputationSummaryDto"
];

for (const command of requiredCommands) {
  const spec = contract.commands[command];
  assert(spec, `${command} is missing`);
  assert(spec.mutates === true, `${command} must be marked mutating`);
  assert(spec.actorRoles?.length > 0, `${command} must define actorRoles`);
  assert(spec.sourceChannels?.length > 0, `${command} must define sourceChannels`);
  assert(["all", "any"].includes(spec.scopeMode), `${command} must define scopeMode all/any`);
  assert(spec.payloadRequired?.length > 0, `${command} must define payloadRequired`);
  assert(spec.requiredScopes?.length > 0, `${command} must define requiredScopes`);
  assert(spec.successEvents?.length > 0, `${command} must define successEvents`);
  assert(spec.failureCodes?.length > 0, `${command} must define failureCodes`);
  assert(spec.responseDto, `${command} must define responseDto`);
  for (const code of spec.failureCodes) {
    assert(contract.errorCodes.includes(code), `${command} references unknown error code ${code}`);
  }
  for (const role of spec.actorRoles) {
    assert(["buyer", "seller", "operator", "system", "agent_runtime"].includes(role), `${command} references unknown actor role ${role}`);
  }
  for (const scope of spec.requiredScopes) {
    assert(contract.scopes.includes(scope), `${command} references unknown scope ${scope}`);
  }
  for (const event of spec.successEvents) {
    assert(contract.eventPayloadSchemas[event], `${command} references event without payload schema: ${event}`);
  }
  assert(contract.dtoSchemas[spec.responseDto], `${command} references unknown response DTO ${spec.responseDto}`);
}

for (const query of requiredQueries) {
  const spec = contract.queries?.[query];
  assert(spec, `${query} query is missing`);
  assert(spec.payloadRequired?.length > 0, `${query} must define payloadRequired`);
  assert(spec.requiredScopes?.length > 0, `${query} must define requiredScopes`);
  assert(contract.dtoSchemas[spec.responseDto], `${query} references unknown response DTO ${spec.responseDto}`);
}

const golden = contract.goldenPath;
for (const event of golden) {
  assert(contract.eventPayloadSchemas[event], `golden event missing payload schema: ${event}`);
}

for (const dto of requiredDtos) {
  assert(contract.dtoSchemas[dto], `missing DTO schema ${dto}`);
}

const requiredBranchEvents = [
  "BuyerOrgSetupUpdated",
  "CustomProjectRequested",
  "CustomProjectMilestoneConfirmed",
  "CustomProjectUatSubmitted",
  "CustomProjectChangeOrderCreated",
  "AgentAppInstalled",
  "AgentAppUsageRecorded",
  "AgentAppExited",
  "ProgramCreditAllocated",
  "ProgramCreditDrawdownRecorded",
  "ProgramQbrUpdated",
  "RevisionRequested",
  "DisputeOpened",
  "DisputeResolved",
  "DeliveryQaRejected",
  "EscrowPartiallyReleased",
  "EscrowRefunded",
  "PermissionRevoked",
  "RunCancelled",
  "RunFailed",
  "EvidenceExportRequested",
  "EvidenceExported",
  "EvidenceDeletionRequested",
  "EvidenceDeleted",
  "UnauthorizedAccessAttempted",
  "TokenScopeDenied",
  "CommandActorDenied",
  "CommandValidationFailed",
  "StateTransitionRejected",
  "OptimisticLockRejected",
  "IdempotencyConflictDetected",
  "RateLimitDenied",
  "RuntimeToolDenied",
  "EvidenceAccessDenied",
  "EvidenceExportDenied",
  "FinanceCommandDenied"
];
for (const event of requiredBranchEvents) {
  assert(contract.eventPayloadSchemas[event], `missing branch event payload schema ${event}`);
}

assert(contract.financeRules.partialRelease.releaseAmountMinorFormula.includes("acceptedCriteriaWeightBps"), "partial release formula must be deterministic");
assert(contract.financeRules.rounding.includes("integer minor units"), "finance rounding rule must use integer minor units");
assert(contract.security?.tenantResolutionOrder?.length > 0, "security.tenantResolutionOrder is required");
assert(contract.security?.runtimeToolPolicy?.allowed?.length > 0, "security runtime allowed tools are required");
assert(contract.security?.runtimeToolPolicy?.denied?.includes("account_login"), "security must deny account_login");
assert(contract.security?.evidenceVisibilityChecks?.includes("tenantId"), "security must define evidence visibility checks");
assert(contract.security?.rateLimits?.cliMutatingCommandPerMinute > 0, "security must define CLI mutating rate limit");
assert(contract.security?.permissionMatrixCovers?.includes("other_tenant"), "security must cover other_tenant isolation");
for (const [code, event] of Object.entries(contract.security?.auditEventByErrorCode ?? {})) {
  assert(contract.errorCodes.includes(code), `audit mapping references unknown error code ${code}`);
  assert(contract.eventPayloadSchemas[event], `audit mapping references unknown event ${event}`);
}

const engineeringDoc = fs.readFileSync(path.join(root, "docs", "engineering-contract.md"), "utf8");
assert(engineeringDoc.includes("contracts/alphaagents.contract.json"), "engineering doc must reference machine-readable contract");
assert(engineeringDoc.includes("acceptedCriteriaWeightBps"), "engineering doc must use canonical partial-release formula");
for (const command of requiredCommands) {
  assert(engineeringDoc.includes(`\`${command}\``), `engineering doc must mention ${command}`);
}

console.log("contract verification passed");
