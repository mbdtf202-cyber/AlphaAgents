import { beforeEach, describe, expect, it } from "vitest";

import { getMemoryState, resetMemoryState } from "../../../../../lib/server/memory-store";
import { POST } from "./route";
import { GET as verifyMagicLink } from "../verify/route";

describe("magic link flow", () => {
  beforeEach(() => {
    process.env.ALPHA_AGENTS_STORAGE = "memory";
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    resetMemoryState();
  });

  it("normalizes redirect targets and binds verify redirects to stored challenge state", async () => {
    const requestResponse = await POST(
      new Request("http://localhost/api/auth/magic-link/request", {
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

    expect(requestResponse.status).toBe(200);
    expect(previewUrl.searchParams.has("redirectTo")).toBe(false);
    expect(getMemoryState().magicLinks[0]?.redirectTo).toBe("/workspace");

    const verifyResponse = await verifyMagicLink(
      new Request(`http://localhost/api/auth/magic-link/verify?token=${token}&redirectTo=/evil`, {
        method: "GET",
      }),
    );

    expect(verifyResponse.headers.get("location")).toBe("http://localhost/workspace");
  });
});
