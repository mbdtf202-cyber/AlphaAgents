import crypto from "node:crypto";

import { computeArenaTotalScore, type ArenaRun, type ArenaRunStatus } from "@openclaw/alpha-agents-arena-core";

export * from "./builtin";

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, nested]) => `${JSON.stringify(key)}:${stableStringify(nested)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function computeArenaArtifactHash(input: Record<string, unknown>) {
  return `sha256:${crypto.createHash("sha256").update(stableStringify(input)).digest("hex").slice(0, 24)}`;
}

export function simulateArenaRun(input: Pick<
  ArenaRun,
  | "competitionId"
  | "competitionSlug"
  | "leagueSlug"
  | "entryId"
  | "agentSlug"
  | "agentVersionId"
  | "providerKind"
  | "proofMode"
  | "liveStatus"
  | "rankingScope"
  | "instrument"
> & {
  rationaleSummary: ArenaRun["rationaleSummary"];
  actionSummary: string[];
  status?: ArenaRunStatus;
}) : ArenaRun {
  const seed = computeArenaArtifactHash({
    entryId: input.entryId,
    providerKind: input.providerKind,
    instrument: input.instrument,
  });
  const variance = parseInt(seed.slice(-2), 16) / 255;
  const netReturnPct = Math.round((8 + variance * 12) * 10) / 10;
  const maxDrawdownPct = Math.round((3 + variance * 6) * 10) / 10;
  const sharpe = Math.round((1.4 + variance * 1.4) * 10) / 10;
  const calmar = Math.round((1.3 + variance * 1.7) * 10) / 10;
  const consistencyScore = Math.round(74 + variance * 20);
  const survivalScore = Math.round(80 + variance * 16);
  const executionQualityScore = Math.round(76 + variance * 18);
  const disciplineScore = Math.round(82 + variance * 14);

  return {
    id: `arena-run-${seed.slice(7, 19)}`,
    competitionId: input.competitionId,
    competitionSlug: input.competitionSlug,
    leagueSlug: input.leagueSlug,
    entryId: input.entryId,
    agentSlug: input.agentSlug,
    agentVersionId: input.agentVersionId,
    providerKind: input.providerKind,
    proofMode: input.proofMode,
    verificationLevel: input.proofMode === "verified_live" ? "verified" : "review",
    liveStatus: input.liveStatus,
    rankingScope: input.rankingScope,
    status: input.status ?? "completed",
    rationaleSummary: input.rationaleSummary,
    actionSummary: input.actionSummary,
    instrument: input.instrument,
    netReturnPct,
    maxDrawdownPct,
    sharpe,
    calmar,
    consistencyScore,
    survivalScore,
    executionQualityScore,
    disciplineScore,
    totalScore: computeArenaTotalScore({
      netReturnPct,
      maxDrawdownPct,
      sharpe,
      calmar,
      consistencyScore,
      survivalScore,
      executionQualityScore,
      disciplineScore,
    }),
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
}
