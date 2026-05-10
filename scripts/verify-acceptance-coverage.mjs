import fs from "node:fs";
import path from "node:path";

import {
  agentApps,
  agents,
  categories,
  categoryUnitEconomics,
  evidenceRecords,
  listings,
  programWorkspaces,
  sampleOrders,
  sellerProfiles
} from "../lib/alphaagents/data.js";

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const exists = (file) => fs.existsSync(path.join(root, file));
const json = (file) => JSON.parse(read(file));

const acceptance = read("docs/acceptance.md");
const product = read("docs/product-design.md");
const visual = read("docs/frontend-visual-design.md");
const readme = read("README.md");
const contract = json("contracts/alphaagents.contract.json");

function fail(message) {
  throw new Error(`[acceptance-coverage] ${message}`);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function assertIncludes(source, token, label) {
  assert(source.includes(token), `${label} must include ${token}`);
}

function assertDeepEqual(actual, expected, message) {
  assert(JSON.stringify(actual) === JSON.stringify(expected), message);
}

function source(files) {
  return files.map((file) => read(file)).join("\n");
}

const acceptanceIds = [...acceptance.matchAll(/\|\s*([A-Z]+-\d+[A-Z]?)\s*\|/g)].map((match) => match[1]);
const expectedIds = [
  "P-01", "P-02", "P-03", "P-04", "P-05", "P-06", "P-07", "P-08", "P-09", "P-10", "P-11", "P-12", "P-13", "P-14",
  "C-01", "C-02", "C-03", "C-04", "C-05", "C-06", "C-07", "C-08",
  "B-01", "B-02", "B-03", "B-04", "B-05", "B-06", "B-07", "B-08", "B-09", "B-10", "B-11", "B-12", "B-13", "B-14", "B-15",
  "A-01", "A-02", "A-03", "A-04", "A-05", "A-06", "A-07", "A-08", "A-09", "A-10", "A-11", "A-12", "A-13", "A-14", "A-15", "A-16", "A-17", "A-18", "A-19",
  "CH-01", "CH-02", "CH-03", "CH-04", "CH-05", "CH-06", "CH-07", "CH-08", "CH-09", "CH-10", "CH-11", "CH-12", "CH-13", "CH-14",
  "UI-01", "UI-02", "UI-03", "UI-04", "UI-04A", "UI-05", "UI-06", "UI-07", "UI-08", "UI-09", "UI-10", "UI-11", "UI-12", "UI-13", "UI-14", "UI-15", "UI-16", "UI-17", "UI-18", "UI-19", "UI-20", "UI-21", "UI-22", "UI-23", "UI-24", "UI-24A", "UI-25", "UI-26", "UI-27", "UI-28",
  "D-01", "D-02", "D-03", "D-04", "D-05", "D-06", "D-07", "D-08", "D-09", "D-10", "D-11", "D-12", "D-13", "D-14", "D-15",
  "T-01", "T-02", "T-03", "T-04", "T-05",
  "S-01", "S-02", "S-03", "S-04", "S-05", "S-06",
  "O-01", "O-02", "O-03", "O-04", "O-05", "O-06",
  "E-01", "E-02", "E-03", "E-04", "E-05",
  "G-01", "G-02", "G-03", "G-04", "G-05", "G-06", "G-07"
];

assert.equal = (actual, expected, message) => assert(actual === expected, `${message}: expected ${expected}, got ${actual}`);
assert.equal(acceptanceIds.length, expectedIds.length, "acceptance ID count");
assert.equal(new Set(acceptanceIds).size, acceptanceIds.length, "acceptance IDs must be unique");
for (const id of expectedIds) {
  assert(acceptanceIds.includes(id), `docs/acceptance.md is missing ${id}`);
}

const evidenceById = {
  "P-01": ["positioning"],
  "P-02": ["categories"],
  "P-03": ["categories"],
  "P-04": ["supply-unified"],
  "P-05": ["agent-detail"],
  "P-06": ["golden-flow"],
  "P-07": ["transaction-pages"],
  "P-08": ["legacy-clean"],
  "P-09": ["machine-readable"],
  "P-10": ["cli-api-ui"],
  "P-11": ["transaction-modes"],
  "P-12": ["page-ecosystem"],
  "P-13": ["aaas"],
  "P-14": ["agent-app-aaas"],
  "C-01": ["categories"],
  "C-02": ["category-fields"],
  "C-03": ["catalog-control-plane"],
  "C-04": ["category-history"],
  "C-05": ["catalog-control-plane"],
  "C-06": ["listing-category"],
  "C-07": ["catalog-filters"],
  "C-08": ["category-history"],
  "B-01": ["quick-order"],
  "B-02": ["rfp-proposal-order"],
  "B-03": ["custom-project"],
  "B-04": ["agent-app-aaas"],
  "B-05": ["program-credit"],
  "B-06": ["finance-evidence"],
  "B-07": ["roi"],
  "B-08": ["cli-api-ui"],
  "B-09": ["evidence-package"],
  "B-10": ["unit-economics"],
  "B-11": ["procurement-pack"],
  "B-12": ["evidence-status"],
  "B-13": ["buyer-org"],
  "B-14": ["evidence-status"],
  "B-15": ["agent-app-aaas"],
  "A-01": ["command-contract"],
  "A-02": ["json-readwrite"],
  "A-03": ["agent-passport"],
  "A-04": ["agent-app-aaas"],
  "A-05": ["execution-evidence"],
  "A-06": ["squad"],
  "A-07": ["ui-command-parity"],
  "A-08": ["ui-command-parity"],
  "A-09": ["ui-command-parity"],
  "A-10": ["ui-command-parity"],
  "A-11": ["ui-command-parity"],
  "A-12": ["ui-command-parity"],
  "A-13": ["ui-command-parity"],
  "A-14": ["ui-command-parity"],
  "A-15": ["ui-command-parity"],
  "A-16": ["negative-tests"],
  "A-17": ["cli-output"],
  "A-18": ["command-events"],
  "A-19": ["a19"],
  "CH-01": ["command-contract"],
  "CH-02": ["command-contract"],
  "CH-03": ["negative-tests"],
  "CH-04": ["negative-tests"],
  "CH-05": ["command-contract"],
  "CH-06": ["negative-tests"],
  "CH-07": ["negative-tests"],
  "CH-08": ["negative-tests"],
  "CH-09": ["negative-tests"],
  "CH-10": ["negative-tests"],
  "CH-11": ["negative-tests"],
  "CH-12": ["dispute-finance"],
  "CH-13": ["category-history"],
  "CH-14": ["contract-source"],
  "UI-01": ["public-showcase"],
  "UI-02": ["public-showcase"],
  "UI-03": ["public-showcase"],
  "UI-04": ["public-showcase"],
  "UI-04A": ["public-showcase"],
  "UI-05": ["catalog-page"],
  "UI-06": ["catalog-page"],
  "UI-07": ["catalog-page"],
  "UI-08": ["catalog-page"],
  "UI-09": ["catalog-page"],
  "UI-10": ["catalog-admin-page"],
  "UI-11": ["catalog-admin-page"],
  "UI-12": ["catalog-admin-page"],
  "UI-13": ["catalog-admin-page"],
  "UI-14": ["buyer-org-page"],
  "UI-15": ["buyer-org-page"],
  "UI-16": ["buyer-org-page"],
  "UI-17": ["buyer-org-page"],
  "UI-18": ["agent-detail"],
  "UI-19": ["agent-detail"],
  "UI-20": ["agent-detail"],
  "UI-21": ["agent-detail"],
  "UI-22": ["agent-detail"],
  "UI-23": ["category-history"],
  "UI-24": ["agent-detail"],
  "UI-24A": ["agent-app-detail"],
  "UI-25": ["order-pages"],
  "UI-26": ["order-pages"],
  "UI-27": ["order-pages"],
  "UI-28": ["risk-finance"],
  "D-01": ["domain-models"],
  "D-02": ["domain-models"],
  "D-03": ["domain-models"],
  "D-04": ["domain-models"],
  "D-05": ["domain-models"],
  "D-06": ["domain-models"],
  "D-07": ["domain-models"],
  "D-08": ["domain-models"],
  "D-09": ["domain-models"],
  "D-10": ["domain-models"],
  "D-11": ["dispute-finance"],
  "D-12": ["domain-models"],
  "D-13": ["evidence-fields"],
  "D-14": ["command-events"],
  "D-15": ["contract-source"],
  "T-01": ["negative-tests"],
  "T-02": ["transaction-modes"],
  "T-03": ["finance-evidence"],
  "T-04": ["conditional-release"],
  "T-05": ["risk-finance"],
  "S-01": ["negative-tests"],
  "S-02": ["risk-finance"],
  "S-03": ["agent-app-aaas"],
  "S-04": ["custom-project"],
  "S-05": ["negative-tests"],
  "S-06": ["negative-tests"],
  "O-01": ["negative-tests"],
  "O-02": ["category-fields"],
  "O-03": ["category-fields"],
  "O-04": ["negative-tests"],
  "O-05": ["catalog-control-plane"],
  "O-06": ["order-pages"],
  "E-01": ["evidence-package"],
  "E-02": ["evidence-status"],
  "E-03": ["evidence-status"],
  "E-04": ["evidence-fields"],
  "E-05": ["evidence-package"],
  "G-01": ["positioning"],
  "G-02": ["categories"],
  "G-03": ["catalog-control-plane"],
  "G-04": ["evidence-status"],
  "G-05": ["procurement-pack"],
  "G-06": ["business-gate"],
  "G-07": ["aaas"]
};

for (const id of expectedIds) {
  assert(evidenceById[id]?.length > 0, `${id} is not mapped to evidence`);
}
for (const id of Object.keys(evidenceById)) {
  assert(expectedIds.includes(id), `${id} mapping does not exist in docs/acceptance.md`);
}

const checks = {
  positioning() {
    assertIncludes(readme, "完整 Agent 交易、托管交付、应用分发和企业运营网络", "README");
    assertIncludes(product, "完整 Agent 交易、托管交付、应用分发和企业运营网络", "product design");
    assertIncludes(read("app/page.tsx"), "Complete Agent commerce", "public showcase");
  },
  aaas() {
    for (const text of [readme, product, visual]) {
      assertIncludes(text, "Agent as a Service", "AaaS source");
    }
    assertIncludes(read("app/page.tsx"), "AaaS versus traditional SaaS", "public showcase");
  },
  categories() {
    const required = [
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
    ];
    assert.equal(categories.length, required.length, "default category count");
    for (const id of required) {
      assert(categories.some((category) => category.categoryId === id), `category missing ${id}`);
      assertIncludes(product, `\`${id}\``, "product design category registry");
    }
  },
  "category-fields"() {
    for (const category of categories) {
      for (const key of ["categoryId", "name", "riskLevel", "defaultPermissionTemplateId", "defaultAcceptanceTemplateId", "opsOwner", "riskOwner", "categoryStatus"]) {
        assert(category[key], `${category.categoryId} missing ${key}`);
      }
      assert(category.name.en && category.name["zh-CN"], `${category.categoryId} missing bilingual names`);
    }
  },
  "supply-unified"() {
    for (const supply of ["standard_agent", "managed_service_agent", "custom_agent", "agent_app", "squad", "embedded_agent"]) {
      assert(read("lib/alphaagents/catalog.js").includes(supply), `catalog filters missing ${supply}`);
    }
    assert(agents.some((agent) => agent.supplyType === "squad"), "missing squad Agent passport");
    assert(categories.some((category) => category.supportedSupplyTypes.includes("embedded_agent")), "missing embedded Agent supply category");
    assert(agentApps.length > 0, "missing Agent App passport");
  },
  "transaction-modes"() {
    const combined = `${readme}\n${product}\n${read("docs/procurement-pack.md")}\n${read("lib/alphaagents/catalog.js")}`;
    for (const token of ["per_order", "subscription", "order_credit", "收益分成", "私有部署"]) {
      assertIncludes(combined, token, "transaction mode evidence");
    }
  },
  "page-ecosystem"() {
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
      "app/risk-finance/page.tsx"
    ]) {
      assert(exists(route), `${route} is missing`);
    }
  },
  "legacy-clean"() {
    const publicSource = source(["README.md", "app/page.tsx", "components/alphaagents/shell.tsx", "package.json"]);
    for (const forbidden of ["trading arena", "benchmark leaderboard", "speculative trading"]) {
      assert(!publicSource.toLowerCase().includes(forbidden), `legacy narrative remains: ${forbidden}`);
    }
  },
  "machine-readable"() {
    assert(contract.metadata.sourceOfTruth === true, "contract must be source of truth");
    assert(contract.commandDefaults.requiresEnvelope.includes("commandId"), "CommandEnvelope fields missing");
    assert(contract.requiredEvidencePackageFiles.length >= 15, "evidence package manifest too small");
  },
  "command-contract"() {
    for (const [commandName, spec] of Object.entries(contract.commands)) {
      assert(spec.mutates === true, `${commandName} must mutate through CommandEnvelope`);
      for (const field of ["actorRoles", "sourceChannels", "payloadRequired", "requiredScopes", "successEvents", "failureCodes", "responseDto"]) {
        assert(spec[field]?.length || spec[field], `${commandName} missing ${field}`);
      }
    }
    assert(contract.commandDefaults.idempotent === true, "commands must be idempotent by default");
    assert(contract.commandDefaults.requiresOptimisticLock === true, "commands must require optimistic lock");
  },
  "catalog-control-plane"() {
    for (const command of ["agent-category.create", "agent-category.update", "agent-category.archive", "agent-category.restore", "agent-passport.create", "agent-passport.update", "agent-passport.suspend", "agent-listing.publish", "agent-listing.update", "agent-listing.archive"]) {
      assert(contract.commands[command], `contract missing ${command}`);
    }
    for (const query of ["agent-category.list", "agent-listing.search", "agent-passport.show"]) {
      assert(contract.queries[query], `contract missing ${query}`);
    }
    const adminSource = read("app/catalog-admin/page.tsx");
    for (const token of ["agent-category create", "agent-category archive", "agent-passport update", "agent-listing publish"]) {
      assertIncludes(adminSource, token, "catalog admin page");
    }
  },
  "listing-category"() {
    for (const listing of listings) {
      assert(listing.categoryIds.length > 0, `${listing.listingId} missing categoryIds`);
      for (const categoryId of listing.categoryIds) {
        assert(categories.some((category) => category.categoryId === categoryId), `${listing.listingId} references unknown category ${categoryId}`);
      }
    }
  },
  "catalog-filters"() {
    const catalogSource = `${read("lib/alphaagents/view-models.js")}\n${read("app/catalog/page.tsx")}\n${read("tests/catalog.test.js")}`;
    for (const token of ["categoryId", "supplyType", "riskLevel", "billingMode", "maxPriceMinor", "maxDeliveryHours", "minRating", "minCapacity"]) {
      assertIncludes(catalogSource, token, "catalog filters");
    }
  },
  "category-history"() {
    const runtimeTest = read("tests/runtime-engine.test.js");
    assertIncludes(runtimeTest, "category rename preserves historical order and reputation category snapshots", "runtime tests");
    assertIncludes(runtimeTest, "category update rejects categoryId rename or reuse attempts", "runtime tests");
    assertIncludes(read("lib/alphaagents/runtime-engine.js"), "categorySnapshot", "runtime engine");
    assertIncludes(read("lib/alphaagents/runtime-engine.js"), "history", "runtime engine");
  },
  "quick-order"() {
    assert(exists("app/quick-order/page.tsx"), "quick order page missing");
    assertIncludes(`${read("app/quick-order/page.tsx")}\n${read("lib/alphaagents/view-models.js")}`, "rfp publish", "quick order command preview");
  },
  "rfp-proposal-order"() {
    const runtimeTest = read("tests/runtime-engine.test.js");
    for (const token of ["rfp.create", "rfp.publish", "proposal.submit", "proposal.accept", "escrow.fund"]) {
      assertIncludes(runtimeTest, token, "golden flow test");
    }
  },
  "golden-flow"() {
    const runtimeTest = read("tests/runtime-engine.test.js");
    assertIncludes(runtimeTest, "runtime engine persists a real golden path flow", "golden flow test");
    for (const command of ["rfp.create", "rfp.publish", "proposal.submit", "proposal.accept", "escrow.fund", "permission.approve", "run.start", "delivery.submit", "delivery.qa_pass", "acceptance.accept", "escrow.release", "rating.submit", "evidence.export"]) {
      assertIncludes(runtimeTest, command, "golden flow commands");
    }
    for (const event of contract.goldenPath) {
      assert(contract.eventPayloadSchemas[event], `golden path event missing schema ${event}`);
    }
  },
  "custom-project"() {
    for (const command of ["custom-project.request", "custom-project.confirm-milestone", "custom-project.submit-uat", "custom-project.create-change-order"]) {
      assert(contract.commands[command], `contract missing ${command}`);
    }
    assertIncludes(read("app/custom-agent/page.tsx"), "change order", "custom Agent page");
  },
  "agent-app-aaas"() {
    const app = agentApps[0];
    assert(app.runtimeCallbacks.startRun, "Agent App missing runtime callback");
    for (const token of ["ExecutionRun", "DeliveryPackage", "EvidenceRef", "AcceptanceReview", "ReputationEvent"]) {
      assert(app.acceptanceProof.includes(token), `Agent App missing proof ${token}`);
    }
    assert(app.exitMechanisms.length > 0, "Agent App missing exit mechanisms");
    assertIncludes(read("app/agent-apps/[slug]/page.tsx"), "AaaS delivery", "Agent App detail");
  },
  "program-credit"() {
    for (const command of ["program.allocate-credit", "program.record-drawdown", "program.update-qbr"]) {
      assert(contract.commands[command], `contract missing ${command}`);
    }
    assert(programWorkspaces.some((program) => program.activeCreditMinor > 0 && program.renewalBlockers.length > 0), "program workspace missing credit or blockers");
  },
  "finance-evidence"() {
    for (const order of sampleOrders) {
      for (const key of ["paymentRef", "invoiceStatus", "reconciliationExport", "financeEvidenceRefs"]) {
        assert(order.ledger[key], `${order.packageId} ledger missing ${key}`);
      }
    }
    assertIncludes(read("app/risk-finance/page.tsx"), "finance evidence", "risk finance page");
  },
  roi() {
    for (const order of sampleOrders) {
      for (const key of ["cycleTimeSavedHours", "usableResultRate", "repurchaseSignal", "renewalSignal"]) {
        assert(order.roi[key] !== undefined, `${order.packageId} ROI missing ${key}`);
      }
    }
  },
  "unit-economics"() {
    assert(categoryUnitEconomics.length >= 3, "category unit economics missing rows");
    for (const row of categoryUnitEconomics) {
      for (const key of ["averageGmvMinor", "takeRateBps", "providerPayoutBps", "qaOpsMinutes", "cacMinor", "disputeCostBps", "contributionMarginBps"]) {
        assert(row[key] !== undefined, `${row.categoryId} unit economics missing ${key}`);
      }
    }
  },
  "procurement-pack"() {
    const procurement = read("docs/procurement-pack.md");
    for (const token of ["PoC", "enterprise", "custom", "subscription", "order-credit", "高风险权限"]) {
      assertIncludes(procurement, token, "procurement pack");
    }
  },
  "evidence-status"() {
    const market = read("docs/market-validation-pack.md");
    for (const status of contract.evidenceStatuses) {
      assertIncludes(market, status, "market validation pack");
    }
    for (const order of sampleOrders) {
      assert(order.snapshot.ui.orderDto.evidenceStatus !== "validated", `${order.packageId} must not claim validated`);
    }
  },
  "buyer-org"() {
    const buyerSource = `${read("components/alphaagents/buyer-org-setup-form.tsx")}\n${read("tests/runtime-engine.test.js")}`;
    for (const token of ["requesterUserId", "acceptanceOwnerUserId", "financeContactUserId", "legalContactUserId", "authorizedPayerId", "signerIds", "invoiceReadiness", "scopeAcknowledgement", "contractingEntity", "collectionEntity", "invoiceIssuer", "refundRemitter", "subprocessors"]) {
      assertIncludes(buyerSource, token, "buyer org setup");
    }
  },
  "json-readwrite"() {
    assert(exists("app/api/commands/route.ts"), "commands API missing");
    assert(exists("app/api/catalog/route.ts"), "catalog API missing");
    assert(exists("app/api/evidence/route.ts"), "evidence API missing");
    assert(exists("scripts/alphaagents.mjs"), "CLI missing");
  },
  "agent-passport"() {
    for (const agent of agents) {
      assert(agent.machineManifest.inputSchema.length > 0, `${agent.id} missing input schema`);
      assert(agent.machineManifest.outputSchema.length > 0, `${agent.id} missing output schema`);
      assert(agent.machineManifest.tools.length > 0, `${agent.id} missing tools`);
      assert(agent.humanOwner && agent.version, `${agent.id} missing owner/version`);
    }
  },
  "execution-evidence"() {
    const runtimeTest = read("tests/runtime-engine.test.js");
    for (const token of ["run.start", "RunDto", "evidenceRefs", "delivery.submit"]) {
      assertIncludes(runtimeTest + read("lib/alphaagents/runtime-engine.js"), token, "execution evidence");
    }
    assertIncludes(acceptance + product, "ExecutionRun", "acceptance/product execution model");
  },
  squad() {
    const squad = agents.find((agent) => agent.supplyType === "squad");
    assert(squad, "squad Agent missing");
    assert(squad.machineManifest.outputSchema.includes("ProgramWorkspace"), "squad missing unified acceptance output");
    assert(squad.humanOwner, "squad missing responsible owner");
  },
  "ui-command-parity"() {
    const uiSource = source(["components/alphaagents/runtime-command-console.tsx", "lib/alphaagents/view-models.js", "app/rfps/page.tsx", "app/orders/page.tsx", "app/catalog-admin/page.tsx", "app/risk-finance/page.tsx", "app/agent-apps/[slug]/page.tsx"]);
    for (const command of ["rfp publish", "proposal submit", "proposal accept", "escrow fund", "run start", "delivery submit", "acceptance accept", "dispute open", "rating submit"]) {
      assertIncludes(uiSource, command, "UI command parity");
    }
    const parityTest = read("tests/ui-api-cli-parity.test.js");
    for (const token of ["getOrdersIndexModel", "runCli([\"runtime\", \"snapshot\"]", "RfpPublished", "ProposalSubmitted", "EscrowFunded", "RunStarted", "DeliverySubmitted", "AcceptanceAccepted", "DisputeOpened", "ReputationPublished"]) {
      assertIncludes(parityTest, token, "UI/API/CLI executable parity test");
    }
  },
  "cli-api-ui"() {
    for (const order of sampleOrders) {
      assertDeepEqual(order.snapshot.ui.orderDto, order.snapshot.cli.orderDto, `${order.packageId} UI and CLI snapshots must match`);
      assertDeepEqual(order.snapshot.api.orderDto, order.snapshot.cli.orderDto, `${order.packageId} API and CLI snapshots must match`);
    }
    for (const file of ["scripts/alphaagents.mjs", "app/api/commands/route.ts", "app/api/catalog/route.ts", "components/alphaagents/blocks.tsx"]) {
      assert(exists(file), `${file} missing for CLI/API/UI alignment`);
    }
    assertIncludes(read("components/alphaagents/blocks.tsx"), "CLI / API / Events", "shared A-19 panel");
    assertIncludes(read("lib/alphaagents/commands.js"), "executeRuntimeCommand", "CLI command helper must call runtime engine");
    assertIncludes(read("tests/control-plane.test.js"), "every contract command is executable with a valid sample payload", "control-plane executable command coverage");
    assertIncludes(read("tests/ui-api-cli-parity.test.js"), "orderFromUi.orderStatus, orderFromCli.orderStatus", "runtime UI/API/CLI state parity");
  },
  "negative-tests"() {
    const tests = read("tests/runtime-engine.test.js");
    for (const token of ["VERSION_CONFLICT", "ACTOR_FORBIDDEN", "TENANT_FORBIDDEN", "SELLER_NOT_APPROVED", "STATE_CONFLICT", "PERMISSION_DENIED", "BUYER_NOT_PROCUREMENT_READY", "SCOPE_EXPANSION_REQUIRED"]) {
      assertIncludes(tests, token, "negative runtime tests");
    }
    for (const token of ["write commands reject cross-tenant aggregate ownership", "UnauthorizedAccessAttempted"]) {
      assertIncludes(tests, token, "negative runtime tenant ownership tests");
    }
    for (const token of ["delivery.qa_reject blocks buyer acceptance until QA passes", "delivery.qa_reject", "DeliveryQaRejected", "acceptance.accept"]) {
      assertIncludes(tests, token, "negative runtime QA rejection tests");
    }
    for (const token of ["archived category blocks proposal acceptance from creating new orders", "validateProposalCategoriesSellable"]) {
      assertIncludes(tests + read("lib/alphaagents/runtime-engine.js"), token, "negative runtime archived category tests");
    }
    for (const token of ["proposal.submit rejects missing inactive or mismatched AgentPassport references", "proposal.submit rejects AgentPassport category mismatch with RFP", "validateProposalAgentReadiness"]) {
      assertIncludes(tests + read("lib/alphaagents/runtime-engine.js"), token, "negative runtime proposal AgentPassport tests");
    }
  },
  "cli-output"() {
    assertIncludes(read("tests/cli-output.test.js"), "--json", "CLI output tests");
    assertIncludes(read("scripts/alphaagents.mjs"), "printOutput", "CLI output formatter");
  },
  "command-events"() {
    for (const spec of Object.values(contract.commands)) {
      for (const event of spec.successEvents) {
        assert(contract.eventPayloadSchemas[event], `event schema missing ${event}`);
      }
    }
  },
  a19() {
    assertIncludes(read("scripts/verify-a19-frontend-coverage.mjs"), "CliApiEventsPanel", "A-19 verifier");
    assertIncludes(read("components/alphaagents/blocks.tsx"), "CLI / API / Events", "A-19 panel");
  },
  "contract-source"() {
    assert(contract.metadata.sourceOfTruth === true, "machine contract not marked source of truth");
    assertIncludes(read("docs/engineering-contract.md"), "contracts/alphaagents.contract.json", "engineering contract");
  },
  "public-showcase"() {
    const home = read("app/page.tsx");
    for (const token of ["Open Agent Catalog", "Start Buyer Org Setup", "Start Trial Quick Order", "AaaS versus traditional SaaS", "sample_only + sandbox_verified"]) {
      assertIncludes(home, token, "public showcase page");
    }
  },
  "catalog-page"() {
    const catalog = read("app/catalog/page.tsx");
    for (const token of ["Agent Catalog", "categoryId", "supplyType", "riskLevel", "billingMode", "AgentListingPublished", "CliApiEventsPanel"]) {
      assertIncludes(catalog, token, "catalog page");
    }
  },
  "catalog-admin-page"() {
    const admin = read("app/catalog-admin/page.tsx");
    for (const token of ["Category CRUD", "AgentPassport", "AgentListing", "RuntimeCommandConsole", "agent-category create"]) {
      assertIncludes(admin, token, "catalog admin page");
    }
  },
  "buyer-org-page"() {
    const page = `${read("app/buyer-org-setup/page.tsx")}\n${read("components/alphaagents/buyer-org-setup-form.tsx")}`;
    for (const token of ["Buyer org preflight", "Authority chain", "Invoice readiness", "High-risk purchases blocked", "Save Buyer Setup"]) {
      assertIncludes(page, token, "buyer org page");
    }
  },
  "agent-detail"() {
    const page = read("app/agents/[slug]/page.tsx");
    for (const token of ["Trust, purchase, and delivery record", "Machine-readable manifest", "Permissions, deployment, and failure boundaries", "Purchase modes", "Reputation and performance", "CliApiEventsPanel"]) {
      assertIncludes(page, token, "agent detail page");
    }
  },
  "agent-app-detail"() {
    const page = read("app/agent-apps/[slug]/page.tsx");
    for (const token of ["AaaS delivery", "runtimeCallbacks", "acceptanceProof", "exitMechanisms", "CliApiEventsPanel"]) {
      assertIncludes(page, token, "agent app detail page");
    }
  },
  "order-pages"() {
    const pages = `${read("app/orders/page.tsx")}\n${read("app/order-workspace/page.tsx")}`;
    for (const token of ["ledgerStatus", "acceptanceStatus", "RiskPermissionGrant", "ExecutionRun", "DeliveryPackage", "AcceptanceReview", "revision", "dispute"]) {
      assertIncludes(pages, token, "order pages");
    }
  },
  "risk-finance"() {
    const page = read("app/risk-finance/page.tsx");
    for (const token of ["Explicit authorization", "Action preview", "Audit event", "Revoke path", "Finance evidence", "refund", "reconciliation"]) {
      assertIncludes(page, token, "risk finance page");
    }
  },
  "domain-models"() {
    for (const dto of ["RfpDto", "ProposalDto", "OrderDto", "GrantDto", "RunDto", "DeliveryDto", "EvidenceDto", "ReputationDto", "AgentCategoryDto", "AgentPassportDto", "AgentAppInstallDto", "AgentListingDto"]) {
      assert(contract.dtoSchemas[dto], `missing DTO ${dto}`);
    }
    assert(!JSON.stringify(contract.dtoSchemas).includes("DisputeCase"), "DisputeCase must not be an independent write model");
  },
  "dispute-finance"() {
    const runtime = `${read("lib/alphaagents/runtime-engine.js")}\n${read("tests/runtime-engine.test.js")}`;
    for (const token of ["dispute.resolve", "DisputeResolved", "partial-release", "refundAmountMinor", "releaseAmountMinor"]) {
      assertIncludes(runtime, token, "dispute finance");
    }
  },
  "evidence-fields"() {
    for (const evidence of evidenceRecords) {
      for (const key of ["hash", "capturedAt", "visibility", "redactionStatus"]) {
        assert(evidence[key], `${evidence.id} missing ${key}`);
      }
    }
  },
  "conditional-release"() {
    assertIncludes(readme, "conditional release", "README");
    assert(!readme.includes("licensed clearing"), "README must not claim licensed clearing");
    assertIncludes(product, "conditional release ledger 不等于平台拥有持牌资金清结算能力", "product design");
  },
  "evidence-package"() {
    for (const packageName of ["AA-SANDBOX-TRIAL-001", "AA-SANDBOX-REVISION-002", "AA-SANDBOX-DISPUTE-003"]) {
      for (const file of contract.requiredEvidencePackageFiles) {
        assert(exists(`evidence-packages/${packageName}/${file}`), `${packageName} missing ${file}`);
      }
      const summary = read(`evidence-packages/${packageName}/00-order-summary.md`);
      assertIncludes(summary, "sandbox", `${packageName} summary`);
      assert(!summary.includes("Evidence status: validated"), `${packageName} must not claim validated`);
    }
  },
  "business-gate"() {
    const gate = read("scripts/verify-business-readiness.mjs");
    for (const token of ["sandbox_verified", "Validated evidence gap", "Default Trial gate", "conditional release"]) {
      assertIncludes(gate + read("docs/market-validation-pack.md") + read("docs/procurement-pack.md") + readme, token, "business readiness gate");
    }
  },
  "transaction-pages"() {
    for (const route of ["app/catalog/page.tsx", "app/quick-order/page.tsx", "app/rfps/page.tsx", "app/orders/page.tsx", "app/projects/page.tsx", "app/agent-apps/page.tsx"]) {
      assert(exists(route), `${route} missing`);
    }
  }
};

const executed = new Set();
for (const tags of Object.values(evidenceById)) {
  for (const tag of tags) {
    assert(checks[tag], `missing check implementation for evidence tag ${tag}`);
    if (!executed.has(tag)) {
      checks[tag]();
      executed.add(tag);
    }
  }
}

console.log(`acceptance coverage verification passed (${expectedIds.length} acceptance IDs, ${executed.size} evidence checks)`);
