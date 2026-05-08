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
  return agents.find((agent) => agent.slug === slug);
}

export function getAgentAppBySlug(slug) {
  return agentApps.find((agentApp) => agentApp.slug === slug);
}

export function getListingsByAgentId(agentId) {
  return listings.filter((listing) => listing.agentId === agentId);
}

export function getCategoryById(categoryId) {
  return categories.find((category) => category.categoryId === categoryId);
}

export function getMarketFilters() {
  return {
    billingModes: ["per_order", "subscription", "order_credit"],
    riskLevels: ["medium", "medium_high", "high", "regulated"],
    supplyTypes: ["standard_agent", "managed_service_agent", "custom_agent", "agent_app", "squad", "embedded_agent"]
  };
}
