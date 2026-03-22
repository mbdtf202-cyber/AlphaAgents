import { beforeEach, describe, expect, it } from "vitest";

import { hashToken } from "../../../../../lib/server/auth";
import { createArenaCompetitionEntry, createTradingVersionConfig } from "../../../../../lib/server/arena-store";
import { createMemorySession, getMemoryState, resetMemoryState } from "../../../../../lib/server/memory-store";
import { resetRateLimiters } from "../../../../../lib/server/rate-limit";
import { POST } from "./route";

describe("POST /api/workspace/arena/runs", () => {
  beforeEach(() => {
    process.env.ALPHA_AGENTS_STORAGE = "memory";
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    resetMemoryState();
    resetRateLimiters();
  });

  it("creates a run and derived replay/report artifacts", async () => {
    const rawSessionToken = "builder-arena-run-session";
    createMemorySession("user-sample-builder", "builder", hashToken(rawSessionToken));
    const actor = {
      sessionId: "builder-session",
      userId: "user-sample-builder",
      email: "builder@example.com",
      role: "builder" as const,
      githubHandle: "northframe",
      memberships: [],
    };
    const config = await createTradingVersionConfig(actor, {
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
    });
    const entry = await createArenaCompetitionEntry(actor, {
      competitionId: "competition-main-spring",
      competitionSlug: "spring-2026-main-cup",
      leagueSlug: "crypto-perps-main-arena",
      agentSlug: "swe-copilot-forge",
      agentName: "SWE Copilot Forge",
      builderHandle: "northframe",
      organizationSlug: "helix-cloud",
      organizationName: "Helix Cloud",
      agentVersionId: "ver-swe-copilot-forge-1-4-2",
      tradingVersionConfigId: config.id,
      proofMode: "paper",
      verificationLevel: "verified",
      liveStatus: "paper_only",
      promptMode: "abstracted",
      rankingScope: "overall",
    });

    const response = await POST(
      new Request("http://localhost/api/workspace/arena/runs", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `alpha_agents_session=${rawSessionToken}`,
        },
        body: JSON.stringify({
          entryId: entry.id,
          competitionId: "competition-main-spring",
          competitionSlug: "spring-2026-main-cup",
          leagueSlug: "crypto-perps-main-arena",
          agentSlug: "swe-copilot-forge",
          agentVersionId: "ver-swe-copilot-forge-1-4-2",
          providerKind: "paper_matching_engine",
          proofMode: "paper",
          liveStatus: "paper_only",
          rankingScope: "overall",
          instrument: "BTCUSDT",
        }),
      }),
    );

    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json.run.totalScore).toBeGreaterThan(0);
    expect(getMemoryState().arenaReplays.some((replay) => replay.runId === json.run.id)).toBe(true);
    expect(getMemoryState().arenaReports.some((report) => report.id === json.report.id)).toBe(true);
  });
});
