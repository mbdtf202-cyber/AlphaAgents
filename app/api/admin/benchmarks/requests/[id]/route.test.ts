import { beforeEach, describe, expect, it } from "vitest";

import { hashToken } from "../../../../../../lib/server/auth";
import { createMemorySession, getMemoryState, resetMemoryState } from "../../../../../../lib/server/memory-store";
import { resetRateLimiters } from "../../../../../../lib/server/rate-limit";
import { POST } from "./route";

describe("POST /api/admin/benchmarks/requests/[id]", () => {
  beforeEach(() => {
    process.env.ALPHA_AGENTS_STORAGE = "memory";
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    resetMemoryState();
    resetRateLimiters();
    getMemoryState().benchmarkRequests.push({
      id: "benchmark-request-1",
      ownerUserId: "user-sample-buyer",
      createdByUserId: "user-sample-buyer",
      agentSlug: "swe-copilot-forge",
      versionId: "ver-swe-copilot-forge-1-4-2",
      suiteSlug: "coding-command",
      status: "running",
      queuedAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
    });
  });

  it("allows an admin to force fail a benchmark request", async () => {
    const rawSessionToken = "admin-session";
    createMemorySession("user-sample-admin", "admin", hashToken(rawSessionToken));

    const response = await POST(
      new Request("http://localhost/api/admin/benchmarks/requests/benchmark-request-1", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `alpha_agents_session=${rawSessionToken}`,
        },
        body: JSON.stringify({
          action: "fail",
          failureReason: "Admin forced failure for invalid attestation.",
        }),
      }),
      { params: Promise.resolve({ id: "benchmark-request-1" }) },
    );

    expect(response.status).toBe(200);
    expect(getMemoryState().benchmarkRequests.find((request: { id: string; status?: string }) => request.id === "benchmark-request-1")?.status).toBe("failed");
  });
});
