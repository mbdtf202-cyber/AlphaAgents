import { beforeEach, describe, expect, it } from "vitest";

import { hashToken } from "../../../lib/server/auth";
import { createMemorySession, getMemoryState, resetMemoryState } from "../../../lib/server/memory-store";
import { POST } from "./route";

describe("POST /api/submissions", () => {
  beforeEach(() => {
    process.env.ALPHA_AGENTS_STORAGE = "memory";
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    resetMemoryState();
  });

  it("creates a moderation case when a builder submits a draft", async () => {
    const rawSessionToken = "builder-session";
    createMemorySession("user-sample-builder", "builder", hashToken(rawSessionToken));

    const response = await POST(
      new Request("http://localhost/api/submissions", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `alpha_agents_session=${rawSessionToken}`,
        },
        body: JSON.stringify({
          agentName: "New Coding Operator",
          agentSlug: "new-coding-operator",
          builderHandle: "northframe",
          sourceKind: "github",
          sourceUrl: "https://github.com/northframe/new-coding-operator",
          installCommand: "git clone https://github.com/northframe/new-coding-operator",
          summary: { en: "Imported draft", "zh-CN": "导入草稿" },
          permissionManifest: {
            summary: { en: "Needs review", "zh-CN": "待复核" },
            skills: ["software-architecture"],
            secrets: [],
            networkAccess: [],
            fileAccess: ["workspace read/write"],
            shellAccess: true,
            automationHooks: false,
            riskLevel: "medium",
          },
          dependencies: ["GitHub repository access"],
          knownLimits: [{ en: "Draft only", "zh-CN": "仅草稿" }],
          supportedEnvironments: ["macOS"],
        }),
      }),
    );
    const json = await response.json();
    const state = getMemoryState();

    expect(response.status).toBe(201);
    expect(json.submission.agentSlug).toBe("new-coding-operator");
    expect(
      state.moderationCases.some(
        (item) => item.entityType === "submission" && item.entityId === json.submission.id && item.status === "pending",
      ),
    ).toBe(true);
  });
});
