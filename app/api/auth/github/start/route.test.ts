import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { resetRateLimiters } from "../../../../../lib/server/rate-limit";
import { GET } from "./route";

const ORIGINAL_ENV = { ...process.env };

describe("GET /api/auth/github/start", () => {
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
    resetRateLimiters();
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("redirects into github oauth and sets a transient state cookie", async () => {
    const response = await GET(new Request("http://localhost/api/auth/github/start"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("https://github.com/login/oauth/authorize");
    expect(response.headers.get("set-cookie")).toContain("alpha_agents_oauth_state=");
  });

  it("returns 503 when github oauth is not configured", async () => {
    delete process.env.GITHUB_CLIENT_ID;

    const response = await GET(new Request("http://localhost/api/auth/github/start"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/login?error=github_not_configured");
  });
});
