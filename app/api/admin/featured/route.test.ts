import { beforeEach, describe, expect, it } from "vitest";

import { hashToken } from "../../../../lib/server/auth";
import { createMemorySession, getMemoryState, resetMemoryState } from "../../../../lib/server/memory-store";
import { resetRateLimiters } from "../../../../lib/server/rate-limit";
import { POST } from "./route";

describe("POST /api/admin/featured", () => {
  beforeEach(() => {
    process.env.ALPHA_AGENTS_STORAGE = "memory";
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    resetMemoryState();
    resetRateLimiters();
  });

  it("updates an existing featured slot", async () => {
    const rawSessionToken = "admin-session";
    createMemorySession("user-sample-admin", "admin", hashToken(rawSessionToken));

    const response = await POST(
      new Request("http://localhost/api/admin/featured", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `alpha_agents_session=${rawSessionToken}`,
        },
        body: JSON.stringify({
          slotKey: "coding-primary",
          agentSlug: "research-brief-operator",
          title: { en: "Research first", "zh-CN": "研究优先" },
          description: { en: "Now highlighting research.", "zh-CN": "现在突出研究。" },
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(getMemoryState().featureSlots.find((slot) => slot.slotKey === "coding-primary")?.agentSlug).toBe("research-brief-operator");
  });
});
