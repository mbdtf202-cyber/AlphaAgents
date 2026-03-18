import { beforeEach, describe, expect, it } from "vitest";

import { hashToken } from "../../../../lib/server/auth";
import { createMemorySession, resetMemoryState } from "../../../../lib/server/memory-store";
import { resetRateLimiters } from "../../../../lib/server/rate-limit";
import { POST } from "./route";

function buildRequest(body: Record<string, unknown>, rawSessionToken?: string) {
  return new Request("http://localhost/api/workspace/shortlists", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(rawSessionToken ? { cookie: `alpha_agents_session=${rawSessionToken}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/workspace/shortlists", () => {
  beforeEach(() => {
    process.env.ALPHA_AGENTS_STORAGE = "memory";
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    resetMemoryState();
    resetRateLimiters();
  });

  it("rejects unauthenticated writes", async () => {
    const response = await POST(
      buildRequest({
        name: { en: "Buyer shortlist", "zh-CN": "买方短名单" },
        buyerType: "team",
        agentSlugs: ["swe-copilot-forge"],
      }),
    );

    expect(response.status).toBe(401);
  });

  it("persists a shortlist for the current actor", async () => {
    const rawSessionToken = "buyer-session";
    createMemorySession("user-sample-buyer", "buyer", hashToken(rawSessionToken));

    const response = await POST(
      buildRequest(
        {
          name: { en: "Buyer shortlist", "zh-CN": "买方短名单" },
          buyerType: "team",
          agentSlugs: ["swe-copilot-forge", "research-brief-operator"],
        },
        rawSessionToken,
      ),
    );
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.shortlist.agentSlugs).toHaveLength(2);
    expect(json.shortlist.ownerUserId).toBe("user-sample-buyer");
  });

  it("rejects builder actors for buyer-owned shortlist workflows", async () => {
    const rawSessionToken = "builder-session";
    createMemorySession("user-sample-builder", "builder", hashToken(rawSessionToken));

    const response = await POST(
      buildRequest(
        {
          name: { en: "Builder shortlist", "zh-CN": "Builder 列表" },
          buyerType: "team",
          agentSlugs: ["swe-copilot-forge"],
        },
        rawSessionToken,
      ),
    );

    expect(response.status).toBe(403);
  });
});
