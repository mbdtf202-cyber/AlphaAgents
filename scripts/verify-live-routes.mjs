import { spawn } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import { createServer } from "node:net";
import { join, relative, sep } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import { agentApps, agents, listings } from "../lib/alphaagents/data.js";

const dynamicAliasRoutes = [
  "/agents/mira-competitor-intel",
  "/agent-apps/launch-review-copilot"
];

function discoverDynamicSampleRoutes() {
  const agentRoutes = agents.map((agent) => `/agents/${agent.slug}`);
  const appRoutes = agentApps.map((agentApp) => `/agent-apps/${agentApp.slug}`);
  const listingRoutes = listings.map((listing) =>
    listing.supplyType === "agent_app" ? `/agent-apps/${listing.slug}` : `/agents/${listing.slug}`
  );

  return [...new Set([...agentRoutes, ...appRoutes, ...listingRoutes, ...dynamicAliasRoutes])].sort((a, b) =>
    a.localeCompare(b)
  );
}

const externalBaseUrl = process.env.ALPHAAGENTS_LIVE_BASE_URL;

function fail(message) {
  throw new Error(`[live-routes] ${message}`);
}

function discoverPageFiles(dir = join(process.cwd(), "app")) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
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
  const appRoot = join(process.cwd(), "app");
  const relativeDir = relative(appRoot, file).split(sep).slice(0, -1);
  if (relativeDir.length === 0) return "/";
  if (relativeDir.some((segment) => segment.startsWith("[") && segment.endsWith("]"))) {
    return null;
  }
  return `/${relativeDir.join("/")}`;
}

function discoverStaticPageRoutes() {
  return discoverPageFiles()
    .map(routeFromPageFile)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

function normalizeInternalHref(href) {
  const normalized = href.replaceAll("&amp;", "&").trim();
  if (!normalized.startsWith("/") || normalized.startsWith("//")) return null;
  if (normalized.startsWith("/_next/") || normalized.startsWith("/api/")) return null;
  const withoutHash = normalized.split("#")[0];
  if (!withoutHash) return null;
  return withoutHash;
}

function collectLinkedRoutes(route, body) {
  const links = [];
  for (const match of body.matchAll(/\shref="([^"]+)"/g)) {
    const linkedRoute = normalizeInternalHref(match[1]);
    if (linkedRoute) links.push({ from: route, route: linkedRoute });
  }
  return links;
}

async function reservePort() {
  const server = createServer();
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : null;
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  if (!port) fail("could not reserve a local port");
  return port;
}

async function startServer() {
  const port = await reservePort();
  const child = spawn("pnpm", ["exec", "next", "dev", "--port", String(port), "--hostname", "127.0.0.1"], {
    cwd: process.cwd(),
    detached: true,
    env: {
      ...process.env,
      ALPHA_AGENTS_ENABLE_TEST_MAILER: "true",
      NEXT_TELEMETRY_DISABLED: "1"
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let output = "";
  const append = (chunk) => {
    output += chunk.toString();
    if (output.length > 12000) output = output.slice(-12000);
  };
  child.stdout.on("data", append);
  child.stderr.on("data", append);

  const baseUrl = `http://127.0.0.1:${port}`;
  const startedAt = Date.now();
  while (Date.now() - startedAt < 60000) {
    if (child.exitCode !== null) fail(`dev server exited early\n${output}`);
    try {
      const response = await fetch(baseUrl, { redirect: "manual" });
      await response.arrayBuffer();
      if (response.status >= 200 && response.status < 500) {
        return { baseUrl, child, output: () => output };
      }
    } catch {
      // Keep waiting until Next has bound the port.
    }
    await delay(500);
  }

  await stopServer(child);
  fail(`dev server did not become ready within 60s\n${output}`);
}

async function stopServer(child) {
  if (!child || child.exitCode !== null) return;
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    try {
      child.kill("SIGTERM");
    } catch {
      return;
    }
  }

  const stopped = await Promise.race([
    new Promise((resolve) => child.once("exit", () => resolve(true))),
    delay(5000).then(() => false)
  ]);

  if (!stopped) {
    try {
      process.kill(-child.pid, "SIGKILL");
    } catch {
      child.kill("SIGKILL");
    }
  }
}

async function fetchRoute(baseUrl, route) {
  let response;
  let body;
  try {
    response = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
    body = await response.text();
  } catch (error) {
    return {
      failures: [`${route} request failed: ${error.message}`],
      links: []
    };
  }

  const failures = [];
  if (response.status < 200 || response.status >= 400) {
    failures.push(`${route} returned ${response.status}`);
  }
  if (response.status >= 200 && response.status < 400 && !body.includes("aa-shell")) {
    failures.push(`${route} did not render the AlphaAgents application shell`);
  }

  return {
    failures,
    links: collectLinkedRoutes(route, body)
  };
}

async function scanRoutes(baseUrl, initialRoutes) {
  const visited = new Set();
  const queue = [...initialRoutes];
  const failures = [];
  const discoveredLinks = new Map();

  while (queue.length) {
    const route = queue.shift();
    if (!route || visited.has(route)) continue;
    visited.add(route);

    const result = await fetchRoute(baseUrl, route);
    failures.push(...result.failures);

    for (const link of result.links) {
      if (!discoveredLinks.has(link.route)) discoveredLinks.set(link.route, link.from);
      if (!visited.has(link.route)) queue.push(link.route);
    }
  }

  return { failures, scannedRoutes: visited, discoveredLinks };
}

let server = null;
const baseUrl = externalBaseUrl ?? (server = await startServer()).baseUrl;
const routes = [...new Set([...discoverStaticPageRoutes(), ...discoverDynamicSampleRoutes()])];

try {
  const { failures, scannedRoutes } = await scanRoutes(baseUrl, routes);
  if (failures.length) fail(failures.join("\n"));
  console.log(`live route verification passed (${scannedRoutes.size} routes at ${baseUrl})`);
} finally {
  if (server) await stopServer(server.child);
}
