import { beforeEach, describe, expect, it } from "vitest";

import { hashToken } from "../../../../../../lib/server/auth";
import { createMemorySession, getMemoryState, resetMemoryState } from "../../../../../../lib/server/memory-store";
import { resetRateLimiters } from "../../../../../../lib/server/rate-limit";
import { POST } from "./route";

describe("POST /api/admin/moderation/[id]/decision", () => {
  beforeEach(() => {
    process.env.ALPHA_AGENTS_STORAGE = "memory";
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    resetMemoryState();
    resetRateLimiters();
  });

  it("approving a submission creates a live agent record", async () => {
    const rawSessionToken = "admin-session";
    createMemorySession("user-sample-admin", "admin", hashToken(rawSessionToken));

    const state = getMemoryState();
    state.submissions.push({
      id: "submission-new-agent",
      ownerUserId: "user-sample-builder",
      createdByUserId: "user-sample-builder",
      agentName: "Verified Research Agent",
      agentSlug: "verified-research-agent",
      builderHandle: "new-builder",
      sourceKind: "github",
      sourceUrl: "https://github.com/example/verified-research-agent",
      installCommand: "git clone https://github.com/example/verified-research-agent",
      summary: { en: "Research-first agent", "zh-CN": "研究优先 Agent" },
      permissionManifest: {
        id: "perm-new-agent",
        summary: { en: "Research workflows", "zh-CN": "研究工作流" },
        skills: ["research"],
        secrets: [],
        networkAccess: ["api.github.com"],
        fileAccess: ["workspace read/write"],
        shellAccess: false,
        automationHooks: false,
        riskLevel: "medium",
      },
      dependencies: ["GitHub repository access"],
      knownLimits: [{ en: "Needs review for unsupported sources.", "zh-CN": "对不受支持来源仍需复核。" }],
      supportedEnvironments: ["macOS"],
      initialVersion: "0.1.0",
      initialBundleHash: "sha256:new-agent-bundle",
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    state.moderationCases.push({
      id: "moderation-submission-new-agent",
      entityType: "submission",
      entityId: "submission-new-agent",
      title: "New submission review",
      status: "pending",
      reason: { en: "Needs approval.", "zh-CN": "需要批准。" },
      assignedTo: "trust-team",
      updatedAt: new Date().toISOString(),
    });

    const response = await POST(
      new Request("http://localhost/api/admin/moderation/moderation-submission-new-agent/decision", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `alpha_agents_session=${rawSessionToken}`,
        },
        body: JSON.stringify({
          status: "approved",
          note: "Submission approved for public release.",
        }),
      }),
      { params: Promise.resolve({ id: "moderation-submission-new-agent" }) },
    );

    expect(response.status).toBe(200);
    expect(state.agents.some((agent) => agent.slug === "verified-research-agent")).toBe(true);
    expect(state.submissions.find((entry) => entry.id === "submission-new-agent")?.status).toBe("approved");
  });

  it("approving a version moves it back to verified", async () => {
    const rawSessionToken = "admin-session";
    createMemorySession("user-sample-admin", "admin", hashToken(rawSessionToken));

    const state = getMemoryState();
    const agent = state.agents.find((entry) => entry.slug === "swe-copilot-forge");
    const version = agent?.versions.find((entry) => entry.id === "ver-swe-copilot-forge-1-4-2");
    if (!agent || !version) {
      throw new Error("Missing sample agent fixture.");
    }
    version.status = "review";
    agent.verificationStatus = "review";
    state.moderationCases.push({
      id: "moderation-version-swe",
      entityType: "version",
      entityId: version.id,
      title: "Version verification review",
      status: "pending",
      reason: { en: "Re-verify version.", "zh-CN": "重新验证版本。" },
      assignedTo: "trust-team",
      updatedAt: new Date().toISOString(),
    });

    const response = await POST(
      new Request("http://localhost/api/admin/moderation/moderation-version-swe/decision", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `alpha_agents_session=${rawSessionToken}`,
        },
        body: JSON.stringify({
          status: "approved",
          note: "Version approved after attestation review.",
        }),
      }),
      { params: Promise.resolve({ id: "moderation-version-swe" }) },
    );

    expect(response.status).toBe(200);
    expect(version.status).toBe("verified");
    expect(agent.verificationStatus).toBe("verified");
  });
});
