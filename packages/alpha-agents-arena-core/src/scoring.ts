import type { ArenaLeaderboardEntry, ArenaRun } from "./types";

const clamp = (value: number, minimum = 0, maximum = 100) => Math.min(maximum, Math.max(minimum, value));

export function computeArenaTotalScore(input: {
  netReturnPct: number;
  maxDrawdownPct: number;
  sharpe: number;
  calmar: number;
  consistencyScore: number;
  survivalScore: number;
  executionQualityScore: number;
  disciplineScore: number;
}) {
  const returnScore = clamp(50 + input.netReturnPct * 2);
  const drawdownScore = clamp(100 - input.maxDrawdownPct * 1.8);
  const sharpeScore = clamp(input.sharpe * 22);
  const calmarScore = clamp(input.calmar * 18);
  const total =
    returnScore * 0.22 +
    sharpeScore * 0.18 +
    drawdownScore * 0.18 +
    input.consistencyScore * 0.12 +
    calmarScore * 0.1 +
    input.survivalScore * 0.08 +
    input.executionQualityScore * 0.07 +
    input.disciplineScore * 0.05;

  return Math.round(total * 10) / 10;
}

export function toArenaLeaderboardEntry(run: ArenaRun, options: {
  competitionId: string;
  competitionSlug: string;
  leagueSlug: string;
  entryId: string;
  agentName: string;
  builderHandle: string;
  organizationSlug?: string;
  promptMode: ArenaLeaderboardEntry["promptMode"];
  verificationLevel: ArenaLeaderboardEntry["verificationLevel"];
  liveStatus: ArenaLeaderboardEntry["liveStatus"];
  proofMode: ArenaLeaderboardEntry["proofMode"];
  rankingScope: ArenaLeaderboardEntry["rankingScope"];
  ruleViolationCount: number;
  rank: number;
}) : ArenaLeaderboardEntry {
  return {
    id: `leaderboard-${run.id}`,
    competitionId: options.competitionId,
    competitionSlug: options.competitionSlug,
    leagueSlug: options.leagueSlug,
    entryId: options.entryId,
    agentSlug: run.agentSlug,
    agentName: options.agentName,
    builderHandle: options.builderHandle,
    organizationSlug: options.organizationSlug,
    proofMode: options.proofMode,
    verificationLevel: options.verificationLevel,
    liveStatus: options.liveStatus,
    promptMode: options.promptMode,
    rankingScope: options.rankingScope,
    rank: options.rank,
    totalScore: run.totalScore,
    netReturnPct: run.netReturnPct,
    maxDrawdownPct: run.maxDrawdownPct,
    sharpe: run.sharpe,
    calmar: run.calmar,
    consistencyScore: run.consistencyScore,
    survivalScore: run.survivalScore,
    executionQualityScore: run.executionQualityScore,
    disciplineScore: run.disciplineScore,
    ruleViolationCount: options.ruleViolationCount,
    asOf: run.completedAt ?? run.startedAt,
  };
}
