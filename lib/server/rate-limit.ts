import { Pool } from "pg";
import { RateLimiterMemory, RateLimiterPostgres } from "rate-limiter-flexible";

import type { SessionActor } from "@openclaw/alpha-agents-core";

import { getDatabaseUrl, getStorageMode, isRateLimitDisabled } from "./env";
import { RateLimitError } from "./errors";
import { incrementRateLimitRejection } from "./metrics";

type RateLimitScope =
  | "magic-link-ip"
  | "magic-link-email"
  | "github-start-ip"
  | "write-session"
  | "write-user"
  | "import-ip";

const RATE_LIMITS: Record<RateLimitScope, { points: number; duration: number; blockDuration?: number }> = {
  "magic-link-ip": { points: 5, duration: 300, blockDuration: 900 },
  "magic-link-email": { points: 3, duration: 900, blockDuration: 1800 },
  "github-start-ip": { points: 10, duration: 300, blockDuration: 900 },
  "write-session": { points: 30, duration: 60, blockDuration: 60 },
  "write-user": { points: 20, duration: 60, blockDuration: 60 },
  "import-ip": { points: 20, duration: 300, blockDuration: 300 },
};

declare global {
  var __alphaAgentsRateLimiters: Map<string, RateLimiterPostgres | RateLimiterMemory> | undefined;
  var __alphaAgentsRateLimitPool: Pool | undefined;
}

function getRateLimitPool() {
  if (!globalThis.__alphaAgentsRateLimitPool) {
    globalThis.__alphaAgentsRateLimitPool = new Pool({
      connectionString: getDatabaseUrl(),
    });
  }
  return globalThis.__alphaAgentsRateLimitPool;
}

function getLimiter(scope: RateLimitScope) {
  if (!globalThis.__alphaAgentsRateLimiters) {
    globalThis.__alphaAgentsRateLimiters = new Map();
  }
  const existing = globalThis.__alphaAgentsRateLimiters.get(scope);
  if (existing) {
    return existing;
  }

  const config = RATE_LIMITS[scope];
  const limiter =
    getStorageMode() === "postgres"
      ? new RateLimiterPostgres({
          keyPrefix: `alpha-agents:${scope}`,
          points: config.points,
          duration: config.duration,
          blockDuration: config.blockDuration,
          storeClient: getRateLimitPool(),
          storeType: "pool",
          tableName: "alpha_agents_rate_limit_buckets",
          tableCreated: true,
          clearExpiredByTimeout: true,
        })
      : new RateLimiterMemory({
          keyPrefix: `alpha-agents:${scope}`,
          points: config.points,
          duration: config.duration,
          blockDuration: config.blockDuration,
        });

  globalThis.__alphaAgentsRateLimiters.set(scope, limiter);
  return limiter;
}

function retryAfterSecondsFromError(error: unknown, defaultSeconds: number) {
  if (error && typeof error === "object" && "msBeforeNext" in error) {
    const msBeforeNext = Number((error as { msBeforeNext?: number }).msBeforeNext ?? 0);
    return Math.max(1, Math.ceil(msBeforeNext / 1000));
  }
  return defaultSeconds;
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "127.0.0.1";
  }
  return request.headers.get("x-real-ip")?.trim() || "127.0.0.1";
}

export async function enforceRateLimit(scope: RateLimitScope, key: string) {
  if (isRateLimitDisabled()) {
    return;
  }
  const config = RATE_LIMITS[scope];
  try {
    await getLimiter(scope).consume(key, 1);
  } catch (error) {
    incrementRateLimitRejection(scope);
    throw new RateLimitError("Too many requests.", retryAfterSecondsFromError(error, config.duration));
  }
}

export async function enforceAuthenticatedWriteRateLimit(request: Request, actor: SessionActor) {
  await enforceRateLimit("write-session", `${actor.sessionId}:${getClientIp(request)}`);
  await enforceRateLimit("write-user", actor.userId);
}

export function resetRateLimiters() {
  globalThis.__alphaAgentsRateLimiters?.clear();
}

export async function closeRateLimitPool() {
  if (globalThis.__alphaAgentsRateLimitPool) {
    await globalThis.__alphaAgentsRateLimitPool.end();
    globalThis.__alphaAgentsRateLimitPool = undefined;
  }
}
