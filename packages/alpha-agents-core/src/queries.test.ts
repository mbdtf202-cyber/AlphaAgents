import { describe, expect, it } from "vitest";

import { compareAgents, getLeaderboards, listAgents } from "./queries";

describe("queries", () => {
  it("sorts agents by ranking signal for plain listings", () => {
    const entries = listAgents();

    expect(entries[0]?.slug).toBe("research-brief-operator");
  });

  it("limits compare results to four agents", () => {
    const compared = compareAgents([
      "swe-copilot-forge",
      "research-brief-operator",
      "support-triage-pilot",
      "workflow-orchestrator",
      "talent-scout-grid",
    ]);

    expect(compared).toHaveLength(4);
  });

  it("groups leaderboards by suite slug", () => {
    const leaderboards = getLeaderboards();

    expect(Object.keys(leaderboards)).toContain("coding-command");
    expect(leaderboards["coding-command"]?.[0]?.agentSlug).toBe("swe-copilot-forge");
  });
});
