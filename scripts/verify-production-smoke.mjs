import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

import { buildSamplePayload } from "../lib/alphaagents/commands.js";

const root = process.cwd();
const internalToken = `smoke_${Date.now()}_${Math.random().toString(36).slice(2)}`;
const stateDir = mkdtempSync(join(tmpdir(), "alphaagents-prod-smoke-"));
const stateFile = join(stateDir, "runtime-state.json");
let server = null;

try {
  buildProductionApp();
  server = await startProductionServer();
  await assertPage(server.baseUrl, "/");
  await assertPage(server.baseUrl, "/catalog");
  await assertPage(server.baseUrl, "/buyer-org-setup");
  await assertJson(server.baseUrl, "/api/runtime-state", (body) => Array.isArray(body.orders));
  await assertJson(server.baseUrl, "/api/orders", (body) => body && typeof body === "object");
  await assertJson(server.baseUrl, "/api/workbench", (body) => body && typeof body === "object");

  await assertBlockedWrite(server.baseUrl);
  await assertBlockedCatalogWrite(server.baseUrl);
  await assertBlockedReset(server.baseUrl);
  await assertUiDemoWritesDisabled(server.baseUrl);
  await assertForbiddenPrivilegeFields(server.baseUrl);
  await assertAuthorizedWrite(server.baseUrl);
  await assertFinanceWriteForbidden(server.baseUrl);
  await assertAuthorizedReset(server.baseUrl);

  console.log(`production smoke passed at ${server.baseUrl}`);
} finally {
  if (server) await stopServer(server.child);
  rmSync(stateDir, { recursive: true, force: true });
}

function buildProductionApp() {
  const result = spawnSync("pnpm", ["exec", "next", "build"], {
    cwd: root,
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: "1"
    },
    stdio: "inherit"
  });
  assert.equal(result.status, 0, "[prod-smoke] next build failed");
}

async function startProductionServer() {
  const port = await reservePort();
  const child = spawn("pnpm", ["exec", "next", "start", "--port", String(port), "--hostname", "127.0.0.1"], {
    cwd: root,
    detached: true,
    env: {
      ...process.env,
      ALPHAAGENTS_ENABLE_DEMO_WRITE_API: "false",
      ALPHAAGENTS_INTERNAL_API_TOKEN: internalToken,
      ALPHAAGENTS_INTERNAL_API_ACTOR_ROLES: "buyer,operator",
      ALPHAAGENTS_INTERNAL_API_SCOPES: "buyer:orders.write,runtime:state.reset",
      ALPHAAGENTS_INTERNAL_TENANT_ID: "org_demo_001",
      ALPHAAGENTS_STATE_FILE: stateFile,
      NEXT_TELEMETRY_DISABLED: "1",
      PORT: String(port)
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  let output = "";
  const append = (chunk) => {
    output += chunk.toString();
    if (output.length > 16000) output = output.slice(-16000);
  };
  child.stdout.on("data", append);
  child.stderr.on("data", append);

  const baseUrl = `http://127.0.0.1:${port}`;
  const startedAt = Date.now();
  while (Date.now() - startedAt < 60000) {
    if (child.exitCode !== null) throw new Error(`[prod-smoke] next start exited early\n${output}`);
    try {
      const response = await fetch(baseUrl, { redirect: "manual" });
      await response.arrayBuffer();
      if (response.status >= 200 && response.status < 500) return { baseUrl, child };
    } catch {
      // Wait for Next to bind and serve.
    }
    await delay(500);
  }

  await stopServer(child);
  throw new Error(`[prod-smoke] next start did not become ready\n${output}`);
}

async function reservePort() {
  const server = await import("node:net").then(({ createServer }) => createServer());
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  const port = typeof address === "object" && address ? address.port : null;
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  assert(port, "[prod-smoke] could not reserve a local port");
  return port;
}

async function stopServer(child) {
  if (!child || child.exitCode !== null) return;
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
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

async function assertPage(baseUrl, route) {
  const response = await fetch(`${baseUrl}${route}`);
  const body = await response.text();
  assert.equal(response.status, 200, `[prod-smoke] ${route} returned ${response.status}`);
  assert(body.includes("aa-shell"), `[prod-smoke] ${route} did not render the app shell`);
}

async function assertJson(baseUrl, route, predicate) {
  const response = await fetch(`${baseUrl}${route}`);
  const body = await response.json();
  assert.equal(response.status, 200, `[prod-smoke] ${route} returned ${response.status}`);
  assert(predicate(body), `[prod-smoke] ${route} returned unexpected JSON`);
  return body;
}

async function assertBlockedWrite(baseUrl) {
  const response = await fetch(`${baseUrl}/api/commands`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ commandName: "buyer-org.setup", expectedVersion: 1, payload: buildSamplePayload("buyer-org.setup") })
  });
  const body = await response.json();
  assert.equal(response.status, 401);
  assert.equal(body.errorCode, "AUTH_REQUIRED");
}

async function assertBlockedCatalogWrite(baseUrl) {
  const response = await fetch(`${baseUrl}/api/catalog`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ commandName: "agent-category update", expectedVersion: 1, payload: buildSamplePayload("agent-category.update") })
  });
  const body = await response.json();
  assert.equal(response.status, 401);
  assert.equal(body.errorCode, "AUTH_REQUIRED");
}

async function assertBlockedReset(baseUrl) {
  const response = await fetch(`${baseUrl}/api/runtime-state`, {
    method: "DELETE"
  });
  const body = await response.json();
  assert.equal(response.status, 401);
  assert.equal(body.errorCode, "AUTH_REQUIRED");
}

async function assertUiDemoWritesDisabled(baseUrl) {
  const commandResponse = await fetch(`${baseUrl}/api/ui-runtime-command`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ commandName: "buyer-org.setup", expectedVersion: 1, payload: buildSamplePayload("buyer-org.setup") })
  });
  const commandBody = await commandResponse.json();
  assert.equal(commandResponse.status, 403);
  assert.equal(commandBody.errorCode, "DEMO_WRITE_API_DISABLED");

  const resetResponse = await fetch(`${baseUrl}/api/ui-runtime-reset`, {
    method: "POST"
  });
  const resetBody = await resetResponse.json();
  assert.equal(resetResponse.status, 403);
  assert.equal(resetBody.errorCode, "DEMO_WRITE_API_DISABLED");
}

async function assertForbiddenPrivilegeFields(baseUrl) {
  const response = await fetch(`${baseUrl}/api/commands`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${internalToken}`
    },
    body: JSON.stringify({
      commandName: "escrow.release",
      actorRole: "operator",
      tokenScopes: ["finance:ledger.write"],
      tenantId: "org_demo_001",
      payload: buildSamplePayload("escrow.release")
    })
  });
  const body = await response.json();
  assert.equal(response.status, 400);
  assert.equal(body.errorCode, "FORBIDDEN_PRIVILEGE_FIELDS");
}

async function assertAuthorizedWrite(baseUrl) {
  const response = await fetch(`${baseUrl}/api/commands`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${internalToken}`
    },
    body: JSON.stringify({ commandName: "buyer-org.setup", expectedVersion: 1, payload: buildSamplePayload("buyer-org.setup") })
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.events[0].eventName, "BuyerOrgSetupUpdated");
}

async function assertFinanceWriteForbidden(baseUrl) {
  const response = await fetch(`${baseUrl}/api/commands`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${internalToken}`
    },
    body: JSON.stringify({ commandName: "escrow.release", payload: buildSamplePayload("escrow.release") })
  });
  const body = await response.json();
  assert.equal(response.status, 400);
  assert.equal(body.errorCode, "TOKEN_SCOPE_FORBIDDEN");
}

async function assertAuthorizedReset(baseUrl) {
  const response = await fetch(`${baseUrl}/api/runtime-state`, {
    method: "DELETE",
    headers: { authorization: `Bearer ${internalToken}` }
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
}
