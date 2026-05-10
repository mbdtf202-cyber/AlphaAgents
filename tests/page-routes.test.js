import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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

function discoverPageFiles(dir = appDir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...discoverPageFiles(fullPath));
    } else if (entry === "page.tsx") {
      files.push(fullPath);
    }
  }
  return files;
}

function routeFromPageFile(file) {
  const relativeDir = path.relative(appDir, file).split(path.sep).slice(0, -1);
  if (relativeDir.length === 0) return "/";
  if (relativeDir.some((segment) => segment.startsWith("[") && segment.endsWith("]"))) {
    return null;
  }
  return `/${relativeDir.join("/")}`;
}

test("live-route gate discovers every static Next.js page file and rendered internal links", () => {
  const source = readFileSync(path.join("scripts", "verify-live-routes.mjs"), "utf8");
  assert.match(source, /function discoverPageFiles/, "live route gate must discover app/**/page.tsx");
  assert.match(source, /function collectLinkedRoutes/, "live route gate must crawl rendered internal links");
  assert.match(source, /aa-shell/, "live route gate must verify the AlphaAgents shell rendered");
});

test("all static page files are represented by concrete route URLs", () => {
  const discoveredRoutes = discoverPageFiles()
    .map(routeFromPageFile)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  const requiredRoutes = [...requiredPageRoutes, ...aliasRoutes].sort((a, b) => a.localeCompare(b));

  assert.deepEqual(discoveredRoutes, requiredRoutes);
});

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
  assert.match(aliasSurfaceSource, /canonicalPath/, "shared alias surface must expose canonical route recovery");

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
