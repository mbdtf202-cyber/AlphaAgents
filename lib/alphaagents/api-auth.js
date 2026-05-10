import crypto from "node:crypto";

import { contract } from "./data.js";

const forbiddenPrivilegeFields = ["actorRole", "actorId", "tenantId", "tokenScopes"];
const defaultInternalApiScopes = ["buyer:orders.write"];
const defaultInternalApiRoles = ["buyer"];
const actorRoles = ["buyer", "seller", "operator", "system", "agent_runtime"];

const legacyCommandNameMap = {
  "agent-category create": "agent-category.create",
  "agent-category update": "agent-category.update",
  "agent-category archive": "agent-category.archive",
  "agent-category restore": "agent-category.restore",
  "agent-passport create": "agent-passport.create",
  "agent-passport update": "agent-passport.update",
  "agent-passport suspend": "agent-passport.suspend",
  "agent-listing publish": "agent-listing.publish",
  "agent-listing update": "agent-listing.update",
  "agent-listing archive": "agent-listing.archive"
};

export function hasForbiddenPrivilegeFields(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return [];
  return forbiddenPrivilegeFields.filter((field) => Object.hasOwn(body, field));
}

export function requireRuntimeApiAuth(request, { allowDemo = isDemoWriteApiEnabled() } = {}) {
  if (allowDemo) {
    return {
      error: null,
      mode: "demo",
      actorId: "user_demo_api_001",
      tenantId: "org_demo_001",
      tokenScopes: contract.scopes,
      actorRoles
    };
  }

  const configuredToken = process.env.ALPHAAGENTS_INTERNAL_API_TOKEN;
  if (!configuredToken) {
    return {
      error: {
        status: 503,
        errorCode: "API_TOKEN_NOT_CONFIGURED",
        message: "Runtime write API requires ALPHAAGENTS_INTERNAL_API_TOKEN or explicit demo mode."
      }
    };
  }

  const suppliedToken = readBearerToken(request) ?? request.headers.get("x-alphaagents-internal-token");
  if (!suppliedToken || !constantTimeEquals(suppliedToken, configuredToken)) {
    return {
      error: {
        status: 401,
        errorCode: "AUTH_REQUIRED",
        message: "Runtime write API requires a valid internal API token."
      }
    };
  }

  return {
    error: null,
    mode: "internal",
    actorId: process.env.ALPHAAGENTS_INTERNAL_ACTOR_ID ?? "internal_api_001",
    tenantId: process.env.ALPHAAGENTS_INTERNAL_TENANT_ID ?? "org_demo_001",
    tokenScopes: parseCsvEnv("ALPHAAGENTS_INTERNAL_API_SCOPES", defaultInternalApiScopes, contract.scopes),
    actorRoles: parseCsvEnv("ALPHAAGENTS_INTERNAL_API_ACTOR_ROLES", defaultInternalApiRoles, actorRoles)
  };
}

export function buildAuthorizedCommandEnvelope(commandName, body, authContext, sourceChannel = "api") {
  const payload = body.payload ?? {};
  const actorRole = resolveServerActorRole(commandName, authContext);
  return {
    commandId: body.commandId ?? `cmd_${crypto.randomUUID().slice(0, 12)}`,
    actorId: authContext.actorId,
    actorRole,
    sourceChannel,
    tenantId: authContext.tenantId,
    tokenScopes: authContext.tokenScopes,
    idempotencyKey: body.idempotencyKey ?? `idem_${crypto.randomUUID().slice(0, 12)}`,
    correlationId: body.correlationId ?? `corr_${crypto.randomUUID().slice(0, 12)}`,
    expectedVersion: body.expectedVersion,
    payload
  };
}

export function resolveServerActorRole(commandName, authContext = {}) {
  const normalized = legacyCommandNameMap[commandName] ?? commandName;
  const spec = contract.commands[normalized] ?? contract.commands[commandName];
  const authorizedRoles = authContext.actorRoles ?? [];
  return spec?.actorRoles?.find((role) => authorizedRoles.includes(role)) ?? "unauthorized";
}

export function isDemoWriteApiEnabled() {
  return process.env.ALPHAAGENTS_ENABLE_DEMO_WRITE_API === "true" && process.env.NODE_ENV !== "production";
}

export function hasScope(authContext, scope) {
  return Boolean(authContext?.tokenScopes?.includes(scope));
}

export function canResetRuntimeState(authContext) {
  return authContext?.mode === "internal" && authContext.actorRoles?.includes("operator") && hasScope(authContext, "runtime:state.reset");
}

function readBearerToken(request) {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function constantTimeEquals(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function parseCsvEnv(key, fallback, allowedValues) {
  const raw = process.env[key];
  const values = raw?.split(",").map((value) => value.trim()).filter(Boolean) ?? fallback;
  return [...new Set(values)].filter((value) => allowedValues.includes(value));
}
