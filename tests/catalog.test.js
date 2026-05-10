import assert from "node:assert/strict";
import test from "node:test";

import {
  filterCatalogListings,
  getCatalogModel
} from "../lib/alphaagents/view-models.js";

import {
  getAgentAppBySlug,
  getAgentListings,
  getAgentPassportBySlug,
  getCategoryRegistry
} from "../lib/alphaagents/catalog.js";

test("default registry contains all first-level categories", () => {
  const categories = getCategoryRegistry();

  assert.equal(categories.length, 12);
  assert.deepEqual(
    categories.map((category) => category.categoryId),
    [
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
    ]
  );

  for (const category of categories) {
    assert.ok(category.name.en);
    assert.ok(category.name["zh-CN"]);
    assert.ok(category.defaultPermissionTemplateId);
    assert.ok(category.defaultAcceptanceTemplateId);
    assert.ok(category.opsOwner);
    assert.ok(category.riskOwner);
  }
});

test("catalog filters cover category, tags, supply, risk, billing, price, SLA, rating, and capacity", () => {
  const listings = getAgentListings();

  assert.ok(filterCatalogListings(listings, { categoryId: "custom_agent_app" }).every((listing) => listing.categoryIds.includes("custom_agent_app")));
  const evidenceListings = filterCatalogListings(listings, { tag: "evidence_package" });
  assert.ok(evidenceListings.length > 0);
  assert.ok(evidenceListings.every((listing) => listing.tags.includes("evidence_package")));
  assert.ok(filterCatalogListings(listings, { supplyType: "agent_app" }).every((listing) => listing.supplyType === "agent_app"));
  assert.ok(filterCatalogListings(listings, { riskLevel: "medium_high" }).every((listing) => listing.riskLevel === "medium_high"));
  assert.ok(filterCatalogListings(listings, { billingMode: "subscription" }).every((listing) => listing.billingMode === "subscription"));
  assert.ok(filterCatalogListings(listings, { maxPriceMinor: 700000 }).every((listing) => listing.startingPriceMinor <= 700000));
  assert.ok(filterCatalogListings(listings, { maxDeliveryHours: 48 }).every((listing) => listing.deliveryHours <= 48));
  assert.ok(filterCatalogListings(listings, { minRating: 0.91 }).every((listing) => listing.qaPassRate >= 0.91));
  assert.ok(filterCatalogListings(listings, { minCapacity: 3 }).every((listing) => listing.capacityAvailable >= 3));

  const model = getCatalogModel({ supplyType: "agent_app" });
  assert.equal(model.listingCount, 1);
  assert.equal(model.listings[0].supplyType, "agent_app");
  assert.ok(model.filters.tags.includes("evidence_package"));

  const tagModel = getCatalogModel({ tag: "evidence_package" });
  assert.ok(tagModel.listingCount > 0);
  assert.ok(tagModel.listings.every((listing) => listing.tags.includes("evidence_package")));
  assert.ok(tagModel.listings.some((listing) => listing.agentName === "Mira Competitor Intel Agent"));
});

test("every listing binds categories, pricing, proof, and capacity", () => {
  const listings = getAgentListings();

  assert.ok(listings.length >= 4);

  for (const listing of listings) {
    assert.ok(listing.categoryIds.length >= 1);
    assert.ok(listing.proofStatus);
    assert.ok(listing.startingPriceMinor > 0);
    assert.ok(listing.deliveryHours > 0);
    assert.equal(typeof listing.capacityAvailable, "number");
  }
});

test("agent passports and app passports expose AaaS delivery boundaries", () => {
  const agent = getAgentPassportBySlug("mira-competitor-intel-agent");
  const app = getAgentAppBySlug("harbor-growth-workbench-app");

  assert.equal(agent.supplyType, "standard_agent");
  assert.ok(agent.machineManifest.tools.length > 0);
  assert.ok(agent.commandExamples.includes("alphaagents proposal submit"));

  assert.equal(app.appDeliveryMode, "agent_app");
  assert.ok(app.runtimeCallbacks.startRun);
  assert.ok(app.acceptanceProof.join(" ").includes("ExecutionRun"));
  assert.ok(app.exitMechanisms.length > 0);
});
