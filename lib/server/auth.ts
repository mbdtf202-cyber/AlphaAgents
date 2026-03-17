import { createHash, randomBytes } from "node:crypto";

import { cookies } from "next/headers";

import type { ActorRole, SessionActor } from "@openclaw/agent-ledger-core";

import { getMemoryState, getActorFromMemorySession } from "./memory-store";
import { getStorageMode, getAuthSecret } from "./env";
import { AuthError, ConfigurationError, ForbiddenError } from "./errors";

export const SESSION_COOKIE_NAME = "agent_ledger_session";
export const OAUTH_STATE_COOKIE_NAME = "agent_ledger_oauth_state";

export function hashToken(token: string): string {
  return createHash("sha256").update(`${getAuthSecret()}:${token}`).digest("hex");
}

export function generateOpaqueToken() {
  return randomBytes(32).toString("hex");
}

export function buildSessionCookie(token: string, expiresAt: Date) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}${secure}`;
}

export function clearSessionCookie() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secure}`;
}

export function buildTransientCookie(name: string, value: string, maxAgeSeconds: number) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export function clearTransientCookie(name: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${name}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT${secure}`;
}

function parseCookieHeader(headerValue: string | null): Record<string, string> {
  if (!headerValue) {
    return {};
  }
  return Object.fromEntries(
    headerValue
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [key, ...rest] = part.split("=");
        return [key, rest.join("=")];
      }),
  );
}

export async function getSessionFromRequest(request: Request): Promise<SessionActor | null> {
  const parsed = parseCookieHeader(request.headers.get("cookie"));
  const raw = parsed[SESSION_COOKIE_NAME];
  if (!raw) {
    return null;
  }
  const storageMode = getStorageMode();
  if (storageMode === "sample") {
    return null;
  }
  if (storageMode === "memory") {
    return getActorFromMemorySession(hashToken(raw)) ?? null;
  }
  const { getRepositoryBundle } = await import("./repositories");
  const bundle = await getRepositoryBundle();
  return bundle.authRepository.getSessionByTokenHash(hashToken(raw));
}

export async function getServerSession(): Promise<SessionActor | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) {
    return null;
  }
  const storageMode = getStorageMode();
  if (storageMode === "sample") {
    return null;
  }
  if (storageMode === "memory") {
    return getActorFromMemorySession(hashToken(raw)) ?? null;
  }
  const { getRepositoryBundle } = await import("./repositories");
  const bundle = await getRepositoryBundle();
  return bundle.authRepository.getSessionByTokenHash(hashToken(raw));
}

export async function requireSessionFromRequest(request: Request): Promise<SessionActor> {
  const session = await getSessionFromRequest(request);
  if (!session) {
    throw new AuthError();
  }
  return session;
}

export function assertRole(session: SessionActor, allowed: ActorRole[]) {
  if (!allowed.includes(session.role)) {
    throw new ForbiddenError("You are authenticated, but your role cannot perform this action.");
  }
}

export function requireConfiguredAuthForWrite() {
  if (getStorageMode() === "sample") {
    throw new ConfigurationError("Write actions are disabled while Agent Ledger is running in sample-only mode.");
  }
}

export function getDevAuthPreviewHint() {
  const state = getMemoryState();
  return {
    buyer: state.users.find((user) => user.role === "buyer")?.email,
    builder: state.users.find((user) => user.role === "builder")?.email,
    admin: state.users.find((user) => user.role === "admin")?.email,
  };
}
