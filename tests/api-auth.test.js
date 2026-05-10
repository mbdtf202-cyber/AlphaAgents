import assert from "node:assert/strict";
import test from "node:test";

import {
  buildAuthorizedCommandEnvelope,
  canResetRuntimeState,
  hasScope,
  hasForbiddenPrivilegeFields,
  requireRuntimeApiAuth,
  resolveServerActorRole
} from "../lib/alphaagents/api-auth.js";
import { buildSamplePayload } from "../lib/alphaagents/commands.js";
import { executeRuntimeCommand } from "../lib/alphaagents/runtime-engine.js";
import { createTempStateFile, loadRuntimeState, resetRuntimeState } from "../lib/alphaagents/runtime-state.js";

const originalEnv = {
  ALPHAAGENTS_ENABLE_DEMO_WRITE_API: process.env.ALPHAAGENTS_ENABLE_DEMO_WRITE_API,
  ALPHAAGENTS_INTERNAL_API_TOKEN: process.env.ALPHAAGENTS_INTERNAL_API_TOKEN,
  ALPHAAGENTS_INTERNAL_API_ACTOR_ROLES: process.env.ALPHAAGENTS_INTERNAL_API_ACTOR_ROLES,
  ALPHAAGENTS_INTERNAL_API_SCOPES: process.env.ALPHAAGENTS_INTERNAL_API_SCOPES,
  ALPHAAGENTS_INTERNAL_TENANT_ID: process.env.ALPHAAGENTS_INTERNAL_TENANT_ID,
  NODE_ENV: process.env.NODE_ENV
};

test.afterEach(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test("runtime API auth fails closed when demo mode and internal token are absent", () => {
  process.env.ALPHAAGENTS_ENABLE_DEMO_WRITE_API = "false";
  delete process.env.ALPHAAGENTS_INTERNAL_API_TOKEN;
  delete process.env.ALPHAAGENTS_INTERNAL_API_ACTOR_ROLES;
  delete process.env.ALPHAAGENTS_INTERNAL_API_SCOPES;

  const auth = requireRuntimeApiAuth(new Request("http://alphaagents.test/api/commands"));

  assert(auth.error);
  assert.equal(auth.error.status, 503);
  assert.equal(auth.error.errorCode, "API_TOKEN_NOT_CONFIGURED");
});

test("runtime API auth rejects invalid tokens and accepts bearer or internal-token header", () => {
  process.env.ALPHAAGENTS_ENABLE_DEMO_WRITE_API = "false";
  process.env.ALPHAAGENTS_INTERNAL_API_TOKEN = "test-internal-token";
  delete process.env.ALPHAAGENTS_INTERNAL_API_ACTOR_ROLES;
  delete process.env.ALPHAAGENTS_INTERNAL_API_SCOPES;

  const rejected = requireRuntimeApiAuth(new Request("http://alphaagents.test/api/commands", {
    headers: { authorization: "Bearer wrong-token" }
  }));
  assert(rejected.error);
  assert.equal(rejected.error.status, 401);

  const bearer = requireRuntimeApiAuth(new Request("http://alphaagents.test/api/commands", {
    headers: { authorization: "Bearer test-internal-token" }
  }));
  assert.equal(bearer.error, null);
  assert.equal(bearer.mode, "internal");

  const header = requireRuntimeApiAuth(new Request("http://alphaagents.test/api/commands", {
    headers: { "x-alphaagents-internal-token": "test-internal-token" }
  }));
  assert.equal(header.error, null);
  assert.equal(header.tenantId, "org_demo_001");
  assert.deepEqual(header.actorRoles, ["buyer"]);
  assert.deepEqual(header.tokenScopes, ["buyer:orders.write"]);
});

test("runtime API rejects caller-controlled privilege fields before command dispatch", () => {
  const forbidden = hasForbiddenPrivilegeFields({
    commandName: "escrow.release",
    actorRole: "operator",
    actorId: "attacker",
    tenantId: "org_other_001",
    tokenScopes: ["finance:ledger.write"],
    payload: buildSamplePayload("escrow.release")
  });

  assert.deepEqual(forbidden, ["actorRole", "actorId", "tenantId", "tokenScopes"]);
});

test("authorized envelope derives role tenant and scopes server-side", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);
  const body = {
    commandName: "buyer-org.setup",
    expectedVersion: 1,
    payload: buildSamplePayload("buyer-org.setup")
  };
  const envelope = buildAuthorizedCommandEnvelope(body.commandName, body, {
    actorId: "internal_api_001",
    tenantId: "org_demo_001",
    tokenScopes: ["buyer:orders.write"],
    actorRoles: ["buyer"]
  });

  const result = executeRuntimeCommand(body.commandName, envelope, { stateFile });
  const state = loadRuntimeState(stateFile);

  assert.equal(envelope.actorRole, "buyer");
  assert.equal(envelope.tenantId, "org_demo_001");
  assert.deepEqual(envelope.tokenScopes, ["buyer:orders.write"]);
  assert.equal(result.ok, true);
  assert.equal(state.buyers[0].legalContactUserId, "user_demo_legal_owner");
  assert.equal(state.eventLog.at(-1).eventName, "BuyerOrgSetupUpdated");
});

test("server actor resolution handles legacy catalog aliases", () => {
  assert.equal(resolveServerActorRole("agent-category update", { actorRoles: ["operator"] }), "operator");
  assert.equal(resolveServerActorRole("rfp.create", { actorRoles: ["buyer"] }), "buyer");
  assert.equal(resolveServerActorRole("proposal.submit", { actorRoles: ["seller"] }), "seller");
  assert.equal(resolveServerActorRole("escrow.release", { actorRoles: ["buyer"] }), "unauthorized");
});

test("internal token principal scopes and roles come from server configuration", () => {
  process.env.ALPHAAGENTS_ENABLE_DEMO_WRITE_API = "false";
  process.env.ALPHAAGENTS_INTERNAL_API_TOKEN = "test-internal-token";
  process.env.ALPHAAGENTS_INTERNAL_API_ACTOR_ROLES = "operator";
  process.env.ALPHAAGENTS_INTERNAL_API_SCOPES = "operator:catalog.write,runtime:state.reset";

  const auth = requireRuntimeApiAuth(new Request("http://alphaagents.test/api/commands", {
    headers: { authorization: "Bearer test-internal-token" }
  }));

  assert.equal(auth.error, null);
  assert.deepEqual(auth.actorRoles, ["operator"]);
  assert.deepEqual(auth.tokenScopes, ["operator:catalog.write", "runtime:state.reset"]);
  assert.equal(hasScope(auth, "runtime:state.reset"), true);
  assert.equal(hasScope(auth, "finance:ledger.write"), false);
});

test("server-derived envelope cannot elevate beyond principal roles or scopes", () => {
  const stateFile = createTempStateFile();
  resetRuntimeState(stateFile);
  const envelope = buildAuthorizedCommandEnvelope(
    "escrow.release",
    { commandName: "escrow.release", payload: buildSamplePayload("escrow.release") },
    {
      actorId: "internal_api_001",
      tenantId: "org_demo_001",
      tokenScopes: ["buyer:orders.write"],
      actorRoles: ["buyer"]
    }
  );

  const result = executeRuntimeCommand("escrow.release", envelope, { stateFile });

  assert.equal(envelope.actorRole, "unauthorized");
  assert.deepEqual(envelope.tokenScopes, ["buyer:orders.write"]);
  assert.equal(result.ok, false);
  assert.equal(result.errorCode, "ACTOR_FORBIDDEN");
});

test("demo auth cannot satisfy internal-only reset guard", () => {
  process.env.NODE_ENV = "development";
  process.env.ALPHAAGENTS_ENABLE_DEMO_WRITE_API = "true";
  delete process.env.ALPHAAGENTS_INTERNAL_API_TOKEN;

  const auth = requireRuntimeApiAuth(new Request("http://alphaagents.test/api/runtime-state"));

  assert.equal(auth.error, null);
  assert.equal(auth.mode, "demo");
  assert.equal(auth.actorRoles.includes("operator"), true);
  assert.equal(hasScope(auth, "runtime:state.reset"), true);
  assert.equal(canResetRuntimeState(auth), false);
  assert.equal(canResetRuntimeState({
    mode: "internal",
    actorRoles: ["operator"],
    tokenScopes: ["runtime:state.reset"]
  }), true);
});
