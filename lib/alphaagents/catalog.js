import { agentApps, agents, categories, listings } from "./data.js";

export function getCategoryRegistry() {
  return categories;
}

export function getAgentListings() {
  return listings;
}

export function getAgentPassports() {
  return agents;
}

export function getAgentApps() {
  return agentApps;
}

export function getFeaturedListings() {
  return listings.filter((listing) => listing.featured);
}

export function getAgentPassportBySlug(slug) {
  const normalized = normalizeSlug(slug);
  const direct = agents.find((agent) => agent.slug === normalized || agent.id === slug);
  if (direct) return direct;

  const listing = listings.find((entry) => entry.slug === normalized && entry.supplyType !== "agent_app");
  if (listing) {
    return agents.find((agent) => agent.id === listing.agentId) ?? null;
  }

  const aliasTarget = agentSlugAliases[normalized];
  return aliasTarget ? agents.find((agent) => agent.slug === aliasTarget || agent.id === aliasTarget) ?? null : null;
}

export function getAgentAppBySlug(slug) {
  const normalized = normalizeSlug(slug);
  const direct = agentApps.find((agentApp) => agentApp.slug === normalized || agentApp.id === slug);
  if (direct) return direct;

  const listing = listings.find((entry) => entry.slug === normalized && entry.supplyType === "agent_app");
  if (listing) {
    return agentApps.find((agentApp) => agentApp.id === listing.agentId) ?? null;
  }

  const aliasTarget = agentAppSlugAliases[normalized];
  return aliasTarget ? agentApps.find((agentApp) => agentApp.slug === aliasTarget || agentApp.id === aliasTarget) ?? null : null;
}

export function getListingsByAgentId(agentId) {
  return listings.filter((listing) => listing.agentId === agentId);
}

export function getCategoryById(categoryId) {
  return categories.find((category) => category.categoryId === categoryId);
}

export function getMarketFilters() {
  const tags = Array.from(
    new Set([
      ...categories.flatMap((category) => category.tags ?? []),
      ...agents.flatMap((agent) => agent.tags ?? []),
      ...listings.flatMap((listing) => listing.tags ?? [])
    ])
  ).sort((a, b) => a.localeCompare(b));

  return {
    billingModes: ["per_order", "subscription", "order_credit"],
    riskLevels: ["medium", "medium_high", "high", "regulated"],
    supplyTypes: ["standard_agent", "managed_service_agent", "custom_agent", "agent_app", "squad", "embedded_agent"],
    tags
  };
}

function normalizeSlug(slug) {
  return String(slug ?? "").trim().toLowerCase();
}

const agentSlugAliases = {
  "mira-competitor-intel": "mira-competitor-intel-agent",
  "mira": "mira-competitor-intel-agent",
  "signal-claim-review": "signal-claim-review-agent"
};

const agentAppSlugAliases = {
  "harbor-growth-workbench": "harbor-growth-workbench-app",
  "launch-review-copilot": "harbor-growth-workbench-app"
};
