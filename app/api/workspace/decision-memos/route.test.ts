import { beforeEach, describe, expect, it } from "vitest";

import { hashToken } from "../../../../lib/server/auth";
import { createMemorySession, resetMemoryState } from "../../../../lib/server/memory-store";
import { resetRateLimiters } from "../../../../lib/server/rate-limit";
import { POST } from "./route";

function buildRequest(body: Record<string, unknown>, rawSessionToken?: string) {
  return new Request("http://localhost/api/workspace/decision-memos", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(rawSessionToken ? { cookie: `alpha_agents_session=${rawSessionToken}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

const validPayload = {
  shortlistId: "shortlist-sample-1",
  title: { en: "Pilot recommendation", "zh-CN": "试点建议" },
  summary: { en: "Use the shortlist for a controlled pilot.", "zh-CN": "基于该列表进行受控试点。" },
  recommendationState: "pilot",
  rolloutRecommendation: { en: "Start with a narrow pilot.", "zh-CN": "先做小范围试点。" },
  tradeoffs: [{ en: "Higher setup, lower risk.", "zh-CN": "配置更高，但风险更低。" }],
  evidenceSummary: { en: "Signals come from profile evidence.", "zh-CN": "证据来自档案信号。" },
  riskSummary: { en: "Live proof is still growing.", "zh-CN": "live 证明仍在增长。" },
};

describe("POST /api/workspace/decision-memos", () => {
  beforeEach(() => {
    process.env.ALPHA_AGENTS_STORAGE = "memory";
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    resetMemoryState();
    resetRateLimiters();
  });

  it("rejects unauthenticated writes", async () => {
    const response = await POST(buildRequest(validPayload));

    expect(response.status).toBe(401);
  });

  it("rejects builder actors for buyer-owned memo workflows", async () => {
    const rawSessionToken = "builder-session";
    createMemorySession("user-sample-builder", "builder", hashToken(rawSessionToken));

    const response = await POST(buildRequest(validPayload, rawSessionToken));

    expect(response.status).toBe(403);
  });

  it("persists a decision memo for buyers", async () => {
    const rawSessionToken = "buyer-session";
    createMemorySession("user-sample-buyer", "buyer", hashToken(rawSessionToken));

    const response = await POST(buildRequest(validPayload, rawSessionToken));
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.memo.shortlistId).toBe("shortlist-sample-1");
    expect(json.memo.ownerUserId).toBe("user-sample-buyer");
  });
});
