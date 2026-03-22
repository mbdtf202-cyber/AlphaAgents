import { beforeEach, describe, expect, it } from "vitest";

import { hashToken } from "../../../../../lib/server/auth";
import { createMemorySession, getMemoryState, resetMemoryState } from "../../../../../lib/server/memory-store";
import { resetRateLimiters } from "../../../../../lib/server/rate-limit";
import { POST } from "./route";

describe("POST /api/workspace/arena/trading-configs", () => {
  beforeEach(() => {
    process.env.ALPHA_AGENTS_STORAGE = "memory";
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    resetMemoryState();
    resetRateLimiters();
  });

  it("creates a trading version config for a builder-owned agent version", async () => {
    const rawSessionToken = "builder-arena-config-session";
    createMemorySession("user-sample-builder", "builder", hashToken(rawSessionToken));

    const response = await POST(
      new Request("http://localhost/api/workspace/arena/trading-configs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `alpha_agents_session=${rawSessionToken}`,
        },
        body: JSON.stringify({
          agentSlug: "swe-copilot-forge",
          agentVersionId: "ver-swe-copilot-forge-1-4-2",
          sourceKind: "clawhub",
          runtimeImage: "builtin://trend-scout-15m",
          manifest: {
            executionMode: "paper",
            marketScope: ["BTCUSDT perpetual"],
            supportedProviders: ["paper_matching_engine"],
            promptMode: "abstracted",
            strategySummary: { en: "Test", "zh-CN": "测试" },
            modelMetadata: { family: "gpt-5" },
            riskProfile: {
              maxLeverage: 2,
              maxOrderNotionalUsd: 10000,
              maxDailyLossPct: 4,
              maxDrawdownPct: 12,
            },
          },
        }),
      }),
    );

    expect(response.status).toBe(201);
    expect(getMemoryState().arenaTradingVersionConfigs.some((config) => config.runtimeImage === "builtin://trend-scout-15m")).toBe(true);
  });
});
