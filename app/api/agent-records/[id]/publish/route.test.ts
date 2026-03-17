import { beforeEach, describe, expect, it } from "vitest";

import { hashToken } from "../../../../../lib/server/auth";
import { createMemorySession, getMemoryState, resetMemoryState } from "../../../../../lib/server/memory-store";
import { POST } from "./route";

describe("POST /api/agent-records/[id]/publish", () => {
  beforeEach(() => {
    process.env.ALPHA_AGENTS_STORAGE = "memory";
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    resetMemoryState();
  });

  it("creates or updates a moderation case for version publish review", async () => {
    const rawSessionToken = "builder-session";
    createMemorySession("user-sample-builder", "builder", hashToken(rawSessionToken));

    const response = await POST(
      new Request("http://localhost/api/agent-records/swe-copilot-forge/publish", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `alpha_agents_session=${rawSessionToken}`,
        },
        body: JSON.stringify({
          versionId: "ver-swe-copilot-forge-1-4-2",
          publishNote: "Permission delta reviewed.",
        }),
      }),
      { params: Promise.resolve({ id: "swe-copilot-forge" }) },
    );

    expect(response.status).toBe(200);
    expect(
      getMemoryState().moderationCases.some(
        (item) =>
          item.entityType === "version" &&
          item.entityId === "ver-swe-copilot-forge-1-4-2" &&
          item.status === "pending",
      ),
    ).toBe(true);
  });
});
