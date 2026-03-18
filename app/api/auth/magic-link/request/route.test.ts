import { beforeEach, describe, expect, it } from "vitest";

import { getMemoryState, resetMemoryState } from "../../../../../lib/server/memory-store";
import { resetRateLimiters } from "../../../../../lib/server/rate-limit";
import { POST } from "./route";
import { GET as verifyMagicLink } from "../verify/route";

describe("magic link flow", () => {
  beforeEach(() => {
    process.env.ALPHA_AGENTS_STORAGE = "memory";
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    process.env.ALPHA_AGENTS_ENABLE_TEST_MAILER = "true";
    process.env.ALPHA_AGENTS_APP_URL = "http://localhost:3200";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3200";
    resetMemoryState();
    resetRateLimiters();
  });

  it("normalizes redirect targets and binds verify redirects to stored challenge state", async () => {
    const requestResponse = await POST(
      new Request("http://localhost:3200/api/auth/magic-link/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email: "buyer@example.com",
          redirectTo: "https://evil.example/phish",
          role: "buyer",
        }),
      }),
    );
    const requestJson = await requestResponse.json();
    const previewUrl = new URL(requestJson.previewUrl);
    const token = previewUrl.searchParams.get("token");

    expect(requestResponse.status).toBe(202);
    expect(previewUrl.origin).toBe("http://localhost:3200");
    expect(previewUrl.searchParams.has("redirectTo")).toBe(false);
    expect(getMemoryState().magicLinks[0]?.redirectTo).toBe("/workspace");

    const verifyResponse = await verifyMagicLink(
      new Request(`http://localhost:3200/api/auth/magic-link/verify?token=${token}&redirectTo=/evil`, {
        method: "GET",
        headers: {
          cookie: "alpha-agents-workspace-home=/workspace/shortlists",
        },
      }),
    );

    expect(verifyResponse.headers.get("location")).toBe("http://localhost:3200/workspace/shortlists");
  });
});
