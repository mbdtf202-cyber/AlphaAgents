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

export function getCatalogModel(filters = {}) {
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
  const listings = filterCatalogListings(getAgentListings(), filters);
  return {
    shell: getShellModel(),
    categories: getCategoryRegistry(),
    categoryUnitEconomics: getCategoryUnitEconomicsRows(),
    filters: getMarketFilters(),
    activeFilters: normalizeCatalogFilters(filters),
    listings,
    listingCount: listings.length,
    runtimeListings: listRuntimeListings(),
    featuredActions
  };
}

export function filterCatalogListings(listings, filters = {}) {
  const normalized = normalizeCatalogFilters(filters);
  return listings.filter((listing) => {
    const rating = listing.qaPassRate ?? 0;
    return (
      (!normalized.categoryId || listing.categoryIds.includes(normalized.categoryId)) &&
      (!normalized.supplyType || listing.supplyType === normalized.supplyType) &&
      (!normalized.riskLevel || listing.riskLevel === normalized.riskLevel) &&
      (!normalized.billingMode || listing.billingMode === normalized.billingMode) &&
      (!normalized.maxPriceMinor || listing.startingPriceMinor <= normalized.maxPriceMinor) &&
      (!normalized.maxDeliveryHours || listing.deliveryHours <= normalized.maxDeliveryHours) &&
      (!normalized.minRating || rating >= normalized.minRating) &&
      (!normalized.minCapacity || listing.capacityAvailable >= normalized.minCapacity)
    );
  });
}

function normalizeCatalogFilters(filters = {}) {
  const asString = (value) => (Array.isArray(value) ? value[0] : value);
  const asNumber = (value) => {
    const parsed = Number(asString(value));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };
  return {
    categoryId: asString(filters.categoryId) ?? "",
    supplyType: asString(filters.supplyType) ?? "",
    riskLevel: asString(filters.riskLevel) ?? "",
    billingMode: asString(filters.billingMode) ?? "",
    maxPriceMinor: asNumber(filters.maxPriceMinor),
    maxDeliveryHours: asNumber(filters.maxDeliveryHours),
    minRating: asNumber(filters.minRating),
    minCapacity: asNumber(filters.minCapacity)
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
    roiRows: getRoiRows(),
    financeRows: getSampleFinanceRows(),
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
    roiRows: getRoiRows(),
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
    roiRows: getRoiRows(),
    queues: [
      { queue: "Weekly backlog", status: "active", owner: "Ops Lead" },
      { queue: "QBR package", status: "in progress", owner: "Buyer success" }
    ],
    programEvents: runtimeEvents
  };
}

export function getAgentAppsIndexModel(options = {}) {
  const runtimeState = getAppRuntimeState(options);
  const appsById = new Map(getAgentApps().map((app) => [app.id, app]));
  return {
    shell: getShellModel(),
    apps: getAgentListings()
      .filter((listing) => listing.supplyType === "agent_app")
      .map((listing) => ({
        ...listing,
        detailSlug: appsById.get(listing.agentId)?.slug ?? listing.slug
      })),
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
    runtimeFinanceRows: getRuntimeFinanceRows(runtimeSnapshot.orders),
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
      invoiceStatus: entry.ledger.invoiceStatus,
      reconciliationStatus: entry.ledger.reconciliationStatus,
      reputationEventId: entry.reputation.id
    })),
    sampleFinanceRows: getSampleFinanceRows(),
    roiRows: getRoiRows(),
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
    runtimeFinanceRows: getRuntimeFinanceRows(runtimeSnapshot.orders),
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
      paymentRef: entry.ledger.paymentRef,
      contractingEntity: entry.ledger.contractingEntity,
      collectionEntity: entry.ledger.collectionEntity,
      invoiceIssuer: entry.ledger.invoiceIssuer,
      invoiceStatus: entry.ledger.invoiceStatus,
      refundRemitter: entry.ledger.refundRemitter,
      reconciliationStatus: entry.ledger.reconciliationStatus,
      disclaimer: entry.ledger.licensedClearingDisclaimer
    })),
    financeEvidenceRows: getSampleFinanceRows(),
    roiRows: getRoiRows()
  };
}

function getSampleFinanceRows() {
  return sampleOrders.map((entry) => ({
    packageId: entry.packageId,
    orderId: entry.ledger.orderId,
    paymentRef: entry.ledger.paymentRef,
    paymentStatus: entry.ledger.paymentStatus,
    contractingEntity: entry.ledger.contractingEntity,
    collectionEntity: entry.ledger.collectionEntity,
    invoiceIssuer: entry.ledger.invoiceIssuer,
    invoiceStatus: entry.ledger.invoiceStatus,
    refundRemitter: entry.ledger.refundRemitter,
    releasedAmountMinor: entry.ledger.releasedAmountMinor,
    refundAmountMinor: entry.ledger.refundAmountMinor,
    reconciliationStatus: entry.ledger.reconciliationStatus,
    reconciliationExport: `${entry.packageId}/12-finance-ledger.json`,
    financeEvidenceRefs: entry.ledger.eventRefs.join(", ")
  }));
}

function getRuntimeFinanceRows(orders) {
  return orders.map((order) => ({
    orderId: order.id,
    paymentRef: order.paymentRef || "missing",
    paymentStatus: order.paymentStatus || "not_confirmed",
    contractingEntity: order.contractingEntity || "missing",
    collectionEntity: order.collectionEntity || "missing",
    invoiceIssuer: order.invoiceIssuer || "missing",
    invoiceStatus: order.invoiceStatus || "not_requested",
    refundRemitter: order.refundRemitter || "missing",
    releasedAmountMinor: order.releasedAmountMinor ?? 0,
    refundAmountMinor: order.refundAmountMinor ?? 0,
    reconciliationStatus: order.reconciliationStatus || "not_ready",
    reconciliationExport: order.reconciliationStatus === "weekly_export_ready" ? `runtime/${order.id}/finance-ledger.json` : "not_ready",
    financeEvidenceRefs: (order.financeEvidenceRefs ?? []).join(", ")
  }));
}

function getRoiRows() {
  return sampleOrders.map((entry) => ({
    packageId: entry.packageId,
    orderId: entry.ledger.orderId,
    cycleTimeSavedHours: entry.roi.cycleTimeSavedHours,
    buyerReviewHours: entry.roi.buyerReviewHours,
    usableResultCount: entry.roi.usableResultCount,
    usableResultRate: entry.roi.usableResultRate,
    acceptanceScore: entry.roi.acceptanceScore,
    runtimeCostMinor: entry.roi.runtimeCostMinor,
    providerPayoutMinor: entry.roi.providerPayoutMinor,
    refundCostMinor: entry.roi.refundCostMinor,
    contributionMarginEstimate: entry.roi.contributionMarginEstimate,
    repurchaseSignal: entry.roi.repurchaseSignal,
    renewalSignal: entry.roi.renewalSignal
  }));
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

export function getAgentDetailModel(slug, options = {}) {
  const agent = getAgentPassportBySlug(slug);
  if (!agent) return null;
  const listings = getListingsByAgentId(agent.id);
  const detailPerformance = getAgentDetailPerformance(agent, options);
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
    historicalOrderRows: detailPerformance.historicalOrderRows,
    ratingDistributionBuckets: detailPerformance.ratingDistributionBuckets,
    performanceMetrics: detailPerformance.performanceMetrics,
    performanceHistory: detailPerformance.performanceHistory,
    purchaseModes: listings.map((listing) => ({
      title: listing.title,
      billingMode: listing.billingMode,
      startingPriceMinor: listing.startingPriceMinor,
      deliveryHours: listing.deliveryHours,
      proofStatus: listing.proofStatus
    }))
  };
}

function getAgentDetailPerformance(agent, options = {}) {
  const sampleRows = sampleOrders
    .filter((entry) => entry.reputation.subjectType === "agent" && entry.reputation.subjectId === agent.id)
    .map((entry) => getSampleAgentOrderRow(entry));
  const runtimeRows = getRuntimeAgentOrderRows(agent, options);
  const historicalOrderRows = [...sampleRows, ...runtimeRows];
  const completedRows = historicalOrderRows.filter((row) => row.deliveryOutcome !== "pending");
  const ratedRows = historicalOrderRows.filter((row) => Number.isFinite(row.ratingAverage));
  const onTimeRows = completedRows.filter((row) => row.onTime);
  const reworkRows = completedRows.filter((row) => row.reworkRevision);
  const disputeRows = completedRows.filter((row) => row.disputed);

  return {
    historicalOrderRows: historicalOrderRows.map(formatHistoricalOrderRow),
    ratingDistributionBuckets: [5, 4, 3, 2, 1].map((rating) => {
      const count = ratedRows.filter((row) => Math.round(row.ratingAverage) === rating).length;
      return {
        rating,
        bucket: `${rating} star`,
        count,
        share: formatPercent(count, ratedRows.length)
      };
    }),
    performanceMetrics: {
      completedOrderCount: completedRows.length,
      ratedOrderCount: ratedRows.length,
      averageRating: formatDecimal(average(ratedRows.map((row) => row.ratingAverage)) ?? agent.scoreSummary.averageRating),
      onTimeDeliveryRate: formatPercent(onTimeRows.length, completedRows.length, agent.scoreSummary.onTimeRate),
      reworkRevisionRate: formatPercent(reworkRows.length, completedRows.length, safeRate(agent.orderHistory.revisions, agent.orderHistory.completed)),
      disputeRate: formatPercent(disputeRows.length, completedRows.length, agent.scoreSummary.disputeRate),
      qaPassRate: formatPercent(null, null, agent.scoreSummary.qaPassRate)
    },
    performanceHistory: historicalOrderRows.map((row) => ({
      orderId: row.orderId,
      packageId: row.packageId,
      reportedAt: row.reportedAt,
      ratingAverage: Number(formatDecimal(row.ratingAverage)),
      reviewScore: row.reviewScore ?? 0,
      timelinessRating: row.timelinessRating ?? 0,
      evidenceRating: row.evidenceRating ?? 0,
      deliveryOutcome: row.deliveryOutcome,
      onTimeFlag: row.onTime ? "yes" : "no",
      reworkRevisionFlag: row.reworkRevision ? "yes" : "no",
      disputeFlag: row.disputed ? "yes" : "no"
    }))
  };
}

function getSampleAgentOrderRow(entry) {
  const order = entry.snapshot.ui.orderDto;
  const ratingAverage = average(Object.values(entry.reputation.ratingBreakdown ?? {}));
  const reviewReason = entry.review.decisionReason ?? "";
  const deliveryOutcome = entry.reputation.deliveryOutcome ?? order.acceptanceStatus;
  const ledgerStatus = entry.ledger.ledgerStatus ?? order.ledgerStatus;
  const reworkRevision = /revision|rework/i.test(`${entry.packageId} ${entry.review.reviewStatus} ${reviewReason} ${deliveryOutcome}`);
  const disputed = /dispute|disputed|partially_released|refunded/i.test(`${entry.packageId} ${entry.review.reviewStatus} ${deliveryOutcome} ${ledgerStatus}`);

  return {
    packageId: entry.packageId,
    orderId: order.id,
    orderStatus: order.orderStatus,
    acceptanceStatus: order.acceptanceStatus,
    ledgerStatus,
    amountMinor: order.amountMinor,
    currency: order.currency,
    categories: (entry.reputation.categoryLabels ?? entry.reputation.categoryIds ?? []).join(", "),
    agentVersion: entry.reputation.agentVersion,
    deliveryOutcome,
    reputationEventId: entry.reputation.id,
    reportedAt: entry.reputation.createdAt ?? entry.review.createdAt,
    ratingAverage: ratingAverage ?? 0,
    reviewScore: entry.review.totalScore ?? 0,
    timelinessRating: entry.reputation.ratingBreakdown?.timeliness ?? 0,
    evidenceRating: entry.reputation.ratingBreakdown?.evidence ?? 0,
    evidenceCompleteness: order.evidenceCompleteness ?? 0,
    onTime: (entry.review.criteriaScores?.on_time_delivery ?? 0) > 0 || (entry.reputation.ratingBreakdown?.timeliness ?? 0) >= 4,
    reworkRevision,
    disputed
  };
}

function getRuntimeAgentOrderRows(agent, options = {}) {
  const runtimeSnapshot = getRuntimeSnapshot(options);
  return runtimeSnapshot.orders
    .filter((order) => order.agentId === agent.id)
    .map((order) => {
      const reputation = runtimeSnapshot.reputations.find((entry) => entry.sourceOrderId === order.id && entry.subjectId === agent.id);
      const reviews = runtimeSnapshot.reviews.filter((review) => review.orderId === order.id);
      const latestReview = reviews.at(-1) ?? null;
      const ratingAverage = reputation ? average(Object.values(reputation.ratingBreakdown ?? {})) : null;
      const reworkRevision = reviews.some((review) => review.reviewStatus === "revision_requested");
      const disputed = reviews.some((review) => review.reviewStatus === "disputed") || ["disputed", "resolved", "partially_released", "refunded"].includes(order.orderStatus);
      const onTime = latestReview?.criteriaScores?.on_time_delivery ? latestReview.criteriaScores.on_time_delivery > 0 : (reputation?.ratingBreakdown?.timeliness ?? 0) >= 4;

      return {
        packageId: "runtime",
        orderId: order.id,
        orderStatus: order.orderStatus,
        acceptanceStatus: order.acceptanceStatus,
        ledgerStatus: order.ledgerStatus,
        amountMinor: order.amountMinor,
        currency: order.currency,
        categories: (reputation?.categoryLabels ?? reputation?.categoryIds ?? agent.categoryIds).join(", "),
        agentVersion: reputation?.agentVersion ?? agent.version,
        deliveryOutcome: reputation?.deliveryOutcome ?? (order.orderStatus === "released" ? "accepted" : "pending"),
        reputationEventId: reputation?.id ?? "pending",
        reportedAt: reputation?.createdAt ?? "runtime",
        ratingAverage: ratingAverage ?? 0,
        reviewScore: latestReview?.totalScore ?? 0,
        timelinessRating: reputation?.ratingBreakdown?.timeliness ?? 0,
        evidenceRating: reputation?.ratingBreakdown?.evidence ?? 0,
        evidenceCompleteness: order.evidenceCompleteness ?? 0,
        onTime,
        reworkRevision,
        disputed
      };
    });
}

function formatHistoricalOrderRow(row) {
  return {
    packageId: row.packageId,
    orderId: row.orderId,
    reportedAt: row.reportedAt,
    orderStatus: row.orderStatus,
    acceptanceStatus: row.acceptanceStatus,
    ledgerStatus: row.ledgerStatus,
    amount: formatMoney(row.amountMinor, row.currency),
    categories: row.categories,
    agentVersion: row.agentVersion,
    deliveryOutcome: row.deliveryOutcome,
    ratingAverage: formatDecimal(row.ratingAverage),
    reviewScore: row.reviewScore,
    onTimeFlag: row.onTime ? "yes" : "no",
    reworkRevisionFlag: row.reworkRevision ? "yes" : "no",
    disputeFlag: row.disputed ? "yes" : "no",
    evidenceCompleteness: formatPercent(null, null, row.evidenceCompleteness),
    reputationEventId: row.reputationEventId
  };
}

function average(values) {
  const numbers = values.filter((value) => Number.isFinite(value));
  if (numbers.length === 0) return null;
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function formatDecimal(value) {
  return Number((value ?? 0).toFixed(1)).toFixed(1);
}

function safeRate(numerator, denominator) {
  if (!denominator) return null;
  return numerator / denominator;
}

function formatPercent(numerator, denominator, fallbackRate = null) {
  const rate = numerator === null || denominator === null ? fallbackRate : safeRate(numerator, denominator);
  if (!Number.isFinite(rate)) return "0%";
  return `${Math.round(rate * 100)}%`;
}

function formatMoney(amountMinor = 0, currency = "CNY") {
  const symbol = currency === "CNY" ? "¥" : `${currency} `;
  return `${symbol}${(amountMinor / 100).toLocaleString("en-US")}`;
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
