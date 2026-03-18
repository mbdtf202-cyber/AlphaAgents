import { beforeEach, describe, expect, it } from "vitest";

import { hashToken } from "../../../lib/server/auth";
import { createMemorySession, getMemoryState, resetMemoryState } from "../../../lib/server/memory-store";
import { DELETE, POST } from "./route";

function buildRequest(method: "POST" | "DELETE", body: Record<string, unknown>, rawSessionToken?: string) {
  return new Request("http://localhost/api/follows", {
    method,
    headers: {
      "content-type": "application/json",
      ...(rawSessionToken ? { cookie: `alpha_agents_session=${rawSessionToken}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

describe("/api/follows", () => {
  beforeEach(() => {
    process.env.ALPHA_AGENTS_STORAGE = "memory";
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    resetMemoryState();
  });

  it("creates and removes a follow edge for the current actor", async () => {
    const rawSessionToken = "buyer-session";
    createMemorySession("user-sample-buyer", "buyer", hashToken(rawSessionToken));

    const followResponse = await POST(
      buildRequest("POST", { subjectType: "agent", subjectId: "agent-workflow-orchestrator" }, rawSessionToken),
    );
    expect(followResponse.status).toBe(201);
    expect(
      getMemoryState().relationships.some(
        (edge) =>
          edge.type === "follows" &&
          edge.fromType === "user" &&
          edge.fromId === "user-sample-buyer" &&
          edge.toType === "agent" &&
          edge.toId === "agent-workflow-orchestrator",
      ),
    ).toBe(true);

    const unfollowResponse = await DELETE(
      buildRequest("DELETE", { subjectType: "agent", subjectId: "agent-workflow-orchestrator" }, rawSessionToken),
    );
    expect(unfollowResponse.status).toBe(200);
    expect(
      getMemoryState().relationships.some(
        (edge) =>
          edge.type === "follows" &&
          edge.fromType === "user" &&
          edge.fromId === "user-sample-buyer" &&
          edge.toType === "agent" &&
          edge.toId === "agent-workflow-orchestrator",
      ),
    ).toBe(false);
  });
});
