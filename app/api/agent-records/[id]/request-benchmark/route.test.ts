import { beforeEach, describe, expect, it } from "vitest";

import { hashToken } from "../../../../../lib/server/auth";
import { createMemorySession, getMemoryState, resetMemoryState } from "../../../../../lib/server/memory-store";
import { resetRateLimiters } from "../../../../../lib/server/rate-limit";
import { POST } from "./route";

describe("POST /api/agent-records/[id]/request-benchmark", () => {
  beforeEach(() => {
    process.env.ALPHA_AGENTS_STORAGE = "memory";
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    delete process.env.DATABASE_URL;
    resetMemoryState();
    resetRateLimiters();
  });

  it("fails fast when benchmark queue infrastructure is unavailable", async () => {
    const rawSessionToken = "buyer-session";
    createMemorySession("user-sample-buyer", "buyer", hashToken(rawSessionToken));

    const response = await POST(
      new Request("http://localhost/api/agent-records/swe-copilot-forge/request-benchmark", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `alpha_agents_session=${rawSessionToken}`,
        },
        body: JSON.stringify({
          suiteSlug: "coding-command",
          versionId: "ver-swe-copilot-forge-1-4-2",
          objective: "Verify version-specific queue semantics.",
        }),
      }),
      { params: Promise.resolve({ id: "swe-copilot-forge" }) },
    );
    const json = await response.json();

    expect(response.status).toBe(503);
    expect(json.error).toContain("DATABASE_URL is required");
    expect(getMemoryState().benchmarkRequests[0]?.status).toBe("failed");
  });
});
