import {
  agents,
  benchmarkSuites,
  builders,
  claimVerifications,
  endorsements,
  featureSlots,
  featuredWorks,
  moderationCases,
  organizations,
  relationshipEdges,
  shortlists,
  verifiedInstalls,
  verifiedReviews,
} from "./data/index";
import { hydratePublicCatalog, sortAgentProfiles, sortBuilderProfiles } from "./profiles";
import { rankingSignal, toLeaderboardEntry } from "./scoring";
import type { AgentProfileView, AgentRecord, BenchmarkSuite, BuilderProfile, BuilderProfileView, LeaderboardEntry } from "./types";

const sampleCatalog = hydratePublicCatalog({
  agents,
  builders,
  organizations,
  relationshipEdges,
  claimVerifications,
  endorsements,
  featuredWork: featuredWorks,
  verifiedInstalls,
  verifiedReviews,
});

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
  return sortAgentProfiles([...sampleCatalog.agents])
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
    .map((slot) => sampleCatalog.agents.find((agent) => agent.slug === slot.agentSlug))
    .filter((agent): agent is AgentProfileView => Boolean(agent));
}

export function getFeatureSlots() {
  return featureSlots;
}

export function getAgentBySlug(slug: string): AgentRecord | undefined {
  return sampleCatalog.agents.find((agent) => agent.slug === slug);
}

export function listBuilders(): BuilderProfile[] {
  return sortBuilderProfiles([...sampleCatalog.builders]);
}

export function getBuilderByHandle(handle: string): BuilderProfile | undefined {
  return sampleCatalog.builders.find((builder) => builder.handle === handle);
}

export function listBenchmarkSuites(): BenchmarkSuite[] {
  return benchmarkSuites;
}

export function getBenchmarkSuiteBySlug(slug: string): BenchmarkSuite | undefined {
  return benchmarkSuites.find((suite) => suite.slug === slug);
}

export function getLeaderboards(): Record<string, LeaderboardEntry[]> {
  const entries = sampleCatalog.agents.flatMap((agent) => agent.versions[0]?.benchmarkRuns.map((run) => toLeaderboardEntry(run, agent)) ?? []);
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

export function getSampleHydratedAgents(): AgentProfileView[] {
  return sampleCatalog.agents;
}

export function getSampleHydratedBuilders(): BuilderProfileView[] {
  return sampleCatalog.builders;
}

export function getCollections() {
  return shortlists;
}

export function getModerationCases() {
  return moderationCases;
}

export function getVerifiedReviews() {
  return verifiedReviews;
}
