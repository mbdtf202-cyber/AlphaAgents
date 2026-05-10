import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

import { getAgentAppDetailModel, getAgentDetailModel } from "../lib/alphaagents/view-models.js";

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
  "/agents/mira-competitor-intel",
  "/agents/mira-trial-quick-order",
  "/agent-apps/harbor-growth-workbench-app",
  "/agent-apps/harbor-growth-workbench",
  "/agent-apps/launch-review-copilot"
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

test("buyer-facing route aliases render real pages instead of redirect-only placeholders", () => {
  const aliasSurfaceSource = readFileSync(path.join("components", "alphaagents", "alias-surface.tsx"), "utf8");
  assert.match(aliasSurfaceSource, /<AppShell/, "shared alias surface does not mount the shell");
  assert.match(aliasSurfaceSource, /<SectionCard/, "shared alias surface does not expose section UI");
  assert.match(aliasSurfaceSource, /<DataTable/, "shared alias surface does not expose route-specific data tables");
  assert.match(aliasSurfaceSource, /<CliApiEventsPanel/, "shared alias surface does not expose CLI/API/event evidence");

  for (const route of aliasRoutes) {
    const source = readFileSync(pageFileForRoute(route), "utf8");
    assert.equal(source.includes("redirect("), false, `${route} still redirects instead of rendering a real page`);
    assert.match(source, /<AliasSurfacePage|<AppShell|<main|<section/, `${route} does not expose concrete page UI`);
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

test("known dynamic agent and agent-app detail routes resolve real detail models", () => {
  for (const route of dynamicSampleRoutes) {
    const slug = route.split("/").at(-1);
    const model = route.startsWith("/agents/")
      ? getAgentDetailModel(slug)
      : getAgentAppDetailModel(slug);

    assert.ok(model, `${route} resolves to 404 because its detail model is missing`);
  }
});
