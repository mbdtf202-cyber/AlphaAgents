import { afterEach, describe, expect, it, vi } from "vitest";

import { executeBuiltinPaperRun, isBuiltinRuntimeImage } from "./builtin";

describe("builtin arena runner", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("recognizes builtin runtime images", () => {
    expect(isBuiltinRuntimeImage("builtin://trend-scout-15m")).toBe(true);
    expect(isBuiltinRuntimeImage("ghcr.io/openclaw/arena/agent:1.0.0")).toBe(false);
  });

  it("executes a builtin paper run against a real market snapshot shape", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          lastPrice: "102500.0",
          priceChangePercent: "3.4",
          highPrice: "103200.0",
          lowPrice: "99200.0",
          quoteVolume: "800000000.0",
        }),
      }),
    );

    const result = await executeBuiltinPaperRun({
      runtimeImage: "builtin://trend-scout-15m",
      instrument: "BTCUSDT",
      riskProfile: {
        maxLeverage: 2,
        maxOrderNotionalUsd: 10000,
      },
    });

    expect(result.metrics.totalScore).toBeGreaterThan(0);
    expect(result.state.completedRuns).toBe(1);
    expect(result.actionSummary.length).toBeGreaterThan(0);
  });
});
