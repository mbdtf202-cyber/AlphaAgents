import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function fail(message) {
  throw new Error(`[visual] ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

const tokenPath = path.join(root, "design", "alphaagents-design-tokens.json");
const fixturePath = path.join(root, "design", "visual-fixtures", "orders.json");
const masterPath = path.join(root, "design", "visual-masters", "alphaagents-visual-master.html");
const logoPath = path.join(root, "design", "brand", "ledger-passport-mark.svg");

for (const filePath of [tokenPath, fixturePath, masterPath, logoPath]) {
  assert(fs.existsSync(filePath), `${path.relative(root, filePath)} is missing`);
  assert(fs.statSync(filePath).size > 0, `${path.relative(root, filePath)} is empty`);
}

const tokens = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
assert(tokens.color?.actionPrimary === "#1F6FEB", "actionPrimary token drifted");
assert(tokens.layout?.breakpoints?.desktop === 1440, "desktop breakpoint must be 1440");
assert(tokens.brand?.mark === "ledger-passport", "brand mark must be ledger-passport");

const fixtures = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
assert(fixtures.orders.length >= 20, "visual fixtures must include at least 20 order rows");
for (const required of ["created", "ready_for_acceptance", "revision_requested", "disputed", "partially_released", "refunded", "closed"]) {
  assert(fixtures.orders.some((order) => order.orderStatus === required), `visual fixture missing ${required}`);
}

const html = fs.readFileSync(masterPath, "utf8");
const pages = ["workbench", "publish-rfp", "agent-market", "order-acceptance", "reputation"];
const breakpoints = ["desktop", "tablet", "mobile"];
for (const page of pages) {
  for (const breakpoint of breakpoints) {
    assert(html.includes(`data-page="${page}" data-breakpoint="${breakpoint}"`), `visual master missing ${page}/${breakpoint}`);
  }
}
assert(html.includes("Ledger Passport"), "visual master must include brand mark explanation");
assert(html.includes("No horizontal page scroll"), "visual master must include overflow QA rule");
for (const text of [
  "Trial Quick Order",
  "Start 48h Trial",
  "Buyer mini terms",
  "Conditional release trust rail",
  "CLI mismatch blocks CTA",
  "Provider Proof Directory",
  "Mira Competitor Intel Agent",
  "QA pass 91%",
  "Ready for acceptance",
  "Disputed",
  "Revision requested",
  "Public showcase",
  "Signup / buyer org setup",
  "Evidence room",
  "Program ops",
  "AA-ORD-1042",
  "CLI / Events collapsed",
  "Accept delivery",
  "Quality score 84/100",
  "Refunded",
  "Source type",
  "Redaction",
  "At-risk orders",
  "Sync review"
]) {
  assert(html.includes(text), `visual master missing required high-value UI text: ${text}`);
}

for (const token of [
  'data-component="SkuPlanSelector"',
  'data-component="DataTable"',
  'data-component="CommandPreview"',
  'data-component="OrgReadinessPanel"',
  'data-component="ApprovedProviders"',
  'data-component="StatusTimeline"',
  'data-component="QaChecklist"',
  'data-component="OrderEscrowPanel"',
  'data-state="selected"',
  'data-state="blocked"',
  'data-state="mismatch"',
  'data-state="loading"',
  'data-state="disabled"'
]) {
  assert(html.includes(token), `visual master missing component/state token: ${token}`);
}

console.log("visual system verification passed");
