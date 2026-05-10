import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { setTimeout as delay } from "node:timers/promises";

const primaryRoutes = [
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

const routes = [...primaryRoutes, ...aliasRoutes, ...dynamicSampleRoutes];
const externalBaseUrl = process.env.ALPHAAGENTS_LIVE_BASE_URL;

function fail(message) {
  throw new Error(`[live-routes] ${message}`);
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

async function scanRoutes(baseUrl) {
  const failures = [];
  for (const route of routes) {
    let response;
    let body;
    try {
      response = await fetch(`${baseUrl}${route}`, { redirect: "manual" });
      body = await response.text();
    } catch (error) {
      failures.push(`${route} request failed: ${error.message}`);
      continue;
    }

    if (response.status < 200 || response.status >= 400) {
      failures.push(`${route} returned ${response.status}`);
    }
  }
  return failures;
}

let server = null;
const baseUrl = externalBaseUrl ?? (server = await startServer()).baseUrl;

try {
  const failures = await scanRoutes(baseUrl);
  if (failures.length) fail(failures.join("\n"));
  console.log(`live route verification passed (${routes.length} routes at ${baseUrl})`);
} finally {
  if (server) await stopServer(server.child);
}
