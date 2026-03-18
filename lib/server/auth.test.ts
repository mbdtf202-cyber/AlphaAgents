import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  buildSessionCookie,
  buildTransientCookie,
  clearSessionCookie,
  clearTransientCookie,
  getSessionFromRequest,
  hashToken,
  normalizeRedirectPath,
  requireConfiguredAuthForWrite,
} from "./auth";
import { createMemorySession, resetMemoryState } from "./memory-store";

const ORIGINAL_ENV = { ...process.env };

function setNodeEnv(value: string) {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

describe("auth", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
    setNodeEnv("test");
    process.env.ALPHA_AGENTS_STORAGE = "memory";
    resetMemoryState();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    resetMemoryState();
  });

  it("normalizes unsafe redirects back to workspace", () => {
    expect(normalizeRedirectPath("/workspace/benchmarks")).toBe("/workspace/benchmarks");
    expect(normalizeRedirectPath("https://evil.example")).toBe("/workspace");
    expect(normalizeRedirectPath("//evil.example")).toBe("/workspace");
  });

  it("builds and clears secure cookies in production", () => {
    setNodeEnv("production");
    delete process.env.ALPHA_AGENTS_FORCE_INSECURE_COOKIES;

    expect(buildSessionCookie("raw", new Date("2026-03-18T00:00:00.000Z"))).toContain("Secure");
    expect(clearSessionCookie()).toContain("Secure");
    expect(buildTransientCookie("state", "abc", 60)).toContain("Secure");
    expect(clearTransientCookie("state")).toContain("Secure");
  });

  it("allows opting out of secure cookies in production", () => {
    setNodeEnv("production");
    process.env.ALPHA_AGENTS_FORCE_INSECURE_COOKIES = "true";

    expect(buildSessionCookie("raw", new Date("2026-03-18T00:00:00.000Z"))).not.toContain("Secure");
    expect(clearSessionCookie()).not.toContain("Secure");
    expect(buildTransientCookie("state", "abc", 60)).not.toContain("Secure");
    expect(clearTransientCookie("state")).not.toContain("Secure");
  });

  it("resolves a memory backed session from request cookies", async () => {
    const rawToken = "buyer-session";
    createMemorySession("user-sample-buyer", "buyer", hashToken(rawToken));

    const actor = await getSessionFromRequest(
      new Request("http://localhost", {
        headers: {
          cookie: `alpha_agents_session=${rawToken}`,
        },
      }),
    );

    expect(actor?.userId).toBe("user-sample-buyer");
    expect(actor?.role).toBe("buyer");
  });

  it("blocks writes in sample mode", () => {
    process.env.ALPHA_AGENTS_STORAGE = "sample";

    expect(() => requireConfiguredAuthForWrite()).toThrow("sample-only mode");
  });
});
