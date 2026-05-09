import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { executeRuntimeCommand } from "../lib/alphaagents/runtime-engine.js";
import { createTempStateFile, loadRuntimeState, resetRuntimeState } from "../lib/alphaagents/runtime-state.js";

const root = process.cwd();
const contract = JSON.parse(fs.readFileSync(path.join(root, "contracts", "alphaagents.contract.json"), "utf8"));
const packageDirs = [
  path.join(root, "evidence-packages", "AA-SANDBOX-TRIAL-001"),
  path.join(root, "evidence-packages", "AA-SANDBOX-REVISION-002"),
  path.join(root, "evidence-packages", "AA-SANDBOX-DISPUTE-003")
];

const packageExpectations = {
  "AA-SANDBOX-TRIAL-001": {
    suffix: "sandbox_trial_001",
    orderId: "order_sandbox_trial_001",
    rfpId: "rfp_sandbox_trial_001",
    proposalId: "proposal_sandbox_trial_001",
    grantId: "grant_sandbox_trial_001",
    runId: "run_sandbox_trial_001",
    reviewIdPrefix: "review_sandbox_trial_001",
    deliveryIdPrefix: "delivery_sandbox_trial_001",
    ledgerId: "ledger_sandbox_trial_001",
    reputationId: "rep_sandbox_trial_001",
    snapshotLedgerStatus: "released",
    snapshotAcceptanceStatus: "accepted",
    snapshotVersion: 9
  },
  "AA-SANDBOX-REVISION-002": {
    suffix: "sandbox_revision_002",
    orderId: "order_sandbox_revision_002",
    rfpId: "rfp_sandbox_revision_002",
    proposalId: "proposal_sandbox_revision_002",
    grantId: "grant_sandbox_revision_002",
    runId: "run_sandbox_revision_002",
    reviewIdPrefix: "review_sandbox_revision_002",
    deliveryIdPrefix: "delivery_sandbox_revision_002",
    ledgerId: "ledger_sandbox_revision_002",
    reputationId: "rep_sandbox_revision_002",
    snapshotLedgerStatus: "released",
    snapshotAcceptanceStatus: "accepted",
    snapshotVersion: 9
  },
  "AA-SANDBOX-DISPUTE-003": {
    suffix: "sandbox_dispute_003",
    orderId: "order_sandbox_dispute_003",
    rfpId: "rfp_sandbox_dispute_003",
    proposalId: "proposal_sandbox_dispute_003",
    grantId: "grant_sandbox_dispute_003",
    runId: "run_sandbox_dispute_003",
    reviewIdPrefix: "review_sandbox_dispute_003",
    deliveryIdPrefix: "delivery_sandbox_dispute_003",
    ledgerId: "ledger_sandbox_dispute_003",
    reputationId: "rep_sandbox_dispute_003",
    snapshotLedgerStatus: "partially_released",
    snapshotAcceptanceStatus: "resolved",
    snapshotVersion: 10
  }
};

function fail(message) {
  throw new Error(`[evidence] ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

for (const packageDir of packageDirs) {
  const packageName = path.basename(packageDir);
  const expected = packageExpectations[packageName];
  assert(fs.existsSync(packageDir), `${packageName} package directory is missing`);

  for (const file of contract.requiredEvidencePackageFiles) {
    const filePath = path.join(packageDir, file);
    assert(fs.existsSync(filePath), `${packageName} missing ${file}`);
    assert(fs.statSync(filePath).size > 0, `${packageName} has empty ${file}`);
  }

  const pdfHeader = fs.readFileSync(path.join(packageDir, "07-delivery.pdf"), "utf8").slice(0, 5);
  assert(pdfHeader === "%PDF-", `${packageName} 07-delivery.pdf must be a real PDF file`);
  const pdfStrings = spawnSync("strings", [path.join(packageDir, "07-delivery.pdf")], { encoding: "utf8" });
  assert(pdfStrings.status === 0, `${packageName} 07-delivery.pdf must be readable by strings`);
  assert(pdfStrings.stdout.includes(`Package: ${packageName}`), `${packageName} PDF must embed its own package id`);
  const xlsxHeader = fs.readFileSync(path.join(packageDir, "08-topics.xlsx")).subarray(0, 2).toString("utf8");
  assert(xlsxHeader === "PK", `${packageName} 08-topics.xlsx must be a real XLSX zip file`);

  const summary = fs.readFileSync(path.join(packageDir, "00-order-summary.md"), "utf8");
  assert(summary.includes("sandbox_verified"), `${packageName} must be marked sandbox_verified`);
  assert(summary.includes(expected.orderId), `${packageName} order summary must mention local orderId`);
  assert(!summary.includes("Evidence status: validated"), `${packageName} must not claim validated commercial evidence`);

  const rfp = JSON.parse(fs.readFileSync(path.join(packageDir, "02-rfp.json"), "utf8"));
  assert(rfp.id === expected.rfpId, `${packageName} rfp id drifted`);
  assert(rfp.rfpStatus === "ordered", `${packageName} rfpStatus must be ordered`);
  assert(rfp.packageTier === "trial", `${packageName} must stay Trial`);
  assert(rfp.market === "US", `${packageName} must keep US market ICP`);
  assert(rfp.competitors.length === contract.packages.trial.competitors, `${packageName} must contain 5 competitors`);

  const proposal = JSON.parse(fs.readFileSync(path.join(packageDir, "03-proposal.json"), "utf8"));
  assert(proposal.id === expected.proposalId, `${packageName} proposal id drifted`);
  assert(proposal.rfpId === expected.rfpId, `${packageName} proposal must point at local rfp`);
  assert(proposal.proposalStatus === "selected", `${packageName} proposalStatus must be selected`);

  const grants = JSON.parse(fs.readFileSync(path.join(packageDir, "05-risk-permission-grants.json"), "utf8"));
  assert(grants.every((grant) => grant.id === expected.grantId), `${packageName} grant id drifted`);
  assert(grants.every((grant) => grant.orderId === expected.orderId), `${packageName} grant orderId drifted`);
  assert(grants.every((grant) => grant.grantStatus === "approved"), `${packageName} grants must be approved`);
  assert(grants.every((grant) => !grant.toolAllowlist.includes("account_login")), `${packageName} grants must not include high-risk tools`);

  const run = JSON.parse(fs.readFileSync(path.join(packageDir, "06-execution-run.json"), "utf8"));
  assert(run.id === expected.runId, `${packageName} execution run id drifted`);
  assert(run.orderId === expected.orderId, `${packageName} execution run orderId drifted`);
  assert(run.permissionGrantIds.includes(expected.grantId), `${packageName} execution run must use local grant`);
  assert(run.runStatus === "succeeded", `${packageName} execution run must be succeeded`);

  const evidenceRows = fs.readFileSync(path.join(packageDir, "09-evidence-index.csv"), "utf8").trim().split(/\r?\n/);
  assert(evidenceRows.length >= contract.packages.trial.evidenceRefs + 1, `${packageName} evidence-index must contain at least 20 evidence refs plus header`);
  assert(evidenceRows[0] === "evidenceId,orderId,sourceType,sourceUrl,capturedAt,hash,redactionStatus,visibility,linkedClaimId,qaStatus", `${packageName} evidence-index header drifted`);
  const evidenceIds = new Set(evidenceRows.slice(1).map((row) => row.split(",")[0]));
  for (const row of evidenceRows.slice(1)) {
    const cols = row.split(",");
    assert(cols[1] === expected.orderId, `${packageName} evidence row orderId drifted`);
  }

  const topicsCsv = fs.readFileSync(path.join(packageDir, "08-topics.csv"), "utf8").trim().split(/\r?\n/);
  assert(topicsCsv.length === contract.packages.trial.topicIdeas + 1, `${packageName} topics CSV must contain exactly 15 rows plus header`);
  for (const row of topicsCsv.slice(1)) {
    const cols = row.match(/(".*?"|[^,]+)/g) ?? [];
    const refs = (cols[5] ?? "").replaceAll('"', "").split(";").filter(Boolean);
    assert(refs.length > 0, `${packageName} each topic must reference evidence`);
    for (const ref of refs) {
      assert(evidenceIds.has(ref), `${packageName} topic references missing evidence id ${ref}`);
    }
  }
  const unzip = spawnSync("unzip", ["-p", path.join(packageDir, "08-topics.xlsx"), "xl/sharedStrings.xml"], { encoding: "utf8" });
  assert(unzip.status === 0, `${packageName} xlsx must be readable by unzip`);
  assert(unzip.stdout.includes("topic_015"), `${packageName} xlsx must include all 15 topics`);

  const review = JSON.parse(fs.readFileSync(path.join(packageDir, "11-acceptance-review.json"), "utf8"));
  const ledger = JSON.parse(fs.readFileSync(path.join(packageDir, "12-finance-ledger.json"), "utf8"));
  const reputation = JSON.parse(fs.readFileSync(path.join(packageDir, "13-reputation-event.json"), "utf8"));
  assert(review.id.startsWith(expected.reviewIdPrefix), `${packageName} review id drifted`);
  assert(review.orderId === expected.orderId, `${packageName} review orderId drifted`);
  assert(review.deliveryPackageId.startsWith(expected.deliveryIdPrefix), `${packageName} delivery package id drifted`);
  assert(ledger.ledgerId === expected.ledgerId, `${packageName} ledger id drifted`);
  assert(ledger.orderId === expected.orderId, `${packageName} ledger orderId drifted`);
  assert(ledger.paymentRef, `${packageName} ledger must include paymentRef`);
  assert(ledger.invoiceStatus, `${packageName} ledger must include invoiceStatus`);
  assert(ledger.reconciliationStatus, `${packageName} ledger must include reconciliationStatus`);
  assert(ledger.reconciliationExport === `evidence-packages/${packageName}/12-finance-ledger.json`, `${packageName} ledger reconciliation export drifted`);
  assert(Array.isArray(ledger.financeEvidenceRefs) && ledger.financeEvidenceRefs.length > 0, `${packageName} ledger must include finance evidence refs`);
  assert(reputation.id === expected.reputationId, `${packageName} reputation id drifted`);
  assert(reputation.sourceOrderId === expected.orderId, `${packageName} reputation sourceOrderId drifted`);
  assert(reputation.eventStatus === "published", `${packageName} reputation event must be published`);

  const events = JSON.parse(fs.readFileSync(path.join(packageDir, "15-event-sequence.json"), "utf8"));
  const eventNames = events.events.map((event) => event.eventName);
  if (packageName === "AA-SANDBOX-TRIAL-001") {
    assert(review.reviewStatus === "accepted", "accepted sandbox reviewStatus must be accepted");
    assert(review.totalScore >= 85, "accepted sandbox order must score >= 85");
    assert(ledger.ledgerStatus === "released", "accepted sandbox ledgerStatus must be released");
    assert(ledger.releasedAmountMinor === ledger.orderAmountMinor, "accepted sandbox released amount must equal order amount");
    assert(ledger.refundAmountMinor === 0, "accepted sandbox refund amount must be zero");
    for (const expected of contract.goldenPath) {
      assert(eventNames.includes(expected), `golden event missing in accepted sandbox package: ${expected}`);
    }
  }
  if (packageName === "AA-SANDBOX-REVISION-002") {
    assert(eventNames.includes("RevisionRequested"), "revision package must include RevisionRequested");
    assert(eventNames.includes("RevisionRunStarted"), "revision package must include RevisionRunStarted");
    assert(review.reviewStatus === "accepted", "revision package must end accepted");
    assert(ledger.ledgerStatus === "released", "revision package must end released");
  }
  if (packageName === "AA-SANDBOX-DISPUTE-003") {
    assert(eventNames.includes("DisputeOpened"), "dispute package must include DisputeOpened");
    assert(eventNames.includes("DisputeResolved"), "dispute package must include DisputeResolved");
    assert(eventNames.includes("EscrowPartiallyReleased"), "dispute package must include EscrowPartiallyReleased");
    assert(review.reviewStatus === "disputed", "dispute package reviewStatus must be disputed");
    assert(ledger.ledgerStatus === "partially_released", "dispute package must end partially released");
    assert(ledger.releasedAmountMinor + ledger.refundAmountMinor + (ledger.penaltyAmountMinor ?? 0) === ledger.orderAmountMinor, "dispute package amounts must balance");
  }

  const snapshots = JSON.parse(fs.readFileSync(path.join(packageDir, "16-cli-api-ui-snapshots.json"), "utf8"));
  assert(JSON.stringify(snapshots.ui.orderDto) === JSON.stringify(snapshots.cli.orderDto), `${packageName} UI and CLI order snapshots must match`);
  assert(JSON.stringify(snapshots.api.orderDto) === JSON.stringify(snapshots.cli.orderDto), `${packageName} API and CLI order snapshots must match`);
  assert(snapshots.ui.orderDto.id === expected.orderId, `${packageName} snapshot order id drifted`);
  assert(snapshots.ui.orderDto.ledgerStatus === expected.snapshotLedgerStatus, `${packageName} snapshot ledgerStatus drifted`);
  assert(snapshots.ui.orderDto.acceptanceStatus === expected.snapshotAcceptanceStatus, `${packageName} snapshot acceptanceStatus drifted`);
  assert(snapshots.ui.orderDto.version === expected.snapshotVersion, `${packageName} snapshot version drifted`);
}

const buyerAudit = fs.readFileSync(path.join(root, "evidence-packages", "AA-SANDBOX-TRIAL-001", "17-buyer-audit.md"), "utf8");
assert(buyerAudit.includes("2-minute Audit"), "buyer audit instructions must exist");
assert(buyerAudit.includes("topic_015"), "buyer audit must include deterministic topic samples");

const runtimeStateFile = createTempStateFile("alphaagents-export-verify-");
resetRuntimeState(runtimeStateFile);

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
      "buyer:ratings.write",
      "seller:proposals.write",
      "seller:runs.write",
      "seller:deliveries.write",
      "operator:qa.write",
      "operator:permissions.write",
      "finance:ledger.write",
      "evidence:export"
    ],
    idempotencyKey: `idem_${Math.random().toString(36).slice(2, 10)}`,
    correlationId: `corr_${Math.random().toString(36).slice(2, 10)}`,
    expectedVersion: 1,
    payload,
    ...overrides
  };
}

function execute(commandName, actorRole, payload, overrides = {}) {
  const result = executeRuntimeCommand(commandName, envelope(actorRole, payload, overrides), { stateFile: runtimeStateFile });
  assert(result.ok, `runtime ${commandName} should succeed: ${result.errorCode ?? result.message}`);
  return result;
}

execute("buyer-org.setup", "buyer", {
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
});
const runtimeRfp = execute("rfp.create", "buyer", {
  sku: "cross_border_competitor_topic_pack",
  packageTier: "trial",
  category: "US TikTok Shop sensitive-skin skincare",
  market: "US",
  channels: ["tiktok_shop_public"],
  language: "zh-CN analysis with English source labels",
  budgetAmountMinor: 198000,
  currency: "CNY",
  deliverableFormat: ["pdf", "csv"]
}, { expectedVersion: 0 });
const runtimePublished = execute("rfp.publish", "buyer", {
  rfpId: runtimeRfp.dto.id,
  acceptanceTemplateId: "acceptance_template_trial_v1",
  competitorsOrDiscoveryRule: "Use 5 named competitors",
  prohibitedSources: ["production_account_login"],
  deadlineAt: "2026-05-10T18:00:00+08:00"
});
const runtimeProposal = execute("proposal.submit", "seller", {
  rfpId: runtimeRfp.dto.id,
  sellerId: "seller_harbor_growth_sandbox",
  agentId: "agent_mira_competitor_intel_sandbox",
  priceAmountMinor: 198000,
  deliveryHours: 48,
  includedScope: ["5 competitors", "15 topic ideas"],
  evidenceStandard: "Every key claim maps to evidence",
  responsibleOwner: "project-owner@harbor-growth.example",
  capacityReservedUntil: "2026-05-10T18:00:00+08:00"
}, { expectedVersion: runtimePublished.newVersion });
const runtimeOrder = execute("proposal.accept", "buyer", {
  proposalId: runtimeProposal.dto.id,
  termsSnapshot: "trial_v1_terms"
});
const runtimeFunded = execute("escrow.fund", "buyer", {
  orderId: runtimeOrder.dto.id,
  paymentRef: "sandbox_payment_ref_001",
  receivedAt: "2026-05-08T20:00:00+08:00",
  receivedBy: "user_finance_sandbox_001"
}, { expectedVersion: runtimeOrder.newVersion });
const runtimeGrant = loadRuntimeState(runtimeStateFile).grants[0];
execute("permission.approve", "operator", {
  grantId: runtimeGrant.id,
  toolAllowlist: ["read_public_url", "write_generated_artifact"],
  expiresAt: "2026-05-10T18:00:00+08:00",
  approvalReason: "trial lane"
});
const runtimeRun = execute("run.start", "seller", {
  orderId: runtimeOrder.dto.id,
  permissionGrantIds: [runtimeGrant.id]
}, { expectedVersion: runtimeFunded.newVersion });
const runtimeDelivery = execute("delivery.submit", "seller", {
  orderId: runtimeOrder.dto.id,
  executionRunIds: [runtimeRun.dto.id],
  artifactRefs: ["ev_sandbox_delivery_pdf_001"],
  evidenceRefs: ["ev_sandbox_delivery_pdf_001"],
  criteriaMapping: ["competitor_coverage"],
  knownLimitations: ["sandbox only"]
}, { expectedVersion: runtimeRun.newVersion + 2 });
const runtimeQa = execute("delivery.qa_pass", "operator", {
  deliveryPackageId: runtimeDelivery.dto.id,
  qaChecklistId: "qa_trial_001",
  sampledFacts: ["fact_01"]
});
const runtimeAccepted = execute("acceptance.accept", "buyer", {
  orderId: runtimeOrder.dto.id,
  deliveryPackageId: runtimeDelivery.dto.id,
  criteriaConfirmations: ["competitor_coverage", "evidence_traceability", "topic_actionability"],
  criteriaScores: { competitor_coverage: 20, evidence_traceability: 25, topic_actionability: 20 },
  decisionReason: "buyer accepted"
}, { expectedVersion: runtimeQa.newVersion });
const runtimeReleased = execute("escrow.release", "operator", {
  orderId: runtimeOrder.dto.id,
  releaseReason: "accepted",
  financeEvidenceRef: "ev_sandbox_delivery_pdf_001"
}, { expectedVersion: runtimeAccepted.newVersion });
execute("rating.submit", "buyer", {
  orderId: runtimeOrder.dto.id,
  subjectType: "agent",
  subjectId: "agent_mira_competitor_intel_sandbox",
  agentVersion: "1.0.0",
  categoryIds: ["social_media_operations", "intelligence_research"],
  ratingBreakdown: { outcome: 5, evidence: 5, speed: 4 },
  deliveryOutcome: "accepted"
}, { expectedVersion: runtimeReleased.newVersion });
const runtimeCurrentOrder = loadRuntimeState(runtimeStateFile).orders.find((order) => order.id === runtimeOrder.dto.id);
const runtimeExport = execute("evidence.export", "buyer", {
  orderId: runtimeOrder.dto.id,
  evidenceRefs: ["ev_sandbox_delivery_pdf_001"],
  exportReason: "verify runtime package",
  redactionMode: "buyer_safe"
}, { expectedVersion: runtimeCurrentOrder.version });

for (const section of [
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
]) {
  assert(runtimeExport.dto.manifest.requiredSections.includes(section), `runtime export missing manifest section ${section}`);
  assert(runtimeExport.dto.manifest.sectionStatuses[section] === "present", `runtime export section ${section} should be present`);
}
assert(JSON.stringify(runtimeExport.dto.snapshot.ui.orderDto) === JSON.stringify(runtimeExport.dto.snapshot.cli.orderDto), "runtime export UI/CLI snapshots must match");
assert(JSON.stringify(runtimeExport.dto.snapshot.api.orderDto) === JSON.stringify(runtimeExport.dto.snapshot.cli.orderDto), "runtime export API/CLI snapshots must match");
assert(runtimeExport.dto.sections.financeLedger.ledgerStatus === "released", "runtime export finance ledger must reflect release");
assert(runtimeExport.dto.sections.reputationEvent.sourceOrderId === runtimeOrder.dto.id, "runtime export reputation event must bind source order");

console.log("evidence package verification passed");
