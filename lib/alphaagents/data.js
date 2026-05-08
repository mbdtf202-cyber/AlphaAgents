import contract from "../../contracts/alphaagents.contract.json" with { type: "json" };
import orderFixtures from "../../design/visual-fixtures/orders.json" with { type: "json" };
import trialSnapshot from "../../evidence-packages/AA-SANDBOX-TRIAL-001/16-cli-api-ui-snapshots.json" with { type: "json" };
import revisionSnapshot from "../../evidence-packages/AA-SANDBOX-REVISION-002/16-cli-api-ui-snapshots.json" with { type: "json" };
import disputeSnapshot from "../../evidence-packages/AA-SANDBOX-DISPUTE-003/16-cli-api-ui-snapshots.json" with { type: "json" };
import trialReview from "../../evidence-packages/AA-SANDBOX-TRIAL-001/11-acceptance-review.json" with { type: "json" };
import revisionReview from "../../evidence-packages/AA-SANDBOX-REVISION-002/11-acceptance-review.json" with { type: "json" };
import disputeReview from "../../evidence-packages/AA-SANDBOX-DISPUTE-003/11-acceptance-review.json" with { type: "json" };
import trialLedger from "../../evidence-packages/AA-SANDBOX-TRIAL-001/12-finance-ledger.json" with { type: "json" };
import revisionLedger from "../../evidence-packages/AA-SANDBOX-REVISION-002/12-finance-ledger.json" with { type: "json" };
import disputeLedger from "../../evidence-packages/AA-SANDBOX-DISPUTE-003/12-finance-ledger.json" with { type: "json" };
import trialRun from "../../evidence-packages/AA-SANDBOX-TRIAL-001/06-execution-run.json" with { type: "json" };
import revisionRun from "../../evidence-packages/AA-SANDBOX-REVISION-002/06-execution-run.json" with { type: "json" };
import disputeRun from "../../evidence-packages/AA-SANDBOX-DISPUTE-003/06-execution-run.json" with { type: "json" };
import trialProposal from "../../evidence-packages/AA-SANDBOX-TRIAL-001/03-proposal.json" with { type: "json" };
import revisionProposal from "../../evidence-packages/AA-SANDBOX-REVISION-002/03-proposal.json" with { type: "json" };
import disputeProposal from "../../evidence-packages/AA-SANDBOX-DISPUTE-003/03-proposal.json" with { type: "json" };
import trialRfp from "../../evidence-packages/AA-SANDBOX-TRIAL-001/02-rfp.json" with { type: "json" };
import revisionRfp from "../../evidence-packages/AA-SANDBOX-REVISION-002/02-rfp.json" with { type: "json" };
import disputeRfp from "../../evidence-packages/AA-SANDBOX-DISPUTE-003/02-rfp.json" with { type: "json" };
import trialReputation from "../../evidence-packages/AA-SANDBOX-TRIAL-001/13-reputation-event.json" with { type: "json" };
import revisionReputation from "../../evidence-packages/AA-SANDBOX-REVISION-002/13-reputation-event.json" with { type: "json" };
import disputeReputation from "../../evidence-packages/AA-SANDBOX-DISPUTE-003/13-reputation-event.json" with { type: "json" };
import trialGrants from "../../evidence-packages/AA-SANDBOX-TRIAL-001/05-risk-permission-grants.json" with { type: "json" };
import revisionGrants from "../../evidence-packages/AA-SANDBOX-REVISION-002/05-risk-permission-grants.json" with { type: "json" };
import disputeGrants from "../../evidence-packages/AA-SANDBOX-DISPUTE-003/05-risk-permission-grants.json" with { type: "json" };

const categories = [
  {
    categoryId: "finance",
    name: { en: "Finance & Research", "zh-CN": "金融与投研" },
    riskLevel: "regulated",
    defaultPermissionTemplateId: "perm_finance_readonly_v1",
    defaultAcceptanceTemplateId: "acceptance_finance_result_v1",
    opsOwner: "ops-finance-alphaagents",
    riskOwner: "risk-finance-alphaagents",
    categoryStatus: "sellable",
    supportedSupplyTypes: ["standard_agent", "managed_service_agent", "custom_agent"],
    tags: ["report", "reconciliation", "risk_monitoring"]
  },
  {
    categoryId: "social_media_operations",
    name: { en: "Social Media Operations", "zh-CN": "社媒运营与内容增长" },
    riskLevel: "medium_high",
    defaultPermissionTemplateId: "perm_social_readonly_v1",
    defaultAcceptanceTemplateId: "acceptance_social_result_v1",
    opsOwner: "ops-social-alphaagents",
    riskOwner: "risk-social-alphaagents",
    categoryStatus: "sellable",
    supportedSupplyTypes: ["standard_agent", "managed_service_agent", "agent_app", "squad"],
    tags: ["publishing", "analytics", "content"]
  },
  {
    categoryId: "intelligence_research",
    name: { en: "Intelligence & Research", "zh-CN": "情报与研究" },
    riskLevel: "medium",
    defaultPermissionTemplateId: "perm_intel_readonly_v1",
    defaultAcceptanceTemplateId: "acceptance_intel_result_v1",
    opsOwner: "ops-intel-alphaagents",
    riskOwner: "risk-intel-alphaagents",
    categoryStatus: "sellable",
    supportedSupplyTypes: ["standard_agent", "managed_service_agent", "custom_agent"],
    tags: ["research", "evidence_package", "report"]
  },
  {
    categoryId: "life_assistant",
    name: { en: "Life Assistant", "zh-CN": "生活助理与个人效率" },
    riskLevel: "medium",
    defaultPermissionTemplateId: "perm_life_assistant_v1",
    defaultAcceptanceTemplateId: "acceptance_task_result_v1",
    opsOwner: "ops-life-alphaagents",
    riskOwner: "risk-life-alphaagents",
    categoryStatus: "sellable",
    supportedSupplyTypes: ["standard_agent", "agent_app"],
    tags: ["planning", "personal_productivity", "tasks"]
  },
  {
    categoryId: "sales_customer_growth",
    name: { en: "Sales & Customer Growth", "zh-CN": "销售与客户增长" },
    riskLevel: "medium_high",
    defaultPermissionTemplateId: "perm_sales_growth_v1",
    defaultAcceptanceTemplateId: "acceptance_sales_result_v1",
    opsOwner: "ops-sales-alphaagents",
    riskOwner: "risk-sales-alphaagents",
    categoryStatus: "sellable",
    supportedSupplyTypes: ["standard_agent", "managed_service_agent", "agent_app"],
    tags: ["crm", "outreach", "growth"]
  },
  {
    categoryId: "enterprise_operations",
    name: { en: "Enterprise Operations", "zh-CN": "企业运营与流程自动化" },
    riskLevel: "medium_high",
    defaultPermissionTemplateId: "perm_enterprise_ops_v1",
    defaultAcceptanceTemplateId: "acceptance_enterprise_ops_v1",
    opsOwner: "ops-enterprise-alphaagents",
    riskOwner: "risk-enterprise-alphaagents",
    categoryStatus: "sellable",
    supportedSupplyTypes: ["managed_service_agent", "custom_agent", "agent_app", "squad"],
    tags: ["sop", "approvals", "tickets"]
  },
  {
    categoryId: "developer_it_ops",
    name: { en: "Developer & IT Ops", "zh-CN": "开发者与 IT 运维" },
    riskLevel: "high",
    defaultPermissionTemplateId: "perm_devops_readonly_v1",
    defaultAcceptanceTemplateId: "acceptance_devops_result_v1",
    opsOwner: "ops-devops-alphaagents",
    riskOwner: "risk-devops-alphaagents",
    categoryStatus: "sellable",
    supportedSupplyTypes: ["standard_agent", "managed_service_agent", "custom_agent", "agent_app"],
    tags: ["coding", "qa", "rollback"]
  },
  {
    categoryId: "legal_compliance_risk",
    name: { en: "Legal, Compliance & Risk", "zh-CN": "法务、合规与风险" },
    riskLevel: "regulated",
    defaultPermissionTemplateId: "perm_legal_readonly_v1",
    defaultAcceptanceTemplateId: "acceptance_legal_result_v1",
    opsOwner: "ops-legal-alphaagents",
    riskOwner: "risk-legal-alphaagents",
    categoryStatus: "sellable",
    supportedSupplyTypes: ["standard_agent", "managed_service_agent", "custom_agent"],
    tags: ["compliance", "policy", "audit"]
  },
  {
    categoryId: "data_bi_analytics",
    name: { en: "Data, BI & Analytics", "zh-CN": "数据分析与商业智能" },
    riskLevel: "medium",
    defaultPermissionTemplateId: "perm_bi_readonly_v1",
    defaultAcceptanceTemplateId: "acceptance_bi_result_v1",
    opsOwner: "ops-bi-alphaagents",
    riskOwner: "risk-bi-alphaagents",
    categoryStatus: "sellable",
    supportedSupplyTypes: ["standard_agent", "managed_service_agent", "agent_app"],
    tags: ["dashboard", "analytics", "forecasting"]
  },
  {
    categoryId: "education_knowledge",
    name: { en: "Education & Knowledge", "zh-CN": "教育、培训与知识管理" },
    riskLevel: "medium",
    defaultPermissionTemplateId: "perm_education_readonly_v1",
    defaultAcceptanceTemplateId: "acceptance_education_result_v1",
    opsOwner: "ops-education-alphaagents",
    riskOwner: "risk-education-alphaagents",
    categoryStatus: "sellable",
    supportedSupplyTypes: ["standard_agent", "agent_app", "custom_agent"],
    tags: ["courses", "knowledge_base", "assessment"]
  },
  {
    categoryId: "vertical_industry",
    name: { en: "Vertical Industry", "zh-CN": "行业垂直 Agent" },
    riskLevel: "high",
    defaultPermissionTemplateId: "perm_vertical_readonly_v1",
    defaultAcceptanceTemplateId: "acceptance_vertical_result_v1",
    opsOwner: "ops-vertical-alphaagents",
    riskOwner: "risk-vertical-alphaagents",
    categoryStatus: "sellable",
    supportedSupplyTypes: ["custom_agent", "managed_service_agent", "agent_app"],
    tags: ["healthcare", "real_estate", "manufacturing"]
  },
  {
    categoryId: "custom_agent_app",
    name: { en: "Custom Agent & Agent App", "zh-CN": "定制 Agent 与 Agent 原生 App" },
    riskLevel: "medium_high",
    defaultPermissionTemplateId: "perm_custom_agent_app_v1",
    defaultAcceptanceTemplateId: "acceptance_custom_agent_app_v1",
    opsOwner: "ops-custom-alphaagents",
    riskOwner: "risk-custom-alphaagents",
    categoryStatus: "sellable",
    supportedSupplyTypes: ["custom_agent", "agent_app", "squad", "embedded_agent"],
    tags: ["workflow_app", "private_deployment", "integration"]
  }
];

const agents = [
  {
    id: "agent_mira_competitor_intel_sandbox",
    slug: "mira-competitor-intel-agent",
    name: "Mira Competitor Intel Agent",
    supplyType: "standard_agent",
    sellerId: "seller_harbor_growth_sandbox",
    legalEntity: "Harbor Growth Studio",
    humanOwner: "project-owner@harbor-growth.example",
    categoryIds: ["social_media_operations", "intelligence_research"],
    tags: ["beauty", "research", "report", "evidence_package", "trial_first"],
    riskLabel: "read_only_only",
    proofStatus: "sandbox_verified",
    scoreSummary: { averageRating: 4.7, qaPassRate: 0.91, disputeRate: 0.04, onTimeRate: 0.91 },
    orderHistory: { completed: 14, revisions: 2, disputes: 1 },
    version: "1.0.0",
    manifestVersion: 1,
    unsupportedScenarios: [
      "production_account_login",
      "paid_account_scrape",
      "ad_spend_optimization",
      "fund_movement"
    ],
    machineManifest: {
      inputSchema: ["category", "market", "competitors", "outputLanguage", "acceptanceOwner"],
      outputSchema: ["DeliveryPackage", "EvidenceRef[]", "AcceptanceReview-ready summary"],
      tools: contract.security.runtimeToolPolicy.allowed,
      blockedTools: contract.security.runtimeToolPolicy.denied
    },
    deliveryModes: ["quick_order", "rfp", "program"],
    commandExamples: [
      "alphaagents proposal submit",
      "alphaagents run start --json",
      "alphaagents delivery submit --json"
    ],
    narrative:
      "Trial-first cross-border competitor intelligence agent for US beauty and personal-care teams. Produces reviewable evidence, QA-ready delivery packages, and bounded content topic sets."
  },
  {
    id: "agent_signal_claim_review",
    slug: "signal-claim-review-agent",
    name: "Signal Claim Review Agent",
    supplyType: "managed_service_agent",
    sellerId: "seller_cora_evidence_ops",
    legalEntity: "Cora Evidence Ops",
    humanOwner: "claims@cora.example",
    categoryIds: ["legal_compliance_risk", "social_media_operations"],
    tags: ["claim_review", "manual_review", "high_risk"],
    riskLabel: "manual_review_required",
    proofStatus: "sample_only",
    scoreSummary: { averageRating: 4.1, qaPassRate: 0.84, disputeRate: 0.08, onTimeRate: 0.87 },
    orderHistory: { completed: 9, revisions: 3, disputes: 2 },
    version: "0.9.2",
    manifestVersion: 1,
    unsupportedScenarios: ["legal_advice", "live_publishing"],
    machineManifest: {
      inputSchema: ["channel", "claimSet", "complianceContext"],
      outputSchema: ["reviewMemo", "riskFlags", "EvidenceRef[]"],
      tools: ["read_public_url", "write_generated_artifact", "write_evidence_metadata"],
      blockedTools: contract.security.runtimeToolPolicy.denied
    },
    deliveryModes: ["quick_order", "custom_project"],
    commandExamples: ["alphaagents agent-passport update --json", "alphaagents dispute open --json"],
    narrative:
      "High-sensitivity claim review lane with human backup and visible risk boundaries before any order starts."
  },
  {
    id: "agent_ops_program_orchestrator",
    slug: "ops-program-orchestrator",
    name: "Ops Program Orchestrator",
    supplyType: "squad",
    sellerId: "seller_alphaagents_platform_ops",
    legalEntity: "AlphaAgents Platform Ops",
    humanOwner: "ops-program@alphaagents.example",
    categoryIds: ["enterprise_operations", "custom_agent_app"],
    tags: ["program_ops", "credits", "qbr", "renewal"],
    riskLabel: "platform_controlled",
    proofStatus: "sandbox_verified",
    scoreSummary: { averageRating: 4.6, qaPassRate: 0.93, disputeRate: 0.02, onTimeRate: 0.95 },
    orderHistory: { completed: 18, revisions: 1, disputes: 0 },
    version: "1.2.0",
    manifestVersion: 2,
    unsupportedScenarios: ["unscoped_buyer_data_writeback"],
    machineManifest: {
      inputSchema: ["programId", "creditPolicy", "renewalRules"],
      outputSchema: ["ProgramWorkspace", "QBR packet", "renewal blockers"],
      tools: ["read_buyer_upload", "write_generated_artifact", "write_evidence_metadata"],
      blockedTools: contract.security.runtimeToolPolicy.denied
    },
    deliveryModes: ["program", "order_credit", "managed_service"],
    commandExamples: ["alphaagents evidence export --json", "alphaagents reputation show --json"],
    narrative:
      "Program-level control surface for recurring managed delivery, QBR generation, and renewal blocker visibility."
  }
];

const agentApps = [
  {
    id: "agent_app_harbor_growth_workbench",
    slug: "harbor-growth-workbench-app",
    name: "Harbor Growth Workbench App",
    appDeliveryMode: "agent_app",
    ownerAgentId: "agent_mira_competitor_intel_sandbox",
    sellerId: "seller_harbor_growth_sandbox",
    legalEntity: "Harbor Growth Studio",
    categoryIds: ["custom_agent_app", "social_media_operations"],
    pricingModes: ["subscription", "usage_based", "quick_order_assist"],
    installBoundary: "installation does not bypass platform permissions or acceptance",
    runtimeCallbacks: {
      startRun: "/api/runtime/events",
      submitDelivery: "/api/runtime/events",
      publishUsageProof: "/api/runtime/events"
    },
    acceptanceProof: [
      "ExecutionRun",
      "DeliveryPackage",
      "EvidenceRef",
      "AcceptanceReview",
      "ReputationEvent"
    ],
    exitMechanisms: ["cancel_subscription", "export_evidence_bundle", "revoke_permissions"],
    responsibilityChain: ["seller human owner", "platform risk policy", "buyer acceptance owner"],
    version: "1.0.0"
  }
];

const listings = [
  {
    listingId: "listing_trial_mira_001",
    agentId: "agent_mira_competitor_intel_sandbox",
    slug: "mira-trial-quick-order",
    title: "Trial Quick Order",
    supplyType: "standard_agent",
    categoryIds: ["social_media_operations", "intelligence_research"],
    billingMode: "per_order",
    startingPriceMinor: contract.packages.trial.priceAmountMinor,
    currency: "CNY",
    deliveryHours: contract.packages.trial.deliveryHours,
    qaPassRate: 0.91,
    disputeRate: 0.04,
    proofStatus: "sandbox_verified",
    capacityAvailable: 3,
    riskLevel: "medium_high",
    buyerScale: "team",
    sellerLegalEntity: "Harbor Growth Studio",
    humanOwner: "project-owner@harbor-growth.example",
    acceptanceTemplateId: "acceptance_template_trial_v1",
    permissionTemplateId: "perm_social_readonly_v1",
    listingStatus: "published",
    featured: true
  },
  {
    listingId: "listing_standard_mira_001",
    agentId: "agent_mira_competitor_intel_sandbox",
    slug: "mira-standard-order",
    title: "Standard Managed Result",
    supplyType: "managed_service_agent",
    categoryIds: ["social_media_operations", "intelligence_research"],
    billingMode: "per_order",
    startingPriceMinor: contract.packages.standard.priceAmountMinor,
    currency: "CNY",
    deliveryHours: contract.packages.standard.deliveryHours,
    qaPassRate: 0.91,
    disputeRate: 0.04,
    proofStatus: "sandbox_verified",
    capacityAvailable: 2,
    riskLevel: "medium_high",
    buyerScale: "smb",
    sellerLegalEntity: "Harbor Growth Studio",
    humanOwner: "project-owner@harbor-growth.example",
    acceptanceTemplateId: "acceptance_template_standard_v1",
    permissionTemplateId: "perm_social_readonly_v1",
    listingStatus: "published",
    featured: true
  },
  {
    listingId: "listing_app_harbor_001",
    agentId: "agent_app_harbor_growth_workbench",
    slug: "harbor-growth-workbench",
    title: "Harbor Growth Workbench App",
    supplyType: "agent_app",
    categoryIds: ["custom_agent_app", "social_media_operations"],
    billingMode: "subscription",
    startingPriceMinor: 880000,
    currency: "CNY",
    deliveryHours: 24,
    qaPassRate: 0.94,
    disputeRate: 0.02,
    proofStatus: "sample_only",
    capacityAvailable: 8,
    riskLevel: "medium_high",
    buyerScale: "enterprise",
    sellerLegalEntity: "Harbor Growth Studio",
    humanOwner: "ops@harbor-growth.example",
    acceptanceTemplateId: "acceptance_template_app_v1",
    permissionTemplateId: "perm_custom_agent_app_v1",
    listingStatus: "published",
    featured: true
  },
  {
    listingId: "listing_program_orchestrator_001",
    agentId: "agent_ops_program_orchestrator",
    slug: "ops-program-orchestrator",
    title: "Program Ops Orchestrator",
    supplyType: "squad",
    categoryIds: ["enterprise_operations", "custom_agent_app"],
    billingMode: "order_credit",
    startingPriceMinor: 2800000,
    currency: "CNY",
    deliveryHours: 72,
    qaPassRate: 0.93,
    disputeRate: 0.02,
    proofStatus: "sandbox_verified",
    capacityAvailable: 1,
    riskLevel: "medium_high",
    buyerScale: "enterprise",
    sellerLegalEntity: "AlphaAgents Platform Ops",
    humanOwner: "ops-program@alphaagents.example",
    acceptanceTemplateId: "acceptance_template_program_v1",
    permissionTemplateId: "perm_enterprise_ops_v1",
    listingStatus: "published",
    featured: false
  }
];

const sampleOrders = [
  { packageId: "AA-SANDBOX-TRIAL-001", snapshot: trialSnapshot, review: trialReview, ledger: trialLedger, run: trialRun, proposal: trialProposal, rfp: trialRfp, reputation: trialReputation, grants: trialGrants },
  { packageId: "AA-SANDBOX-REVISION-002", snapshot: revisionSnapshot, review: revisionReview, ledger: revisionLedger, run: revisionRun, proposal: revisionProposal, rfp: revisionRfp, reputation: revisionReputation, grants: revisionGrants },
  { packageId: "AA-SANDBOX-DISPUTE-003", snapshot: disputeSnapshot, review: disputeReview, ledger: disputeLedger, run: disputeRun, proposal: disputeProposal, rfp: disputeRfp, reputation: disputeReputation, grants: disputeGrants }
];

const evidenceRecords = [
  {
    id: "ev_sandbox_delivery_pdf_001",
    tenantId: "org_sandbox_buyer_001",
    orderId: "order_sandbox_trial_001",
    sourceType: "runtime_output",
    uri: "evidence-packages/AA-SANDBOX-TRIAL-001/07-delivery.pdf",
    hash: "sha256:8ad91f4aa31c",
    capturedAt: "2026-05-09T15:31:00+08:00",
    visibility: "buyer",
    redactionStatus: "none",
    retentionDays: 365,
    linkedClaimId: "topic_001",
    qaStatus: "passed"
  },
  {
    id: "ev_sandbox_topics_csv_001",
    tenantId: "org_sandbox_buyer_001",
    orderId: "order_sandbox_trial_001",
    sourceType: "runtime_output",
    uri: "evidence-packages/AA-SANDBOX-TRIAL-001/08-topics.csv",
    hash: "sha256:0fe22b99abc7",
    capturedAt: "2026-05-09T15:32:00+08:00",
    visibility: "buyer",
    redactionStatus: "redacted",
    retentionDays: 365,
    linkedClaimId: "topic_005",
    qaStatus: "passed"
  },
  {
    id: "ev_sandbox_dispute_001",
    tenantId: "org_sandbox_buyer_001",
    orderId: "order_sandbox_dispute_003",
    sourceType: "operator_note",
    uri: "evidence-packages/AA-SANDBOX-DISPUTE-003/17-buyer-audit.md",
    hash: "sha256:d551cb0c88aa",
    capturedAt: "2026-05-09T18:00:00+08:00",
    visibility: "operator",
    redactionStatus: "restricted",
    retentionDays: 365,
    linkedClaimId: "topic_015",
    qaStatus: "passed"
  }
];

const programWorkspaces = [
  {
    id: "program_northstar_growth_001",
    buyerOrgId: "org_demo_001",
    activeCreditMinor: 1800000,
    backlogValueMinor: 4800000,
    renewalBlockers: ["invoice entity pending", "security review queued"],
    qbrStatus: "in_progress"
  }
];

export {
  agentApps,
  agents,
  categories,
  contract,
  evidenceRecords,
  listings,
  orderFixtures,
  programWorkspaces,
  sampleOrders
};
