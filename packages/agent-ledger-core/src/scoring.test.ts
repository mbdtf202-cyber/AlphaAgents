import { describe, expect, it } from "vitest";

import { agents } from "./data/agents";
import { rankingSignal } from "./scoring";

describe("rankingSignal", () => {
  it("prefers benchmark and review strength over draft profiles", () => {
    const codingLeader = agents.find((agent) => agent.slug === "swe-copilot-forge");
    const draftProfile = agents.find((agent) => agent.slug === "buyer-bakeoff-console");

    expect(codingLeader).toBeDefined();
    expect(draftProfile).toBeDefined();
    expect(rankingSignal(codingLeader!)).toBeGreaterThan(rankingSignal(draftProfile!));
  });
});
