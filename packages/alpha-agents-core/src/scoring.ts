import type { AgentRecord, BenchmarkRun, LeaderboardEntry, ScoreBreakdown } from "./types";

function average(numbers: number[]): number {
  if (numbers.length === 0) {
    return 0;
  }
  return Math.round((numbers.reduce((sum, value) => sum + value, 0) / numbers.length) * 10) / 10;
}

export function latestVersion(agent: AgentRecord) {
  return agent.versions[0];
}

export function isVerifiedBenchmarkRun(run: BenchmarkRun): boolean {
  return run.verification ? run.verification.status === "verified" : true;
}

export function averageScore(agent: AgentRecord): number {
  return average(latestVersion(agent).benchmarkRuns.filter(isVerifiedBenchmarkRun).map((run) => run.scorecard.overall));
}

export function freshnessPenalty(freshnessDays: number): number {
  return Math.max(0, freshnessDays - 7) * 0.3;
}

export function reviewQualitySignal(agent: AgentRecord): number {
  const version = latestVersion(agent);
  return version.reviewAverage * 18 + Math.min(version.reviewCount, 20);
}

export function verificationBonus(status: AgentRecord["verificationStatus"]): number {
  if (status === "verified") {
    return 12;
  }
  if (status === "review") {
    return 4;
  }
  return 0;
}

export function permissionRiskPenalty(agent: AgentRecord): number {
  const risk = agent.permissionManifest.riskLevel;
  if (risk === "high") {
    return 14;
  }
  if (risk === "medium") {
    return 6;
  }
  return 0;
}

export function rankingSignal(agent: AgentRecord, textMatch = 0): number {
  const version = latestVersion(agent);
  const freshestRun = version.benchmarkRuns[0];
  const trustBonus =
    agent.trust?.tier === "Established" ? 26 : agent.trust?.tier === "Verified" ? 16 : agent.trust?.tier === "Emerging" ? 8 : 0;
  const completenessBonus = (agent.trust?.completenessPercent ?? 0) * 0.18;
  const recentVerifiedActivityBonus = agent.trust?.lastVerifiedEventAt
    ? Math.max(0, 18 - (Date.now() - new Date(agent.trust.lastVerifiedEventAt).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const base =
    averageScore(agent) * 0.28 +
    reviewQualitySignal(agent) * 0.2 +
    trustBonus +
    completenessBonus +
    recentVerifiedActivityBonus +
    verificationBonus(agent.verificationStatus) * 0.08 +
    textMatch * 18;
  return Math.round((base - permissionRiskPenalty(agent) - freshnessPenalty(freshestRun?.freshnessDays ?? 0)) * 10) / 10;
}

export function toLeaderboardEntry(run: BenchmarkRun, agent: AgentRecord): LeaderboardEntry {
  return {
    rank: run.publicRank,
    suiteSlug: run.suiteSlug,
    agentSlug: agent.slug,
    agentName: agent.name,
    builderHandle: agent.builderHandle,
    overall: run.scorecard.overall,
    taskSuccess: run.scorecard.taskSuccess,
    reliability: run.scorecard.reliability,
    costEfficiency: run.scorecard.costEfficiency,
    latency: run.scorecard.latency,
    safetyFootprint: run.scorecard.safetyFootprint,
    operatorBurden: run.scorecard.operatorBurden,
    freshnessDays: run.freshnessDays,
  };
}

export function flattenScore(scorecard: ScoreBreakdown) {
  return [
    ["Task success", scorecard.taskSuccess],
    ["Reliability", scorecard.reliability],
    ["Cost efficiency", scorecard.costEfficiency],
    ["Latency", scorecard.latency],
    ["Safety footprint", scorecard.safetyFootprint],
    ["Setup friction", scorecard.setupFriction],
    ["Operator burden", scorecard.operatorBurden],
    ["Domain fit", scorecard.domainFit],
  ] as const;
}
