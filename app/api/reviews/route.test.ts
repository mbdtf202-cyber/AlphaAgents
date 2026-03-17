import { beforeEach, describe, expect, it } from "vitest";

import { hashToken } from "../../../lib/server/auth";
import { createMemorySession, resetMemoryState } from "../../../lib/server/memory-store";
import { POST } from "./route";

function buildReviewRequest(body: Record<string, unknown>, rawSessionToken?: string) {
  return new Request("http://localhost/api/reviews", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(rawSessionToken ? { cookie: `agent_ledger_session=${rawSessionToken}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

const baseReview = {
  installId: "install-swe-1",
  agentSlug: "swe-copilot-forge",
  versionId: "ver-swe-copilot-forge-1-4-2",
  company: "Helix Cloud",
  role: "Engineering Manager",
  headline: { en: "Still strong", "zh-CN": "依然很强" },
  body: { en: "Ownership-gated review flow works.", "zh-CN": "所有权约束评价链已生效。" },
  rating: 5,
  dimensions: {
    taskSuccess: 95,
    reliability: 94,
    costEfficiency: 80,
    latency: 82,
    safetyFootprint: 96,
    setupFriction: 84,
    operatorBurden: 89,
    domainFit: 95,
  },
};

describe("POST /api/reviews", () => {
  beforeEach(() => {
    process.env.AGENT_LEDGER_STORAGE = "memory";
    process.env.NODE_ENV = "test";
    resetMemoryState();
  });

  it("rejects unauthenticated review writes", async () => {
    const response = await POST(buildReviewRequest(baseReview));
    expect(response.status).toBe(401);
  });

  it("rejects review creation when install is not owned by the actor", async () => {
    const rawSessionToken = "builder-session";
    createMemorySession("user-sample-builder", "builder", hashToken(rawSessionToken));

    const response = await POST(buildReviewRequest(baseReview, rawSessionToken));

    expect(response.status).toBe(403);
  });

  it("persists review creation for the install owner", async () => {
    const rawSessionToken = "buyer-session";
    createMemorySession("user-sample-buyer", "buyer", hashToken(rawSessionToken));

    const response = await POST(buildReviewRequest(baseReview, rawSessionToken));
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.review.installId).toBe("install-swe-1");
    expect(json.review.ownerUserId).toBe("user-sample-buyer");
  });
});
