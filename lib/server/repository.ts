import {
  benchmarkSuites,
  decisionMemos as sampleDecisionMemos,
  featureSlots,
  moderationCases as sampleModerationCases,
  resolveText,
  shortlists as sampleShortlists,
  type AgentRecord,
  type BuilderProfile,
  type LeaderboardEntry,
  type Locale,
  type SessionActor,
} from "@openclaw/alpha-agents-core";

import { buildLeaderboardsFromAgents, filterAgents } from "./catalog";
import { getReadCatalog, getRepositoryBundle } from "./repositories";
import { sampleProvenance } from "./provenance";

const buildLeaderboards = (agents: AgentRecord[]): Record<string, LeaderboardEntry[]> =>
  buildLeaderboardsFromAgents(agents);

export async function getHomepageData() {
  const catalog = await getReadCatalog();
  const leaderboards = buildLeaderboards(catalog.agents);

  return {
    featuredAgents: featureSlots
      .map((slot) => catalog.agents.find((agent) => agent.slug === slot.agentSlug))
      .filter((agent): agent is AgentRecord => Boolean(agent)),
    builders: catalog.builders.slice(0, 3),
    leaderboards,
    featureSlots: featureSlots.map((slot) => ({ ...slot, provenance: slot.provenance ?? sampleProvenance })),
    suites: benchmarkSuites.map((suite) => ({ ...suite, provenance: suite.provenance ?? sampleProvenance })),
    metrics: catalog.metrics,
    publicDataMode: catalog.metrics.liveAgentCount > 0 ? "mixed" : "sample",
  };
}

export async function getFilteredAgentsPageData(filters: {
  query?: string;
  category?: string;
  status?: string;
}) {
  return filterAgents((await getReadCatalog()).agents, filters);
}

export async function getAgentPageData(slug: string, versionId?: string) {
  const agent = (await getReadCatalog()).agents.find((entry) => entry.slug === slug);
  if (!agent) {
    return undefined;
  }
  if (!versionId) {
    return agent;
  }
  return {
    ...agent,
    versions: agent.versions.filter((version) => version.id === versionId),
    reviews: agent.reviews.filter((review) => review.versionId === versionId),
  };
}

export async function getBuilderPageData(handle: string) {
  const catalog = await getReadCatalog();
  const builder = catalog.builders.find((entry) => entry.handle === handle);
  if (!builder) {
    return undefined;
  }

  const publishedAgents = catalog.agents.filter((agent) => agent.builderHandle === handle);
  const reviews = publishedAgents.flatMap((agent) => agent.reviews);

  return {
    builder,
    publishedAgents,
    reviews,
  };
}

export async function getBenchmarksPageData() {
  const catalog = await getReadCatalog();
  const leaderboards = buildLeaderboards(catalog.agents);

  return benchmarkSuites.map((suite) => ({
    ...suite,
    provenance: suite.provenance ?? sampleProvenance,
    entries: (leaderboards[suite.slug] ?? []).slice(0, 5),
  }));
}

export async function getBenchmarkDetailPageData(slug: string) {
  const suite = benchmarkSuites.find((entry) => entry.slug === slug);
  if (!suite) {
    return undefined;
  }

  const catalog = await getReadCatalog();
  const runs = catalog.agents
    .flatMap((agent) =>
      agent.versions.flatMap((version) =>
        version.benchmarkRuns
          .filter((run) => run.suiteSlug === slug)
          .map((run) => ({ agent: { ...agent, versions: [version] }, run })),
      ),
    )
    .sort((left, right) => left.run.publicRank - right.run.publicRank);

  return {
    suite: { ...suite, provenance: suite.provenance ?? sampleProvenance },
    runs,
  };
}

export async function getComparePageData(slugs: string[]) {
  const catalog = await getReadCatalog();
  return slugs
    .map((slug) => catalog.agents.find((entry) => entry.slug === slug))
    .filter((agent): agent is AgentRecord => Boolean(agent))
    .slice(0, 4);
}

export async function getCompareCandidates() {
  return (await getReadCatalog()).agents;
}

export async function getLeaderboardsPageData() {
  const catalog = await getReadCatalog();
  return buildLeaderboards(catalog.agents);
}

export async function getWorkspaceData(actor: SessionActor, locale: Locale) {
  const bundle = await getRepositoryBundle();
  const [submissions, builderAgents, installs, reviews, shortlists, decisionMemos, benchmarkRequests, moderationCases] =
    await Promise.all([
      bundle.agentRepository.listSubmissionsForActor(actor),
      bundle.agentRepository.listBuilderAgents(actor),
      bundle.installRepository.listInstallsForActor(actor),
      bundle.reviewRepository.listReviewsForActor(actor),
      bundle.shortlistRepository.listShortlistsForActor(actor),
      bundle.shortlistRepository.listDecisionMemosForActor(actor),
      bundle.benchmarkRepository.listRequestsForActor(actor),
      bundle.moderationRepository.listModerationCases(actor),
    ]);

  return {
    actor,
    submissions,
    builderAgents,
    verifiedInstalls: installs,
    reviews,
    shortlists,
    decisionMemos,
    benchmarkRequests,
    moderationCases,
    reviewHighlights: reviews.map((review) => ({
      ...review,
      headlineText: resolveText(review.headline, locale),
    })),
  };
}

export async function getAdminData(actor: SessionActor) {
  const bundle = await getRepositoryBundle();
  const catalog = await getReadCatalog();
  return {
    moderationCases: await bundle.moderationRepository.listModerationCases(actor),
    flaggedAgents: catalog.agents.filter((agent) => agent.verificationStatus !== "verified"),
  };
}

export async function getBuildersDirectory(): Promise<BuilderProfile[]> {
  return (await getReadCatalog()).builders;
}

export function getSampleBuyerArtifacts() {
  return {
    shortlists: sampleShortlists,
    decisionMemos: sampleDecisionMemos,
    moderationCases: sampleModerationCases,
  };
}
