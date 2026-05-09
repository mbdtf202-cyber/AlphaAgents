import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const appDir = path.resolve("app");

const requiredPageRoutes = [
  "/",
  "/catalog",
  "/agents",
  "/agent-apps",
  "/custom-agent",
  "/buyer-org-setup",
  "/quick-order",
  "/rfps",
  "/workbench",
  "/provider-proof",
  "/order-workspace",
  "/orders",
  "/projects",
  "/evidence-room",
  "/reputation",
  "/program-ops",
  "/catalog-admin",
  "/risk-finance"
];

const aliasRoutes = [
  "/agent-catalog",
  "/rfp",
  "/order",
  "/project",
  "/project-workspace",
  "/orders-and-projects",
  "/orders-acceptance",
  "/provider-proof-directory",
  "/providers",
  "/proof",
  "/evidence",
  "/evidence-room-index",
  "/apps",
  "/agent-app",
  "/quick-order-rfp",
  "/program",
  "/programs",
  "/admin",
  "/risk",
  "/finance",
  "/risk-finance-console"
];

const dynamicSampleRoutes = [
  "/agents/mira-competitor-intel-agent",
  "/agent-apps/harbor-growth-workbench-app"
];

function pageFileForRoute(route) {
  if (route === "/") return path.join(appDir, "page.tsx");
  return path.join(appDir, route.slice(1), "page.tsx");
}

test("acceptance page ecosystem has concrete Next.js page files", () => {
  for (const route of requiredPageRoutes) {
    assert.equal(existsSync(pageFileForRoute(route)), true, `${route} is missing`);
  }
});

test("common buyer-facing route aliases resolve to pages instead of 404", () => {
  for (const route of aliasRoutes) {
    assert.equal(existsSync(pageFileForRoute(route)), true, `${route} alias is missing`);
  }
});

function dynamicPageFileForRoute(route) {
  if (route.startsWith("/agents/")) return path.join(appDir, "agents", "[slug]", "page.tsx");
  if (route.startsWith("/agent-apps/")) return path.join(appDir, "agent-apps", "[slug]", "page.tsx");
  throw new Error(`No dynamic route matcher for ${route}`);
}

test("known dynamic agent and agent-app detail routes have concrete page handlers", () => {
  for (const route of dynamicSampleRoutes) {
    assert.equal(existsSync(dynamicPageFileForRoute(route)), true, `${route} dynamic detail handler is missing`);
  }
});
