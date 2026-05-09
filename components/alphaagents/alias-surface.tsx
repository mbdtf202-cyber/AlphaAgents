import Link from "next/link";

import {
  getAgentAppsIndexModel,
  getAgentsIndexModel,
  getCatalogAdminModel,
  getCatalogModel,
  getEvidenceRoomModel,
  getOrdersIndexModel,
  getProjectsIndexModel,
  getProviderProofModel,
  getQuickOrderModel,
  getRfpsModel,
  getRiskFinanceModel,
  getProgramOpsModel
} from "../../lib/alphaagents/view-models";
import { getRuntimeSnapshot } from "../../lib/alphaagents/runtime-queries";
import { AppShell } from "./shell";
import { Chip, CliApiEventsPanel, CommandPreview, DataTable, SectionCard } from "./blocks";

type AliasKey =
  | "agent-catalog"
  | "rfp"
  | "order"
  | "project"
  | "project-workspace"
  | "orders-and-projects"
  | "orders-acceptance"
  | "provider-proof-directory"
  | "providers"
  | "proof"
  | "evidence"
  | "evidence-room-index"
  | "apps"
  | "agent-app"
  | "quick-order-rfp"
  | "program"
  | "programs"
  | "admin"
  | "risk"
  | "finance"
  | "risk-finance-console";

type AliasConfig = {
  canonicalPath: string;
  title: string;
  subtitle: string;
  surface:
    | "catalog"
    | "rfp"
    | "orders"
    | "projects"
    | "provider-proof"
    | "evidence-room"
    | "agent-apps"
    | "quick-order"
    | "program-ops"
    | "catalog-admin"
    | "risk-finance";
  command: string;
  events: string[];
  apiPurpose: string;
};

const aliasConfig: Record<AliasKey, AliasConfig> = {
  "agent-catalog": {
    canonicalPath: "/catalog",
    title: "Agent Catalog Alias",
    subtitle: "Legacy catalog entry now renders the procurement catalog directly instead of redirecting or 404ing.",
    surface: "catalog",
    command: "alphaagents agent-listing search --json",
    events: ["AgentListingPublished", "AgentListingUpdated", "AgentListingArchived"],
    apiPurpose: "Read category-backed AgentListing filters and listing lifecycle state."
  },
  rfp: {
    canonicalPath: "/rfps",
    title: "RFP Workspace Alias",
    subtitle: "Single RFP entry renders buyer demand, proposal, acceptance, and order conversion state.",
    surface: "rfp",
    command: "alphaagents rfp publish --json",
    events: ["RfpPublished", "ProposalSubmitted", "ProposalAccepted"],
    apiPurpose: "Publish RFPs, submit proposals, and convert accepted proposals into orders."
  },
  order: {
    canonicalPath: "/orders",
    title: "Order Workspace Alias",
    subtitle: "Single order entry renders escrow, permission, delivery, QA, acceptance, dispute, finance, and reputation.",
    surface: "orders",
    command: "alphaagents acceptance accept --json",
    events: ["EscrowFunded", "DeliverySubmitted", "AcceptanceAccepted", "DisputeOpened"],
    apiPurpose: "Read and mutate the shared order state machine."
  },
  project: {
    canonicalPath: "/projects",
    title: "Project Workspace Alias",
    subtitle: "Project entry renders custom Agent milestones, UAT, change orders, program credit, and renewal blockers.",
    surface: "projects",
    command: "alphaagents custom-project request --json",
    events: ["CustomProjectRequested", "CustomProjectMilestoneConfirmed", "ProgramCreditAllocated"],
    apiPurpose: "Operate custom projects, milestones, UAT, change orders, and program credits."
  },
  "project-workspace": {
    canonicalPath: "/projects",
    title: "Project Workspace",
    subtitle: "The workspace URL now has its own project control surface, not a redirect placeholder.",
    surface: "projects",
    command: "alphaagents custom-project confirm-milestone --json",
    events: ["CustomProjectMilestoneConfirmed", "CustomProjectUatSubmitted", "CustomProjectChangeOrderCreated"],
    apiPurpose: "Track project milestone, UAT, change-order, and evidence state."
  },
  "orders-and-projects": {
    canonicalPath: "/projects",
    title: "Orders And Projects",
    subtitle: "Combined entry keeps orders and custom/program work visible for buyer operations.",
    surface: "projects",
    command: "alphaagents program allocate-credit --json",
    events: ["ProgramCreditAllocated", "ProgramCreditDrawdownRecorded", "ProgramQbrUpdated"],
    apiPurpose: "Read project and program state alongside order-backed evidence."
  },
  "orders-acceptance": {
    canonicalPath: "/orders",
    title: "Orders Acceptance",
    subtitle: "Acceptance-specific entry renders pass, limited revision, dispute, and release controls.",
    surface: "orders",
    command: "alphaagents acceptance request-revision --json",
    events: ["AcceptanceAccepted", "AcceptanceRevisionRequested", "DisputeOpened"],
    apiPurpose: "Execute buyer acceptance, revision, dispute, and conditional release actions."
  },
  "provider-proof-directory": {
    canonicalPath: "/provider-proof",
    title: "Provider Proof Directory",
    subtitle: "Provider proof has a concrete directory surface with seller admission and Agent proof.",
    surface: "provider-proof",
    command: "alphaagents agent-passport show --json",
    events: ["AgentPassportUpdated", "AgentListingPublished", "SellerAdmissionUpdated"],
    apiPurpose: "Read seller admission, AgentPassport, AgentAppPassport, and listing proof."
  },
  providers: {
    canonicalPath: "/provider-proof",
    title: "Providers",
    subtitle: "Provider alias renders seller legal entity, human owner, admission, payout, and capacity state.",
    surface: "provider-proof",
    command: "alphaagents agent-listing search --json",
    events: ["SellerAdmissionUpdated", "AgentPassportSuspended", "AgentListingArchived"],
    apiPurpose: "Inspect provider proof and supply gates."
  },
  proof: {
    canonicalPath: "/provider-proof",
    title: "Proof",
    subtitle: "Proof alias renders source-level provider evidence instead of routing to a placeholder.",
    surface: "provider-proof",
    command: "alphaagents evidence show --json",
    events: ["EvidenceExported", "AgentPassportUpdated", "AgentListingPublished"],
    apiPurpose: "Read proof artifacts tied to provider, Agent, App, listing, and evidence records."
  },
  evidence: {
    canonicalPath: "/evidence-room",
    title: "Evidence",
    subtitle: "Evidence entry renders package, hash, redaction, visibility, and export modes.",
    surface: "evidence-room",
    command: "alphaagents evidence export --json",
    events: ["EvidenceExportRequested", "EvidenceExported", "EvidenceDeletionRequested"],
    apiPurpose: "Read and export evidence packages consistently across UI, CLI, and API."
  },
  "evidence-room-index": {
    canonicalPath: "/evidence-room",
    title: "Evidence Room Index",
    subtitle: "Index entry renders evidence-package summaries for audit and replay.",
    surface: "evidence-room",
    command: "alphaagents evidence show --json",
    events: ["EvidenceExported", "AcceptanceAccepted", "DisputeResolved"],
    apiPurpose: "Read buyer-safe, procurement, support, and replay-ready evidence bundles."
  },
  apps: {
    canonicalPath: "/agent-apps",
    title: "Apps",
    subtitle: "Apps alias renders Agent App lifecycle proof instead of a generic SaaS app-store page.",
    surface: "agent-apps",
    command: "alphaagents agent-app install --json",
    events: ["AgentAppInstalled", "AgentAppUsageRecorded", "AgentAppExited"],
    apiPurpose: "Install, run, prove, and exit Agent Apps under AaaS rules."
  },
  "agent-app": {
    canonicalPath: "/agent-apps",
    title: "Agent App",
    subtitle: "Singular App entry keeps install, subscription, run, evidence, acceptance, exit, and reputation visible.",
    surface: "agent-apps",
    command: "alphaagents agent-app record-usage --json",
    events: ["AgentAppInstalled", "AgentAppUsageRecorded", "ReputationEventCreated"],
    apiPurpose: "Operate Agent App lifecycle records without bypassing platform accountability."
  },
  "quick-order-rfp": {
    canonicalPath: "/quick-order",
    title: "Quick Order / RFP",
    subtitle: "Combined purchase entry renders guided order prerequisites plus publishable RFP command state.",
    surface: "quick-order",
    command: "alphaagents rfp publish --json",
    events: ["RfpCreated", "RfpPublished", "ProposalAccepted"],
    apiPurpose: "Create a buyer-ready Quick Order or RFP with procurement gates."
  },
  program: {
    canonicalPath: "/program-ops",
    title: "Program",
    subtitle: "Program entry renders order-credit, drawdown, QBR, SLA, and renewal blockers.",
    surface: "program-ops",
    command: "alphaagents program update-qbr --json",
    events: ["ProgramCreditAllocated", "ProgramCreditDrawdownRecorded", "ProgramQbrUpdated"],
    apiPurpose: "Operate recurring program credit, backlog, and renewal state."
  },
  programs: {
    canonicalPath: "/program-ops",
    title: "Programs",
    subtitle: "Programs alias renders the multi-order operating lane for subscriptions and order-credit.",
    surface: "program-ops",
    command: "alphaagents program allocate-credit --json",
    events: ["ProgramCreditAllocated", "ProgramCreditDrawdownRecorded", "ProgramQbrUpdated"],
    apiPurpose: "Read and mutate program workspaces with ledger-safe events."
  },
  admin: {
    canonicalPath: "/catalog-admin",
    title: "Catalog Admin",
    subtitle: "Admin alias renders category, template, AgentPassport, and AgentListing governance.",
    surface: "catalog-admin",
    command: "alphaagents agent-category update --json",
    events: ["AgentCategoryUpdated", "AgentPassportUpdated", "AgentListingPublished"],
    apiPurpose: "Manage catalog CRUD, passports, listings, templates, and audit events."
  },
  risk: {
    canonicalPath: "/risk-finance",
    title: "Risk",
    subtitle: "Risk alias renders permission approval, preview, revoke, audit, and denied-tool policy.",
    surface: "risk-finance",
    command: "alphaagents permission approve --json",
    events: ["PermissionApproved", "PermissionDenied", "PermissionRevoked"],
    apiPurpose: "Approve, deny, revoke, and audit permission grants."
  },
  finance: {
    canonicalPath: "/risk-finance",
    title: "Finance",
    subtitle: "Finance alias renders conditional release, invoice, refund, reconciliation, and finance evidence.",
    surface: "risk-finance",
    command: "alphaagents dispute resolve --json",
    events: ["EscrowReleased", "EscrowRefunded", "DisputeResolved"],
    apiPurpose: "Read and mutate ledger, release, refund, invoice, and reconciliation state."
  },
  "risk-finance-console": {
    canonicalPath: "/risk-finance",
    title: "Risk / Finance Console",
    subtitle: "Console alias renders the shared risk and finance control plane directly.",
    surface: "risk-finance",
    command: "alphaagents permission revoke --json",
    events: ["PermissionApproved", "PermissionRevoked", "DisputeResolved"],
    apiPurpose: "Control high-risk permissions, audit events, finance evidence, and ledger outcomes."
  }
};

export function AliasSurfacePage({ aliasKey }: { aliasKey: AliasKey }) {
  const config = aliasConfig[aliasKey];
  const shell = getCatalogModel().shell;

  return (
    <AppShell shell={shell} currentPath={config.canonicalPath}>
      <div className="aa-grid">
        <SectionCard title={config.title} subtitle={config.subtitle} tone="trust">
          <div className="aa-button-row">
            <Link className="aa-button" href={config.canonicalPath}>
              Open canonical surface
            </Link>
            <Chip tone="trust">Route: /{aliasKey}</Chip>
            <Chip>Canonical: {config.canonicalPath}</Chip>
          </div>
          <CommandPreview command={config.command} />
        </SectionCard>
        {renderSurface(config)}
        <CliApiEventsPanel
          a19Id={`A-19-ALIAS-${aliasKey.toUpperCase().replaceAll("-", "_")}`}
          subject={`${config.title} route alias`}
          commands={[config.command]}
          apiRoutes={[
            { method: "GET", path: "/api/runtime-state", purpose: config.apiPurpose },
            { method: "POST", path: "/api/commands", purpose: "Mutate state through CommandEnvelope handlers with version, role, scope, tenant, and idempotency checks." }
          ]}
          events={config.events}
          dtoRefs={["CommandEnvelope", "RuntimeSnapshot", "EvidenceRef"]}
        />
      </div>
    </AppShell>
  );
}

function renderSurface(config: AliasConfig) {
  switch (config.surface) {
    case "catalog":
      return <CatalogAliasSurface />;
    case "rfp":
      return <RfpAliasSurface />;
    case "orders":
      return <OrdersAliasSurface />;
    case "projects":
      return <ProjectsAliasSurface />;
    case "provider-proof":
      return <ProviderProofAliasSurface />;
    case "evidence-room":
      return <EvidenceAliasSurface />;
    case "agent-apps":
      return <AgentAppsAliasSurface />;
    case "quick-order":
      return <QuickOrderAliasSurface />;
    case "program-ops":
      return <ProgramOpsAliasSurface />;
    case "catalog-admin":
      return <CatalogAdminAliasSurface />;
    case "risk-finance":
      return <RiskFinanceAliasSurface />;
    default:
      return null;
  }
}

function CatalogAliasSurface() {
  const model = getCatalogModel();
  return (
    <SectionCard title="Catalog control surface" subtitle="Category, risk, billing, SLA, rating, capacity, and unit economics stay visible at the alias route.">
      <DataTable
        columns={[
          { key: "title", label: "Listing" },
          { key: "supplyType", label: "Supply" },
          { key: "proofStatus", label: "Proof" },
          { key: "riskLevel", label: "Risk" },
          { key: "capacityAvailable", label: "Capacity" }
        ]}
        rows={model.listings.slice(0, 6)}
      />
    </SectionCard>
  );
}

function RfpAliasSurface() {
  const model = getRfpsModel();
  return (
    <div className="aa-grid aa-grid-2">
      <SectionCard title="RFP state" subtitle="Demand and proposal state must be visible before order conversion.">
        <DataTable
          columns={[
            { key: "rfpId", label: "RFP" },
            { key: "rfpStatus", label: "RFP status" },
            { key: "proposalId", label: "Proposal" },
            { key: "proposalStatus", label: "Proposal status" }
          ]}
          rows={model.sampleRfps}
        />
      </SectionCard>
      <SectionCard title="Runtime proposal count" subtitle="Live command bus RFP/proposal state.">
        <Chip tone="trust">RFPs: {model.runtimeRfps.length}</Chip>
        <Chip tone="trust">Proposals: {model.runtimeProposals.length}</Chip>
      </SectionCard>
    </div>
  );
}

function OrdersAliasSurface() {
  const model = getOrdersIndexModel();
  return (
    <div className="aa-grid aa-grid-2">
      <SectionCard title="Order and acceptance state" subtitle="Sandbox and runtime order states are both inspectable.">
        <DataTable
          columns={[
            { key: "orderId", label: "Order" },
            { key: "orderStatus", label: "Order" },
            { key: "ledgerStatus", label: "Ledger" },
            { key: "acceptanceStatus", label: "Acceptance" },
            { key: "reputationEventId", label: "Reputation" }
          ]}
          rows={model.sampleOrders}
        />
      </SectionCard>
      <SectionCard title="Runtime artifact counts" subtitle="Permission, run, delivery, and review artifacts cannot be hidden.">
        <DataTable
          columns={[
            { key: "artifact", label: "Artifact" },
            { key: "count", label: "Count" }
          ]}
          rows={[
            { artifact: "RiskPermissionGrant", count: String(model.runtimeGrants.length) },
            { artifact: "ExecutionRun", count: String(model.runtimeRuns.length) },
            { artifact: "DeliveryPackage", count: String(model.runtimeDeliveries.length) },
            { artifact: "AcceptanceReview", count: String(model.runtimeReviews.length) }
          ]}
        />
      </SectionCard>
    </div>
  );
}

function ProjectsAliasSurface() {
  const model = getProjectsIndexModel();
  return (
    <div className="aa-grid aa-grid-2">
      <SectionCard title="Custom project controls" subtitle="Demand freeze, milestones, UAT, and change orders stay in scope.">
        <ul className="aa-list">
          {model.customIntake.map((item: string) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </SectionCard>
      <SectionCard title="Program controls" subtitle="Order-credit, backlog, QBR, and renewal blockers remain visible.">
        <DataTable
          columns={[
            { key: "id", label: "Program" },
            { key: "qbrStatus", label: "QBR" },
            { key: "renewalBlockers", label: "Renewal blockers" }
          ]}
          rows={model.runtimePrograms.map((program: { id: string; qbrStatus: string; renewalBlockers: string[] }) => ({
            id: program.id,
            qbrStatus: program.qbrStatus,
            renewalBlockers: program.renewalBlockers.join(", ") || "none"
          }))}
        />
      </SectionCard>
    </div>
  );
}

function ProviderProofAliasSurface() {
  const model = getProviderProofModel();
  return (
    <div className="aa-grid aa-grid-2">
      <SectionCard title="Seller admission" subtitle="Providers below score 80 remain blocked from receiving proposals.">
        <DataTable
          columns={[
            { key: "legalEntity", label: "Seller" },
            { key: "admissionScore", label: "Score" },
            { key: "admissionStatus", label: "Admission" },
            { key: "gate", label: "Gate" }
          ]}
          rows={model.sellers}
        />
      </SectionCard>
      <SectionCard title="Provider proof objects" subtitle="AgentPassport and AgentAppPassport proof are part of provider proof.">
        {[model.primaryAgent, model.secondaryAgent, model.app].filter(Boolean).map((item: any) => (
          <Chip key={item.id} tone={item.proofStatus === "validated" ? "trust" : "warning"}>
            {item.name} / {item.version}
          </Chip>
        ))}
      </SectionCard>
    </div>
  );
}

function EvidenceAliasSurface() {
  const model = getEvidenceRoomModel();
  return (
    <div className="aa-grid aa-grid-2">
      <SectionCard title="Evidence packages" subtitle="Hash, visibility, redaction, ledger, and export status stay visible.">
        <DataTable
          columns={[
            { key: "packageId", label: "Package" },
            { key: "orderId", label: "Order" },
            { key: "ledgerStatus", label: "Ledger" },
            { key: "evidenceStatus", label: "Evidence" }
          ]}
          rows={model.packages}
        />
      </SectionCard>
      <SectionCard title="Export modes" subtitle="Buyer-safe, procurement, and support bundles share the same evidence chain.">
        {model.exportModes.map((mode: string) => (
          <Chip key={mode} tone="trust">
            {mode}
          </Chip>
        ))}
      </SectionCard>
    </div>
  );
}

function AgentAppsAliasSurface() {
  const model = getAgentAppsIndexModel();
  return (
    <div className="aa-grid aa-grid-2">
      <SectionCard title="Agent App listings" subtitle="App-style UX still carries Agent identity, evidence, acceptance, exit, and reputation.">
        <DataTable
          columns={[
            { key: "title", label: "Agent App" },
            { key: "billingMode", label: "Billing" },
            { key: "proofStatus", label: "Proof" },
            { key: "capacityAvailable", label: "Capacity" }
          ]}
          rows={model.apps}
        />
      </SectionCard>
      <SectionCard title="Runtime lifecycle" subtitle="Install and usage records prove App execution instead of seat-only SaaS usage.">
        <Chip tone="trust">Installs: {model.runtimeInstalls.length}</Chip>
        <Chip tone="trust">Usage runs: {model.runtimeUsageRuns.length}</Chip>
      </SectionCard>
    </div>
  );
}

function QuickOrderAliasSurface() {
  const model = getQuickOrderModel();
  return (
    <div className="aa-grid aa-grid-2">
      <SectionCard title="Buyer readiness" subtitle="High-risk purchase and custom confirmation stay blocked until procurement fields are complete.">
        <Chip tone={model.buyerReady ? "trust" : "warning"}>{model.buyerReady ? "Buyer ready" : "Buyer blocked"}</Chip>
        <Chip>{model.defaultPackage.packageTier}</Chip>
      </SectionCard>
      <SectionCard title="Guided order steps" subtitle="Quick Order and RFP share the same command and event pathway.">
        <ul className="aa-list">
          {model.steps.map((step: string) => (
            <li key={step}>{step}</li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}

function ProgramOpsAliasSurface() {
  const model = getProgramOpsModel();
  return (
    <div className="aa-grid aa-grid-2">
      <SectionCard title="Program workspace" subtitle="Credits, backlog, QBR, SLA, and renewal blockers stay visible.">
        <DataTable
          columns={[
            { key: "queue", label: "Queue" },
            { key: "status", label: "Status" },
            { key: "owner", label: "Owner" }
          ]}
          rows={model.queues}
        />
      </SectionCard>
      <SectionCard title="Live program events" subtitle="Credit allocation, drawdown, and QBR events are part of the runtime audit trail.">
        <Chip tone="trust">Events: {model.programEvents.length}</Chip>
        {model.blockers.map((blocker: string) => (
          <Chip key={blocker} tone="warning">
            {blocker}
          </Chip>
        ))}
      </SectionCard>
    </div>
  );
}

function CatalogAdminAliasSurface() {
  const model = getCatalogAdminModel();
  return (
    <div className="aa-grid aa-grid-2">
      <SectionCard title="Category registry" subtitle="Category create, update, archive, and restore are governed objects, not frontend constants.">
        <DataTable
          columns={[
            { key: "categoryId", label: "Category" },
            { key: "riskLevel", label: "Risk" },
            { key: "categoryStatus", label: "Status" },
            { key: "owners", label: "Owners" }
          ]}
          rows={model.categories.slice(0, 8).map((category: any) => ({
            categoryId: category.categoryId,
            riskLevel: category.riskLevel,
            categoryStatus: category.categoryStatus,
            owners: [category.opsOwner, category.riskOwner].filter(Boolean).join(" / ")
          }))}
        />
      </SectionCard>
      <SectionCard title="Passport and listing controls" subtitle="AgentPassport and AgentListing lifecycle changes must emit audit events.">
        <Chip tone="trust">{model.agent?.name}</Chip>
        <Chip tone="trust">Listings: {model.listings.length}</Chip>
      </SectionCard>
    </div>
  );
}

function RiskFinanceAliasSurface() {
  const model = getRiskFinanceModel();
  const runtimeSnapshot = getRuntimeSnapshot();
  return (
    <div className="aa-grid aa-grid-2">
      <SectionCard title="High-risk permission control" subtitle="Explicit authorization, preview, revoke, and audit must be visible before risky actions.">
        {model.security.runtimeToolPolicy.denied.map((tool: string) => (
          <Chip key={tool} tone="danger">
            Denied by default: {tool}
          </Chip>
        ))}
        <Chip tone="trust">Runtime events: {runtimeSnapshot.events.length}</Chip>
      </SectionCard>
      <SectionCard title="Preview / audit / revoke checklist" subtitle="Alias routes expose the same high-risk review gates as the canonical console.">
        <DataTable
          columns={[
            { key: "label", label: "Gate" },
            { key: "command", label: "CLI" },
            { key: "evidence", label: "Evidence" }
          ]}
          rows={model.riskActionChecklist}
        />
      </SectionCard>
      <SectionCard title="Finance evidence" subtitle="Conditional release, invoice, refund, and reconciliation stay buyer-readable.">
        <DataTable
          columns={[
            { key: "packageId", label: "Package" },
            { key: "paymentRef", label: "Payment" },
            { key: "invoiceStatus", label: "Invoice" },
            { key: "reconciliationStatus", label: "Reconciliation" }
          ]}
          rows={model.sampleOrders}
        />
      </SectionCard>
    </div>
  );
}

export type { AliasKey };
