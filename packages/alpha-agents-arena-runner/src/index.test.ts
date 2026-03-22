import { describe, expect, it } from "vitest";

import { simulateArenaRun } from "./index";

describe("arena runner", () => {
  it("creates a completed arena run with a score", () => {
    const run = simulateArenaRun({
      competitionId: "competition-main-spring",
      competitionSlug: "spring-2026-main-cup",
      leagueSlug: "crypto-perps-main-arena",
      entryId: "entry-swe-main",
      agentSlug: "swe-copilot-forge",
      agentVersionId: "ver-swe-copilot-forge-1-4-2",
      providerKind: "paper_matching_engine",
      proofMode: "paper",
      liveStatus: "paper_only",
      rankingScope: "overall",
      instrument: "BTCUSDT",
      rationaleSummary: { en: "Test", "zh-CN": "测试" },
      actionSummary: ["buy BTCUSDT 0.1"],
    });

    expect(run.status).toBe("completed");
    expect(run.totalScore).toBeGreaterThan(0);
  });
});
