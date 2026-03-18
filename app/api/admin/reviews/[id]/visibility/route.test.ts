import { beforeEach, describe, expect, it } from "vitest";

import { hashToken } from "../../../../../../lib/server/auth";
import { createMemorySession, getMemoryState, resetMemoryState } from "../../../../../../lib/server/memory-store";
import { resetRateLimiters } from "../../../../../../lib/server/rate-limit";
import { POST } from "./route";

describe("POST /api/admin/reviews/[id]/visibility", () => {
  beforeEach(() => {
    process.env.ALPHA_AGENTS_STORAGE = "memory";
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    resetMemoryState();
    resetRateLimiters();
  });

  it("hides a review via the admin moderation route", async () => {
    const rawSessionToken = "admin-session";
    createMemorySession("user-sample-admin", "admin", hashToken(rawSessionToken));

    const response = await POST(
      new Request("http://localhost/api/admin/reviews/review-swe-1/visibility", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `alpha_agents_session=${rawSessionToken}`,
        },
        body: JSON.stringify({
          visibilityStatus: "hidden",
          note: "Hide while reviewing provenance.",
        }),
      }),
      { params: Promise.resolve({ id: "review-swe-1" }) },
    );

    expect(response.status).toBe(200);
    expect(getMemoryState().reviews.find((review: { id: string; visibilityStatus?: string }) => review.id === "review-swe-1")?.visibilityStatus).toBe("hidden");
  });
});
