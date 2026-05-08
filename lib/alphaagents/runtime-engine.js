import crypto from "node:crypto";

import { loadRuntimeState, saveRuntimeState, contract } from "./runtime-state.js";

const customCommandSpecs = {
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
    payloadRequired: ["listingId", "agentId", "categoryIds", "priceAmountMinor"],
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

  return null;
}

function dispatchCommand(commandName, envelope, state) {
  switch (commandName) {
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
    auditEvents: []
  };
  state.categories.push(category);
  return ok(state, category.categoryId, 1, [{ eventName: "AgentCategoryCreated", payload: { categoryId: category.categoryId } }], category);
}

function updateCategory(state, envelope) {
  const category = requireById(state.categories, "categoryId", envelope.payload.categoryId);
  if (!category) return fail("VALIDATION_FAILED", "Unknown category");
  category.version += 1;
  Object.assign(category, envelope.payload.patch);
  return ok(state, category.categoryId, category.version, [{ eventName: "AgentCategoryUpdated", payload: { categoryId: category.categoryId } }], category);
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
  const hasArchivedCategory = envelope.payload.categoryIds.some((categoryId) => {
    const category = requireById(state.categories, "categoryId", categoryId);
    return !category || category.categoryStatus !== "sellable";
  });
  if (hasArchivedCategory) {
    return fail("STATE_CONFLICT", "Listing category is not sellable");
  }

  const listing = requireById(state.listings, "listingId", envelope.payload.listingId);
  if (listing) {
    listing.version += 1;
    listing.listingStatus = "published";
    listing.categoryIds = envelope.payload.categoryIds;
    listing.startingPriceMinor = envelope.payload.priceAmountMinor;
    return ok(state, listing.listingId, listing.version, [{ eventName: "AgentListingPublished", payload: { listingId: listing.listingId } }], listing);
  }

  const created = {
    listingId: envelope.payload.listingId,
    agentId: envelope.payload.agentId,
    slug: envelope.payload.listingId,
    title: envelope.payload.listingId,
    supplyType: "custom_agent",
    categoryIds: envelope.payload.categoryIds,
    billingMode: "per_order",
    startingPriceMinor: envelope.payload.priceAmountMinor,
    currency: "CNY",
    deliveryHours: 48,
    qaPassRate: 0,
    disputeRate: 0,
    proofStatus: "sample_only",
    capacityAvailable: 0,
    riskLevel: "medium_high",
    buyerScale: "team",
    sellerLegalEntity: envelope.payload.agentId,
    humanOwner: envelope.payload.agentId,
    acceptanceTemplateId: "acceptance_template_trial_v1",
    permissionTemplateId: "perm_social_readonly_v1",
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
  if (rfp.version !== envelope.expectedVersion) return fail("VERSION_CONFLICT", "RFP version conflict");
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
  const categoryBlocked = rfp.category && state.categories.some((category) => category.name?.["zh-CN"] === rfp.category && category.categoryStatus === "archived");
  if (categoryBlocked) {
    return fail("STATE_CONFLICT", "RFP category is archived");
  }
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
  proposal.proposalStatus = "selected";
  proposal.version += 1;
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
    termsSnapshot: envelope.payload.termsSnapshot,
    evidenceCompleteness: 0,
    qaSummary: "waiting for payment",
    version: 1
  };
  state.orders.push(order);
  const rfp = requireById(state.rfps, "id", proposal.rfpId);
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
  order.version += 1;
  order.orderStatus = "funded";
  order.ledgerStatus = "escrowed";
  order.acceptanceStatus = "qa_pending";
  order.paymentRef = envelope.payload.paymentRef;

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
      { eventName: "EscrowFunded", payload: { orderId: order.id, orderStatus: order.orderStatus, ledgerStatus: order.ledgerStatus, paymentRef: order.paymentRef } },
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
  return ok(state, order.id, order.version, [{ eventName: "DisputeResolved", payload: { orderId: order.id, orderStatus: order.orderStatus, releaseAmountMinor: order.releaseAmountMinor, refundAmountMinor: order.refundAmountMinor, decision: order.disputeDecision } }], toOrderDto(order));
}

function releaseEscrow(state, envelope) {
  const order = requireById(state.orders, "id", envelope.payload.orderId);
  if (!order || order.acceptanceStatus !== "accepted") {
    return fail("STATE_CONFLICT", "Order is not accepted");
  }
  order.version += 1;
  order.orderStatus = "released";
  order.ledgerStatus = "released";
  return ok(state, order.id, order.version, [{ eventName: "EscrowReleased", payload: { orderId: order.id, orderStatus: order.orderStatus, ledgerStatus: order.ledgerStatus, releasedAmountMinor: order.amountMinor } }], toOrderDto(order));
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
  return ok(state, order.id, order.version, [{ eventName: "EscrowPartiallyReleased", payload: { orderId: order.id, orderStatus: order.orderStatus, ledgerStatus: order.ledgerStatus, releasedAmountMinor: order.releaseAmountMinor, refundAmountMinor: order.refundAmountMinor, decisionRef: envelope.payload.decisionRef } }], toOrderDto(order));
}

function refundEscrow(state, envelope) {
  const order = requireById(state.orders, "id", envelope.payload.orderId);
  if (!order) return fail("VALIDATION_FAILED", "Unknown order");
  order.version += 1;
  order.ledgerStatus = "refunded";
  order.orderStatus = "refunded";
  order.refundAmountMinor = envelope.payload.refundAmountMinor;
  return ok(state, order.id, order.version, [{ eventName: "EscrowRefunded", payload: { orderId: order.id, orderStatus: order.orderStatus, ledgerStatus: order.ledgerStatus, refundAmountMinor: order.refundAmountMinor, refundReason: envelope.payload.refundReason } }], toOrderDto(order));
}

function submitRating(state, envelope) {
  const order = requireById(state.orders, "id", envelope.payload.orderId);
  if (!order || !["released", "partially_released", "refunded"].includes(order.orderStatus)) {
    return fail("ORDER_NOT_COMPLETED", "Order must be financially closed before rating");
  }
  const reputation = {
    id: nextId("rep"),
    tenantId: envelope.tenantId,
    eventStatus: "published",
    subjectType: envelope.payload.subjectType,
    subjectId: envelope.payload.subjectId,
    sourceOrderId: order.id,
    deliveryOutcome: envelope.payload.deliveryOutcome,
    version: 1
  };
  state.reputations.push(reputation);
  const agent = requireById(state.agentPassports, "id", envelope.payload.subjectId);
  if (agent) {
    agent.orderHistory.completed += 1;
  }
  return ok(state, reputation.id, reputation.version, [{ eventName: "ReputationPublished", payload: { reputationEventId: reputation.id, eventStatus: reputation.eventStatus } }], reputation);
}

function exportEvidence(state, envelope) {
  const visibleCount = envelope.payload.evidenceRefs.filter((id) => state.evidenceRecords.some((record) => record.id === id)).length;
  return ok(
    state,
    nextId("export"),
    1,
    [{ eventName: "EvidenceExported", payload: { exportId: nextId("export"), orderId: envelope.payload.orderId, evidenceCount: visibleCount } }],
    {
      exportId: nextId("export"),
      tenantId: envelope.tenantId,
      orderId: envelope.payload.orderId,
      evidenceCount: visibleCount,
      redactionMode: envelope.payload.redactionMode,
      status: "ready",
      hash: stableHash(envelope.payload.evidenceRefs)
    }
  );
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
    nextAction: deriveNextAction(order),
    evidenceCompleteness: order.evidenceCompleteness ?? 0,
    qaSummary: order.qaSummary ?? "pending",
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
  return item?.tenantId ?? null;
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

