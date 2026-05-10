import fs from "node:fs";
import path from "node:path";

import { agentApps, agents, categories, listings, sampleOrders } from "../lib/alphaagents/data.js";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));
const json = (file) => JSON.parse(read(file));

function fail(message) {
  throw new Error(`[goal-completion] ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function assertIncludes(source, token, label) {
  assert(source.includes(token), `${label} must include ${token}`);
}

const requiredDocs = ["docs/product-design.md", "docs/frontend-visual-design.md", "docs/acceptance.md"];
for (const doc of requiredDocs) {
  assert(exists(doc), `${doc} is missing`);
  assert(fs.statSync(path.join(root, doc)).size > 0, `${doc} is empty`);
}

const product = read("docs/product-design.md");
const visual = read("docs/frontend-visual-design.md");
const acceptance = read("docs/acceptance.md");
const readme = read("README.md");
const contract = json("contracts/alphaagents.contract.json");

const finalChecklist = [
  "README 明确展示完整平台定位。",
  "产品和首屏明确说明 Agent as a Service 对标传统 SaaS，但交付对象是 Agent 执行结果和证据责任链。",
  "`product-design.md` 列出所有默认一级分类和 CRUD 规则。",
  "定制 Agent、Agent 原生 App、Agent Squad 都纳入 Agent 统一身份。",
  "Agent App 没有退化成传统 SaaS 安装包，仍有权限、运行证据、验收/使用证明、退出和声誉回写。",
  "机器契约包含 catalog、passport、listing 命令和查询。",
  "Agent Catalog 支持分类、标签、供给形态、风险、计费和评分筛选。",
  "Buyer org setup 覆盖角色、付款、发票、授权链和风险边界。",
  "Quick Order、RFP、订阅、定制项目、order-credit 至少有契约表达。",
  "高风险权限有授权、preview、审计和撤销路径。",
  "执行、交付、QA、验收、争议、财务和声誉闭环可回放。",
  "Evidence package 可打开、可校验、可导出。",
  "Sandbox evidence 不被伪装成真实商业验证。",
  "验证脚本全部通过。"
];

for (const item of finalChecklist) {
  assertIncludes(acceptance, `- [x] ${item}`, "docs/acceptance.md final checklist");
}
assert(!acceptance.includes("- [ ] "), "docs/acceptance.md final checklist still has unchecked items");

for (const token of [
  "完整 Agent 交易、托管交付、应用分发和企业运营网络",
  "Agent as a Service",
  "Agent App",
  "ExecutionRun",
  "DeliveryPackage",
  "EvidenceRef",
  "AcceptanceReview",
  "ReputationEvent"
]) {
  assertIncludes(`${readme}\n${product}\n${visual}`, token, "core docs");
}

for (const categoryId of [
  "finance",
  "social_media_operations",
  "intelligence_research",
  "life_assistant",
  "sales_customer_growth",
  "enterprise_operations",
  "developer_it_ops",
  "legal_compliance_risk",
  "data_bi_analytics",
  "education_knowledge",
  "vertical_industry",
  "custom_agent_app"
]) {
  assert(categories.some((category) => category.categoryId === categoryId), `category registry missing ${categoryId}`);
  assertIncludes(product, `\`${categoryId}\``, "product category registry");
}

for (const commandName of [
  "agent-category.create",
  "agent-category.update",
  "agent-category.archive",
  "agent-category.restore",
  "agent-passport.create",
  "agent-passport.update",
  "agent-passport.suspend",
  "agent-listing.publish",
  "agent-listing.update",
  "agent-listing.archive",
  "rfp.create",
  "rfp.publish",
  "proposal.submit",
  "proposal.accept",
  "escrow.fund",
  "permission.approve",
  "run.start",
  "delivery.submit",
  "delivery.qa_pass",
  "acceptance.accept",
  "dispute.open",
  "dispute.resolve",
  "rating.submit",
  "agent-app.install",
  "agent-app.record-usage",
  "agent-app.exit",
  "custom-project.request",
  "custom-project.confirm-milestone",
  "custom-project.submit-uat",
  "custom-project.create-change-order",
  "program.allocate-credit",
  "program.record-drawdown",
  "program.update-qbr"
]) {
  assert(contract.commands[commandName], `contract missing required command ${commandName}`);
}

for (const queryName of ["agent-category.list", "agent-listing.search", "agent-passport.show"]) {
  assert(contract.queries[queryName], `contract missing required query ${queryName}`);
}

for (const supplyType of ["standard_agent", "managed_service_agent", "custom_agent", "agent_app", "squad", "embedded_agent"]) {
  assert(
    agents.some((agent) => agent.supplyType === supplyType) ||
      listings.some((listing) => listing.supplyType === supplyType) ||
      categories.some((category) => category.supportedSupplyTypes.includes(supplyType)),
    `unified supply type not represented: ${supplyType}`
  );
}

const appPage = read("app/agent-apps/[slug]/page.tsx");
for (const token of [
  "Agent App Passport",
  "AaaS delivery explanation",
  "runtime evidence",
  "acceptance proof",
  "exit path",
  "reputation proof",
  "RuntimeCommandConsole"
]) {
  assertIncludes(appPage, token, "Agent App detail page");
}
for (const app of agentApps) {
  assert(app.runtimeCallbacks.startRun, `${app.id} missing runtime callback`);
  assert(app.acceptanceProof.includes("ExecutionRun"), `${app.id} missing ExecutionRun proof`);
  assert(app.acceptanceProof.includes("DeliveryPackage"), `${app.id} missing DeliveryPackage proof`);
  assert(app.acceptanceProof.includes("EvidenceRef"), `${app.id} missing EvidenceRef proof`);
  assert(app.acceptanceProof.includes("AcceptanceReview"), `${app.id} missing AcceptanceReview proof`);
  assert(app.acceptanceProof.includes("ReputationEvent"), `${app.id} missing ReputationEvent proof`);
  assert(app.exitMechanisms.length > 0, `${app.id} missing exit mechanisms`);
}

for (const route of [
  "app/page.tsx",
  "app/catalog/page.tsx",
  "app/buyer-org-setup/page.tsx",
  "app/quick-order/page.tsx",
  "app/rfps/page.tsx",
  "app/workbench/page.tsx",
  "app/provider-proof/page.tsx",
  "app/order-workspace/page.tsx",
  "app/orders/page.tsx",
  "app/projects/page.tsx",
  "app/evidence-room/page.tsx",
  "app/reputation/page.tsx",
  "app/program-ops/page.tsx",
  "app/catalog-admin/page.tsx",
  "app/risk-finance/page.tsx",
  "app/risk-finance-console/page.tsx"
]) {
  assert(exists(route), `${route} is missing from page ecosystem`);
}

const catalogSource = `${read("app/catalog/page.tsx")}\n${read("lib/alphaagents/view-models.js")}\n${read("tests/catalog.test.js")}`;
for (const filterToken of ["categoryId", "tags", "supplyType", "riskLevel", "billingMode", "maxPriceMinor", "maxDeliveryHours", "minRating", "minCapacity"]) {
  assertIncludes(catalogSource, filterToken, "catalog filter implementation");
}

const buyerSource = `${read("app/buyer-org-setup/page.tsx")}\n${read("components/alphaagents/buyer-org-setup-form.tsx")}`;
for (const token of [
  "requesterUserId",
  "acceptanceOwnerUserId",
  "financeContactUserId",
  "legalContactUserId",
  "authorizedPayerId",
  "signerIds",
  "invoiceReadiness",
  "scopeAcknowledgement",
  "contractingEntity",
  "collectionEntity",
  "invoiceIssuer",
  "refundRemitter",
  "subprocessors"
]) {
  assertIncludes(buyerSource, token, "buyer org setup");
}

const riskSource = `${read("app/risk-finance/page.tsx")}\n${read("lib/alphaagents/view-models.js")}\n${read("tests/runtime-view-models.test.js")}`;
for (const token of ["Explicit authorization", "Action preview", "Audit event", "Revoke path", "permission revoke", "finance evidence"]) {
  assertIncludes(riskSource, token, "risk and finance evidence");
}

const runtimeSource = `${read("lib/alphaagents/runtime-engine.js")}\n${read("tests/runtime-engine.test.js")}\n${read("tests/ui-api-cli-parity.test.js")}`;
for (const token of [
  "runtime engine persists a real golden path flow",
  "UI/API/CLI state parity covers RFP, proposal, escrow, run, delivery, acceptance, dispute, and rating actions",
  "delivery.qa_reject blocks buyer acceptance until QA passes",
  "permission approval allows scoped tools then revoke blocks runtime execution",
  "write commands reject stale expectedVersion",
  "write commands reject cross-tenant aggregate ownership",
  "RuntimeToolDenied",
  "ReputationEventCreated"
]) {
  assertIncludes(runtimeSource, token, "runtime proof tests");
}

for (const order of sampleOrders) {
  assert(order.snapshot.ui.orderDto.evidenceStatus !== "validated", `${order.packageId} claims validated evidence`);
  assert(order.ledger.financeEvidenceRefs?.length || order.ledger.eventRefs?.length, `${order.packageId} missing finance/evidence refs`);
  assert(order.reputation.sourceOrderId, `${order.packageId} missing reputation provenance`);
  assert(order.roi.repurchaseSignal || order.roi.renewalSignal, `${order.packageId} missing ROI signal`);
}

for (const packageName of ["AA-SANDBOX-TRIAL-001", "AA-SANDBOX-REVISION-002", "AA-SANDBOX-DISPUTE-003"]) {
  for (const file of contract.requiredEvidencePackageFiles) {
    assert(exists(`evidence-packages/${packageName}/${file}`), `${packageName} missing ${file}`);
  }
  assert(!read(`evidence-packages/${packageName}/00-order-summary.md`).includes("Evidence status: validated"), `${packageName} must not claim validated evidence`);
}

const visualMaster = read("design/visual-masters/alphaagents-visual-master.html");
for (const componentToken of [
  'data-component="DataTable"',
  'data-component="CommandPreview"',
  'data-component="OrgReadinessPanel"',
  'data-component="StatusTimeline"',
  'data-component="QaChecklist"',
  "No horizontal page scroll"
]) {
  assertIncludes(visualMaster, componentToken, "visual master component coverage");
}

const verifyAll = read("scripts/verify-all.mjs");
for (const script of [
  "verify-contract",
  "verify-evidence-package",
  "verify-visual-system",
  "verify-frontend-implementation",
  "verify-live-routes",
  "verify-business-readiness",
  "verify-acceptance-coverage",
  "verify-a19-frontend-coverage",
  "verify-goal-completion"
]) {
  assertIncludes(verifyAll, script, "top-level verify pipeline");
}

console.log("goal completion verification passed");
