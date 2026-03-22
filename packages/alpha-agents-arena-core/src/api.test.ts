import { describe, expect, it } from "vitest";

import { arenaCompetitionEntryInputSchema, tradingVersionConfigInputSchema } from "./api";

describe("arena api schemas", () => {
  it("accepts a trading version config input", () => {
    const parsed = tradingVersionConfigInputSchema.safeParse({
      agentSlug: "swe-copilot-forge",
      agentVersionId: "ver-swe-copilot-forge-1-4-2",
      sourceKind: "github",
      runtimeImage: "ghcr.io/example/swe:1.4.2",
      manifest: {
        executionMode: "paper",
        marketScope: ["BTCUSDT perpetual"],
        supportedProviders: ["paper_matching_engine"],
        promptMode: "abstracted",
        strategySummary: { en: "Summary", "zh-CN": "摘要" },
        modelMetadata: { family: "gpt-5" },
        riskProfile: {
          maxLeverage: 2,
          maxOrderNotionalUsd: 1000,
          maxDailyLossPct: 4,
          maxDrawdownPct: 12,
        },
      },
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects incomplete competition entry data", () => {
    const parsed = arenaCompetitionEntryInputSchema.safeParse({
      competitionId: "comp-1",
      competitionSlug: "spring-2026-main-cup",
    });

    expect(parsed.success).toBe(false);
  });
});
