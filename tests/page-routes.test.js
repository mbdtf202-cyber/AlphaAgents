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
  "/orders",
  "/projects",
  "/evidence-room",
  "/reputation",
  "/program-ops",
  "/catalog-admin",
  "/risk-finance"
];

const aliasRoutes = [
  "/rfp",
  "/order",
  "/project",
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
  "/programs",
  "/admin",
  "/risk",
  "/finance",
  "/risk-finance-console"
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
