import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { GET } from "./route";
import { resetMemoryState } from "../../../../../lib/server/memory-store";

const ORIGINAL_ENV = { ...process.env };

describe("GET /api/auth/github/callback", () => {
  beforeEach(() => {
    process.env = {
      ...ORIGINAL_ENV,
      NODE_ENV: "test",
      ALPHA_AGENTS_STORAGE: "memory",
      ALPHA_AGENTS_AUTH_SECRET: "test-secret",
      GITHUB_CLIENT_ID: "github-client-id",
      GITHUB_CLIENT_SECRET: "github-client-secret",
      ALPHA_AGENTS_APP_URL: "http://localhost:3100",
    };
    resetMemoryState();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    resetMemoryState();
    vi.restoreAllMocks();
  });

  it("rejects invalid oauth state", async () => {
    const response = await GET(
      new Request("http://localhost/api/auth/github/callback?code=test-code&state=wrong-state", {
        headers: {
          cookie: "alpha_agents_oauth_state=expected-state",
        },
      }),
    );

    expect(response.headers.get("location")).toBe("http://localhost/login?error=invalid_oauth_state");
  });

  it("creates a builder session after a successful github exchange", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          json: async () => ({ access_token: "github-token" }),
        })
        .mockResolvedValueOnce({
          json: async () => ({ id: 42, login: "release-builder", email: null, name: "Release Builder" }),
        })
        .mockResolvedValueOnce({
          json: async () => [{ email: "builder@example.com", primary: true, verified: true }],
        }),
    );

    const response = await GET(
      new Request("http://localhost/api/auth/github/callback?code=test-code&state=expected-state", {
        headers: {
          cookie: "alpha_agents_oauth_state=expected-state; alpha-agents-workspace-home=/workspace/agents",
        },
      }),
    );

    expect(response.headers.get("location")).toBe("http://localhost/workspace/agents");
    expect(response.headers.get("set-cookie")).toContain("alpha_agents_session=");
  });
});
