import { executeRuntimeCommand } from "./runtime-engine.js";
import { createTempStateFile, loadRuntimeState, resetRuntimeState } from "./runtime-state.js";
import { contract } from "./data.js";

const defaultScopePayload = {
  categoryId: "social_media_operations",
  sellerId: "seller_harbor_growth_sandbox",
  agentId: "agent_mira_competitor_intel_sandbox",
  listingId: "listing_trial_mira_001",
  rfpId: "rfp_demo_trial_001",
  proposalId: "proposal_demo_trial_001",
  orderId: "order_sandbox_trial_001",
  runId: "run_sandbox_trial_001",
  deliveryPackageId: "delivery_sandbox_trial_001",
  grantId: "grant_sandbox_trial_001",
  evidenceId: "ev_sandbox_delivery_pdf_001",
  customProjectId: "custom_project_northstar_launch_001"
};

const demoEvents = {
  "buyer-org.setup": [{ eventName: "BuyerOrgSetupUpdated", payload: { buyerOrgId: "org_demo_001", invoiceReadiness: "ready", scopeAcknowledgement: "accepted" } }],
  "custom-project.request": [{ eventName: "CustomProjectRequested", payload: { projectId: "custom_project_northstar_launch_001", projectStatus: "intake_submitted" } }],
  "custom-project.confirm-milestone": [{ eventName: "CustomProjectMilestoneConfirmed", payload: { projectId: "custom_project_northstar_launch_001", milestoneId: "milestone_design_freeze_001" } }],
  "custom-project.submit-uat": [{ eventName: "CustomProjectUatSubmitted", payload: { projectId: "custom_project_northstar_launch_001", milestoneId: "milestone_design_freeze_001" } }],
  "custom-project.create-change-order": [{ eventName: "CustomProjectChangeOrderCreated", payload: { projectId: "custom_project_northstar_launch_001", changeOrderId: "change_scope_001" } }],
  "agent-app.install": [{ eventName: "AgentAppInstalled", payload: { installId: "app_install_demo_001", appId: "agent_app_harbor_growth_workbench" } }],
  "agent-app.record-usage": [{ eventName: "AgentAppUsageRecorded", payload: { usageRunId: "app_run_demo_001", installId: "app_install_demo_001" } }],
  "agent-app.exit": [{ eventName: "AgentAppExited", payload: { installId: "app_install_demo_001", exitReason: "quarterly review complete" } }],
  "program.allocate-credit": [{ eventName: "ProgramCreditAllocated", payload: { programId: "program_northstar_growth_001", creditAmountMinor: 320000 } }],
  "program.record-drawdown": [{ eventName: "ProgramCreditDrawdownRecorded", payload: { programId: "program_northstar_growth_001", drawdownMinor: 120000 } }],
  "program.update-qbr": [{ eventName: "ProgramQbrUpdated", payload: { programId: "program_northstar_growth_001", qbrStatus: "ready_for_review" } }],
  "agent-category create": [{ eventName: "AgentCategoryCreated", payload: { categoryId: "social_media_operations" } }],
  "agent-category update": [{ eventName: "AgentCategoryUpdated", payload: { categoryId: "social_media_operations" } }],
  "agent-category archive": [{ eventName: "AgentCategoryArchived", payload: { categoryId: "social_media_operations" } }],
  "agent-category restore": [{ eventName: "AgentCategoryRestored", payload: { categoryId: "social_media_operations" } }],
  "agent-passport create": [{ eventName: "AgentPassportCreated", payload: { agentId: "agent_mira_competitor_intel_sandbox" } }],
  "agent-passport update": [{ eventName: "AgentPassportUpdated", payload: { agentId: "agent_mira_competitor_intel_sandbox" } }],
  "agent-passport suspend": [{ eventName: "AgentPassportSuspended", payload: { agentId: "agent_mira_competitor_intel_sandbox" } }],
  "agent-listing publish": [{ eventName: "AgentListingPublished", payload: { listingId: "listing_trial_mira_001" } }],
  "agent-listing update": [{ eventName: "AgentListingUpdated", payload: { listingId: "listing_trial_mira_001" } }],
  "agent-listing archive": [{ eventName: "AgentListingArchived", payload: { listingId: "listing_trial_mira_001" } }],
  "rfp.create": [{ eventName: "RfpDraftCreated", payload: { rfpId: "rfp_demo_trial_001", rfpStatus: "draft" } }],
  "rfp.publish": [{ eventName: "RfpPublished", payload: { rfpId: "rfp_demo_trial_001", rfpStatus: "published" } }],
  "rfp.cancel": [{ eventName: "RfpCancelled", payload: { rfpId: "rfp_demo_trial_001", rfpStatus: "cancelled" } }],
  "proposal.submit": [{ eventName: "ProposalSubmitted", payload: { proposalId: "proposal_demo_trial_001", proposalStatus: "submitted" } }],
  "proposal.accept": [{ eventName: "ProposalSelected", payload: { proposalId: "proposal_demo_trial_001", proposalStatus: "selected" } }],
  "proposal.withdraw": [{ eventName: "ProposalWithdrawn", payload: { proposalId: "proposal_demo_trial_001", proposalStatus: "withdrawn" } }],
  "escrow.fund": [{ eventName: "EscrowFunded", payload: { orderId: "order_sandbox_trial_001", ledgerStatus: "escrowed" } }],
  "escrow.release": [{ eventName: "EscrowReleased", payload: { orderId: "order_sandbox_trial_001", ledgerStatus: "released" } }],
  "escrow.partial-release": [{ eventName: "EscrowPartiallyReleased", payload: { orderId: "order_sandbox_dispute_003", ledgerStatus: "partially_released" } }],
  "escrow.refund": [{ eventName: "EscrowRefunded", payload: { orderId: "order_sandbox_dispute_003", ledgerStatus: "refunded" } }],
  "permission.approve": [{ eventName: "PermissionApproved", payload: { grantId: "grant_sandbox_trial_001", grantStatus: "approved" } }],
  "permission.deny": [{ eventName: "PermissionDenied", payload: { grantId: "grant_sandbox_trial_001", grantStatus: "denied" } }],
  "permission.revoke": [{ eventName: "PermissionRevoked", payload: { grantId: "grant_sandbox_trial_001", grantStatus: "revoked" } }],
  "run.start": [{ eventName: "RunStarted", payload: { runId: "run_sandbox_trial_001", runStatus: "running" } }],
  "run.cancel": [{ eventName: "RunCancelled", payload: { runId: "run_sandbox_trial_001", runStatus: "cancelled" } }],
  "delivery.submit": [{ eventName: "DeliverySubmitted", payload: { deliveryPackageId: "delivery_sandbox_trial_001", deliveryStatus: "submitted" } }],
  "delivery.qa_pass": [{ eventName: "DeliveryQaPassed", payload: { deliveryPackageId: "delivery_sandbox_trial_001", deliveryStatus: "qa_passed" } }],
  "delivery.qa_reject": [{ eventName: "DeliveryQaRejected", payload: { deliveryPackageId: "delivery_sandbox_trial_001", deliveryStatus: "qa_rejected" } }],
  "acceptance.accept": [{ eventName: "AcceptanceAccepted", payload: { reviewId: "review_demo_trial_001", reviewStatus: "accepted" } }],
  "acceptance.request-revision": [{ eventName: "RevisionRequested", payload: { reviewId: "review_demo_revision_001", reviewStatus: "revision_requested" } }],
  "dispute.open": [{ eventName: "DisputeOpened", payload: { reviewId: "review_demo_dispute_001", reviewStatus: "disputed" } }]
  ,
  "dispute.resolve": [{ eventName: "DisputeResolved", payload: { orderId: "order_sandbox_dispute_003", orderStatus: "resolved" } }],
  "rating.submit": [{ eventName: "ReputationPublished", payload: { reputationEventId: "rep_sandbox_trial_001", eventStatus: "published" } }],
  "evidence.export": [{ eventName: "EvidenceExported", payload: { exportId: "export_demo_001", orderId: "order_sandbox_trial_001" } }],
  "evidence.delete": [{ eventName: "EvidenceDeleted", payload: { requestId: "delete_demo_001", evidenceId: "ev_sandbox_delivery_pdf_001" } }]
};

const demoDtos = {
  "buyer-org.setup": {
    id: "org_demo_001",
    lifecycleStage: "org_setup",
    requesterUserId: "user_demo_buyer_owner",
    acceptanceOwnerUserId: "user_demo_acceptance_owner",
    financeContactUserId: "user_demo_finance_owner",
    legalContactUserId: "user_demo_legal_owner",
    authorizedPayerId: "payer_demo_001",
    signerIds: ["signer_demo_001"],
    invoiceReadiness: "ready",
    scopeAcknowledgement: "accepted",
    contractingEntity: "NorthStar Beauty LLC",
    collectionEntity: "AlphaAgents Platform Ops LLC",
    invoiceIssuer: "AlphaAgents Platform Ops LLC",
    refundRemitter: "AlphaAgents Platform Ops LLC",
    subprocessors: ["Harbor Growth Studio"],
    version: 2
  },
  "custom-project.request": {
    id: "custom_project_northstar_launch_001",
    tenantId: "org_demo_001",
    buyerOrgId: "org_demo_001",
    projectTitle: "NorthStar launch workflow agent",
    categoryId: "custom_agent_app",
    targetOutcome: "launch-ready managed workflow agent with buyer UAT",
    requestedBy: "user_demo_buyer_owner",
    projectStatus: "intake_submitted",
    uatStatus: "not_started",
    milestones: [],
    changeOrders: [],
    version: 1
  },
  "custom-project.confirm-milestone": {
    id: "custom_project_northstar_launch_001",
    tenantId: "org_demo_001",
    buyerOrgId: "org_demo_001",
    projectTitle: "NorthStar launch workflow agent",
    categoryId: "custom_agent_app",
    targetOutcome: "launch-ready managed workflow agent with buyer UAT",
    requestedBy: "user_demo_buyer_owner",
    projectStatus: "milestone_confirmed",
    uatStatus: "not_started",
    milestones: [{ milestoneId: "milestone_design_freeze_001", milestoneName: "Design freeze", dueAt: "2026-05-20T18:00:00+08:00", milestoneStatus: "confirmed" }],
    changeOrders: [],
    version: 2
  },
  "custom-project.submit-uat": {
    id: "custom_project_northstar_launch_001",
    tenantId: "org_demo_001",
    buyerOrgId: "org_demo_001",
    projectTitle: "NorthStar launch workflow agent",
    categoryId: "custom_agent_app",
    targetOutcome: "launch-ready managed workflow agent with buyer UAT",
    requestedBy: "user_demo_buyer_owner",
    projectStatus: "uat_submitted",
    uatStatus: "submitted",
    milestones: [{ milestoneId: "milestone_design_freeze_001", milestoneName: "Design freeze", dueAt: "2026-05-20T18:00:00+08:00", milestoneStatus: "uat_submitted" }],
    changeOrders: [],
    version: 3
  },
  "custom-project.create-change-order": {
    id: "custom_project_northstar_launch_001",
    tenantId: "org_demo_001",
    buyerOrgId: "org_demo_001",
    projectTitle: "NorthStar launch workflow agent",
    categoryId: "custom_agent_app",
    targetOutcome: "launch-ready managed workflow agent with buyer UAT",
    requestedBy: "user_demo_buyer_owner",
    projectStatus: "change_requested",
    uatStatus: "submitted",
    milestones: [{ milestoneId: "milestone_design_freeze_001", milestoneName: "Design freeze", dueAt: "2026-05-20T18:00:00+08:00", milestoneStatus: "uat_submitted" }],
    changeOrders: [{ changeOrderId: "change_scope_001", requestedChange: "add private deployment checklist", impactSummary: "one extra review cycle", changeStatus: "requested" }],
    version: 4
  },
  "agent-app.install": {
    id: "app_install_demo_001",
    tenantId: "org_demo_001",
    appId: "agent_app_harbor_growth_workbench",
    buyerOrgId: "org_demo_001",
    usageMode: "subscription",
    installStatus: "active",
    version: 1
  },
  "agent-app.record-usage": {
    id: "app_run_demo_001",
    tenantId: "org_demo_001",
    installId: "app_install_demo_001",
    appId: "agent_app_harbor_growth_workbench",
    usageSummary: "weekly content sync completed with buyer-safe evidence",
    evidenceRefs: ["ev_sandbox_delivery_pdf_001"],
    usageStatus: "recorded",
    version: 1
  },
  "agent-app.exit": {
    id: "app_install_demo_001",
    tenantId: "org_demo_001",
    appId: "agent_app_harbor_growth_workbench",
    buyerOrgId: "org_demo_001",
    usageMode: "subscription",
    installStatus: "exited",
    exitReason: "quarterly review complete",
    version: 2
  },
  "program.allocate-credit": {
    id: "program_northstar_growth_001",
    buyerOrgId: "org_demo_001",
    activeCreditMinor: 2120000,
    backlogValueMinor: 4800000,
    qbrStatus: "in_progress",
    version: 1
  },
  "program.record-drawdown": {
    id: "program_northstar_growth_001",
    buyerOrgId: "org_demo_001",
    activeCreditMinor: 2000000,
    backlogValueMinor: 4800000,
    qbrStatus: "in_progress",
    version: 2
  },
  "program.update-qbr": {
    id: "program_northstar_growth_001",
    buyerOrgId: "org_demo_001",
    activeCreditMinor: 2000000,
    backlogValueMinor: 4800000,
    qbrStatus: "ready_for_review",
    version: 3
  },
  "agent-category create": {
    id: "social_media_operations",
    name: "Social Media Operations",
    categoryStatus: "sellable",
    riskLevel: "medium_high",
    version: 1
  },
  "agent-category update": {
    id: "social_media_operations",
    name: "Social Media Operations",
    categoryStatus: "sellable",
    riskLevel: "medium_high",
    version: 2
  },
  "agent-category archive": {
    id: "social_media_operations",
    name: "Social Media Operations",
    categoryStatus: "archived",
    riskLevel: "medium_high",
    version: 3
  },
  "agent-category restore": {
    id: "social_media_operations",
    name: "Social Media Operations",
    categoryStatus: "sellable",
    riskLevel: "medium_high",
    version: 4
  },
  "agent-passport create": {
    id: "agent_mira_competitor_intel_sandbox",
    passportStatus: "active",
    machineManifest: {
      inputSchema: ["competitorUrls", "targetAudience", "sourcePolicy"],
      outputSchema: ["topicBacklog", "evidenceIndex", "buyerSummary"],
      tools: ["read_public_url", "write_generated_artifact"]
    },
    version: 1,
    commandPreview: "alphaagents agent-passport create --json"
  },
  "agent-passport update": {
    id: "agent_mira_competitor_intel_sandbox",
    passportStatus: "active",
    version: 2,
    commandPreview: "alphaagents agent-passport update --json"
  },
  "agent-passport suspend": {
    id: "agent_mira_competitor_intel_sandbox",
    passportStatus: "suspended",
    version: 3,
    commandPreview: "alphaagents agent-passport suspend --json"
  },
  "agent-listing publish": {
    id: "listing_trial_mira_001",
    listingStatus: "published",
    version: 1,
    commandPreview: "alphaagents agent-listing publish --json"
  },
  "agent-listing update": {
    id: "listing_trial_mira_001",
    listingStatus: "published",
    version: 2,
    commandPreview: "alphaagents agent-listing update --json"
  },
  "agent-listing archive": {
    id: "listing_trial_mira_001",
    listingStatus: "archived",
    version: 3,
    commandPreview: "alphaagents agent-listing archive --json"
  },
  "rfp.create": {
    id: "rfp_demo_trial_001",
    tenantId: "org_demo_001",
    rfpStatus: "draft",
    packageTier: "trial",
    category: "US TikTok Shop sensitive-skin skincare",
    market: "US",
    budgetAmountMinor: 198000,
    currency: "CNY",
    version: 1
  },
  "rfp.publish": {
    id: "rfp_demo_trial_001",
    tenantId: "org_demo_001",
    rfpStatus: "published",
    packageTier: "trial",
    category: "US TikTok Shop sensitive-skin skincare",
    market: "US",
    budgetAmountMinor: 198000,
    currency: "CNY",
    version: 2
  },
  "rfp.cancel": {
    id: "rfp_demo_trial_001",
    tenantId: "org_demo_001",
    rfpStatus: "cancelled",
    packageTier: "trial",
    category: "US TikTok Shop sensitive-skin skincare",
    market: "US",
    budgetAmountMinor: 198000,
    currency: "CNY",
    version: 3
  },
  "proposal.submit": {
    id: "proposal_demo_trial_001",
    tenantId: "org_demo_001",
    proposalStatus: "submitted",
    rfpId: "rfp_demo_trial_001",
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    priceAmountMinor: 198000,
    currency: "CNY",
    version: 1
  },
  "proposal.accept": {
    id: "order_sandbox_trial_001",
    tenantId: "org_sandbox_buyer_001",
    rfpId: "rfp_sandbox_trial_001",
    proposalId: "proposal_sandbox_trial_001",
    buyerOrgId: "org_sandbox_buyer_001",
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    orderStatus: "created",
    ledgerStatus: "not_funded",
    acceptanceStatus: "not_ready",
    amountMinor: 198000,
    currency: "CNY",
    nextAction: {
      actorRole: "buyer",
      command: "alphaagents escrow fund",
      reason: "proposal accepted and order created"
    },
    evidenceCompleteness: 0,
    qaSummary: "waiting for funding",
    cliPreview: "alphaagents proposal accept --json",
    version: 2
  },
  "proposal.withdraw": {
    id: "proposal_demo_trial_001",
    tenantId: "org_demo_001",
    proposalStatus: "withdrawn",
    rfpId: "rfp_demo_trial_001",
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    priceAmountMinor: 198000,
    currency: "CNY",
    version: 2
  },
  "escrow.fund": {
    id: "order_sandbox_trial_001",
    tenantId: "org_sandbox_buyer_001",
    rfpId: "rfp_sandbox_trial_001",
    proposalId: "proposal_sandbox_trial_001",
    buyerOrgId: "org_sandbox_buyer_001",
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    orderStatus: "funded",
    ledgerStatus: "escrowed",
    acceptanceStatus: "qa_pending",
    amountMinor: 198000,
    currency: "CNY",
    nextAction: {
      actorRole: "operator",
      command: "alphaagents permission approve",
      reason: "payment confirmed"
    },
    evidenceCompleteness: 0.2,
    qaSummary: "funded and waiting for permission approval",
    cliPreview: "alphaagents escrow fund --json",
    version: 3
  },
  "acceptance.accept": {
    id: "order_sandbox_trial_001",
    tenantId: "org_sandbox_buyer_001",
    rfpId: "rfp_sandbox_trial_001",
    proposalId: "proposal_sandbox_trial_001",
    buyerOrgId: "org_sandbox_buyer_001",
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    orderStatus: "accepted",
    ledgerStatus: "locked",
    acceptanceStatus: "accepted",
    amountMinor: 198000,
    currency: "CNY",
    nextAction: {
      actorRole: "operator",
      command: "alphaagents escrow release",
      reason: "buyer accepted and finance release is now allowed"
    },
    evidenceCompleteness: 1,
    qaSummary: "QA pass 91%",
    cliPreview: "alphaagents acceptance accept --order order_sandbox_trial_001 --json",
    version: 8
  },
  "escrow.release": {
    id: "order_sandbox_trial_001",
    tenantId: "org_sandbox_buyer_001",
    rfpId: "rfp_sandbox_trial_001",
    proposalId: "proposal_sandbox_trial_001",
    buyerOrgId: "org_sandbox_buyer_001",
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    orderStatus: "released",
    ledgerStatus: "released",
    acceptanceStatus: "accepted",
    amountMinor: 198000,
    currency: "CNY",
    nextAction: {
      actorRole: "buyer",
      command: "alphaagents rating submit",
      reason: "release completed"
    },
    evidenceCompleteness: 1,
    qaSummary: "accepted and released",
    cliPreview: "alphaagents escrow release --json",
    version: 9
  },
  "escrow.partial-release": {
    id: "order_sandbox_dispute_003",
    tenantId: "org_sandbox_buyer_001",
    rfpId: "rfp_sandbox_dispute_003",
    proposalId: "proposal_sandbox_dispute_003",
    buyerOrgId: "org_sandbox_buyer_001",
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    orderStatus: "resolved",
    ledgerStatus: "partially_released",
    acceptanceStatus: "resolved",
    amountMinor: 198000,
    currency: "CNY",
    nextAction: {
      actorRole: "buyer",
      command: "alphaagents rating submit",
      reason: "partial release completed"
    },
    evidenceCompleteness: 0.92,
    qaSummary: "partial release after dispute decision",
    cliPreview: "alphaagents escrow partial-release --json",
    version: 10
  },
  "escrow.refund": {
    id: "order_sandbox_dispute_003",
    tenantId: "org_sandbox_buyer_001",
    rfpId: "rfp_sandbox_dispute_003",
    proposalId: "proposal_sandbox_dispute_003",
    buyerOrgId: "org_sandbox_buyer_001",
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    orderStatus: "refunded",
    ledgerStatus: "refunded",
    acceptanceStatus: "resolved",
    amountMinor: 198000,
    currency: "CNY",
    nextAction: {
      actorRole: "operator",
      command: "alphaagents evidence export",
      reason: "refund completed"
    },
    evidenceCompleteness: 0.7,
    qaSummary: "refunded after critical breach",
    cliPreview: "alphaagents escrow refund --json",
    version: 11
  },
  "permission.approve": {
    id: "grant_sandbox_trial_001",
    tenantId: "org_sandbox_buyer_001",
    orderId: "order_sandbox_trial_001",
    agentId: "agent_mira_competitor_intel_sandbox",
    grantStatus: "approved",
    toolAllowlist: ["read_public_url", "write_generated_artifact"],
    expiresAt: "2026-05-10T18:00:00+08:00",
    version: 2
  },
  "permission.deny": {
    id: "grant_sandbox_trial_001",
    tenantId: "org_sandbox_buyer_001",
    orderId: "order_sandbox_trial_001",
    agentId: "agent_mira_competitor_intel_sandbox",
    grantStatus: "denied",
    toolAllowlist: [],
    expiresAt: "2026-05-10T18:00:00+08:00",
    version: 2
  },
  "permission.revoke": {
    id: "grant_sandbox_trial_001",
    tenantId: "org_sandbox_buyer_001",
    orderId: "order_sandbox_trial_001",
    agentId: "agent_mira_competitor_intel_sandbox",
    grantStatus: "revoked",
    toolAllowlist: ["read_public_url"],
    expiresAt: "2026-05-10T18:00:00+08:00",
    version: 3
  },
  "run.start": {
    id: "run_sandbox_trial_001",
    tenantId: "org_sandbox_buyer_001",
    runStatus: "running",
    orderId: "order_sandbox_trial_001",
    agentId: "agent_mira_competitor_intel_sandbox",
    permissionGrantIds: ["grant_sandbox_trial_001"],
    failureReason: null,
    version: 5
  },
  "run.cancel": {
    id: "run_sandbox_trial_001",
    tenantId: "org_sandbox_buyer_001",
    runStatus: "cancelled",
    orderId: "order_sandbox_trial_001",
    agentId: "agent_mira_competitor_intel_sandbox",
    permissionGrantIds: ["grant_sandbox_trial_001"],
    failureReason: "operator cancelled",
    version: 6
  },
  "delivery.submit": {
    id: "delivery_sandbox_trial_001",
    tenantId: "org_sandbox_buyer_001",
    deliveryStatus: "submitted",
    orderId: "order_sandbox_trial_001",
    artifactRefs: ["ev_sandbox_delivery_pdf_001"],
    evidenceRefs: ["ev_sandbox_delivery_pdf_001"],
    criteriaMapping: ["competitor_coverage", "evidence_traceability"],
    version: 2
  },
  "delivery.qa_pass": {
    id: "order_sandbox_trial_001",
    tenantId: "org_sandbox_buyer_001",
    rfpId: "rfp_sandbox_trial_001",
    proposalId: "proposal_sandbox_trial_001",
    buyerOrgId: "org_sandbox_buyer_001",
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    orderStatus: "ready_for_acceptance",
    ledgerStatus: "locked",
    acceptanceStatus: "ready",
    amountMinor: 198000,
    currency: "CNY",
    nextAction: {
      actorRole: "buyer",
      command: "alphaagents acceptance accept",
      reason: "QA passed"
    },
    evidenceCompleteness: 1,
    qaSummary: "QA pass 91%",
    cliPreview: "alphaagents delivery qa-pass --json",
    version: 7
  },
  "delivery.qa_reject": {
    id: "order_sandbox_trial_001",
    tenantId: "org_sandbox_buyer_001",
    rfpId: "rfp_sandbox_trial_001",
    proposalId: "proposal_sandbox_trial_001",
    buyerOrgId: "org_sandbox_buyer_001",
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    orderStatus: "revision_requested",
    ledgerStatus: "locked",
    acceptanceStatus: "qa_pending",
    amountMinor: 198000,
    currency: "CNY",
    nextAction: {
      actorRole: "seller",
      command: "alphaagents delivery submit",
      reason: "QA rejected and bounded fix required"
    },
    evidenceCompleteness: 0.7,
    qaSummary: "QA rejected",
    cliPreview: "alphaagents delivery qa-reject --json",
    version: 6
  },
  "acceptance.request-revision": {
    id: "order_sandbox_revision_002",
    tenantId: "org_sandbox_buyer_001",
    rfpId: "rfp_sandbox_revision_002",
    proposalId: "proposal_sandbox_revision_002",
    buyerOrgId: "org_sandbox_buyer_001",
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    orderStatus: "revision_requested",
    ledgerStatus: "locked",
    acceptanceStatus: "revision_requested",
    amountMinor: 198000,
    currency: "CNY",
    nextAction: {
      actorRole: "seller",
      command: "alphaagents run start",
      reason: "buyer requested bounded revision"
    },
    evidenceCompleteness: 0.82,
    qaSummary: "bounded revision requested",
    cliPreview: "alphaagents acceptance request-revision --json",
    version: 8
  },
  "dispute.open": {
    id: "order_sandbox_dispute_003",
    tenantId: "org_sandbox_buyer_001",
    rfpId: "rfp_sandbox_dispute_003",
    proposalId: "proposal_sandbox_dispute_003",
    buyerOrgId: "org_sandbox_buyer_001",
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    orderStatus: "disputed",
    ledgerStatus: "locked",
    acceptanceStatus: "disputed",
    amountMinor: 198000,
    currency: "CNY",
    nextAction: {
      actorRole: "operator",
      command: "alphaagents dispute resolve",
      reason: "buyer dispute opened and finance remains frozen"
    },
    evidenceCompleteness: 0.92,
    qaSummary: "partial actionability gap under review",
    cliPreview: "alphaagents dispute open --order order_sandbox_dispute_003 --json",
    version: 9
  },
  "dispute.resolve": {
    id: "order_sandbox_dispute_003",
    tenantId: "org_sandbox_buyer_001",
    rfpId: "rfp_sandbox_dispute_003",
    proposalId: "proposal_sandbox_dispute_003",
    buyerOrgId: "org_sandbox_buyer_001",
    sellerId: "seller_harbor_growth_sandbox",
    agentId: "agent_mira_competitor_intel_sandbox",
    orderStatus: "resolved",
    ledgerStatus: "partially_released",
    acceptanceStatus: "resolved",
    amountMinor: 198000,
    currency: "CNY",
    nextAction: {
      actorRole: "finance",
      command: "alphaagents escrow partial-release",
      reason: "dispute resolved with weighted outcome"
    },
    evidenceCompleteness: 0.92,
    qaSummary: "dispute resolved",
    cliPreview: "alphaagents dispute resolve --json",
    version: 10
  },
  "rating.submit": {
    id: "rep_sandbox_trial_001",
    tenantId: "org_sandbox_buyer_001",
    eventStatus: "published",
    subjectType: "agent",
    subjectId: "agent_mira_competitor_intel_sandbox",
    sourceOrderId: "order_sandbox_trial_001",
    agentVersion: "1.0.0",
    categoryIds: ["social_media_operations", "intelligence_research"],
    ratingBreakdown: { outcome: 5, evidence: 5, speed: 4 },
    deliveryOutcome: "accepted",
    version: 2
  },
  "evidence.export": {
    exportId: "export_demo_001",
    tenantId: "org_sandbox_buyer_001",
    orderId: "order_sandbox_trial_001",
    evidenceCount: 2,
    redactionMode: "buyer_safe",
    status: "ready",
    hash: "sha256:exportdemo001"
  },
  "evidence.delete": {
    requestId: "delete_demo_001",
    tenantId: "org_sandbox_buyer_001",
    evidenceId: "ev_sandbox_delivery_pdf_001",
    status: "deleted",
    retentionOverride: false
  }
};

const contractToDemoKey = {
  "custom-project.request": "custom-project.request",
  "custom-project.confirm-milestone": "custom-project.confirm-milestone",
  "custom-project.submit-uat": "custom-project.submit-uat",
  "custom-project.create-change-order": "custom-project.create-change-order",
  "agent-app.install": "agent-app.install",
  "agent-app.record-usage": "agent-app.record-usage",
  "agent-app.exit": "agent-app.exit",
  "program.allocate-credit": "program.allocate-credit",
  "program.record-drawdown": "program.record-drawdown",
  "program.update-qbr": "program.update-qbr",
  "agent_category.create": "agent-category create",
  "agent_category.update": "agent-category update",
  "agent_category.archive": "agent-category archive",
  "agent_category.restore": "agent-category restore",
  "agent-category.create": "agent-category create",
  "agent-category.update": "agent-category update",
  "agent-category.archive": "agent-category archive",
  "agent-category.restore": "agent-category restore",
  "agent-passport.create": "agent-passport create",
  "agent-passport.update": "agent-passport update",
  "agent-passport.suspend": "agent-passport suspend",
  "agent-listing.publish": "agent-listing publish",
  "agent-listing.update": "agent-listing update",
  "agent-listing.archive": "agent-listing archive"
};

const customRuntimeCommandIds = {
  "agent-category create": true,
  "agent-category update": true,
  "agent-category archive": true,
  "agent-category restore": true,
  "agent-passport create": true,
  "agent-passport update": true,
  "agent-passport suspend": true,
  "agent-listing publish": true,
  "agent-listing update": true,
  "agent-listing archive": true
};

const actorRoleByCommand = {
  "buyer-org.setup": "buyer",
  "custom-project.request": "buyer",
  "custom-project.confirm-milestone": "operator",
  "custom-project.submit-uat": "seller",
  "custom-project.create-change-order": "buyer",
  "agent-app.install": "buyer",
  "agent-app.record-usage": "buyer",
  "agent-app.exit": "buyer",
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

const createCommands = new Set(["custom-project.request", "agent-app.install", "agent-category create", "agent-passport create", "rfp.create"]);

export function createDemoEnvelope(actorRole, payload) {
  return {
    commandId: "cmd_demo_001",
    actorId: actorRole === "system" ? "system_demo_001" : "user_demo_001",
    actorRole,
    sourceChannel: "cli",
    tenantId: "org_demo_001",
    tokenScopes: contract.scopes,
    idempotencyKey: "idempotency-demo-001",
    correlationId: "correlation-demo-001",
    expectedVersion: 1,
    payload
  };
}

export function runCommand(commandName, envelope, options = {}) {
  const normalized = contractToDemoKey[commandName] ?? commandName;
  const spec =
    contract.commands[commandName] ??
    {
      actorRoles: ["operator"],
      payloadRequired: [],
      sourceChannels: ["ui", "cli", "api"],
      scopeMode: "all"
    };

  if (!(normalized in demoDtos) && !(normalized in customRuntimeCommandIds)) {
    return fail("VALIDATION_FAILED", `Unknown command: ${commandName}`);
  }

  if (!spec.actorRoles.includes(envelope.actorRole)) {
    return fail("ACTOR_FORBIDDEN", `${envelope.actorRole} cannot call ${normalized}`);
  }

  if (normalized === "rfp.publish") {
    if (!("rfpId" in envelope.payload)) {
      envelope.payload.rfpId = demoDtos["rfp.publish"].id;
    }
    if (!("prohibitedSources" in envelope.payload)) {
      envelope.payload.prohibitedSources = [
        "production_account_login",
        "paid_account",
        "private_group",
        "ad_account",
        "fund_movement"
      ];
    }
  }

  const missingPayload = spec.payloadRequired.filter((field) => !(field in envelope.payload));
  if (missingPayload.length > 0) {
    return fail("VALIDATION_FAILED", `Missing payload fields: ${missingPayload.join(", ")}`);
  }

  const stateFile = options.stateFile ?? createTempStateFile("alphaagents-command-");
  if (!options.stateFile) resetRuntimeState(stateFile);
  const runtimeEnvelope = {
    ...envelope,
    idempotencyKey: envelope.idempotencyKey ?? `idempotency-${normalized}`,
    payload: normalizeRuntimePayload(normalized, envelope.payload)
  };

  if (options.prepare !== false) {
    const prepared = prepareRuntimeStateForCommand(normalized, runtimeEnvelope, stateFile);
    if (!prepared.ok) return prepared;
  }

  return executeRuntimeCommand(normalized, runtimeEnvelope, { stateFile });
}

function normalizeRuntimePayload(commandName, payload) {
  const normalized = { ...payload };
  const suffix = Math.random().toString(36).slice(2, 8);
  if (commandName === "agent-category create") {
    normalized.categoryId = `category_runtime_${suffix}`;
  }
  if (commandName === "agent-passport create") {
    normalized.agentId = `agent_runtime_${suffix}`;
  }
  if (commandName === "agent-listing publish" && normalized.listingId === defaultScopePayload.listingId) {
    normalized.listingId = `listing_runtime_${suffix}`;
  }
  return normalized;
}

export function buildSamplePayload(commandName) {
  const normalized = contractToDemoKey[commandName] ?? commandName;
  const catalogPayloads = {
    "buyer-org.setup": {
      buyerOrgId: "org_demo_001",
      requesterUserId: "user_demo_buyer_owner",
      acceptanceOwnerUserId: "user_demo_acceptance_owner",
      financeContactUserId: "user_demo_finance_owner",
      legalContactUserId: "user_demo_legal_owner",
      authorizedPayerId: "payer_demo_001",
      signerIds: ["signer_demo_001"],
      invoiceReadiness: "ready",
      scopeAcknowledgement: "accepted",
      contractingEntity: "NorthStar Beauty LLC",
      collectionEntity: "AlphaAgents Platform Ops LLC",
      invoiceIssuer: "AlphaAgents Platform Ops LLC",
      refundRemitter: "AlphaAgents Platform Ops LLC",
      subprocessors: ["Harbor Growth Studio"]
    },
    "custom-project.request": {
      projectId: defaultScopePayload.customProjectId,
      buyerOrgId: "org_demo_001",
      projectTitle: "NorthStar launch workflow agent",
      categoryId: "custom_agent_app",
      targetOutcome: "launch-ready managed workflow agent with buyer UAT",
      requestedBy: "user_demo_buyer_owner"
    },
    "custom-project.confirm-milestone": {
      projectId: defaultScopePayload.customProjectId,
      milestoneId: "milestone_design_freeze_001",
      milestoneName: "Design freeze",
      dueAt: "2026-05-20T18:00:00+08:00"
    },
    "custom-project.submit-uat": {
      projectId: defaultScopePayload.customProjectId,
      milestoneId: "milestone_design_freeze_001",
      executionSummary: "sandbox UAT flow completed",
      evidenceRefs: ["ev_sandbox_delivery_pdf_001"]
    },
    "custom-project.create-change-order": {
      projectId: defaultScopePayload.customProjectId,
      changeOrderId: "change_scope_001",
      requestedChange: "add private deployment checklist",
      impactSummary: "one extra review cycle"
    },
    "agent-app.install": {
      appId: "agent_app_harbor_growth_workbench",
      buyerOrgId: "org_demo_001",
      authorizedBy: "user_demo_buyer_owner",
      usageMode: "subscription"
    },
    "agent-app.record-usage": {
      installId: "app_install_demo_001",
      appId: "agent_app_harbor_growth_workbench",
      usageSummary: "weekly content sync completed with buyer-safe evidence",
      evidenceRefs: ["ev_sandbox_delivery_pdf_001"],
      executionRunId: "run_agent_app_usage_001",
      deliveryPackageId: "delivery_agent_app_usage_001",
      acceptanceReviewId: "review_agent_app_usage_001",
      acceptanceStatus: "usage_proof_recorded",
      financeEvidenceRefs: ["ev_sandbox_delivery_pdf_001"],
      reputationSubjectId: "agent_app_harbor_growth_workbench",
      reputationStatus: "pending_buyer_rating"
    },
    "agent-app.exit": {
      installId: "app_install_demo_001",
      exitReason: "quarterly review complete"
    },
    "program.allocate-credit": {
      programId: "program_northstar_growth_001",
      creditAmountMinor: 320000,
      reason: "quarterly top-up"
    },
    "program.record-drawdown": {
      programId: "program_northstar_growth_001",
      drawdownMinor: 120000,
      reason: "managed delivery batch 01"
    },
    "program.update-qbr": {
      programId: "program_northstar_growth_001",
      qbrStatus: "ready_for_review"
    },
    "agent-category create": {
      categoryId: defaultScopePayload.categoryId,
      name: "Social Media Operations",
      riskLevel: "medium_high",
      defaultPermissionTemplateId: "perm_social_readonly_v1",
      defaultAcceptanceTemplateId: "acceptance_social_result_v1",
      opsOwner: "ops-social-alphaagents",
      riskOwner: "risk-social-alphaagents"
    },
    "agent-category update": {
      categoryId: defaultScopePayload.categoryId,
      patch: { riskLevel: "medium_high" }
    },
    "agent-category archive": {
      categoryId: defaultScopePayload.categoryId,
      archiveReason: "cleanup"
    },
    "agent-category restore": {
      categoryId: defaultScopePayload.categoryId,
      restoreReason: "re-enabled"
    },
    "agent-passport create": {
      agentId: defaultScopePayload.agentId,
      sellerId: defaultScopePayload.sellerId,
      categoryIds: ["social_media_operations"],
      manifestVersion: 1,
      machineManifest: {
        inputSchema: ["competitorUrls", "targetAudience", "sourcePolicy"],
        outputSchema: ["topicBacklog", "evidenceIndex", "buyerSummary"],
        tools: ["read_public_url", "write_generated_artifact"]
      }
    },
    "agent-passport update": {
      agentId: defaultScopePayload.agentId,
      patch: { version: "1.0.1" }
    },
    "agent-passport suspend": {
      agentId: defaultScopePayload.agentId,
      suspendReason: "manual review"
    },
    "agent-listing publish": {
      listingId: defaultScopePayload.listingId,
      agentId: defaultScopePayload.agentId,
      categoryIds: ["social_media_operations"],
      priceAmountMinor: 198000,
      acceptanceTemplateId: "acceptance_social_result_v1",
      permissionTemplateId: "perm_social_readonly_v1",
      deliveryHours: 48,
      capacityAvailable: 3
    },
    "agent-listing update": {
      listingId: defaultScopePayload.listingId,
      patch: { priceAmountMinor: 198000 }
    },
    "agent-listing archive": {
      listingId: defaultScopePayload.listingId,
      archiveReason: "manual cleanup"
    }
  };

  const transactionPayloads = {
    "rfp.create": {
      sku: "cross_border_competitor_topic_pack",
      packageTier: "trial",
      category: "US TikTok Shop sensitive-skin skincare",
      market: "US",
      channels: ["tiktok_shop_public", "instagram_public", "amazon_public"],
      language: "zh-CN analysis with English source labels",
      budgetAmountMinor: 198000,
      currency: "CNY",
      deliverableFormat: ["pdf", "md", "csv"]
    },
    "rfp.publish": {
      acceptanceTemplateId: "acceptance_template_trial_v1",
      competitorsOrDiscoveryRule: "Use 5 named competitors",
      prohibitedSources: [
        "production_account_login",
        "paid_account",
        "private_group",
        "ad_account",
        "fund_movement"
      ],
      deadlineAt: "2026-05-10T18:00:00+08:00",
      packageTier: "trial"
    },
    "rfp.cancel": {
      rfpId: defaultScopePayload.rfpId,
      cancelReason: "buyer withdrew"
    },
    "proposal.submit": {
      rfpId: defaultScopePayload.rfpId,
      sellerId: defaultScopePayload.sellerId,
      agentId: defaultScopePayload.agentId,
      priceAmountMinor: 198000,
      deliveryHours: 48,
      includedScope: ["5 competitors", "15 topic ideas"],
      evidenceStandard: "Every key claim maps to evidence",
      responsibleOwner: "project-owner@harbor-growth.example",
      capacityReservedUntil: "2026-05-10T18:00:00+08:00"
    },
    "proposal.accept": {
      proposalId: defaultScopePayload.proposalId,
      termsSnapshot: "trial_v1_terms"
    },
    "proposal.withdraw": {
      proposalId: defaultScopePayload.proposalId,
      withdrawReason: "seller withdrew"
    },
    "escrow.fund": {
      orderId: defaultScopePayload.orderId,
      paymentRef: "sandbox_payment_ref_001",
      receivedAt: "2026-05-08T20:00:00+08:00",
      receivedBy: "user_finance_sandbox_001"
    },
    "escrow.release": {
      orderId: defaultScopePayload.orderId,
      releaseReason: "accepted",
      financeEvidenceRef: "ev_sandbox_delivery_pdf_001"
    },
    "escrow.partial-release": {
      orderId: "order_sandbox_dispute_003",
      releaseAmountMinor: 140000,
      refundAmountMinor: 58000,
      decisionRef: "decision_dispute_001"
    },
    "escrow.refund": {
      orderId: "order_sandbox_dispute_003",
      refundAmountMinor: 198000,
      refundReason: "critical breach",
      financeEvidenceRef: "ev_sandbox_dispute_001"
    },
    "permission.approve": {
      grantId: defaultScopePayload.grantId,
      toolAllowlist: ["read_public_url", "write_generated_artifact"],
      expiresAt: "2026-05-10T18:00:00+08:00",
      approvalReason: "trial lane"
    },
    "permission.deny": {
      grantId: defaultScopePayload.grantId,
      denyReason: "high-risk tool request"
    },
    "permission.revoke": {
      grantId: defaultScopePayload.grantId,
      revocationReason: "manual review"
    },
    "run.start": {
      orderId: defaultScopePayload.orderId,
      permissionGrantIds: [defaultScopePayload.grantId]
    },
    "run.cancel": {
      runId: defaultScopePayload.runId,
      cancelReason: "operator stopped run"
    },
    "delivery.submit": {
      orderId: defaultScopePayload.orderId,
      executionRunIds: [defaultScopePayload.runId],
      artifactRefs: ["ev_sandbox_delivery_pdf_001"],
      evidenceRefs: ["ev_sandbox_delivery_pdf_001"],
      criteriaMapping: ["competitor_coverage"],
      knownLimitations: ["sandbox only"]
    },
    "delivery.qa_pass": {
      deliveryPackageId: defaultScopePayload.deliveryPackageId,
      qaChecklistId: "qa_trial_001",
      sampledFacts: ["fact_01", "fact_02"]
    },
    "delivery.qa_reject": {
      deliveryPackageId: defaultScopePayload.deliveryPackageId,
      failedItems: ["evidence_traceability"],
      rejectReason: "missing evidence",
      fixSlaHours: 6
    },
    "acceptance.accept": {
      orderId: defaultScopePayload.orderId,
      deliveryPackageId: defaultScopePayload.deliveryPackageId,
      criteriaConfirmations: ["competitor_coverage", "evidence_traceability", "topic_actionability"],
      criteriaScores: {
        competitor_coverage: 20,
        evidence_traceability: 24,
        topic_actionability: 18
      },
      decisionReason: "buyer accepted"
    },
    "acceptance.request-revision": {
      orderId: "order_sandbox_revision_002",
      deliveryPackageId: "delivery_sandbox_revision_002",
      failedCriteria: ["topic_actionability"],
      requestedFixes: ["increase usable topics"],
      decisionReason: "needs revision"
    },
    "dispute.open": {
      orderId: "order_sandbox_dispute_003",
      deliveryPackageId: "delivery_sandbox_dispute_003",
      disputeReason: "seven topics required buyer-side rewriting",
      evidenceRefs: ["ev_sandbox_dispute_001"]
    },
    "dispute.resolve": {
      orderId: "order_sandbox_dispute_003",
      decision: "partial_release",
      criteriaWeights: { topic_actionability: 7000 },
      releaseAmountMinor: 140000,
      refundAmountMinor: 58000,
      operatorReason: "partial acceptance",
      evidenceRefs: ["ev_sandbox_dispute_001"]
    },
    "rating.submit": {
      orderId: defaultScopePayload.orderId,
      subjectType: "agent",
      subjectId: defaultScopePayload.agentId,
      agentVersion: "1.0.0",
      categoryIds: ["social_media_operations", "intelligence_research"],
      ratingBreakdown: { outcome: 5, evidence: 5, speed: 4 },
      deliveryOutcome: "accepted"
    },
    "evidence.export": {
      orderId: defaultScopePayload.orderId,
      evidenceRefs: ["ev_sandbox_delivery_pdf_001"],
      exportReason: "buyer review",
      redactionMode: "buyer_safe"
    },
    "evidence.delete": {
      evidenceId: defaultScopePayload.evidenceId,
      deletionReason: "retention policy",
      retentionOverride: false
    }
  };

  return catalogPayloads[normalized] ?? transactionPayloads[normalized] ?? {};
}

function prepareRuntimeStateForCommand(commandName, envelope, stateFile) {
  const setup = runtimeSetupByCommand[commandName];
  if (!setup) {
    envelope.expectedVersion = expectedVersionFor(commandName, envelope.payload, stateFile);
    return { ok: true };
  }
  return setup(envelope, stateFile);
}

const runtimeSetupByCommand = {
  "rfp.publish": preparePublishedRfpTarget,
  "proposal.submit": prepareOpenProposalRfpTarget,
  "rfp.cancel": preparePublishedRfpTarget,
  "proposal.accept": prepareSubmittedProposalTarget,
  "proposal.withdraw": prepareSubmittedProposalTarget,
  "escrow.fund": prepareCreatedOrderTarget,
  "permission.approve": prepareFundedOrderTarget,
  "permission.deny": prepareFundedOrderTarget,
  "permission.revoke": prepareFundedOrderTarget,
  "run.start": prepareApprovedGrantTarget,
  "run.cancel": prepareStartedRunTarget,
  "delivery.submit": prepareStartedRunTarget,
  "delivery.qa_pass": prepareSubmittedDeliveryTarget,
  "delivery.qa_reject": prepareSubmittedDeliveryTarget,
  "acceptance.accept": prepareQaPassedOrderTarget,
  "acceptance.request-revision": prepareQaPassedOrderTarget,
  "escrow.release": prepareAcceptedOrderTarget,
  "rating.submit": prepareReleasedOrderTarget,
  "evidence.export": prepareReleasedOrderTarget,
  "dispute.open": prepareQaPassedOrderTarget,
  "dispute.resolve": prepareDisputedOrderTarget,
  "escrow.partial-release": prepareResolvedDisputeTarget,
  "escrow.refund": prepareDisputedOrderTarget,
  "evidence.delete": prepareEvidenceDeleteTarget,
  "custom-project.confirm-milestone": prepareCustomProjectTarget,
  "custom-project.submit-uat": prepareCustomProjectMilestoneTarget,
  "custom-project.create-change-order": prepareCustomProjectTarget,
  "agent-app.record-usage": prepareAgentAppInstallTarget,
  "agent-app.exit": prepareAgentAppInstallTarget
};

function preparePublishedRfpTarget(envelope, stateFile) {
  let rfp = latestOpenRfp(stateFile, ["draft", "published", "quoting"]);
  if (!rfp) {
    runRuntimeSetup("rfp.create", "buyer", buildSamplePayload("rfp.create"), stateFile, { expectedVersion: 0 });
    rfp = latest(loadRuntimeState(stateFile).rfps);
  }
  envelope.payload.rfpId = rfp.id;
  envelope.expectedVersion = rfp.version;
  return { ok: true };
}

function prepareSubmittedProposalTarget(envelope, stateFile) {
  ensureBuyerReady(stateFile);
  const rfp = createPublishedRfp(stateFile);
  runRuntimeSetup(
    "proposal.submit",
    "seller",
    {
      ...buildSamplePayload("proposal.submit"),
      rfpId: rfp.id
    },
    stateFile,
    { expectedVersion: 2 }
  );
  const proposal = latest(loadRuntimeState(stateFile).proposals);
  envelope.payload.proposalId = proposal.id;
  envelope.expectedVersion = proposal.version;
  return { ok: true };
}

function prepareOpenProposalRfpTarget(envelope, stateFile) {
  const rfp = latestOpenRfp(stateFile, ["published", "quoting"]) ?? createPublishedRfp(stateFile);
  envelope.payload.rfpId = rfp.id;
  envelope.expectedVersion = rfp.version;
  return { ok: true };
}

function prepareCreatedOrderTarget(envelope, stateFile) {
  const order = createOrder(stateFile);
  envelope.payload.orderId = order.id;
  envelope.expectedVersion = order.version;
  return { ok: true };
}

function prepareFundedOrderTarget(envelope, stateFile) {
  const order = createFundedOrder(stateFile);
  const grant = latest(loadRuntimeState(stateFile).grants);
  envelope.payload.orderId = order.id;
  envelope.payload.grantId = grant.id;
  envelope.expectedVersion = grant.version;
  return { ok: true };
}

function prepareApprovedGrantTarget(envelope, stateFile) {
  const { order, grant } = createApprovedGrant(stateFile);
  envelope.payload.orderId = order.id;
  envelope.payload.permissionGrantIds = [grant.id];
  envelope.payload.grantId = grant.id;
  envelope.expectedVersion = order.version;
  return { ok: true };
}

function prepareStartedRunTarget(envelope, stateFile) {
  const run = createStartedRun(stateFile);
  envelope.payload.runId = run.id;
  if (!("cancelReason" in envelope.payload)) {
    envelope.payload.orderId = run.orderId;
    envelope.payload.executionRunIds = [run.id];
  }
  envelope.expectedVersion =
    "cancelReason" in envelope.payload ? run.version : loadRuntimeState(stateFile).orders.find((order) => order.id === run.orderId).version;
  return { ok: true };
}

function prepareSubmittedDeliveryTarget(envelope, stateFile) {
  const delivery = createSubmittedDelivery(stateFile);
  envelope.payload.deliveryPackageId = delivery.id;
  envelope.expectedVersion = delivery.version;
  return { ok: true };
}

function prepareQaPassedOrderTarget(envelope, stateFile) {
  const { order, delivery } = createQaPassedOrder(stateFile);
  envelope.payload.orderId = order.id;
  envelope.payload.deliveryPackageId = delivery.id;
  envelope.expectedVersion = order.version;
  return { ok: true };
}

function prepareAcceptedOrderTarget(envelope, stateFile) {
  const order = createAcceptedOrder(stateFile);
  envelope.payload.orderId = order.id;
  envelope.expectedVersion = order.version;
  return { ok: true };
}

function prepareReleasedOrderTarget(envelope, stateFile) {
  const order = createReleasedOrder(stateFile);
  envelope.payload.orderId = order.id;
  envelope.expectedVersion = order.version;
  return { ok: true };
}

function prepareDisputedOrderTarget(envelope, stateFile) {
  const { order, delivery } = createDisputedOrder(stateFile);
  envelope.payload.orderId = order.id;
  envelope.payload.deliveryPackageId = delivery.id;
  envelope.expectedVersion = order.version;
  return { ok: true };
}

function prepareResolvedDisputeTarget(envelope, stateFile) {
  const order = createResolvedDispute(stateFile);
  envelope.payload.orderId = order.id;
  envelope.expectedVersion = order.version;
  return { ok: true };
}

function prepareEvidenceDeleteTarget(envelope, stateFile) {
  const evidence = loadRuntimeState(stateFile).evidenceRecords.find((record) => record.id === envelope.payload.evidenceId);
  if (evidence?.tenantId) envelope.tenantId = evidence.tenantId;
  envelope.expectedVersion = expectedVersionFor("evidence.delete", envelope.payload, stateFile);
  return { ok: true };
}

function prepareCustomProjectTarget(envelope, stateFile) {
  runRuntimeSetup("custom-project.request", "buyer", buildSamplePayload("custom-project.request"), stateFile, { expectedVersion: 0 });
  const project = latest(loadRuntimeState(stateFile).customProjects);
  envelope.payload.projectId = project.id;
  envelope.expectedVersion = project.version;
  return { ok: true };
}

function prepareCustomProjectMilestoneTarget(envelope, stateFile) {
  prepareCustomProjectTarget(envelope, stateFile);
  runRuntimeSetup(
    "custom-project.confirm-milestone",
    "operator",
    {
      ...buildSamplePayload("custom-project.confirm-milestone"),
      projectId: envelope.payload.projectId
    },
    stateFile,
    { expectedVersion: 1 }
  );
  const project = latest(loadRuntimeState(stateFile).customProjects);
  envelope.payload.projectId = project.id;
  envelope.payload.milestoneId = project.milestones[0].milestoneId;
  envelope.expectedVersion = project.version;
  return { ok: true };
}

function prepareAgentAppInstallTarget(envelope, stateFile) {
  runRuntimeSetup("agent-app.install", "buyer", buildSamplePayload("agent-app.install"), stateFile, { expectedVersion: 0 });
  const install = latest(loadRuntimeState(stateFile).appInstalls);
  envelope.payload.installId = install.id;
  envelope.payload.appId = install.appId;
  envelope.expectedVersion = install.version;
  return { ok: true };
}

function createPublishedRfp(stateFile) {
  let rfp = latestOpenRfp(stateFile, ["published", "quoting"]);
  if (rfp) return rfp;
  rfp = latestOpenRfp(stateFile, ["draft"]);
  if (!rfp) {
    runRuntimeSetup("rfp.create", "buyer", buildSamplePayload("rfp.create"), stateFile, { expectedVersion: 0 });
    rfp = latest(loadRuntimeState(stateFile).rfps);
  }
  runRuntimeSetup(
    "rfp.publish",
    "buyer",
    {
      ...buildSamplePayload("rfp.publish"),
      rfpId: rfp.id
    },
    stateFile,
    { expectedVersion: rfp.version }
  );
  return latest(loadRuntimeState(stateFile).rfps);
}

function createOrder(stateFile) {
  ensureBuyerReady(stateFile);
  const proposalEnvelope = { payload: buildSamplePayload("proposal.accept"), expectedVersion: 1 };
  prepareSubmittedProposalTarget(proposalEnvelope, stateFile);
  runRuntimeSetup("proposal.accept", "buyer", proposalEnvelope.payload, stateFile, { expectedVersion: proposalEnvelope.expectedVersion });
  return latest(loadRuntimeState(stateFile).orders);
}

function createFundedOrder(stateFile) {
  const order = createOrder(stateFile);
  runRuntimeSetup(
    "escrow.fund",
    "buyer",
    {
      ...buildSamplePayload("escrow.fund"),
      orderId: order.id
    },
    stateFile,
    { expectedVersion: order.version }
  );
  return latest(loadRuntimeState(stateFile).orders);
}

function createApprovedGrant(stateFile) {
  const order = createFundedOrder(stateFile);
  const grant = latest(loadRuntimeState(stateFile).grants);
  runRuntimeSetup(
    "permission.approve",
    "operator",
    {
      ...buildSamplePayload("permission.approve"),
      grantId: grant.id
    },
    stateFile,
    { expectedVersion: grant.version }
  );
  const state = loadRuntimeState(stateFile);
  return {
    order: state.orders.find((entry) => entry.id === order.id),
    grant: state.grants.find((entry) => entry.id === grant.id)
  };
}

function createStartedRun(stateFile) {
  const { order, grant } = createApprovedGrant(stateFile);
  runRuntimeSetup(
    "run.start",
    "seller",
    {
      ...buildSamplePayload("run.start"),
      orderId: order.id,
      permissionGrantIds: [grant.id]
    },
    stateFile,
    { expectedVersion: order.version }
  );
  return latest(loadRuntimeState(stateFile).runs);
}

function createSubmittedDelivery(stateFile) {
  const run = createStartedRun(stateFile);
  runRuntimeSetup(
    "delivery.submit",
    "seller",
    {
      ...buildSamplePayload("delivery.submit"),
      orderId: run.orderId,
      executionRunIds: [run.id]
    },
    stateFile,
    { expectedVersion: loadRuntimeState(stateFile).orders.find((order) => order.id === run.orderId).version }
  );
  return latest(loadRuntimeState(stateFile).deliveries);
}

function createQaPassedOrder(stateFile) {
  const delivery = createSubmittedDelivery(stateFile);
  runRuntimeSetup(
    "delivery.qa_pass",
    "operator",
    {
      ...buildSamplePayload("delivery.qa_pass"),
      deliveryPackageId: delivery.id
    },
    stateFile,
    { expectedVersion: delivery.version }
  );
  const state = loadRuntimeState(stateFile);
  return {
    order: state.orders.find((order) => order.id === delivery.orderId),
    delivery: state.deliveries.find((entry) => entry.id === delivery.id)
  };
}

function createAcceptedOrder(stateFile) {
  const { order, delivery } = createQaPassedOrder(stateFile);
  runRuntimeSetup(
    "acceptance.accept",
    "buyer",
    {
      ...buildSamplePayload("acceptance.accept"),
      orderId: order.id,
      deliveryPackageId: delivery.id
    },
    stateFile,
    { expectedVersion: order.version }
  );
  return latest(loadRuntimeState(stateFile).orders);
}

function createReleasedOrder(stateFile) {
  const order = createAcceptedOrder(stateFile);
  runRuntimeSetup(
    "escrow.release",
    "operator",
    {
      ...buildSamplePayload("escrow.release"),
      orderId: order.id
    },
    stateFile,
    { expectedVersion: order.version }
  );
  return latest(loadRuntimeState(stateFile).orders);
}

function createDisputedOrder(stateFile) {
  const { order, delivery } = createQaPassedOrder(stateFile);
  runRuntimeSetup(
    "dispute.open",
    "buyer",
    {
      ...buildSamplePayload("dispute.open"),
      orderId: order.id,
      deliveryPackageId: delivery.id
    },
    stateFile,
    { expectedVersion: order.version }
  );
  const state = loadRuntimeState(stateFile);
  return {
    order: state.orders.find((entry) => entry.id === order.id),
    delivery: state.deliveries.find((entry) => entry.id === delivery.id)
  };
}

function createResolvedDispute(stateFile) {
  const { order } = createDisputedOrder(stateFile);
  runRuntimeSetup(
    "dispute.resolve",
    "operator",
    {
      ...buildSamplePayload("dispute.resolve"),
      orderId: order.id
    },
    stateFile,
    { expectedVersion: order.version }
  );
  return latest(loadRuntimeState(stateFile).orders);
}

function runRuntimeSetup(commandName, actorRole, payload, stateFile, overrides = {}) {
  const result = executeRuntimeCommand(
    commandName,
    {
      ...createDemoEnvelope(actorRole, payload),
      commandId: `cmd_setup_${commandName.replaceAll(/[^a-z0-9]+/gi, "_")}_${Math.random().toString(36).slice(2)}`,
      idempotencyKey: `setup-${commandName}-${Math.random().toString(36).slice(2)}`,
      expectedVersion: overrides.expectedVersion ?? expectedVersionFor(commandName, payload, stateFile),
      payload
    },
    { stateFile }
  );
  if (!result.ok) {
    throw new Error(`Runtime setup failed for ${commandName}: ${result.errorCode} ${result.message}`);
  }
  return result;
}

function expectedVersionFor(commandName, payload, stateFile) {
  if (createCommands.has(commandName)) return 0;
  const state = loadRuntimeState(stateFile);
  const aggregate = findAggregateForCommand(commandName, payload, state);
  if (commandName === "agent-listing publish" && !aggregate) return 0;
  return aggregate?.version ?? 1;
}

function ensureBuyerReady(stateFile) {
  const state = loadRuntimeState(stateFile);
  const buyer = state.buyers.find((entry) => entry.id === "org_demo_001");
  if (
    buyer?.legalContactUserId &&
    buyer?.contractingEntity &&
    buyer?.collectionEntity &&
    buyer?.invoiceIssuer &&
    buyer?.refundRemitter
  ) {
    return;
  }
  runRuntimeSetup("buyer-org.setup", "buyer", buildSamplePayload("buyer-org.setup"), stateFile, {
    expectedVersion: buyer?.version ?? 1
  });
}

function findAggregateForCommand(commandName, payload, state) {
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
  return state[collection].find((entry) => entry[key] === value) ?? null;
}

function latest(collection) {
  return collection[collection.length - 1];
}

function latestOpenRfp(stateFile, statuses) {
  return loadRuntimeState(stateFile).rfps.filter((rfp) => statuses.includes(rfp.rfpStatus)).at(-1) ?? null;
}

function fail(errorCode, message) {
  return {
    ok: false,
    errorCode,
    message
  };
}
