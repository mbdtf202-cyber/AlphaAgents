import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));

function fail(message) {
  throw new Error(`[docs-index] ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function assertIncludes(source, token, label) {
  assert(source.includes(token), `${label} must include ${token}`);
}

const readme = read("README.md");
const index = read("docs/README.md");
const operations = read("docs/operations.md");
const visual = read("docs/frontend-visual-design.md");

assert(exists("docs/README.md"), "docs/README.md is missing");
assertIncludes(readme, "./docs/README.md", "README");
assertIncludes(index, "Authority Order", "docs/README.md");
assertIncludes(index, "Canonical Documents", "docs/README.md");
assertIncludes(index, "Cleanup Rules", "docs/README.md");

const expectedMarkdownDocs = [
  "docs/README.md",
  "docs/product-design.md",
  "docs/frontend-visual-design.md",
  "docs/acceptance.md",
  "docs/engineering-contract.md",
  "docs/operations.md"
].sort();

const actualMarkdownDocs = fs
  .readdirSync(path.join(root, "docs"))
  .filter((file) => file.endsWith(".md"))
  .map((file) => `docs/${file}`)
  .sort();

assert(
  JSON.stringify(actualMarkdownDocs) === JSON.stringify(expectedMarkdownDocs),
  `docs markdown set must stay consolidated: ${actualMarkdownDocs.join(", ")}`
);

for (const doc of expectedMarkdownDocs) {
  assert(exists(doc), `${doc} is missing`);
  assertIncludes(index, path.basename(doc), "docs/README.md canonical index");
}

const removedDocs = [
  "docs/breakpoints-and-layout.md",
  "docs/buyer-seller-order-pack.md",
  "docs/commercial-starting-lane.md",
  "docs/evidence-room-index.md",
  "docs/evidence-weighted-decision-table.md",
  "docs/finance-checklist.md",
  "docs/handoff-note.md",
  "docs/market-validation-pack.md",
  "docs/mid-review-board-note.md",
  "docs/poc-war-room-runbook.md",
  "docs/procurement-pack.md",
  "docs/readiness-checklist.md",
  "docs/table-column-priority.md",
  "docs/us-buyer-payment-refund-sheet.md",
  "docs/war-room-templates.md",
  "docs/mvp-strategy-operating-model.md"
];

for (const doc of removedDocs) {
  assert(!exists(doc), `${doc} must remain consolidated into canonical docs`);
}

for (const token of [
  "Commercial Starting Lane",
  "Default Trial Gate",
  "Buyer Acceptance Mini Terms",
  "Validated Evidence Gap",
  "Enterprise Trial / PoC Cadence",
  "Finance And Dispute Templates",
  "US Buyer Payment / Refund Sheet",
  "sample_only",
  "sandbox_verified",
  "validated business readiness requires payment evidence"
]) {
  assertIncludes(operations, token, "docs/operations.md");
}

for (const token of ["断点合同", "表格列优先级", "No horizontal page scroll is allowed", "Active Orders", "EvidenceTimeline"]) {
  assertIncludes(visual, token, "docs/frontend-visual-design.md consolidated responsive rules");
}

const allTrackedDocs = expectedMarkdownDocs.map(read).join("\n");
assert(!/\bMVP\b/i.test(`${readme}\n${allTrackedDocs}`), "consolidated docs must not reintroduce MVP framing");
assert(!allTrackedDocs.includes("mvp-strategy-operating-model"), "docs must not link legacy MVP filename");

console.log("documentation index verification passed");
