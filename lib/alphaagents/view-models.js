import {
  getAgentAppBySlug,
  getAgentListings,
  getAgentPassportBySlug,
  getCategoryRegistry,
  getFeaturedListings,
  getListingsByAgentId,
  getMarketFilters
} from "./catalog.js";
import { contract, orderFixtures, programWorkspaces, sampleOrders } from "./data.js";
import { loadEvidencePackageSummaries } from "./queries.js";
import { getBuyerProfiles, listRuntimeListings, listRuntimeOrders, listRuntimeRfps } from "./runtime-queries.js";

const navItems = [
  { href: "/", label: "Public Showcase" },
  { href: "/catalog", label: "Agent Catalog" },
  { href: "/buyer-org-setup", label: "Buyer Org Setup" },
  { href: "/quick-order", label: "Quick Order / RFP" },
  { href: "/workbench", label: "Workbench" },
  { href: "/provider-proof", label: "Provider Proof Directory" },
  { href: "/order-workspace", label: "Order / Project Workspace" },
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
  return {
    shell: getShellModel(),
    categories: getCategoryRegistry(),
    filters: getMarketFilters(),
    listings: getAgentListings(),
    runtimeListings: listRuntimeListings()
  };
}

export function getBuyerOrgSetupModel() {
  const buyer = getBuyerProfiles()[0];
  return {
    shell: getShellModel(),
    buyer,
    fields: [
      "buyer org name",
      "requester",
      "acceptance owner",
      "finance contact",
      "authorized payer",
      "signer",
      "invoice requirement",
      "scope acknowledgement"
    ],
    readiness: [
      { label: "Authority chain", status: buyer?.signerIds?.length ? "Pass" : "Blocked" },
      { label: "Invoice readiness", status: buyer?.invoiceReadiness ?? "missing" },
      { label: "Scope acknowledgement", status: buyer?.scopeAcknowledgement ?? "missing" }
    ]
  };
}

export function getQuickOrderModel() {
  const runtimeRfps = listRuntimeRfps();
  const buyer = getBuyerProfiles()[0];
  const buyerReady = Boolean(
    buyer?.requesterUserId &&
      buyer?.acceptanceOwnerUserId &&
      buyer?.financeContactUserId &&
      buyer?.authorizedPayerId &&
      buyer?.signerIds?.length &&
      buyer?.invoiceReadiness === "ready" &&
      buyer?.scopeAcknowledgement === "accepted"
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

export function getWorkbenchModel() {
  return {
    shell: getShellModel(),
    categories: getCategoryRegistry().slice(0, 4),
    activeOrders: orderFixtures.orders.slice(0, 8),
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
    app: getAgentAppBySlug("harbor-growth-workbench-app")
  };
}

export function getOrderWorkspaceModel() {
  const runtimeOrders = listRuntimeOrders();
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
  return {
    shell: getShellModel(),
    primaryAgent,
    summaries: [
      { outcome: "Accepted", proof: "sample_only + sandbox_verified", note: "Strong evidence traceability" },
      { outcome: "Partially released", proof: "sample_only + sandbox_verified", note: "Actionability gap surfaced" },
      { outcome: "Refunded", proof: "sample_only + sandbox_verified", note: "Negative outcome remains visible" }
    ]
  };
}

export function getProgramOpsModel() {
  return {
    shell: getShellModel(),
    program: programWorkspaces[0],
    blockers: programWorkspaces[0].renewalBlockers,
    queues: [
      { queue: "Weekly backlog", status: "active", owner: "Ops Lead" },
      { queue: "QBR package", status: "in progress", owner: "Buyer success" }
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

export function getRiskFinanceModel() {
  return {
    shell: getShellModel(),
    financeRules: contract.financeRules,
    security: contract.security,
    sampleOrders: sampleOrders.map((entry) => ({
      packageId: entry.packageId,
      orderId: entry.snapshot.ui.orderDto.id,
      paymentLanguage: entry.ledger.buyerFacingPaymentLanguage,
      ledgerStatus: entry.ledger.ledgerStatus,
      disclaimer: entry.ledger.licensedClearingDisclaimer
    }))
  };
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
  return {
    shell: getShellModel(),
    agent,
    listings: getListingsByAgentId(agent.id)
  };
}

export function getAgentAppDetailModel(slug) {
  const app = getAgentAppBySlug(slug);
  if (!app) return null;

  const ownerAgent = agentsById().get(app.ownerAgentId) ?? null;
  const relatedListings = getAgentListings().filter((listing) => listing.agentId === app.id);

  return {
    shell: getShellModel(),
    app,
    ownerAgent,
    relatedListings
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
