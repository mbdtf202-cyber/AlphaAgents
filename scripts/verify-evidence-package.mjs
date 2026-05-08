import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

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

console.log("evidence package verification passed");
