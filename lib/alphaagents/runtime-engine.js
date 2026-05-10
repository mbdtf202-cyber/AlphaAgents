import crypto from "node:crypto";

import { loadRuntimeState, saveRuntimeState, contract } from "./runtime-state.js";

const customCommandSpecs = {
  "custom-project.request": {
    actorRoles: ["buyer"],
    sourceChannels: ["ui", "cli", "api"],
    scopeMode: "all",
    requiredScopes: ["buyer:orders.write"],
    payloadRequired: ["projectId", "buyerOrgId", "projectTitle", "categoryId", "targetOutcome", "requestedBy"],
    successEvents: ["CustomProjectRequested"]
  },
  "custom-project.confirm-milestone": {
    actorRoles: ["operator"],
    sourceChannels: ["ui", "cli", "api"],
    scopeMode: "all",
    requiredScopes: ["operator:acceptance.write"],
    payloadRequired: ["projectId", "milestoneId", "milestoneName", "dueAt"],
    successEvents: ["CustomProjectMilestoneConfirmed"]
  },
  "custom-project.submit-uat": {
    actorRoles: ["seller", "agent_runtime"],
    sourceChannels: ["ui", "cli", "api", "runtime"],
    scopeMode: "any",
    requiredScopes: ["seller:deliveries.write", "runtime:deliveries.write"],
    payloadRequired: ["projectId", "milestoneId", "executionSummary", "evidenceRefs"],
    successEvents: ["CustomProjectUatSubmitted"]
  },
  "custom-project.create-change-order": {
    actorRoles: ["buyer", "operator"],
    sourceChannels: ["ui", "cli", "api"],
    scopeMode: "any",
    requiredScopes: ["buyer:acceptance.write", "operator:acceptance.write"],
    payloadRequired: ["projectId", "changeOrderId", "requestedChange", "impactSummary"],
    successEvents: ["CustomProjectChangeOrderCreated"]
  },
  "agent-app.install": {
    actorRoles: ["buyer"],
    sourceChannels: ["ui", "cli", "api"],
    scopeMode: "all",
    requiredScopes: ["buyer:orders.write"],
    payloadRequired: ["appId", "buyerOrgId", "authorizedBy", "usageMode"],
    successEvents: ["AgentAppInstalled"]
  },
  "agent-app.record-usage": {
    actorRoles: ["buyer", "seller", "agent_runtime"],
    sourceChannels: ["ui", "cli", "api", "runtime"],
    scopeMode: "any",
    requiredScopes: ["buyer:orders.write", "runtime:runs.write"],
    payloadRequired: ["installId", "appId", "usageSummary", "evidenceRefs"],
    successEvents: ["AgentAppUsageRecorded"]
  },
  "agent-app.exit": {
    actorRoles: ["buyer", "operator"],
    sourceChannels: ["ui", "cli", "api"],
    scopeMode: "any",
    requiredScopes: ["buyer:orders.write", "operator:acceptance.write"],
    payloadRequired: ["installId", "exitReason"],
    successEvents: ["AgentAppExited"]
  },
  "program.allocate-credit": {
    actorRoles: ["operator"],
    sourceChannels: ["ui", "cli", "api"],
    scopeMode: "all",
    requiredScopes: ["finance:ledger.write"],
    payloadRequired: ["programId", "creditAmountMinor", "reason"],
    successEvents: ["ProgramCreditAllocated"]
  },
  "program.record-drawdown": {
    actorRoles: ["operator", "buyer"],
    sourceChannels: ["ui", "cli", "api"],
    scopeMode: "any",
    requiredScopes: ["finance:ledger.write", "buyer:orders.write"],
    payloadRequired: ["programId", "drawdownMinor", "reason"],
    successEvents: ["ProgramCreditDrawdownRecorded"]
  },
  "program.update-qbr": {
    actorRoles: ["operator"],
    sourceChannels: ["ui", "cli", "api"],
    scopeMode: "all",
    requiredScopes: ["operator:acceptance.write"],
    payloadRequired: ["programId", "qbrStatus"],
    successEvents: ["ProgramQbrUpdated"]
  },
  "buyer-org.setup": {
    actorRoles: ["buyer"],
    sourceChannels: ["ui", "cli", "api"],
    scopeMode: "all",
    requiredScopes: ["buyer:orders.write"],
    payloadRequired: [
      "buyerOrgId",
      "requesterUserId",
      "acceptanceOwnerUserId",
      "financeContactUserId",
      "legalContactUserId",
      "authorizedPayerId",
      "signerIds",
      "invoiceReadiness",
      "scopeAcknowledgement",
      "contractingEntity",
      "collectionEntity",
      "invoiceIssuer",
      "refundRemitter",
      "subprocessors"
    ],
    successEvents: ["BuyerOrgSetupUpdated"]
  },
  "agent-category create": {
    actorRoles: ["operator"],
    sourceChannels: ["ui", "cli", "api"],
    scopeMode: "all",
    requiredScopes: ["operator:permissions.write"],
    payloadRequired: ["categoryId", "name", "riskLevel", "defaultPermissionTemplateId", "defaultAcceptanceTemplateId", "opsOwner"],
    successEvents: ["AgentCategoryCreated"]
  },
  "agent-category update": {
    actorRoles: ["operator"],
    sourceChannels: ["ui", "cli", "api"],
    scopeMode: "all",
    requiredScopes: ["operator:permissions.write"],
    payloadRequired: ["categoryId", "patch"],
    successEvents: ["AgentCategoryUpdated"]
  },
  "agent-category archive": {
    actorRoles: ["operator"],
    sourceChannels: ["ui", "cli", "api"],
    scopeMode: "all",
    requiredScopes: ["operator:permissions.write"],
    payloadRequired: ["categoryId", "archiveReason"],
    successEvents: ["AgentCategoryArchived"]
  },
  "agent-category restore": {
    actorRoles: ["operator"],
    sourceChannels: ["ui", "cli", "api"],
    scopeMode: "all",
    requiredScopes: ["operator:permissions.write"],
    payloadRequired: ["categoryId", "restoreReason"],
    successEvents: ["AgentCategoryRestored"]
  },
  "agent-passport create": {
    actorRoles: ["operator"],
    sourceChannels: ["ui", "cli", "api"],
    scopeMode: "all",
    requiredScopes: ["operator:permissions.write"],
    payloadRequired: ["agentId", "sellerId", "categoryIds", "manifestVersion"],
    successEvents: ["AgentPassportCreated"]
  },
  "agent-passport update": {
    actorRoles: ["operator"],
    sourceChannels: ["ui", "cli", "api"],
    scopeMode: "all",
    requiredScopes: ["operator:permissions.write"],
    payloadRequired: ["agentId", "patch"],
    successEvents: ["AgentPassportUpdated"]
  },
  "agent-passport suspend": {
    actorRoles: ["operator"],
    sourceChannels: ["ui", "cli", "api"],
    scopeMode: "all",
    requiredScopes: ["operator:permissions.write"],
    payloadRequired: ["agentId", "suspendReason"],
    successEvents: ["AgentPassportSuspended"]
  },
  "agent-listing publish": {
    actorRoles: ["operator"],
    sourceChannels: ["ui", "cli", "api"],
    scopeMode: "all",
    requiredScopes: ["operator:permissions.write"],
    payloadRequired: [
      "listingId",
      "agentId",
      "categoryIds",
      "priceAmountMinor",
      "acceptanceTemplateId",
      "permissionTemplateId",
      "deliveryHours",
      "capacityAvailable"
    ],
    successEvents: ["AgentListingPublished"]
  },
  "agent-listing update": {
    actorRoles: ["operator"],
    sourceChannels: ["ui", "cli", "api"],
    scopeMode: "all",
    requiredScopes: ["operator:permissions.write"],
    payloadRequired: ["listingId", "patch"],
    successEvents: ["AgentListingUpdated"]
  },
  "agent-listing archive": {
    actorRoles: ["operator"],
    sourceChannels: ["ui", "cli", "api"],
    scopeMode: "all",
    requiredScopes: ["operator:permissions.write"],
    payloadRequired: ["listingId", "archiveReason"],
    successEvents: ["AgentListingArchived"]
  }
};

const initialBuyerOrgId = "org_demo_001";

export function executeRuntimeCommand(commandName, envelope, options = {}) {
  const state = loadRuntimeState(options.stateFile);
  const spec = customCommandSpecs[commandName] ?? contract.commands[commandName];

  if (!spec) {
    return fail("VALIDATION_FAILED", `Unknown command: ${commandName}`);
  }

  const idempotencyKey = `${envelope.actorId}:${commandName}:${envelope.idempotencyKey}`;
  const existingReplay = state.idempotency[idempotencyKey];
  const payloadHash = stableHash(envelope.payload);
  if (existingReplay) {
    if (existingReplay.payloadHash !== payloadHash) {
      return fail("IDEMPOTENCY_CONFLICT", "Same idempotency key used with a different payload");
    }
    return existingReplay.result;
  }

  const preflight = validateEnvelope(commandName, spec, envelope, state);
  if (preflight) {
    recordFailureAudit(state, commandName, envelope, preflight.errorCode);
    saveRuntimeState(state, options.stateFile);
    return preflight;
  }

  const result = dispatchCommand(commandName, envelope, state);
  state.idempotency[idempotencyKey] = {
    payloadHash,
    result
  };
  saveRuntimeState(state, options.stateFile);
  return result;
}

function validateEnvelope(commandName, spec, envelope, state) {
  if (!spec.actorRoles.includes(envelope.actorRole)) {
    return fail("ACTOR_FORBIDDEN", `${envelope.actorRole} cannot call ${commandName}`);
  }

  if (!spec.sourceChannels.includes(envelope.sourceChannel)) {
    return fail("ACTOR_FORBIDDEN", `source channel ${envelope.sourceChannel} is not allowed for ${commandName}`);
  }

  const missingFields = spec.payloadRequired.filter((field) => !(field in envelope.payload));
  if (missingFields.length > 0) {
    return fail("VALIDATION_FAILED", `Missing payload fields: ${missingFields.join(", ")}`);
  }

  const scopes = envelope.tokenScopes ?? [];
  const scopeSatisfied =
    spec.scopeMode === "any"
      ? spec.requiredScopes.some((scope) => scopes.includes(scope))
      : spec.requiredScopes.every((scope) => scopes.includes(scope));

  if (!scopeSatisfied) {
    return fail("TOKEN_SCOPE_FORBIDDEN", `Missing token scopes for ${commandName}`);
  }

  const ownedTenant = resolveAggregateTenant(commandName, envelope.payload, state);
  if (ownedTenant && ownedTenant !== envelope.tenantId) {
    return fail("TENANT_FORBIDDEN", `Tenant mismatch for ${commandName}`);
  }

  const versionCheck = validateExpectedVersion(commandName, envelope, state);
  if (versionCheck) return versionCheck;

  return null;
}

function dispatchCommand(commandName, envelope, state) {
  switch (commandName) {
    case "buyer-org.setup":
      return updateBuyerOrgSetup(state, envelope);
    case "custom-project.request":
      return requestCustomProject(state, envelope);
    case "custom-project.confirm-milestone":
      return confirmCustomProjectMilestone(state, envelope);
    case "custom-project.submit-uat":
      return submitCustomProjectUat(state, envelope);
    case "custom-project.create-change-order":
      return createCustomProjectChangeOrder(state, envelope);
    case "agent-app.install":
      return installAgentApp(state, envelope);
    case "agent-app.record-usage":
      return recordAgentAppUsage(state, envelope);
    case "agent-app.exit":
      return exitAgentApp(state, envelope);
    case "program.allocate-credit":
      return allocateProgramCredit(state, envelope);
    case "program.record-drawdown":
      return recordProgramDrawdown(state, envelope);
    case "program.update-qbr":
      return updateProgramQbr(state, envelope);
    case "agent-category create":
      return createCategory(state, envelope);
    case "agent-category update":
      return updateCategory(state, envelope);
    case "agent-category archive":
      return archiveCategory(state, envelope);
    case "agent-category restore":
      return restoreCategory(state, envelope);
    case "agent-passport create":
      return createAgentPassport(state, envelope);
    case "agent-passport update":
      return updateAgentPassport(state, envelope);
    case "agent-passport suspend":
      return suspendAgentPassport(state, envelope);
    case "agent-listing publish":
      return publishListing(state, envelope);
    case "agent-listing update":
      return updateListing(state, envelope);
    case "agent-listing archive":
      return archiveListing(state, envelope);
    case "rfp.create":
      return createRfp(state, envelope);
    case "rfp.publish":
      return publishRfp(state, envelope);
    case "rfp.cancel":
      return cancelRfp(state, envelope);
    case "proposal.submit":
      return submitProposal(state, envelope);
    case "proposal.accept":
      return acceptProposal(state, envelope);
    case "proposal.withdraw":
      return withdrawProposal(state, envelope);
    case "escrow.fund":
      return fundOrder(state, envelope);
    case "permission.approve":
      return approveGrant(state, envelope);
    case "permission.deny":
      return denyGrant(state, envelope);
    case "permission.revoke":
      return revokeGrant(state, envelope);
    case "run.start":
      return startRun(state, envelope);
    case "run.cancel":
      return cancelRun(state, envelope);
    case "delivery.submit":
      return submitDelivery(state, envelope);
    case "delivery.qa_pass":
      return passDeliveryQa(state, envelope);
    case "delivery.qa_reject":
      return rejectDeliveryQa(state, envelope);
    case "acceptance.accept":
      return acceptDelivery(state, envelope);
    case "acceptance.request-revision":
      return requestRevision(state, envelope);
    case "dispute.open":
      return openDispute(state, envelope);
    case "dispute.resolve":
      return resolveDispute(state, envelope);
    case "escrow.release":
      return releaseEscrow(state, envelope);
    case "escrow.partial-release":
      return partialRelease(state, envelope);
    case "escrow.refund":
      return refundEscrow(state, envelope);
    case "rating.submit":
      return submitRating(state, envelope);
    case "evidence.export":
      return exportEvidence(state, envelope);
    case "evidence.delete":
      return deleteEvidence(state, envelope);
    default:
      return fail("VALIDATION_FAILED", `No runtime handler for ${commandName}`);
  }
}

function createCategory(state, envelope) {
  if (state.categories.some((category) => category.categoryId === envelope.payload.categoryId)) {
    return fail("STATE_CONFLICT", "Category already exists");
  }

  const category = {
    categoryId: envelope.payload.categoryId,
    name: { en: envelope.payload.name, "zh-CN": envelope.payload.name },
    riskLevel: envelope.payload.riskLevel,
    defaultPermissionTemplateId: envelope.payload.defaultPermissionTemplateId,
    defaultAcceptanceTemplateId: envelope.payload.defaultAcceptanceTemplateId,
    opsOwner: envelope.payload.opsOwner,
    riskOwner: envelope.payload.riskOwner ?? envelope.payload.opsOwner,
    categoryStatus: "sellable",
    supportedSupplyTypes: envelope.payload.supportedSupplyTypes ?? ["standard_agent"],
    tags: envelope.payload.tags ?? [],
    version: 1,
    auditEvents: [],
    history: []
  };
  state.categories.push(category);
  return ok(state, category.categoryId, 1, [{ eventName: "AgentCategoryCreated", payload: { categoryId: category.categoryId } }], category);
}

function updateBuyerOrgSetup(state, envelope) {
  const buyer = requireById(state.buyers, "id", envelope.payload.buyerOrgId);
  if (!buyer) return fail("VALIDATION_FAILED", "Unknown buyer org");
  buyer.version += 1;
  buyer.requesterUserId = envelope.payload.requesterUserId;
  buyer.acceptanceOwnerUserId = envelope.payload.acceptanceOwnerUserId;
  buyer.financeContactUserId = envelope.payload.financeContactUserId;
  buyer.legalContactUserId = envelope.payload.legalContactUserId;
  buyer.authorizedPayerId = envelope.payload.authorizedPayerId;
  buyer.signerIds = envelope.payload.signerIds;
  buyer.invoiceReadiness = envelope.payload.invoiceReadiness;
  buyer.scopeAcknowledgement = envelope.payload.scopeAcknowledgement;
  buyer.contractingEntity = envelope.payload.contractingEntity;
  buyer.collectionEntity = envelope.payload.collectionEntity;
  buyer.invoiceIssuer = envelope.payload.invoiceIssuer;
  buyer.refundRemitter = envelope.payload.refundRemitter;
  buyer.subprocessors = envelope.payload.subprocessors;
  buyer.lifecycleStage = envelope.payload.lifecycleStage ?? "org_setup";
  return ok(
    state,
    buyer.id,
    buyer.version,
    [{ eventName: "BuyerOrgSetupUpdated", payload: { buyerOrgId: buyer.id, invoiceReadiness: buyer.invoiceReadiness } }],
    buyer
  );
}

function requestCustomProject(state, envelope) {
  if (state.customProjects.some((project) => project.id === envelope.payload.projectId)) {
    return fail("STATE_CONFLICT", "Custom project already exists");
  }
  const project = {
    id: envelope.payload.projectId,
    tenantId: envelope.tenantId,
    buyerOrgId: envelope.payload.buyerOrgId,
    projectTitle: envelope.payload.projectTitle,
    categoryId: envelope.payload.categoryId,
    targetOutcome: envelope.payload.targetOutcome,
    requestedBy: envelope.payload.requestedBy,
    projectStatus: "intake_submitted",
    uatStatus: "not_started",
    milestones: [],
    changeOrders: [],
    version: 1
  };
  state.customProjects.push(project);
  return ok(
    state,
    project.id,
    project.version,
    [{ eventName: "CustomProjectRequested", payload: { projectId: project.id, projectStatus: project.projectStatus } }],
    project
  );
}

function confirmCustomProjectMilestone(state, envelope) {
  const project = requireById(state.customProjects, "id", envelope.payload.projectId);
  if (!project) return fail("VALIDATION_FAILED", "Unknown custom project");
  project.version += 1;
  project.projectStatus = "milestone_confirmed";
  project.milestones.push({
    milestoneId: envelope.payload.milestoneId,
    milestoneName: envelope.payload.milestoneName,
    dueAt: envelope.payload.dueAt,
    milestoneStatus: "confirmed"
  });
  return ok(
    state,
    project.id,
    project.version,
    [{ eventName: "CustomProjectMilestoneConfirmed", payload: { projectId: project.id, milestoneId: envelope.payload.milestoneId } }],
    project
  );
}

function submitCustomProjectUat(state, envelope) {
  const project = requireById(state.customProjects, "id", envelope.payload.projectId);
  if (!project) return fail("VALIDATION_FAILED", "Unknown custom project");
  const milestone = project.milestones.find((item) => item.milestoneId === envelope.payload.milestoneId);
  if (!milestone) return fail("VALIDATION_FAILED", "Unknown milestone");
  project.version += 1;
  project.projectStatus = "uat_submitted";
  project.uatStatus = "submitted";
  milestone.milestoneStatus = "uat_submitted";
  project.latestUat = {
    executionSummary: envelope.payload.executionSummary,
    evidenceRefs: envelope.payload.evidenceRefs
  };
  return ok(
    state,
    project.id,
    project.version,
    [{ eventName: "CustomProjectUatSubmitted", payload: { projectId: project.id, milestoneId: milestone.milestoneId } }],
    project
  );
}

function createCustomProjectChangeOrder(state, envelope) {
  const project = requireById(state.customProjects, "id", envelope.payload.projectId);
  if (!project) return fail("VALIDATION_FAILED", "Unknown custom project");
  project.version += 1;
  project.projectStatus = "change_requested";
  project.changeOrders.push({
    changeOrderId: envelope.payload.changeOrderId,
    requestedChange: envelope.payload.requestedChange,
    impactSummary: envelope.payload.impactSummary,
    changeStatus: "requested"
  });
  return ok(
    state,
    project.id,
    project.version,
    [{ eventName: "CustomProjectChangeOrderCreated", payload: { projectId: project.id, changeOrderId: envelope.payload.changeOrderId } }],
    project
  );
}

function installAgentApp(state, envelope) {
  const app = requireById(state.agentAppPassports, "id", envelope.payload.appId);
  if (!app) return fail("VALIDATION_FAILED", "Unknown agent app");
  const install = {
    id: nextId("app_install"),
    tenantId: envelope.tenantId,
    buyerOrgId: envelope.payload.buyerOrgId,
    appId: envelope.payload.appId,
    usageMode: envelope.payload.usageMode,
    authorizedBy: envelope.payload.authorizedBy,
    installStatus: "active",
    version: 1
  };
  state.appInstalls.push(install);
  return ok(state, install.id, install.version, [{ eventName: "AgentAppInstalled", payload: { installId: install.id, appId: install.appId } }], install);
}

function recordAgentAppUsage(state, envelope) {
  const install = requireById(state.appInstalls, "id", envelope.payload.installId);
  if (!install || install.installStatus !== "active") {
    return fail("STATE_CONFLICT", "Agent app install is not active");
  }
  const usageRun = {
    id: nextId("app_run"),
    tenantId: envelope.tenantId,
    installId: install.id,
    appId: envelope.payload.appId,
    usageSummary: envelope.payload.usageSummary,
    evidenceRefs: envelope.payload.evidenceRefs,
    executionRunId: envelope.payload.executionRunId ?? nextId("run"),
    deliveryPackageId: envelope.payload.deliveryPackageId ?? nextId("delivery"),
    acceptanceReviewId: envelope.payload.acceptanceReviewId ?? nextId("review"),
    acceptanceStatus: envelope.payload.acceptanceStatus ?? "usage_proof_recorded",
    financeEvidenceRefs: envelope.payload.financeEvidenceRefs ?? envelope.payload.evidenceRefs,
    reputationSubjectId: envelope.payload.reputationSubjectId ?? envelope.payload.appId,
    reputationStatus: envelope.payload.reputationStatus ?? "pending_buyer_rating",
    usageStatus: "recorded",
    version: 1
  };
  state.appUsageRuns.push(usageRun);
  return ok(
    state,
    usageRun.id,
    usageRun.version,
    [
      {
        eventName: "AgentAppUsageRecorded",
        payload: {
          usageRunId: usageRun.id,
          installId: install.id,
          executionRunId: usageRun.executionRunId,
          deliveryPackageId: usageRun.deliveryPackageId,
          acceptanceReviewId: usageRun.acceptanceReviewId,
          reputationSubjectId: usageRun.reputationSubjectId
        }
      }
    ],
    usageRun
  );
}

function exitAgentApp(state, envelope) {
  const install = requireById(state.appInstalls, "id", envelope.payload.installId);
  if (!install) return fail("VALIDATION_FAILED", "Unknown install");
  install.version += 1;
  install.installStatus = "exited";
  install.exitReason = envelope.payload.exitReason;
  return ok(state, install.id, install.version, [{ eventName: "AgentAppExited", payload: { installId: install.id, exitReason: install.exitReason } }], install);
}

function allocateProgramCredit(state, envelope) {
  const program = requireById(state.programWorkspaces, "id", envelope.payload.programId);
  if (!program) return fail("VALIDATION_FAILED", "Unknown program");
  program.activeCreditMinor += envelope.payload.creditAmountMinor;
  return ok(state, program.id, 1, [{ eventName: "ProgramCreditAllocated", payload: { programId: program.id, creditAmountMinor: envelope.payload.creditAmountMinor } }], program);
}

function recordProgramDrawdown(state, envelope) {
  const program = requireById(state.programWorkspaces, "id", envelope.payload.programId);
  if (!program) return fail("VALIDATION_FAILED", "Unknown program");
  if (program.activeCreditMinor < envelope.payload.drawdownMinor) {
    return fail("STATE_CONFLICT", "Insufficient program credit");
  }
  program.activeCreditMinor -= envelope.payload.drawdownMinor;
  return ok(state, program.id, 1, [{ eventName: "ProgramCreditDrawdownRecorded", payload: { programId: program.id, drawdownMinor: envelope.payload.drawdownMinor } }], program);
}

function updateProgramQbr(state, envelope) {
  const program = requireById(state.programWorkspaces, "id", envelope.payload.programId);
  if (!program) return fail("VALIDATION_FAILED", "Unknown program");
  program.qbrStatus = envelope.payload.qbrStatus;
  return ok(state, program.id, 1, [{ eventName: "ProgramQbrUpdated", payload: { programId: program.id, qbrStatus: program.qbrStatus } }], program);
}

function updateCategory(state, envelope) {
  const category = requireById(state.categories, "categoryId", envelope.payload.categoryId);
  if (!category) return fail("VALIDATION_FAILED", "Unknown category");
  if ("categoryId" in envelope.payload.patch && envelope.payload.patch.categoryId !== category.categoryId) {
    return fail("STATE_CONFLICT", "Category ID cannot be renamed or reused after governance history exists");
  }
  const previousSnapshot = snapshotCategory(category);
  category.version += 1;
  category.history = [...(category.history ?? []), previousSnapshot];
  Object.assign(category, envelope.payload.patch);
  return ok(
    state,
    category.categoryId,
    category.version,
    [{ eventName: "AgentCategoryUpdated", payload: { categoryId: category.categoryId, previousVersion: previousSnapshot.version } }],
    category
  );
}

function archiveCategory(state, envelope) {
  const category = requireById(state.categories, "categoryId", envelope.payload.categoryId);
  if (!category) return fail("VALIDATION_FAILED", "Unknown category");
  category.version += 1;
  category.categoryStatus = "archived";
  return ok(state, category.categoryId, category.version, [{ eventName: "AgentCategoryArchived", payload: { categoryId: category.categoryId } }], category);
}

function restoreCategory(state, envelope) {
  const category = requireById(state.categories, "categoryId", envelope.payload.categoryId);
  if (!category) return fail("VALIDATION_FAILED", "Unknown category");
  category.version += 1;
  category.categoryStatus = "sellable";
  return ok(state, category.categoryId, category.version, [{ eventName: "AgentCategoryRestored", payload: { categoryId: category.categoryId } }], category);
}

function createAgentPassport(state, envelope) {
  if (state.agentPassports.some((passport) => passport.id === envelope.payload.agentId)) {
    return fail("STATE_CONFLICT", "Agent passport already exists");
  }
  const passport = {
    id: envelope.payload.agentId,
    slug: envelope.payload.agentId,
    name: envelope.payload.agentId,
    sellerId: envelope.payload.sellerId,
    supplyType: "custom_agent",
    categoryIds: envelope.payload.categoryIds,
    proofStatus: "sample_only",
    passportStatus: "active",
    version: 1,
    machineManifest: { manifestVersion: envelope.payload.manifestVersion },
    commandExamples: [],
    orderHistory: { completed: 0, revisions: 0, disputes: 0 },
    scoreSummary: { averageRating: 0, qaPassRate: 0, disputeRate: 0, onTimeRate: 0 },
    unsupportedScenarios: []
  };
  state.agentPassports.push(passport);
  return ok(state, passport.id, passport.version, [{ eventName: "AgentPassportCreated", payload: { agentId: passport.id } }], passport);
}

function updateAgentPassport(state, envelope) {
  const passport = requireById(state.agentPassports, "id", envelope.payload.agentId);
  if (!passport) return fail("VALIDATION_FAILED", "Unknown agent passport");
  passport.version += 1;
  Object.assign(passport, envelope.payload.patch);
  return ok(state, passport.id, passport.version, [{ eventName: "AgentPassportUpdated", payload: { agentId: passport.id } }], passport);
}

function suspendAgentPassport(state, envelope) {
  const passport = requireById(state.agentPassports, "id", envelope.payload.agentId);
  if (!passport) return fail("VALIDATION_FAILED", "Unknown agent passport");
  passport.version += 1;
  passport.passportStatus = "suspended";
  return ok(state, passport.id, passport.version, [{ eventName: "AgentPassportSuspended", payload: { agentId: passport.id } }], passport);
}

function publishListing(state, envelope) {
  const passport = requireById(state.agentPassports, "id", envelope.payload.agentId) ?? requireById(state.agentAppPassports, "id", envelope.payload.agentId);
  if (!passport || passport.passportStatus !== "active") {
    return fail("VALIDATION_FAILED", "Listing must reference an active AgentPassport or AgentAppPassport");
  }
  const seller = requireById(state.sellers, "id", passport.sellerId);
  if (!seller?.approved || seller.admissionScore < 80 || seller.payoutReadiness !== "ready" || seller.capacityAvailable <= 0) {
    return fail("SELLER_NOT_APPROVED", "Seller admission, payout, and capacity must be ready before listing publish");
  }

  const categoriesForListing = envelope.payload.categoryIds.map((categoryId) => requireById(state.categories, "categoryId", categoryId));
  if (categoriesForListing.some((category) => !category || category.categoryStatus !== "sellable")) {
    return fail("STATE_CONFLICT", "Listing category is not sellable");
  }
  const categoryAligned = envelope.payload.categoryIds.every((categoryId) => passport.categoryIds?.includes(categoryId));
  if (!categoryAligned) {
    return fail("VALIDATION_FAILED", "Listing categories must be covered by the passport categories");
  }
  const templateMatchesCategory = categoriesForListing.some(
    (category) =>
      category.defaultAcceptanceTemplateId === envelope.payload.acceptanceTemplateId &&
      category.defaultPermissionTemplateId === envelope.payload.permissionTemplateId
  );
  if (!templateMatchesCategory) {
    return fail("VALIDATION_FAILED", "Listing must provide category-matched acceptance and permission templates");
  }
  if (!Number.isFinite(envelope.payload.priceAmountMinor) || envelope.payload.priceAmountMinor <= 0) {
    return fail("VALIDATION_FAILED", "Listing price must be positive");
  }
  if (!Number.isFinite(envelope.payload.deliveryHours) || envelope.payload.deliveryHours <= 0) {
    return fail("VALIDATION_FAILED", "Listing deliveryHours must be positive");
  }
  if (!Number.isFinite(envelope.payload.capacityAvailable) || envelope.payload.capacityAvailable <= 0) {
    return fail("VALIDATION_FAILED", "Listing capacityAvailable must be positive");
  }

  const listing = requireById(state.listings, "listingId", envelope.payload.listingId);
  if (listing) {
    listing.version += 1;
    listing.listingStatus = "published";
    listing.categoryIds = envelope.payload.categoryIds;
    listing.startingPriceMinor = envelope.payload.priceAmountMinor;
    listing.acceptanceTemplateId = envelope.payload.acceptanceTemplateId;
    listing.permissionTemplateId = envelope.payload.permissionTemplateId;
    listing.deliveryHours = envelope.payload.deliveryHours;
    listing.capacityAvailable = envelope.payload.capacityAvailable;
    return ok(state, listing.listingId, listing.version, [{ eventName: "AgentListingPublished", payload: { listingId: listing.listingId } }], listing);
  }

  const created = {
    listingId: envelope.payload.listingId,
    agentId: envelope.payload.agentId,
    slug: envelope.payload.listingId,
    title: envelope.payload.title ?? passport.name ?? envelope.payload.listingId,
    supplyType: passport.supplyType ?? "agent_app",
    categoryIds: envelope.payload.categoryIds,
    billingMode: envelope.payload.billingMode ?? "per_order",
    startingPriceMinor: envelope.payload.priceAmountMinor,
    currency: envelope.payload.currency ?? "CNY",
    deliveryHours: envelope.payload.deliveryHours,
    qaPassRate: 0,
    disputeRate: 0,
    proofStatus: passport.proofStatus ?? "sample_only",
    capacityAvailable: envelope.payload.capacityAvailable,
    riskLevel: categoriesForListing[0]?.riskLevel ?? "medium_high",
    buyerScale: envelope.payload.buyerScale ?? "team",
    sellerLegalEntity: seller.legalEntity,
    humanOwner: passport.humanOwner ?? passport.sellerId,
    acceptanceTemplateId: envelope.payload.acceptanceTemplateId,
    permissionTemplateId: envelope.payload.permissionTemplateId,
    listingStatus: "published",
    featured: false,
    version: 1,
    auditEvents: []
  };
  state.listings.push(created);
  return ok(state, created.listingId, created.version, [{ eventName: "AgentListingPublished", payload: { listingId: created.listingId } }], created);
}

function updateListing(state, envelope) {
  const listing = requireById(state.listings, "listingId", envelope.payload.listingId);
  if (!listing) return fail("VALIDATION_FAILED", "Unknown listing");
  listing.version += 1;
  Object.assign(listing, envelope.payload.patch);
  return ok(state, listing.listingId, listing.version, [{ eventName: "AgentListingUpdated", payload: { listingId: listing.listingId } }], listing);
}

function archiveListing(state, envelope) {
  const listing = requireById(state.listings, "listingId", envelope.payload.listingId);
  if (!listing) return fail("VALIDATION_FAILED", "Unknown listing");
  listing.version += 1;
  listing.listingStatus = "archived";
  return ok(state, listing.listingId, listing.version, [{ eventName: "AgentListingArchived", payload: { listingId: listing.listingId } }], listing);
}

function createRfp(state, envelope) {
  const id = nextId("rfp");
  const rfp = {
    id,
    tenantId: envelope.tenantId,
    buyerOrgId: initialBuyerOrgId,
    createdBy: envelope.actorId,
    rfpStatus: "draft",
    version: 1,
    ...envelope.payload
  };
  state.rfps.push(rfp);
  return ok(state, rfp.id, rfp.version, [{ eventName: "RfpDraftCreated", payload: { rfpId: rfp.id, rfpStatus: rfp.rfpStatus } }], toRfpDto(rfp));
}

function publishRfp(state, envelope) {
  const rfp = requireById(state.rfps, "id", envelope.payload.rfpId);
  if (!rfp) return fail("VALIDATION_FAILED", "Unknown RFP");
  rfp.version += 1;
  rfp.rfpStatus = "published";
  rfp.acceptanceTemplateId = envelope.payload.acceptanceTemplateId;
  rfp.prohibitedSources = envelope.payload.prohibitedSources;
  rfp.deadlineAt = envelope.payload.deadlineAt;
  return ok(state, rfp.id, rfp.version, [{ eventName: "RfpPublished", payload: { rfpId: rfp.id, rfpStatus: rfp.rfpStatus } }], toRfpDto(rfp));
}

function cancelRfp(state, envelope) {
  const rfp = requireById(state.rfps, "id", envelope.payload.rfpId);
  if (!rfp) return fail("VALIDATION_FAILED", "Unknown RFP");
  rfp.version += 1;
  rfp.rfpStatus = "cancelled";
  return ok(state, rfp.id, rfp.version, [{ eventName: "RfpCancelled", payload: { rfpId: rfp.id, rfpStatus: rfp.rfpStatus } }], toRfpDto(rfp));
}

function submitProposal(state, envelope) {
  const rfp = requireById(state.rfps, "id", envelope.payload.rfpId);
  if (!rfp || !["published", "quoting"].includes(rfp.rfpStatus)) {
    return fail("RFP_NOT_OPEN", "RFP is not open for proposals");
  }
  const seller = requireById(state.sellers, "id", envelope.payload.sellerId);
  if (!seller?.approved) {
    return fail("SELLER_NOT_APPROVED", "Seller is not approved");
  }
  if ((seller.admissionScore ?? 0) < 80) {
    return fail("SELLER_NOT_APPROVED", "Seller admission score is below 80");
  }
  const categoryBlocked = rfp.category && state.categories.some((category) => category.name?.["zh-CN"] === rfp.category && category.categoryStatus === "archived");
  if (categoryBlocked) {
    return fail("STATE_CONFLICT", "RFP category is archived");
  }
  const agentReadiness = validateProposalAgentReadiness(state, envelope.payload, rfp);
  if (agentReadiness) return agentReadiness;
  const proposalCategoryStatus = validateProposalCategoriesSellable(state, envelope.payload, rfp);
  if (proposalCategoryStatus) return proposalCategoryStatus;
  const proposal = {
    id: nextId("proposal"),
    tenantId: envelope.tenantId,
    proposalStatus: "submitted",
    version: 1,
    ...envelope.payload
  };
  state.proposals.push(proposal);
  rfp.rfpStatus = "quoting";
  return ok(state, proposal.id, proposal.version, [{ eventName: "ProposalSubmitted", payload: { proposalId: proposal.id, proposalStatus: proposal.proposalStatus } }], toProposalDto(proposal));
}

function acceptProposal(state, envelope) {
  const proposal = requireById(state.proposals, "id", envelope.payload.proposalId);
  if (!proposal) return fail("VALIDATION_FAILED", "Unknown proposal");
  const buyer = requireById(state.buyers, "id", initialBuyerOrgId);
  const buyerReadiness = validateBuyerProcurementReadiness(buyer);
  if (buyerReadiness) return buyerReadiness;
  const rfp = requireById(state.rfps, "id", proposal.rfpId);
  const proposalCategoryStatus = validateProposalCategoriesSellable(state, proposal, rfp);
  if (proposalCategoryStatus) return proposalCategoryStatus;
  proposal.proposalStatus = "selected";
  proposal.version += 1;
  const categorySnapshot = snapshotOrderCategories(state, proposal, rfp);
  const order = {
    id: nextId("order"),
    tenantId: envelope.tenantId,
    rfpId: proposal.rfpId,
    proposalId: proposal.id,
    buyerOrgId: initialBuyerOrgId,
    sellerId: proposal.sellerId,
    agentId: proposal.agentId,
    orderStatus: "created",
    ledgerStatus: "not_funded",
    acceptanceStatus: "not_ready",
    amountMinor: proposal.priceAmountMinor,
    currency: proposal.currency,
    includedScope: proposal.includedScope ?? [],
    termsSnapshot: envelope.payload.termsSnapshot,
    categorySnapshot,
    contractingEntity: buyer?.contractingEntity ?? "",
    collectionEntity: buyer?.collectionEntity ?? "",
    invoiceIssuer: buyer?.invoiceIssuer ?? "",
    refundRemitter: buyer?.refundRemitter ?? "",
    financeContactUserId: buyer?.financeContactUserId ?? "",
    authorizedPayerId: buyer?.authorizedPayerId ?? "",
    invoiceStatus: buyer?.invoiceReadiness === "ready" ? "ready_to_request" : "blocked_missing_invoice_profile",
    reconciliationStatus: "not_ready",
    financeEvidenceRefs: [],
    evidenceCompleteness: 0,
    qaSummary: "waiting for payment",
    version: 1
  };
  state.orders.push(order);
  if (rfp) {
    rfp.rfpStatus = "ordered";
    rfp.version += 1;
  }
  const events = [
    { eventName: "ProposalSelected", payload: { proposalId: proposal.id, proposalStatus: proposal.proposalStatus } },
    { eventName: "EscrowOrderCreated", payload: { orderId: order.id, orderStatus: order.orderStatus, ledgerStatus: order.ledgerStatus, acceptanceStatus: order.acceptanceStatus } }
  ];
  return ok(state, order.id, order.version, events, toOrderDto(order));
}

function withdrawProposal(state, envelope) {
  const proposal = requireById(state.proposals, "id", envelope.payload.proposalId);
  if (!proposal) return fail("VALIDATION_FAILED", "Unknown proposal");
  proposal.version += 1;
  proposal.proposalStatus = "withdrawn";
  return ok(state, proposal.id, proposal.version, [{ eventName: "ProposalWithdrawn", payload: { proposalId: proposal.id, proposalStatus: proposal.proposalStatus } }], toProposalDto(proposal));
}

function fundOrder(state, envelope) {
  const order = requireById(state.orders, "id", envelope.payload.orderId);
  if (!order) return fail("VALIDATION_FAILED", "Unknown order");
  const buyer = requireById(state.buyers, "id", order.buyerOrgId);
  const buyerReadiness = validateBuyerProcurementReadiness(buyer, order);
  if (buyerReadiness) return buyerReadiness;
  order.version += 1;
  order.orderStatus = "funded";
  order.ledgerStatus = "escrowed";
  order.acceptanceStatus = "qa_pending";
  order.paymentRef = envelope.payload.paymentRef;
  order.paymentStatus = "confirmed";
  order.receivedAt = envelope.payload.receivedAt;
  order.receivedBy = envelope.payload.receivedBy;
  order.invoiceStatus = order.invoiceStatus === "blocked_missing_invoice_profile" ? order.invoiceStatus : "requested";
  order.reconciliationStatus = "payment_recorded";
  order.financeEvidenceRefs = Array.from(new Set([...(order.financeEvidenceRefs ?? []), envelope.payload.paymentRef]));

  const grant = {
    id: nextId("grant"),
    tenantId: envelope.tenantId,
    orderId: order.id,
    agentId: order.agentId,
    grantStatus: "requested",
    toolAllowlist: [],
    expiresAt: null,
    version: 1
  };
  state.grants.push(grant);

  return ok(
    state,
    order.id,
    order.version,
    [
      {
        eventName: "EscrowFunded",
        payload: {
          orderId: order.id,
          orderStatus: order.orderStatus,
          ledgerStatus: order.ledgerStatus,
          paymentRef: order.paymentRef,
          invoiceStatus: order.invoiceStatus,
          reconciliationStatus: order.reconciliationStatus
        }
      },
      { eventName: "PermissionRequested", payload: { grantId: grant.id, grantStatus: grant.grantStatus, orderId: order.id, agentId: order.agentId } }
    ],
    toOrderDto(order)
  );
}

function approveGrant(state, envelope) {
  const grant = requireById(state.grants, "id", envelope.payload.grantId);
  if (!grant) return fail("VALIDATION_FAILED", "Unknown grant");
  const deniedTools = contract.security.runtimeToolPolicy.denied;
  const hasDeniedTool = envelope.payload.toolAllowlist.some((tool) => deniedTools.includes(tool));
  if (hasDeniedTool) {
    return fail("PERMISSION_DENIED", "High-risk tools remain denied");
  }
  grant.version += 1;
  grant.grantStatus = "approved";
  grant.toolAllowlist = envelope.payload.toolAllowlist;
  grant.expiresAt = envelope.payload.expiresAt;
  return ok(state, grant.id, grant.version, [{ eventName: "PermissionApproved", payload: { grantId: grant.id, grantStatus: grant.grantStatus, toolAllowlist: grant.toolAllowlist, expiresAt: grant.expiresAt } }], toGrantDto(grant));
}

function denyGrant(state, envelope) {
  const grant = requireById(state.grants, "id", envelope.payload.grantId);
  if (!grant) return fail("VALIDATION_FAILED", "Unknown grant");
  grant.version += 1;
  grant.grantStatus = "denied";
  return ok(state, grant.id, grant.version, [{ eventName: "PermissionDenied", payload: { grantId: grant.id, grantStatus: grant.grantStatus, denyReason: envelope.payload.denyReason } }], toGrantDto(grant));
}

function revokeGrant(state, envelope) {
  const grant = requireById(state.grants, "id", envelope.payload.grantId);
  if (!grant) return fail("VALIDATION_FAILED", "Unknown grant");
  grant.version += 1;
  grant.grantStatus = "revoked";
  return ok(state, grant.id, grant.version, [{ eventName: "PermissionRevoked", payload: { grantId: grant.id, grantStatus: grant.grantStatus, revocationReason: envelope.payload.revocationReason } }], toGrantDto(grant));
}

function startRun(state, envelope) {
  const order = requireById(state.orders, "id", envelope.payload.orderId);
  if (!order || order.ledgerStatus !== "escrowed") {
    return fail("ESCROW_NOT_FUNDED", "Order is not funded");
  }
  const approvedGrant = envelope.payload.permissionGrantIds
    .map((id) => requireById(state.grants, "id", id))
    .find((grant) => grant?.grantStatus === "approved");
  if (!approvedGrant) return fail("PERMISSION_DENIED", "No approved permission grant");

  const run = {
    id: nextId("run"),
    tenantId: envelope.tenantId,
    runStatus: "running",
    orderId: order.id,
    agentId: order.agentId,
    permissionGrantIds: envelope.payload.permissionGrantIds,
    failureReason: null,
    version: 1
  };
  state.runs.push(run);
  order.orderStatus = "in_progress";
  order.ledgerStatus = "locked";
  order.version += 1;
  return ok(
    state,
    run.id,
    run.version,
    [
      { eventName: "RunQueued", payload: { runId: run.id, runStatus: "queued", orderId: order.id } },
      { eventName: "RunStarted", payload: { runId: run.id, runStatus: run.runStatus, orderId: order.id } }
    ],
    toRunDto(run)
  );
}

function cancelRun(state, envelope) {
  const run = requireById(state.runs, "id", envelope.payload.runId);
  if (!run) return fail("VALIDATION_FAILED", "Unknown run");
  run.version += 1;
  run.runStatus = "cancelled";
  run.failureReason = envelope.payload.cancelReason;
  return ok(state, run.id, run.version, [{ eventName: "RunCancelled", payload: { runId: run.id, runStatus: run.runStatus, cancelReason: run.failureReason } }], toRunDto(run));
}

function submitDelivery(state, envelope) {
  const order = requireById(state.orders, "id", envelope.payload.orderId);
  if (!order) return fail("VALIDATION_FAILED", "Unknown order");
  const run = requireById(state.runs, "id", envelope.payload.executionRunIds[0]);
  if (!run) return fail("VALIDATION_FAILED", "Unknown run");
  run.runStatus = "succeeded";
  run.version += 1;
  const delivery = {
    id: nextId("delivery"),
    tenantId: envelope.tenantId,
    deliveryStatus: "submitted",
    orderId: order.id,
    artifactRefs: envelope.payload.artifactRefs,
    evidenceRefs: envelope.payload.evidenceRefs,
    criteriaMapping: envelope.payload.criteriaMapping,
    knownLimitations: envelope.payload.knownLimitations,
    version: 1
  };
  state.deliveries.push(delivery);
  order.orderStatus = "delivery_submitted";
  order.version += 1;
  order.evidenceCompleteness = Math.min(1, delivery.evidenceRefs.length / 3);
  return ok(
    state,
    delivery.id,
    delivery.version,
    [
      { eventName: "RunSucceeded", payload: { runId: run.id, runStatus: run.runStatus, outputRefs: delivery.artifactRefs } },
      { eventName: "DeliverySubmitted", payload: { deliveryPackageId: delivery.id, deliveryStatus: delivery.deliveryStatus, orderId: order.id, evidenceRefs: delivery.evidenceRefs } }
    ],
    toDeliveryDto(delivery)
  );
}

function passDeliveryQa(state, envelope) {
  const delivery = requireById(state.deliveries, "id", envelope.payload.deliveryPackageId);
  if (!delivery) return fail("VALIDATION_FAILED", "Unknown delivery");
  delivery.version += 1;
  delivery.deliveryStatus = "qa_passed";
  const order = requireById(state.orders, "id", delivery.orderId);
  order.version += 1;
  order.orderStatus = "ready_for_acceptance";
  order.acceptanceStatus = "ready";
  order.qaSummary = "QA passed";
  return ok(state, order.id, order.version, [{ eventName: "DeliveryQaPassed", payload: { deliveryPackageId: delivery.id, deliveryStatus: delivery.deliveryStatus, qaChecklistId: envelope.payload.qaChecklistId } }], toOrderDto(order));
}

function rejectDeliveryQa(state, envelope) {
  const delivery = requireById(state.deliveries, "id", envelope.payload.deliveryPackageId);
  if (!delivery) return fail("VALIDATION_FAILED", "Unknown delivery");
  delivery.version += 1;
  delivery.deliveryStatus = "qa_rejected";
  const order = requireById(state.orders, "id", delivery.orderId);
  order.version += 1;
  order.orderStatus = "revision_requested";
  order.acceptanceStatus = "qa_pending";
  order.qaSummary = envelope.payload.rejectReason;
  return ok(state, order.id, order.version, [{ eventName: "DeliveryQaRejected", payload: { deliveryPackageId: delivery.id, deliveryStatus: delivery.deliveryStatus, failedItems: envelope.payload.failedItems, fixSlaHours: envelope.payload.fixSlaHours } }], toOrderDto(order));
}

function acceptDelivery(state, envelope) {
  const order = requireById(state.orders, "id", envelope.payload.orderId);
  if (!order || order.acceptanceStatus !== "ready") {
    return fail("STATE_CONFLICT", "Order is not ready for acceptance");
  }
  const review = {
    id: nextId("review"),
    tenantId: envelope.tenantId,
    orderId: order.id,
    deliveryPackageId: envelope.payload.deliveryPackageId,
    reviewStatus: "accepted",
    version: 1,
    criteriaScores: envelope.payload.criteriaScores,
    totalScore: Object.values(envelope.payload.criteriaScores).reduce((total, value) => total + value, 0),
    decisionReason: envelope.payload.decisionReason,
    submittedBy: envelope.actorId
  };
  state.reviews.push(review);
  order.version += 1;
  order.orderStatus = "accepted";
  order.acceptanceStatus = "accepted";
  return ok(state, order.id, order.version, [{ eventName: "AcceptanceAccepted", payload: { reviewId: review.id, reviewStatus: review.reviewStatus, orderId: order.id, totalScore: review.totalScore } }], toOrderDto(order));
}

function requestRevision(state, envelope) {
  const order = requireById(state.orders, "id", envelope.payload.orderId);
  if (!order) return fail("VALIDATION_FAILED", "Unknown order");
  const proposal = requireById(state.proposals, "id", order.proposalId);
  if (revisionExpandsScope(envelope.payload.requestedFixes, order.includedScope ?? proposal?.includedScope ?? [])) {
    return fail("SCOPE_EXPANSION_REQUIRED", "Revision request exceeds frozen order scope and needs a change order");
  }
  const review = {
    id: nextId("review"),
    tenantId: envelope.tenantId,
    orderId: order.id,
    deliveryPackageId: envelope.payload.deliveryPackageId,
    reviewStatus: "revision_requested",
    version: 1,
    failedCriteria: envelope.payload.failedCriteria,
    requestedFixes: envelope.payload.requestedFixes,
    decisionReason: envelope.payload.decisionReason
  };
  state.reviews.push(review);
  order.version += 1;
  order.orderStatus = "revision_requested";
  order.acceptanceStatus = "revision_requested";
  return ok(state, order.id, order.version, [{ eventName: "RevisionRequested", payload: { reviewId: review.id, reviewStatus: review.reviewStatus, orderId: order.id, failedCriteria: review.failedCriteria } }], toOrderDto(order));
}

function openDispute(state, envelope) {
  const order = requireById(state.orders, "id", envelope.payload.orderId);
  if (!order) return fail("VALIDATION_FAILED", "Unknown order");
  const review = {
    id: nextId("review"),
    tenantId: envelope.tenantId,
    orderId: order.id,
    deliveryPackageId: envelope.payload.deliveryPackageId,
    reviewStatus: "disputed",
    version: 1,
    disputeReason: envelope.payload.disputeReason,
    evidenceRefs: envelope.payload.evidenceRefs
  };
  state.reviews.push(review);
  order.version += 1;
  order.orderStatus = "disputed";
  order.acceptanceStatus = "disputed";
  return ok(state, order.id, order.version, [{ eventName: "DisputeOpened", payload: { reviewId: review.id, reviewStatus: review.reviewStatus, orderId: order.id, disputeReason: review.disputeReason } }], toOrderDto(order));
}

function resolveDispute(state, envelope) {
  const order = requireById(state.orders, "id", envelope.payload.orderId);
  if (!order) return fail("VALIDATION_FAILED", "Unknown order");
  order.version += 1;
  order.orderStatus = "resolved";
  order.acceptanceStatus = "resolved";
  order.disputeDecision = envelope.payload.decision;
  order.releaseAmountMinor = envelope.payload.releaseAmountMinor;
  order.refundAmountMinor = envelope.payload.refundAmountMinor;
  order.disputeEvidenceRefs = envelope.payload.evidenceRefs;
  order.financeEvidenceRefs = Array.from(new Set([...(order.financeEvidenceRefs ?? []), ...envelope.payload.evidenceRefs]));
  return ok(state, order.id, order.version, [{ eventName: "DisputeResolved", payload: { orderId: order.id, orderStatus: order.orderStatus, releaseAmountMinor: order.releaseAmountMinor, refundAmountMinor: order.refundAmountMinor, decision: order.disputeDecision, evidenceRefs: order.disputeEvidenceRefs } }], toOrderDto(order));
}

function releaseEscrow(state, envelope) {
  const order = requireById(state.orders, "id", envelope.payload.orderId);
  if (!order || order.acceptanceStatus !== "accepted") {
    return fail("STATE_CONFLICT", "Order is not accepted");
  }
  order.version += 1;
  order.orderStatus = "released";
  order.ledgerStatus = "released";
  order.releasedAmountMinor = order.amountMinor;
  order.refundAmountMinor = order.refundAmountMinor ?? 0;
  order.invoiceStatus = "requested";
  order.reconciliationStatus = "weekly_export_ready";
  order.financeEvidenceRefs = Array.from(new Set([...(order.financeEvidenceRefs ?? []), envelope.payload.financeEvidenceRef]));
  return ok(state, order.id, order.version, [{ eventName: "EscrowReleased", payload: { orderId: order.id, orderStatus: order.orderStatus, ledgerStatus: order.ledgerStatus, releasedAmountMinor: order.amountMinor, financeEvidenceRef: envelope.payload.financeEvidenceRef, reconciliationStatus: order.reconciliationStatus } }], toOrderDto(order));
}

function partialRelease(state, envelope) {
  const order = requireById(state.orders, "id", envelope.payload.orderId);
  if (!order || order.orderStatus !== "resolved") {
    return fail("STATE_CONFLICT", "Order is not resolved");
  }
  order.version += 1;
  order.ledgerStatus = "partially_released";
  order.orderStatus = "partially_released";
  order.releaseAmountMinor = envelope.payload.releaseAmountMinor;
  order.refundAmountMinor = envelope.payload.refundAmountMinor;
  order.releasedAmountMinor = envelope.payload.releaseAmountMinor;
  order.reconciliationStatus = "weekly_export_ready";
  order.financeEvidenceRefs = Array.from(new Set([...(order.financeEvidenceRefs ?? []), envelope.payload.decisionRef]));
  return ok(state, order.id, order.version, [{ eventName: "EscrowPartiallyReleased", payload: { orderId: order.id, orderStatus: order.orderStatus, ledgerStatus: order.ledgerStatus, releasedAmountMinor: order.releaseAmountMinor, refundAmountMinor: order.refundAmountMinor, decisionRef: envelope.payload.decisionRef, reconciliationStatus: order.reconciliationStatus } }], toOrderDto(order));
}

function refundEscrow(state, envelope) {
  const order = requireById(state.orders, "id", envelope.payload.orderId);
  if (!order) return fail("VALIDATION_FAILED", "Unknown order");
  order.version += 1;
  order.ledgerStatus = "refunded";
  order.orderStatus = "refunded";
  order.refundAmountMinor = envelope.payload.refundAmountMinor;
  order.releasedAmountMinor = 0;
  order.refundReason = envelope.payload.refundReason;
  order.reconciliationStatus = "weekly_export_ready";
  order.financeEvidenceRefs = Array.from(new Set([...(order.financeEvidenceRefs ?? []), envelope.payload.financeEvidenceRef]));
  return ok(state, order.id, order.version, [{ eventName: "EscrowRefunded", payload: { orderId: order.id, orderStatus: order.orderStatus, ledgerStatus: order.ledgerStatus, refundAmountMinor: order.refundAmountMinor, refundReason: envelope.payload.refundReason, financeEvidenceRef: envelope.payload.financeEvidenceRef, reconciliationStatus: order.reconciliationStatus } }], toOrderDto(order));
}

function submitRating(state, envelope) {
  const order = requireById(state.orders, "id", envelope.payload.orderId);
  if (!order || !["released", "partially_released", "refunded"].includes(order.orderStatus)) {
    return fail("ORDER_NOT_COMPLETED", "Order must be financially closed before rating");
  }
  if (envelope.actorRole !== "buyer") {
    return fail("ACTOR_FORBIDDEN", "Only buyer-side actors can publish effective ratings");
  }
  const existingRating = state.reputations.find(
    (entry) => entry.sourceOrderId === order.id && entry.subjectType === envelope.payload.subjectType && entry.subjectId === envelope.payload.subjectId
  );
  if (existingRating) {
    return fail("DUPLICATE_RATING", "Rating already exists for this order and subject");
  }
  const allowedCategoryIds = resolveOrderCategoryIds(state, order);
  const submittedCategoryIds = envelope.payload.categoryIds ?? [];
  const categoriesMatch =
    submittedCategoryIds.length > 0 && submittedCategoryIds.every((categoryId) => allowedCategoryIds.includes(categoryId));
  if (!categoriesMatch) {
    return fail("VALIDATION_FAILED", "Rating categories must match the order supply categories");
  }
  if (!isRatingSubjectAllowed(state, order, envelope.payload.subjectType, envelope.payload.subjectId)) {
    return fail("VALIDATION_FAILED", "Rating subject must match the order Agent, Agent App, or seller");
  }
  const reputation = {
    id: nextId("rep"),
    tenantId: envelope.tenantId,
    eventStatus: "published",
    subjectType: envelope.payload.subjectType,
    subjectId: envelope.payload.subjectId,
    sourceOrderId: order.id,
    agentVersion: envelope.payload.agentVersion,
    categoryIds: submittedCategoryIds,
    categorySnapshot: order.categorySnapshot ?? snapshotCategoryIds(state, submittedCategoryIds),
    ratingBreakdown: envelope.payload.ratingBreakdown,
    deliveryOutcome: envelope.payload.deliveryOutcome,
    version: 1
  };
  state.reputations.push(reputation);
  const agent = requireById(state.agentPassports, "id", envelope.payload.subjectId);
  if (agent) {
    agent.orderHistory.completed += 1;
  }
  return ok(
    state,
    reputation.id,
    reputation.version,
    [
      {
        eventName: "ReputationEventCreated",
        payload: {
          reputationEventId: reputation.id,
          eventStatus: reputation.eventStatus,
          sourceOrderId: reputation.sourceOrderId,
          subjectType: reputation.subjectType,
          subjectId: reputation.subjectId,
          agentVersion: reputation.agentVersion,
          categoryIds: reputation.categoryIds,
          deliveryOutcome: reputation.deliveryOutcome
        }
      },
      { eventName: "ReputationPublished", payload: { reputationEventId: reputation.id, eventStatus: reputation.eventStatus } }
    ],
    reputation
  );
}

function resolveOrderCategoryIds(state, order) {
  const proposal = requireById(state.proposals, "id", order.proposalId);
  const directListing = state.listings.find((listing) => listing.agentId === order.agentId);
  const directAgent = requireById(state.agentPassports, "id", order.agentId);
  const appPassport = requireById(state.agentAppPassports, "id", order.agentId);
  const rfp = requireById(state.rfps, "id", proposal?.rfpId ?? order.rfpId);
  const rfpCategory = rfp?.category
    ? state.categories.find((category) => category.name?.["zh-CN"] === rfp.category || category.name?.en === rfp.category || category.categoryId === rfp.category)
        ?.categoryId
    : null;

  return Array.from(
    new Set([
      ...(directListing?.categoryIds ?? []),
      ...(directAgent?.categoryIds ?? []),
      ...(appPassport?.categoryIds ?? []),
      ...(rfpCategory ? [rfpCategory] : [])
    ])
  );
}

function snapshotOrderCategories(state, proposal, rfp) {
  const categoryIds = resolveProposalCategoryIds(state, proposal, rfp);
  return snapshotCategoryIds(state, categoryIds);
}

function validateProposalCategoriesSellable(state, proposal, rfp) {
  const categoryIds = resolveProposalCategoryIds(state, proposal, rfp);
  if (categoryIds.length === 0) {
    return fail("VALIDATION_FAILED", "Proposal must resolve to at least one AgentCategory");
  }

  const blocked = categoryIds
    .map((categoryId) => requireById(state.categories, "categoryId", categoryId))
    .filter((category) => !category || category.categoryStatus !== "sellable");

  return blocked.length > 0
    ? fail("STATE_CONFLICT", "Proposal category is not sellable")
    : null;
}

function validateProposalAgentReadiness(state, proposal, rfp) {
  const passport = requireById(state.agentPassports, "id", proposal.agentId) ?? requireById(state.agentAppPassports, "id", proposal.agentId);
  if (!passport || passport.passportStatus !== "active") {
    return fail("VALIDATION_FAILED", "Proposal must reference an active AgentPassport or AgentAppPassport");
  }

  if (passport.sellerId !== proposal.sellerId) {
    return fail("VALIDATION_FAILED", "Proposal seller must own the referenced AgentPassport");
  }

  const rfpCategoryId = resolveRfpCategoryId(state, rfp);
  if (rfpCategoryId && !passport.categoryIds?.includes(rfpCategoryId)) {
    return fail("VALIDATION_FAILED", "Proposal AgentPassport categories must cover the RFP category");
  }

  return null;
}

function resolveProposalCategoryIds(state, proposal, rfp) {
  const directListing = state.listings.find((listing) => listing.agentId === proposal.agentId);
  const directAgent = requireById(state.agentPassports, "id", proposal.agentId);
  const appPassport = requireById(state.agentAppPassports, "id", proposal.agentId);
  const rfpCategory = rfp?.category
    ? state.categories.find((category) => category.name?.["zh-CN"] === rfp.category || category.name?.en === rfp.category || category.categoryId === rfp.category)
        ?.categoryId
    : null;

  return Array.from(
    new Set([
      ...(directListing?.categoryIds ?? []),
      ...(directAgent?.categoryIds ?? []),
      ...(appPassport?.categoryIds ?? []),
      ...(rfpCategory ? [rfpCategory] : [])
    ])
  );
}

function resolveRfpCategoryId(state, rfp) {
  return rfp?.category
    ? state.categories.find((category) => category.name?.["zh-CN"] === rfp.category || category.name?.en === rfp.category || category.categoryId === rfp.category)
        ?.categoryId ?? null
    : null;
}

function snapshotCategoryIds(state, categoryIds) {
  const categories = categoryIds.map((categoryId) => requireById(state.categories, "categoryId", categoryId)).filter(Boolean);
  return {
    categoryIds: categories.map((category) => category.categoryId),
    categoryLabels: categories.reduce((labels, category) => {
      labels.en = labels.en ? `${labels.en}, ${category.name?.en ?? category.categoryId}` : (category.name?.en ?? category.categoryId);
      labels["zh-CN"] = labels["zh-CN"] ? `${labels["zh-CN"]}, ${category.name?.["zh-CN"] ?? category.categoryId}` : (category.name?.["zh-CN"] ?? category.categoryId);
      return labels;
    }, {}),
    capturedVersions: categories.reduce((versions, category) => {
      versions[category.categoryId] = category.version;
      return versions;
    }, {})
  };
}

function snapshotCategory(category) {
  return {
    categoryId: category.categoryId,
    name: structuredClone(category.name),
    riskLevel: category.riskLevel,
    defaultPermissionTemplateId: category.defaultPermissionTemplateId,
    defaultAcceptanceTemplateId: category.defaultAcceptanceTemplateId,
    opsOwner: category.opsOwner,
    riskOwner: category.riskOwner,
    categoryStatus: category.categoryStatus,
    supportedSupplyTypes: structuredClone(category.supportedSupplyTypes ?? []),
    tags: structuredClone(category.tags ?? []),
    version: category.version
  };
}

function isRatingSubjectAllowed(state, order, subjectType, subjectId) {
  if (subjectType === "agent") return order.agentId === subjectId;
  if (subjectType === "agent_app") return order.agentId === subjectId;
  if (subjectType === "seller") return order.sellerId === subjectId;
  return false;
}

function validateBuyerProcurementReadiness(buyer, order = null) {
  if (!buyer) return fail("BUYER_NOT_PROCUREMENT_READY", "Buyer org is missing");
  const requiredBuyerFields = [
    "acceptanceOwnerUserId",
    "financeContactUserId",
    "legalContactUserId",
    "authorizedPayerId",
    "contractingEntity",
    "collectionEntity",
    "invoiceIssuer",
    "refundRemitter"
  ];
  const missingBuyerFields = requiredBuyerFields.filter((field) => isBlank(buyer[field]));
  if (!Array.isArray(buyer.signerIds) || buyer.signerIds.length === 0) missingBuyerFields.push("signerIds");
  if (buyer.invoiceReadiness !== "ready") missingBuyerFields.push("invoiceReadiness");
  if (buyer.scopeAcknowledgement !== "accepted") missingBuyerFields.push("scopeAcknowledgement");
  if (missingBuyerFields.length > 0) {
    return fail("BUYER_NOT_PROCUREMENT_READY", `Buyer org missing procurement readiness fields: ${missingBuyerFields.join(", ")}`);
  }

  if (order) {
    const requiredOrderFields = ["contractingEntity", "collectionEntity", "invoiceIssuer", "refundRemitter"];
    const missingOrderFields = requiredOrderFields.filter((field) => isBlank(order[field]));
    if (missingOrderFields.length > 0) {
      return fail("BUYER_NOT_PROCUREMENT_READY", `Order missing finance readiness fields: ${missingOrderFields.join(", ")}`);
    }
  }

  return null;
}

function revisionExpandsScope(requestedFixes, includedScope) {
  const scopeTokens = normalizeScopeTokens(includedScope);
  if (scopeTokens.length === 0) return true;
  return requestedFixes.some((fix) => {
    const normalizedFix = normalizeText(fix);
    const hasScopeMatch = scopeTokens.some((scope) => normalizedFix.includes(scope) || scope.includes(normalizedFix));
    const expansionLanguage = /\b(add|new|additional|extra|net-new|beyond|expand|新增|额外|新(增|的)?|扩大|超出)\b/i.test(String(fix));
    return expansionLanguage && !hasScopeMatch;
  });
}

function normalizeScopeTokens(items) {
  return items
    .flatMap((item) => {
      const text = normalizeText(item);
      const withoutCounts = text.replace(/\b\d+\b/g, " ").replace(/\s+/g, " ").trim();
      return [text, withoutCounts].filter((value) => value.length >= 3);
    })
    .filter((value, index, all) => all.indexOf(value) === index);
}

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/[^\p{Letter}\p{Number}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isBlank(value) {
  return value == null || (typeof value === "string" && value.trim() === "");
}

function validateExpectedVersion(commandName, envelope, state) {
  const target = resolveVersionTarget(commandName, envelope.payload, state);
  if (!target) return null;

  const expectedVersion = envelope.expectedVersion;
  if (target.create) {
    return expectedVersion === 0
      ? null
      : fail("VERSION_CONFLICT", `${commandName} expectedVersion must be 0 for create commands`);
  }

  if (!target.aggregate) return fail("VALIDATION_FAILED", `Unknown aggregate for ${commandName}`);
  if (target.aggregate.version !== expectedVersion) {
    return fail("VERSION_CONFLICT", `${commandName} version conflict`);
  }
  return null;
}

function resolveVersionTarget(commandName, payload, state) {
  const createCommands = new Set([
    "custom-project.request",
    "agent-app.install",
    "agent-category create",
    "agent-passport create",
    "rfp.create"
  ]);
  if (createCommands.has(commandName)) return { create: true };

  const existingListing = commandName === "agent-listing publish" ? requireById(state.listings, "listingId", payload.listingId) : null;
  if (commandName === "agent-listing publish" && !existingListing) return { create: true };

  const lookups = {
    "buyer-org.setup": ["buyers", "id", payload.buyerOrgId],
    "custom-project.confirm-milestone": ["customProjects", "id", payload.projectId],
    "custom-project.submit-uat": ["customProjects", "id", payload.projectId],
    "custom-project.create-change-order": ["customProjects", "id", payload.projectId],
    "agent-app.record-usage": ["appInstalls", "id", payload.installId],
    "agent-app.exit": ["appInstalls", "id", payload.installId],
    "program.allocate-credit": ["programWorkspaces", "id", payload.programId],
    "program.record-drawdown": ["programWorkspaces", "id", payload.programId],
    "program.update-qbr": ["programWorkspaces", "id", payload.programId],
    "agent-category update": ["categories", "categoryId", payload.categoryId],
    "agent-category archive": ["categories", "categoryId", payload.categoryId],
    "agent-category restore": ["categories", "categoryId", payload.categoryId],
    "agent-passport update": ["agentPassports", "id", payload.agentId],
    "agent-passport suspend": ["agentPassports", "id", payload.agentId],
    "agent-listing publish": ["listings", "listingId", payload.listingId],
    "agent-listing update": ["listings", "listingId", payload.listingId],
    "agent-listing archive": ["listings", "listingId", payload.listingId],
    "rfp.publish": ["rfps", "id", payload.rfpId],
    "rfp.cancel": ["rfps", "id", payload.rfpId],
    "proposal.submit": ["rfps", "id", payload.rfpId],
    "proposal.accept": ["proposals", "id", payload.proposalId],
    "proposal.withdraw": ["proposals", "id", payload.proposalId],
    "escrow.fund": ["orders", "id", payload.orderId],
    "escrow.release": ["orders", "id", payload.orderId],
    "escrow.partial-release": ["orders", "id", payload.orderId],
    "escrow.refund": ["orders", "id", payload.orderId],
    "permission.approve": ["grants", "id", payload.grantId],
    "permission.deny": ["grants", "id", payload.grantId],
    "permission.revoke": ["grants", "id", payload.grantId],
    "run.start": ["orders", "id", payload.orderId],
    "run.cancel": ["runs", "id", payload.runId],
    "delivery.submit": ["orders", "id", payload.orderId],
    "delivery.qa_pass": ["deliveries", "id", payload.deliveryPackageId],
    "delivery.qa_reject": ["deliveries", "id", payload.deliveryPackageId],
    "acceptance.accept": ["orders", "id", payload.orderId],
    "acceptance.request-revision": ["orders", "id", payload.orderId],
    "dispute.open": ["orders", "id", payload.orderId],
    "dispute.resolve": ["orders", "id", payload.orderId],
    "rating.submit": ["orders", "id", payload.orderId],
    "evidence.export": ["orders", "id", payload.orderId],
    "evidence.delete": ["evidenceRecords", "id", payload.evidenceId]
  }[commandName];

  if (!lookups) return null;
  const [collection, key, value] = lookups;
  return { aggregate: requireById(state[collection], key, value) };
}

function exportEvidence(state, envelope) {
  const order = requireById(state.orders, "id", envelope.payload.orderId);
  if (!order) return fail("VALIDATION_FAILED", "Unknown order");
  const visibleEvidence = envelope.payload.evidenceRefs
    .map((id) => state.evidenceRecords.find((record) => record.id === id))
    .filter(Boolean);
  if (visibleEvidence.length !== envelope.payload.evidenceRefs.length) {
    return fail("EVIDENCE_NOT_VISIBLE", "All requested evidence refs must be visible");
  }

  const exportId = nextId("export");
  const sections = buildEvidenceExportSections(state, order, visibleEvidence);
  const manifest = buildEvidenceExportManifest(exportId, order, envelope, sections);
  const snapshot = buildCliApiUiSnapshot(order);
  const dto = {
    exportId,
    tenantId: envelope.tenantId,
    orderId: order.id,
    evidenceCount: visibleEvidence.length,
    redactionMode: envelope.payload.redactionMode,
    exportReason: envelope.payload.exportReason,
    status: "ready",
    manifest,
    sections,
    snapshot,
    hash: stableHash({ manifest, sections, snapshot })
  };

  return ok(
    state,
    exportId,
    1,
    [
      { eventName: "EvidenceExportRequested", payload: { exportId, orderId: order.id, exportReason: envelope.payload.exportReason, redactionMode: envelope.payload.redactionMode } },
      { eventName: "EvidenceExported", payload: { exportId, orderId: order.id, evidenceCount: visibleEvidence.length, requiredSections: manifest.requiredSections } }
    ],
    dto
  );
}

function buildEvidenceExportSections(state, order, visibleEvidence) {
  const proposal = requireById(state.proposals, "id", order.proposalId);
  const rfp = requireById(state.rfps, "id", order.rfpId ?? proposal?.rfpId);
  const permissionGrants = state.grants.filter((grant) => grant.orderId === order.id);
  const executionRuns = state.runs.filter((run) => run.orderId === order.id);
  const deliveryPackages = state.deliveries.filter((delivery) => delivery.orderId === order.id);
  const reviews = state.reviews.filter((review) => review.orderId === order.id);
  const acceptanceReview = reviews.find((review) => ["accepted", "revision_requested", "disputed"].includes(review.reviewStatus)) ?? reviews.at(-1) ?? null;
  const reputationEvent = state.reputations.find((entry) => entry.sourceOrderId === order.id) ?? null;
  const financeLedger = {
    orderId: order.id,
    ledgerStatus: order.ledgerStatus,
    orderAmountMinor: order.amountMinor,
    releasedAmountMinor: order.releasedAmountMinor ?? (order.ledgerStatus === "released" ? order.amountMinor : 0),
    refundAmountMinor: order.refundAmountMinor ?? 0,
    paymentRef: order.paymentRef ?? "",
    financeEvidenceRefs: order.financeEvidenceRefs ?? [],
    invoiceStatus: order.invoiceStatus ?? "not_requested",
    reconciliationStatus: order.reconciliationStatus ?? "not_ready",
    contractingEntity: order.contractingEntity ?? "",
    collectionEntity: order.collectionEntity ?? "",
    invoiceIssuer: order.invoiceIssuer ?? "",
    refundRemitter: order.refundRemitter ?? ""
  };

  return {
    rfp: rfp ? toRfpDto(rfp) : null,
    proposal: proposal ? toProposalDto(proposal) : null,
    terms: {
      orderId: order.id,
      termsSnapshot: order.termsSnapshot ?? "",
      includedScope: order.includedScope ?? proposal?.includedScope ?? []
    },
    permissionGrants: permissionGrants.map(toGrantDto),
    executionRuns: executionRuns.map(toRunDto),
    deliveryPackages: deliveryPackages.map(toDeliveryDto),
    topics: buildRuntimeTopics(order, deliveryPackages, visibleEvidence),
    evidenceIndex: visibleEvidence.map((record) => ({
      evidenceId: record.id,
      orderId: order.id,
      sourceType: record.sourceType ?? "runtime_ref",
      redactionStatus: record.redactionStatus ?? "visible",
      visibility: record.visibility ?? "buyer_safe",
      hash: record.hash ?? stableHash(record)
    })),
    qaChecklist: {
      orderId: order.id,
      qaSummary: order.qaSummary ?? "pending",
      evidenceCompleteness: order.evidenceCompleteness ?? 0
    },
    acceptanceReview,
    financeLedger,
    reputationEvent,
    roiRetrospective: {
      orderId: order.id,
      cycleTimeSavedHours: "runtime",
      usableResultRate: "runtime",
      acceptanceScore: acceptanceReview?.totalScore ?? 0,
      repurchaseSignal: reputationEvent ? "runtime_reputation_published" : "pending_reputation"
    },
    eventSequence: state.eventLog.filter((event) => event.payload?.orderId === order.id || event.payload?.proposalId === order.proposalId || event.payload?.rfpId === order.rfpId),
    cliApiUiSnapshots: buildCliApiUiSnapshot(order)
  };
}

function buildEvidenceExportManifest(exportId, order, envelope, sections) {
  return {
    exportId,
    orderId: order.id,
    redactionMode: envelope.payload.redactionMode,
    exportReason: envelope.payload.exportReason,
    requiredSections: requiredEvidenceExportSections(),
    sectionStatuses: Object.fromEntries(requiredEvidenceExportSections().map((section) => [section, sectionHasEvidence(sections[section]) ? "present" : "missing"]))
  };
}

function requiredEvidenceExportSections() {
  return [
    "rfp",
    "proposal",
    "terms",
    "permissionGrants",
    "executionRuns",
    "deliveryPackages",
    "topics",
    "evidenceIndex",
    "qaChecklist",
    "acceptanceReview",
    "financeLedger",
    "reputationEvent",
    "roiRetrospective",
    "eventSequence",
    "cliApiUiSnapshots"
  ];
}

function sectionHasEvidence(value) {
  if (Array.isArray(value)) return value.length > 0;
  return value != null;
}

function buildRuntimeTopics(order, deliveryPackages, visibleEvidence) {
  return deliveryPackages.flatMap((delivery) =>
    (delivery.criteriaMapping ?? []).map((criterion, index) => ({
      topicId: `runtime_topic_${index + 1}`,
      orderId: order.id,
      criterion,
      evidenceRefs: visibleEvidence.map((record) => record.id)
    }))
  );
}

function buildCliApiUiSnapshot(order) {
  const orderDto = toOrderDto(order);
  return {
    ui: { orderDto },
    cli: { orderDto },
    api: { orderDto }
  };
}

function deleteEvidence(state, envelope) {
  const evidence = requireById(state.evidenceRecords, "id", envelope.payload.evidenceId);
  if (!evidence) return fail("VALIDATION_FAILED", "Unknown evidence");
  evidence.redactionStatus = "restricted";
  return ok(state, envelope.payload.evidenceId, 1, [{ eventName: "EvidenceDeleted", payload: { requestId: nextId("delete"), evidenceId: envelope.payload.evidenceId, retentionOverride: envelope.payload.retentionOverride } }], {
    requestId: nextId("delete"),
    tenantId: envelope.tenantId,
    evidenceId: envelope.payload.evidenceId,
    status: "deleted",
    retentionOverride: envelope.payload.retentionOverride
  });
}

function toRfpDto(rfp) {
  return {
    id: rfp.id,
    tenantId: rfp.tenantId,
    rfpStatus: rfp.rfpStatus,
    packageTier: rfp.packageTier,
    category: rfp.category,
    market: rfp.market,
    budgetAmountMinor: rfp.budgetAmountMinor,
    currency: rfp.currency,
    version: rfp.version
  };
}

function toProposalDto(proposal) {
  return {
    id: proposal.id,
    tenantId: proposal.tenantId,
    proposalStatus: proposal.proposalStatus,
    rfpId: proposal.rfpId,
    sellerId: proposal.sellerId,
    agentId: proposal.agentId,
    priceAmountMinor: proposal.priceAmountMinor,
    currency: proposal.currency,
    version: proposal.version
  };
}

function toOrderDto(order) {
  return {
    id: order.id,
    tenantId: order.tenantId,
    rfpId: order.rfpId,
    proposalId: order.proposalId,
    buyerOrgId: order.buyerOrgId,
    sellerId: order.sellerId,
    agentId: order.agentId,
    orderStatus: order.orderStatus,
    ledgerStatus: order.ledgerStatus,
    acceptanceStatus: order.acceptanceStatus,
    amountMinor: order.amountMinor,
    currency: order.currency,
    contractingEntity: order.contractingEntity ?? "",
    collectionEntity: order.collectionEntity ?? "",
    invoiceIssuer: order.invoiceIssuer ?? "",
    refundRemitter: order.refundRemitter ?? "",
    financeContactUserId: order.financeContactUserId ?? "",
    authorizedPayerId: order.authorizedPayerId ?? "",
    paymentRef: order.paymentRef ?? "",
    paymentStatus: order.paymentStatus ?? "not_confirmed",
    invoiceStatus: order.invoiceStatus ?? "not_requested",
    reconciliationStatus: order.reconciliationStatus ?? "not_ready",
    releasedAmountMinor: order.releasedAmountMinor ?? 0,
    refundAmountMinor: order.refundAmountMinor ?? 0,
    financeEvidenceRefs: order.financeEvidenceRefs ?? [],
    nextAction: deriveNextAction(order),
    evidenceCompleteness: order.evidenceCompleteness ?? 0,
    qaSummary: order.qaSummary ?? "pending",
    categorySnapshot: order.categorySnapshot ?? null,
    cliPreview: `alphaagents ${deriveCliPreview(order)}`,
    version: order.version
  };
}

function toGrantDto(grant) {
  return {
    id: grant.id,
    tenantId: grant.tenantId,
    orderId: grant.orderId,
    agentId: grant.agentId,
    grantStatus: grant.grantStatus,
    toolAllowlist: grant.toolAllowlist,
    expiresAt: grant.expiresAt,
    version: grant.version
  };
}

function toRunDto(run) {
  return {
    id: run.id,
    tenantId: run.tenantId,
    runStatus: run.runStatus,
    orderId: run.orderId,
    agentId: run.agentId,
    permissionGrantIds: run.permissionGrantIds,
    failureReason: run.failureReason,
    version: run.version
  };
}

function toDeliveryDto(delivery) {
  return {
    id: delivery.id,
    tenantId: delivery.tenantId,
    deliveryStatus: delivery.deliveryStatus,
    orderId: delivery.orderId,
    artifactRefs: delivery.artifactRefs,
    evidenceRefs: delivery.evidenceRefs,
    criteriaMapping: delivery.criteriaMapping,
    version: delivery.version
  };
}

function deriveNextAction(order) {
  const mapping = {
    created: { actorRole: "buyer", command: "alphaagents escrow fund", reason: "proposal accepted and waiting for payment" },
    funded: { actorRole: "operator", command: "alphaagents permission approve", reason: "payment confirmed and permission review needed" },
    in_progress: { actorRole: "seller", command: "alphaagents delivery submit", reason: "run in progress and delivery is next" },
    delivery_submitted: { actorRole: "operator", command: "alphaagents delivery qa-pass", reason: "delivery needs QA" },
    ready_for_acceptance: { actorRole: "buyer", command: "alphaagents acceptance accept", reason: "QA passed and buyer decision is needed" },
    accepted: { actorRole: "operator", command: "alphaagents escrow release", reason: "buyer accepted and finance release is next" },
    released: { actorRole: "buyer", command: "alphaagents rating submit", reason: "release complete and rating is available" },
    disputed: { actorRole: "operator", command: "alphaagents dispute resolve", reason: "dispute is open and needs decision" },
    resolved: { actorRole: "operator", command: "alphaagents escrow partial-release", reason: "resolved dispute needs finance outcome" },
    partially_released: { actorRole: "buyer", command: "alphaagents rating submit", reason: "partial release complete and rating is available" },
    refunded: { actorRole: "buyer", command: "alphaagents evidence export", reason: "refund complete and evidence can be exported" }
  };
  return mapping[order.orderStatus] ?? { actorRole: "buyer", command: "alphaagents rfp create", reason: "start a new order" };
}

function deriveCliPreview(order) {
  return deriveNextAction(order).command.replace("alphaagents ", "") + " --json";
}

function resolveAggregateTenant(commandName, payload, state) {
  const lookups = {
    "buyer-org.setup": ["buyers", "id", payload.buyerOrgId],
    "custom-project.confirm-milestone": ["customProjects", "id", payload.projectId],
    "custom-project.submit-uat": ["customProjects", "id", payload.projectId],
    "custom-project.create-change-order": ["customProjects", "id", payload.projectId],
    "agent-app.record-usage": ["appInstalls", "id", payload.installId],
    "agent-app.exit": ["appInstalls", "id", payload.installId],
    "program.allocate-credit": ["programWorkspaces", "id", payload.programId],
    "program.record-drawdown": ["programWorkspaces", "id", payload.programId],
    "program.update-qbr": ["programWorkspaces", "id", payload.programId],
    "rfp.publish": ["rfps", "id", payload.rfpId],
    "rfp.cancel": ["rfps", "id", payload.rfpId],
    "proposal.accept": ["proposals", "id", payload.proposalId],
    "proposal.withdraw": ["proposals", "id", payload.proposalId],
    "escrow.fund": ["orders", "id", payload.orderId],
    "escrow.release": ["orders", "id", payload.orderId],
    "escrow.partial-release": ["orders", "id", payload.orderId],
    "escrow.refund": ["orders", "id", payload.orderId],
    "permission.approve": ["grants", "id", payload.grantId],
    "permission.deny": ["grants", "id", payload.grantId],
    "permission.revoke": ["grants", "id", payload.grantId],
    "run.start": ["orders", "id", payload.orderId],
    "run.cancel": ["runs", "id", payload.runId],
    "delivery.submit": ["orders", "id", payload.orderId],
    "delivery.qa_pass": ["deliveries", "id", payload.deliveryPackageId],
    "delivery.qa_reject": ["deliveries", "id", payload.deliveryPackageId],
    "acceptance.accept": ["orders", "id", payload.orderId],
    "acceptance.request-revision": ["orders", "id", payload.orderId],
    "dispute.open": ["orders", "id", payload.orderId],
    "dispute.resolve": ["orders", "id", payload.orderId],
    "rating.submit": ["orders", "id", payload.orderId],
    "evidence.delete": ["evidenceRecords", "id", payload.evidenceId]
  }[commandName];

  if (!lookups) return null;

  const [collection, key, value] = lookups;
  const item = requireById(state[collection], key, value);
  return item?.tenantId ?? item?.buyerOrgId ?? item?.id ?? null;
}

function recordFailureAudit(state, commandName, envelope, errorCode) {
  const eventName = contract.security.auditEventByErrorCode?.[errorCode] ?? "CommandValidationFailed";
  state.eventLog.push({
    id: nextId("event"),
    eventName,
    tenantId: envelope.tenantId,
    actorId: envelope.actorId,
    commandName,
    recordedAt: new Date().toISOString()
  });
}

function ok(state, aggregateId, newVersion, events, dto) {
  const stampedEvents = events.map((event) => ({
    id: nextId("event"),
    ...event,
    recordedAt: new Date().toISOString()
  }));
  state.eventLog.push(...stampedEvents);
  return {
    ok: true,
    aggregateId,
    newVersion,
    events: stampedEvents.map(({ id, recordedAt, ...rest }) => rest),
    dto
  };
}

function fail(errorCode, message) {
  return {
    ok: false,
    errorCode,
    message
  };
}

function requireById(collection, key, value) {
  return collection.find((entry) => entry[key] === value);
}

function nextId(prefix) {
  return `${prefix}_${crypto.randomUUID().slice(0, 12)}`;
}

function stableHash(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}
