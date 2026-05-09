import {
  getAgentAppBySlug,
  getAgentApps,
  getAgentListings,
  getAgentPassportBySlug,
  getAgentPassports,
  getCategoryRegistry,
  getFeaturedListings,
  getListingsByAgentId,
  getMarketFilters
} from "./catalog.js";
import { categoryUnitEconomics, contract, orderFixtures, programWorkspaces, sampleOrders, sellerProfiles } from "./data.js";
import { loadEvidencePackageSummaries, runQuery } from "./queries.js";
import {
  getAppRuntimeState,
  getBuyerProfiles,
  getRuntimeCustomProjects,
  getRuntimePrograms,
  getRuntimeSnapshot,
  listRuntimeListings,
  listRuntimeOrders,
  listRuntimeRfps
} from "./runtime-queries.js";

const navItems = [
  { href: "/", label: "Public Showcase" },
  { href: "/catalog", label: "Agent Catalog" },
  { href: "/agents", label: "Agents" },
  { href: "/agent-apps", label: "Agent Apps" },
  { href: "/custom-agent", label: "Custom Agent" },
  { href: "/buyer-org-setup", label: "Buyer Org Setup" },
  { href: "/quick-order", label: "Quick Order / RFP" },
  { href: "/rfps", label: "RFPs" },
  { href: "/workbench", label: "Workbench" },
  { href: "/provider-proof", label: "Provider Proof Directory" },
  { href: "/orders", label: "Orders" },
  { href: "/projects", label: "Projects" },
  { href: "/evidence-room", label: "Evidence Room" },
  { href: "/reputation", label: "Reputation" },
  { href: "/program-ops", label: "Program Ops" },
  { href: "/catalog-admin", label: "Catalog Admin" },
  { href: "/risk-finance", label: "Risk / Finance" }
];

export function getShellModel() {
  return {
    title: "AlphaAgents",
    strapline: "Agent as a Service procurement-grade operating network",
    buyerLanguage: "conditional release workflow",
    navItems,
    trialListing: getFeaturedListings()[0],
    orderCounts: {
      active: orderFixtures.orders.filter((order) => !["closed", "refunded"].includes(order.orderStatus)).length,
      reviewReady: orderFixtures.orders.filter((order) => order.orderStatus === "ready_for_acceptance").length,
      disputed: orderFixtures.orders.filter((order) => order.orderStatus === "disputed").length
    }
  };
}

export function getShowcaseModel() {
  const trialListing = getFeaturedListings()[0];
  return {
    shell: getShellModel(),
    aaasComparison: [
      {
        label: "Who actually does the work",
        saas: "Buyer team operates the software",
        aaas: "Agent, Agent App, Squad, or service-backed owner executes the result"
      },
      {
        label: "What the buyer accepts",
        saas: "Seat, workflow, and access",
        aaas: "DeliveryPackage, ExecutionRun, EvidenceRef, QA, and AcceptanceReview"
      },
      {
        label: "What proves completion",
        saas: "Activity logs and exports",
        aaas: "Machine-readable run, evidence, finance, and reputation events"
      },
      {
        label: "Who is accountable",
        saas: "Buyer team and vendor support",
        aaas: "Agent owner, seller, finance controls, dispute rules, and platform policy"
      }
    ],
    heroBullets: [
      "Default first purchase stays Trial-first",
      "US TikTok Shop beauty and personal-care is the first commercial ICP",
      "Agent Apps stay inside identity, evidence, acceptance, and reputation rules",
      "CLI mismatch blocks CTA when state parity breaks"
    ],
    trialListing,
    samplePackages: loadEvidencePackageSummaries()
  };
}

export function getCatalogModel() {
  const featuredActions = [
    {
      label: "Trial Quick Order",
      path: "/quick-order",
      contractMode: "per_order",
      supportType: "standard_agent"
    },
    {
      label: "Install Agent App",
      path: "/agent-apps/harbor-growth-workbench-app",
      contractMode: "subscription + usage",
      supportType: "agent_app"
    },
    {
      label: "Program Credits",
      path: "/program-ops",
      contractMode: "order_credit",
      supportType: "squad"
    },
    {
      label: "Request Custom Agent",
      path: "/custom-agent",
      contractMode: "milestone + UAT",
      supportType: "custom_agent"
    }
  ];
  return {
    shell: getShellModel(),
    categories: getCategoryRegistry(),
    categoryUnitEconomics: getCategoryUnitEconomicsRows(),
    filters: getMarketFilters(),
    listings: getAgentListings(),
    runtimeListings: listRuntimeListings(),
    featuredActions
  };
}

export function getBuyerOrgSetupModel(options = {}) {
  const buyer = getBuyerProfiles(options)[0];
  return {
    shell: getShellModel(),
    buyer,
    fields: [
      "buyer org name",
      "requester",
      "acceptance owner",
      "finance contact",
      "legal contact",
      "authorized payer",
      "signer",
      "invoice requirement",
      "scope acknowledgement",
      "contracting entity",
      "collection entity",
      "invoice issuer",
      "refund remitter",
      "subprocessors"
    ],
    readiness: [
      { label: "Authority chain", status: buyer?.signerIds?.length ? "Pass" : "Blocked" },
      { label: "Invoice readiness", status: buyer?.invoiceReadiness ?? "missing" },
      { label: "Scope acknowledgement", status: buyer?.scopeAcknowledgement ?? "missing" },
      { label: "Contracting entity", status: buyer?.contractingEntity ? "Pass" : "Blocked" },
      { label: "Collection entity", status: buyer?.collectionEntity ? "Pass" : "Blocked" },
      { label: "Invoice issuer", status: buyer?.invoiceIssuer ? "Pass" : "Blocked" },
      { label: "Refund remitter", status: buyer?.refundRemitter ? "Pass" : "Blocked" },
      { label: "Legal contact", status: buyer?.legalContactUserId ? "Pass" : "Blocked" },
      { label: "Subprocessors", status: buyer?.subprocessors?.length ? "Pass" : "Blocked" }
    ]
  };
}

export function getQuickOrderModel(options = {}) {
  const runtimeRfps = listRuntimeRfps(options);
  const buyer = getBuyerProfiles(options)[0];
  const buyerReady = Boolean(
    buyer?.requesterUserId &&
      buyer?.acceptanceOwnerUserId &&
      buyer?.financeContactUserId &&
      buyer?.legalContactUserId &&
      buyer?.authorizedPayerId &&
      buyer?.signerIds?.length &&
      buyer?.invoiceReadiness === "ready" &&
      buyer?.scopeAcknowledgement === "accepted" &&
      buyer?.contractingEntity &&
      buyer?.collectionEntity &&
      buyer?.invoiceIssuer &&
      buyer?.refundRemitter &&
      buyer?.subprocessors?.length
  );
  return {
    shell: getShellModel(),
    defaultPackage: contract.defaultFirstPurchase,
    prohibitedSources: trialRfpLike().prohibitedSources,
    steps: [
      "Lock package and SLA",
      "Capture category, market, and five competitors",
      "Assign acceptance owner and payer",
      "Freeze terms before payment",
      "Publish RFP or guided Quick Order"
    ],
    commandPreview: "alphaagents rfp publish --json",
    runtimeRfps,
    buyerReady
  };
}

export function getWorkbenchModel(options = {}) {
  const runtimeSnapshot = getRuntimeSnapshot(options);
  const runtimeActiveOrders = runtimeSnapshot.orders
    .filter((order) => !["closed", "refunded"].includes(order.orderStatus))
    .map((order) => ({
      orderId: order.id,
      orderStatus: order.orderStatus,
      amountMinor: order.amountMinor ?? 0,
      nextAction: order.nextAction?.command ?? order.acceptanceStatus,
      badge: order.ledgerStatus
    }));
  const actionQueue = runtimeSnapshot.orders.slice(-4).map((order) => ({
    objectId: order.id,
    orderStatus: order.orderStatus,
    acceptanceStatus: order.acceptanceStatus,
    nextAction: order.nextAction?.command ?? "alphaagents rfp create"
  }));
  const appRuns = runtimeSnapshot.appUsageRuns.slice(-3).map((run) => ({
    id: run.id,
    appId: run.appId,
    usageStatus: run.usageStatus
  }));

  return {
    shell: getShellModel(),
    categories: getCategoryRegistry().slice(0, 4),
    activeOrders: runtimeActiveOrders.length > 0 ? runtimeActiveOrders : orderFixtures.orders.slice(0, 8),
    actionQueue,
    appRuns,
    trustRail: [
      "No execution before payment",
      "QA before acceptance",
      "Dispute freezes funds"
    ],
    kpis: [
      { label: "Escrowed / Locked", value: "¥27,840" },
      { label: "Need buyer action", value: "3" },
      { label: "Review-ready within", value: "48h" },
      { label: "Buyer checks", value: "3 fixed" }
    ]
  };
}

export function getProviderProofModel() {
  return {
    shell: getShellModel(),
    primaryAgent: getAgentPassportBySlug("mira-competitor-intel-agent"),
    secondaryAgent: getAgentPassportBySlug("signal-claim-review-agent"),
    app: getAgentAppBySlug("harbor-growth-workbench-app"),
    sellers: sellerProfiles.map((seller) => ({
      ...seller,
      gate: seller.admissionScore >= 80 && seller.admissionStatus === "approved" ? "Can receive proposals" : "Blocked below 80"
    }))
  };
}

export function getOrderWorkspaceModel(options = {}) {
  const runtimeOrders = listRuntimeOrders(options);
  return {
    shell: getShellModel(),
    packages: sampleOrders,
    runtimeOrders,
    timeline: [
      "Escrow funded",
      "Permission approved",
      "Run succeeded",
      "Delivery QA passed",
      "Buyer accepts / requests revision / opens dispute"
    ]
  };
}

export function getEvidenceRoomModel() {
  return {
    shell: getShellModel(),
    packages: sampleOrders.map((entry) => ({
      packageId: entry.packageId,
      orderId: entry.snapshot.ui.orderDto.id,
      ledgerStatus: entry.ledger.ledgerStatus,
      evidenceStatus: entry.ledger.evidenceStatus
    })),
    exportModes: ["buyer-safe bundle", "procurement packet", "support packet"]
  };
}

export function getReputationModel() {
  const primaryAgent = getAgentPassportBySlug("mira-competitor-intel-agent");
  const reputationSummary = primaryAgent ? runQuery("reputation.show", { subjectId: primaryAgent.id }) : null;
  return {
    shell: getShellModel(),
    primaryAgent,
    reputationSummary: reputationSummary
      ? {
          averageRating: reputationSummary.averageRating,
          reviewCount: reputationSummary.reviewCount,
          disputeRate: reputationSummary.disputeRate
        }
      : null,
    provenanceRows: sampleOrders.map((entry) => ({
      reputationEventId: entry.reputation.id,
      sourceOrderId: entry.reputation.sourceOrderId,
      subjectType: entry.reputation.subjectType,
      subjectId: entry.reputation.subjectId,
      agentVersion: entry.reputation.agentVersion,
      categories: (entry.reputation.categoryLabels ?? entry.reputation.categoryIds ?? []).join(", "),
      deliveryOutcome: entry.reputation.deliveryOutcome,
      eventStatus: entry.reputation.eventStatus
    })),
    summaries: [
      { outcome: "Accepted", proof: "sample_only + sandbox_verified", note: "Strong evidence traceability" },
      { outcome: "Partially released", proof: "sample_only + sandbox_verified", note: "Actionability gap surfaced" },
      { outcome: "Refunded", proof: "sample_only + sandbox_verified", note: "Negative outcome remains visible" }
    ]
  };
}

export function getProgramOpsModel(options = {}) {
  const runtimePrograms = getRuntimePrograms(options);
  const runtimeProgram = runtimePrograms[0] ?? programWorkspaces[0];
  const runtimeEvents = getRuntimeSnapshot(options).events.filter((event) =>
    ["ProgramCreditAllocated", "ProgramCreditDrawdownRecorded", "ProgramQbrUpdated"].includes(event.eventName)
  );

  return {
    shell: getShellModel(),
    program: runtimeProgram,
    blockers: runtimeProgram.renewalBlockers,
    queues: [
      { queue: "Weekly backlog", status: "active", owner: "Ops Lead" },
      { queue: "QBR package", status: "in progress", owner: "Buyer success" }
    ],
    programEvents: runtimeEvents
  };
}

export function getAgentAppsIndexModel(options = {}) {
  const runtimeState = getAppRuntimeState(options);
  return {
    shell: getShellModel(),
    apps: getAgentListings().filter((listing) => listing.supplyType === "agent_app"),
    runtimeInstalls: runtimeState.appInstalls,
    runtimeUsageRuns: runtimeState.appUsageRuns
  };
}

export function getAgentsIndexModel() {
  const categories = new Map(getCategoryRegistry().map((category) => [category.categoryId, category]));
  const listingsByAgent = new Map();
  for (const listing of getAgentListings()) {
    const existing = listingsByAgent.get(listing.agentId) ?? [];
    existing.push(listing);
    listingsByAgent.set(listing.agentId, existing);
  }

  return {
    shell: getShellModel(),
    agents: getAgentPassports().map((agent) => ({
      ...agent,
      categoryLabels: agent.categoryIds.map((categoryId) => categories.get(categoryId)?.name?.["zh-CN"] ?? categoryId),
      listingCount: listingsByAgent.get(agent.id)?.length ?? 0,
      purchaseModes: Array.from(new Set((listingsByAgent.get(agent.id) ?? []).map((listing) => listing.billingMode)))
    })),
    apps: getAgentApps(),
    commandPreview: "alphaagents agent-passport show --json\nalphaagents agent-listing search --json"
  };
}

export function getRfpsModel(options = {}) {
  const runtimeSnapshot = getRuntimeSnapshot(options);
  return {
    shell: getShellModel(),
    runtimeRfps: runtimeSnapshot.rfps,
    runtimeProposals: runtimeSnapshot.proposals,
    sampleRfps: sampleOrders.map((entry) => ({
      packageId: entry.packageId,
      rfpId: entry.rfp.id,
      rfpStatus: entry.rfp.rfpStatus,
      category: entry.rfp.category,
      proposalId: entry.proposal.id,
      proposalStatus: entry.proposal.proposalStatus
    })),
    commandPreview: "alphaagents rfp create --json\nalphaagents rfp publish --json\nalphaagents proposal submit --json\nalphaagents proposal accept --json"
  };
}

export function getOrdersIndexModel(options = {}) {
  const runtimeSnapshot = getRuntimeSnapshot(options);
  return {
    shell: getShellModel(),
    runtimeOrders: runtimeSnapshot.orders,
    runtimeGrants: runtimeSnapshot.grants,
    runtimeRuns: runtimeSnapshot.runs,
    runtimeDeliveries: runtimeSnapshot.deliveries,
    runtimeReviews: runtimeSnapshot.reviews,
    sampleOrders: sampleOrders.map((entry) => ({
      packageId: entry.packageId,
      orderId: entry.snapshot.ui.orderDto.id,
      orderStatus: entry.snapshot.ui.orderDto.orderStatus,
      ledgerStatus: entry.ledger.ledgerStatus,
      acceptanceStatus: entry.snapshot.ui.orderDto.acceptanceStatus,
      financeStatus: entry.ledger.financeStatus ?? entry.ledger.ledgerStatus,
      reputationEventId: entry.reputation.id
    })),
    commandPreview: "alphaagents escrow fund --json\nalphaagents run start --json\nalphaagents delivery submit --json\nalphaagents acceptance accept --json\nalphaagents dispute open --json\nalphaagents rating submit --json"
  };
}

export function getProjectsIndexModel(options = {}) {
  const runtimeProjects = getRuntimeCustomProjects(options);
  const runtimePrograms = getRuntimePrograms(options);
  return {
    shell: getShellModel(),
    runtimeProjects,
    runtimePrograms,
    customIntake: getCustomAgentModel(options).intakeChecklist,
    programQueues: getProgramOpsModel(options).queues,
    commandPreview: "alphaagents custom-project request --json\nalphaagents custom-project confirm-milestone --json\nalphaagents program allocate-credit --json\nalphaagents program update-qbr --json"
  };
}

export function getCustomAgentModel(options = {}) {
  const runtimeProjects = getRuntimeCustomProjects(options);
  const runtimeEvents = getRuntimeSnapshot(options).events.filter((event) =>
    [
      "CustomProjectRequested",
      "CustomProjectMilestoneConfirmed",
      "CustomProjectUatSubmitted",
      "CustomProjectChangeOrderCreated"
    ].includes(event.eventName)
  );
  return {
    shell: getShellModel(),
    runtimeProjects,
    runtimeEvents,
    intakeChecklist: [
      "需求冻结 owner",
      "里程碑与交付边界",
      "UAT 环节与证据要求",
      "变更单与影响说明",
      "私有部署与权限边界"
    ]
  };
}

export function getCatalogAdminModel() {
  return {
    shell: getShellModel(),
    categories: getCategoryRegistry(),
    agent: getAgentPassportBySlug("mira-competitor-intel-agent"),
    listings: getAgentListings()
  };
}

export function getRiskFinanceModel(options = {}) {
  const runtimeSnapshot = getRuntimeSnapshot(options);
  return {
    shell: getShellModel(),
    financeRules: contract.financeRules,
    security: contract.security,
    categoryUnitEconomics: getCategoryUnitEconomicsRows(),
    sellerAdmissions: runtimeSnapshot.sellers.map((seller) => ({
      id: seller.id,
      legalEntity: seller.legalEntity,
      admissionScore: seller.admissionScore,
      admissionStatus: seller.admissionStatus,
      gate: seller.admissionScore >= 80 && seller.approved ? "pass" : "blocked",
      payoutReadiness: seller.payoutReadiness,
      capacityAvailable: seller.capacityAvailable
    })),
    runtimeOrders: runtimeSnapshot.orders,
    runtimeGrants: runtimeSnapshot.grants,
    runtimeEvents: runtimeSnapshot.events.filter((event) =>
      [
        "EscrowFunded",
        "EscrowReleased",
        "EscrowPartiallyReleased",
        "EscrowRefunded",
        "PermissionApproved",
        "PermissionDenied",
        "PermissionRevoked",
        "DisputeResolved"
      ].includes(event.eventName)
    ),
    sampleOrders: sampleOrders.map((entry) => ({
      packageId: entry.packageId,
      orderId: entry.snapshot.ui.orderDto.id,
      paymentLanguage: entry.ledger.buyerFacingPaymentLanguage,
      ledgerStatus: entry.ledger.ledgerStatus,
      disclaimer: entry.ledger.licensedClearingDisclaimer
    }))
  };
}

function getCategoryUnitEconomicsRows() {
  const categories = new Map(getCategoryRegistry().map((category) => [category.categoryId, category]));
  return categoryUnitEconomics.map((entry) => ({
    ...entry,
    categoryLabel: categories.get(entry.categoryId)?.name?.["zh-CN"] ?? entry.categoryId,
    averageGmv: `¥${(entry.averageGmvMinor / 100).toLocaleString("en-US")}`,
    takeRate: `${entry.takeRateBps / 100}%`,
    providerPayout: `${entry.providerPayoutBps / 100}%`,
    qaOpsMinutes: `${entry.qaOpsMinutes}m`,
    cac: `¥${(entry.cacMinor / 100).toLocaleString("en-US")}`,
    disputeCost: `${entry.disputeCostBps / 100}%`,
    contributionMargin: `${entry.contributionMarginBps / 100}%`
  }));
}

export function getApiIndexModel() {
  return {
    endpoints: [
      "/api/catalog",
      "/api/workbench",
      "/api/orders",
      "/api/reputation",
      "/api/evidence",
      "/api/contract"
    ]
  };
}

function trialRfpLike() {
  return sampleOrders[0].rfp;
}

export function getAgentDetailModel(slug) {
  const agent = getAgentPassportBySlug(slug);
  if (!agent) return null;
  const listings = getListingsByAgentId(agent.id);
  return {
    shell: getShellModel(),
    agent,
    listings,
    sampleEvidence: sampleOrders[0],
    reputationEvents: sampleOrders
      .map((entry) => entry.reputation)
      .filter((event) => event.subjectType === "agent" && event.subjectId === agent.id)
      .map((event) => ({
        reputationEventId: event.id,
        sourceOrderId: event.sourceOrderId,
        agentVersion: event.agentVersion,
        categories: (event.categoryLabels ?? event.categoryIds ?? []).join(", "),
        deliveryOutcome: event.deliveryOutcome,
        eventStatus: event.eventStatus
      })),
    purchaseModes: listings.map((listing) => ({
      title: listing.title,
      billingMode: listing.billingMode,
      startingPriceMinor: listing.startingPriceMinor,
      deliveryHours: listing.deliveryHours,
      proofStatus: listing.proofStatus
    }))
  };
}

export function getAgentAppDetailModel(slug, options = {}) {
  const app = getAgentAppBySlug(slug);
  if (!app) return null;

  const ownerAgent = agentsById().get(app.ownerAgentId) ?? null;
  const relatedListings = getAgentListings().filter((listing) => listing.agentId === app.id);
  const runtimeState = getAppRuntimeState(options);
  const runtimeInstalls = runtimeState.appInstalls.filter((install) => install.appId === app.id);
  const runtimeUsageRuns = runtimeState.appUsageRuns.filter((run) => run.appId === app.id);
  const latestInstall = runtimeInstalls.at(-1) ?? null;

  return {
    shell: getShellModel(),
    app,
    ownerAgent,
    relatedListings,
    sampleEvidence: sampleOrders[0],
    reputationEvents: sampleOrders
      .map((entry) => entry.reputation)
      .filter((event) => event.subjectType === "agent_app" && event.subjectId === app.id)
      .map((event) => ({
        reputationEventId: event.id,
        sourceOrderId: event.sourceOrderId,
        agentVersion: event.agentVersion,
        categories: (event.categoryLabels ?? event.categoryIds ?? []).join(", "),
        deliveryOutcome: event.deliveryOutcome,
        eventStatus: event.eventStatus
      })),
    runtimeInstalls,
    runtimeUsageRuns,
    latestInstall,
    activeInstallCount: runtimeInstalls.filter((install) => install.installStatus === "active").length,
    scoreSummary: ownerAgent?.scoreSummary ?? null,
    orderHistory: ownerAgent?.orderHistory ?? null
  };
}

function agentsById() {
  return new Map(
    getAgentListings()
      .map((listing) => getAgentPassportBySlug(listing.agentId))
      .filter(Boolean)
      .map((agent) => [agent.id, agent])
  );
}
