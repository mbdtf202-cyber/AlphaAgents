import { beforeEach, describe, expect, it } from "vitest";

import { hashToken } from "../../../../lib/server/auth";
import { createMemorySession, getMemoryState, resetMemoryState } from "../../../../lib/server/memory-store";
import { resetRateLimiters } from "../../../../lib/server/rate-limit";
import { POST } from "./route";

describe("POST /api/installs/verify", () => {
  beforeEach(() => {
    process.env.ALPHA_AGENTS_STORAGE = "memory";
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    resetMemoryState();
    resetRateLimiters();
  });

  it("persists a verified install for the current actor", async () => {
    const rawSessionToken = "buyer-session";
    createMemorySession("user-sample-buyer", "buyer", hashToken(rawSessionToken));

    const response = await POST(
      new Request("http://localhost/api/installs/verify", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `alpha_agents_session=${rawSessionToken}`,
        },
        body: JSON.stringify({
          agentSlug: "swe-copilot-forge",
          versionId: "ver-swe-copilot-forge-1-4-2",
          packageHash: "sha256:package-hash-123456",
          anonymousRuntimeFingerprint: "fingerprint-123456",
        }),
      }),
    );
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.install.agentSlug).toBe("swe-copilot-forge");
    expect(getMemoryState().installs.at(-1)?.agentSlug).toBe("swe-copilot-forge");
  });
});
