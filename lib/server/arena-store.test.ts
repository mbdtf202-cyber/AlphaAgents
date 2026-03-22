import { beforeEach, describe, expect, it } from "vitest";

import { createArenaCompetitionEntry, createArenaLiveCredential, createArenaWatchlistEntry, createTradingVersionConfig, getArenaAgentView, getArenaLeagueBySlug, listArenaWatchlistForActor, triggerArenaRun } from "./arena-store";
import { getMemoryState, resetMemoryState } from "./memory-store";

const builderActor = {
  sessionId: "builder-session",
  userId: "user-sample-builder",
  email: "builder@example.com",
  role: "builder" as const,
  githubHandle: "northframe",
  memberships: [],
};

const buyerActor = {
  sessionId: "buyer-session",
  userId: "user-sample-buyer",
  email: "buyer@example.com",
  role: "buyer" as const,
  memberships: [],
};

describe("arena store", () => {
  beforeEach(() => {
    process.env.ALPHA_AGENTS_STORAGE = "memory";
    (process.env as Record<string, string | undefined>).NODE_ENV = "test";
    resetMemoryState();
  });

  it("creates a trading config, entry, run, and derived artifacts", async () => {
    const config = await createTradingVersionConfig(builderActor, {
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

    const entry = await createArenaCompetitionEntry(builderActor, {
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

    const result = await triggerArenaRun(builderActor, {
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
    });

    const arenaAgent = await getArenaAgentView("swe-copilot-forge");
    const league = await getArenaLeagueBySlug("crypto-perps-main-arena");

    expect(result.run.totalScore).toBeGreaterThan(0);
    expect(arenaAgent.runs.some((run) => run.id === result.run.id)).toBe(true);
    expect(result.report).toBeDefined();
    expect(result.replay).toBeDefined();
    expect(arenaAgent.reports.some((report) => report.id === result.report!.id)).toBe(true);
    expect(getMemoryState().arenaReplays.some((replay) => replay.id === result.replay!.id)).toBe(true);
    expect(league?.leaderboard.some((row) => row.entryId === entry.id)).toBe(true);
  });

  it("creates live credentials and watchlist entries", async () => {
    const credential = await createArenaLiveCredential(builderActor, {
      agentSlug: "swe-copilot-forge",
      agentVersionId: "ver-swe-copilot-forge-1-4-2",
      accountLabel: "Sandbox managed",
      exchange: "Binance",
      credentialMode: "managed_secret_broker",
      providerKind: "managed_secret_broker",
    });

    const watchlist = await createArenaWatchlistEntry(buyerActor, {
      targetType: "league",
      targetId: "crypto-perps-main-arena",
      label: { en: "Crypto main", "zh-CN": "加密主场" },
    });

    expect(credential.status).toBe("verified");
    expect((await listArenaWatchlistForActor(buyerActor)).some((entry) => entry.id === watchlist.id)).toBe(true);
  });
});
