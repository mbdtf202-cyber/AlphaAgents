import assert from "node:assert/strict";
import test from "node:test";

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
