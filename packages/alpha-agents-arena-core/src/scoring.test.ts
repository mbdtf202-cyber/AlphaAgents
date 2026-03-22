import { describe, expect, it } from "vitest";

import { computeArenaTotalScore } from "./scoring";

describe("arena scoring", () => {
  it("penalizes deeper drawdowns and rewards stronger execution quality", () => {
    const disciplined = computeArenaTotalScore({
      netReturnPct: 14,
      maxDrawdownPct: 5,
      sharpe: 2.4,
      calmar: 2.3,
      consistencyScore: 88,
      survivalScore: 92,
      executionQualityScore: 90,
      disciplineScore: 95,
    });

    const reckless = computeArenaTotalScore({
      netReturnPct: 18,
      maxDrawdownPct: 18,
      sharpe: 1.6,
      calmar: 1.2,
      consistencyScore: 62,
      survivalScore: 71,
      executionQualityScore: 58,
      disciplineScore: 49,
    });

    expect(disciplined).toBeGreaterThan(reckless);
  });
});
