import { agents, benchmarkSuites, builders, collections, featureSlots, moderationCases, verifiedReviews } from "./data/index";
import { rankingSignal, toLeaderboardEntry } from "./scoring";
import type { AgentRecord, BenchmarkSuite, BuilderProfile, LeaderboardEntry } from "./types";

function normalizedText(agent: AgentRecord): string {
  return [
    agent.name,
    agent.slug,
    agent.tagline.en,
    agent.tagline["zh-CN"],
    agent.summary.en,
    agent.summary["zh-CN"],
    ...agent.categories,
    ...agent.permissionManifest.skills,
    ...agent.dependencies,
  ]
    .join(" ")
    .toLowerCase();
}

export function listAgents(query?: string): AgentRecord[] {
  const q = query?.trim().toLowerCase();
  return [...agents]
    .filter((agent) => {
      if (!q) {
        return true;
      }
      return normalizedText(agent).includes(q);
    })
    .sort((left, right) => {
      const leftMatch = q && normalizedText(left).includes(q) ? 1 : 0;
      const rightMatch = q && normalizedText(right).includes(q) ? 1 : 0;
      return rankingSignal(right, rightMatch) - rankingSignal(left, leftMatch);
    });
}

export function getFeaturedAgents(): AgentRecord[] {
  return featureSlots
    .map((slot) => agents.find((agent) => agent.slug === slot.agentSlug))
    .filter((agent): agent is AgentRecord => Boolean(agent));
}

export function getFeatureSlots() {
  return featureSlots;
}

export function getAgentBySlug(slug: string): AgentRecord | undefined {
  return agents.find((agent) => agent.slug === slug);
}

export function listBuilders(): BuilderProfile[] {
  return [...builders].sort((left, right) => right.shortlistCount - left.shortlistCount);
}

export function getBuilderByHandle(handle: string): BuilderProfile | undefined {
  return builders.find((builder) => builder.handle === handle);
}

export function listBenchmarkSuites(): BenchmarkSuite[] {
  return benchmarkSuites;
}

export function getBenchmarkSuiteBySlug(slug: string): BenchmarkSuite | undefined {
  return benchmarkSuites.find((suite) => suite.slug === slug);
}

export function getLeaderboards(): Record<string, LeaderboardEntry[]> {
  const entries = agents.flatMap((agent) => agent.versions[0]?.benchmarkRuns.map((run) => toLeaderboardEntry(run, agent)) ?? []);
  return entries.reduce<Record<string, LeaderboardEntry[]>>((accumulator, entry) => {
    const next = accumulator[entry.suiteSlug] ?? [];
    next.push(entry);
    accumulator[entry.suiteSlug] = next.sort((left, right) => left.rank - right.rank);
    return accumulator;
  }, {});
}

export function compareAgents(slugs: string[]): AgentRecord[] {
  return slugs
    .map((slug) => getAgentBySlug(slug))
    .filter((agent): agent is AgentRecord => Boolean(agent))
    .slice(0, 4);
}

export function getCollections() {
  return collections;
}

export function getModerationCases() {
  return moderationCases;
}

export function getVerifiedReviews() {
  return verifiedReviews;
}
