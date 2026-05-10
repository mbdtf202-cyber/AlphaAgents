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

assert(exists("docs/README.md"), "docs/README.md is missing");
assertIncludes(readme, "./docs/README.md", "README");
assertIncludes(index, "Authority Order", "docs/README.md");
assertIncludes(index, "Canonical Documents", "docs/README.md");
assertIncludes(index, "Commercial And Operating Packs", "docs/README.md");
assertIncludes(index, "Runbooks And Templates", "docs/README.md");
assertIncludes(index, "Cleanup Rules", "docs/README.md");

const canonicalDocs = [
  "docs/product-design.md",
  "docs/frontend-visual-design.md",
  "docs/acceptance.md",
  "docs/engineering-contract.md"
];

for (const doc of canonicalDocs) {
  assert(exists(doc), `${doc} is missing`);
  assertIncludes(index, path.basename(doc), "docs/README.md canonical index");
}

const supportingDocs = [
  "docs/commercial-starting-lane.md",
  "docs/procurement-pack.md",
  "docs/buyer-seller-order-pack.md",
  "docs/market-validation-pack.md",
  "docs/evidence-room-index.md",
  "docs/finance-checklist.md",
  "docs/us-buyer-payment-refund-sheet.md",
  "docs/evidence-weighted-decision-table.md",
  "docs/poc-war-room-runbook.md",
  "docs/war-room-templates.md",
  "docs/readiness-checklist.md",
  "docs/handoff-note.md",
  "docs/mid-review-board-note.md",
  "docs/capacity-sheet.csv",
  "docs/breakpoints-and-layout.md",
  "docs/table-column-priority.md"
];

const boundaryTokens = {
  "docs/commercial-starting-lane.md": [
    "full AlphaAgents AaaS platform",
    "does not reduce the authority of `product-design.md`, `frontend-visual-design.md`, or `acceptance.md`"
  ],
  "docs/procurement-pack.md": [
    "文档边界",
    "不是产品范围或验收标准的权威来源",
    "contracts/alphaagents.contract.json"
  ],
  "docs/buyer-seller-order-pack.md": [
    "文档边界",
    "不是产品范围或完成验收的权威来源",
    "`sample_only` 或 `sandbox_verified`"
  ],
  "docs/market-validation-pack.md": [
    "文档边界",
    "必须保留证据状态",
    "不得把样例、访谈模板或沙盒包描述为真实商业验证"
  ],
  "docs/evidence-room-index.md": [
    "prevents sample artifacts from being mistaken for customer proof",
    "`sandbox_verified` never upgrades to `validated` by itself"
  ],
  "docs/finance-checklist.md": [
    "sandbox finance template",
    "not a live payment record"
  ],
  "docs/us-buyer-payment-refund-sheet.md": [
    "not a claim of licensed payment clearing",
    "not enterprise procurement ready"
  ],
  "docs/evidence-weighted-decision-table.md": [
    "sandbox dispute-decision template",
    "not a live adjudication record"
  ],
  "docs/poc-war-room-runbook.md": [
    "企业试点 / PoC 执行手册",
    "不是默认产品入口",
    "不降低 AlphaAgents 的完整 AaaS 平台范围"
  ],
  "docs/war-room-templates.md": [
    "not canonical requirements",
    "not evidence of real customer orders"
  ],
  "docs/readiness-checklist.md": [
    "sandbox template",
    "not a customer record"
  ],
  "docs/handoff-note.md": [
    "sandbox handoff template",
    "not a customer-facing notice"
  ],
  "docs/mid-review-board-note.md": [
    "sandbox review template",
    "not investor proof"
  ]
};

for (const doc of supportingDocs) {
  assert(exists(doc), `${doc} is missing`);
  assertIncludes(index, path.basename(doc), "docs/README.md supporting index");
}

for (const [file, tokens] of Object.entries(boundaryTokens)) {
  const text = read(file);
  for (const token of tokens) {
    assertIncludes(text, token, `${file} boundary note`);
  }
}

assert(!exists("docs/mvp-strategy-operating-model.md"), "legacy MVP document must not exist");

for (const file of ["README.md", "docs/README.md", ...canonicalDocs, ...supportingDocs.filter((file) => file.endsWith(".md"))]) {
  const text = read(file);
  assert(!/\bMVP\b/i.test(text), `${file} must not reintroduce MVP framing`);
  assert(!text.includes("mvp-strategy-operating-model"), `${file} must not link the legacy MVP filename`);
}

for (const token of ["sample_only", "sandbox_verified", "validated business readiness requires payment evidence"]) {
  assertIncludes(read("docs/market-validation-pack.md") + read("docs/evidence-room-index.md") + readme, token, "commercial evidence boundary");
}

console.log("documentation index verification passed");
