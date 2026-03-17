import { beforeEach, describe, expect, it } from "vitest";

import { hashToken } from "../../../../lib/server/auth";
import { createMemorySession, resetMemoryState } from "../../../../lib/server/memory-store";
import { POST } from "./route";

function buildRequest(body: Record<string, unknown>, rawSessionToken?: string) {
  return new Request("http://localhost/api/workspace/shortlists", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(rawSessionToken ? { cookie: `agent_ledger_session=${rawSessionToken}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/workspace/shortlists", () => {
  beforeEach(() => {
    process.env.AGENT_LEDGER_STORAGE = "memory";
    process.env.NODE_ENV = "test";
    resetMemoryState();
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
});
