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
  type ProfileSubjectType,
  type RelationshipEdge,
  type SessionActor,
} from "@openclaw/alpha-agents-core";
import type { ArenaWatchlistEntry } from "@openclaw/alpha-agents-arena-core";

import {
  getArenaAgentView,
  getArenaBuilderView,
  getArenaHomeView,
  getArenaLeagueBySlug,
  getArenaReplayByRunId,
  getArenaReportById,
  getArenaTeamBySlug,
  listArenaEntriesForActor,
  listArenaFeedItems,
  listArenaLeagues,
  listArenaLiveCredentialsForActor,
  listArenaReports,
  listArenaTeams,
  listArenaTradingVersionConfigsForActor,
  listArenaRunsForActor,
  listArenaWatchlistForActor,
} from "./arena-store";
import { buildLeaderboardsFromAgents, filterAgents } from "./catalog";
import { getStorageMode } from "./env";
import { getReadCatalog, getRepositoryBundle } from "./repositories";
import { sampleProvenance } from "./provenance";

const buildLeaderboards = (agents: AgentRecord[]): Record<string, LeaderboardEntry[]> =>
  buildLeaderboardsFromAgents(agents);

function isFollowing(
  actor: SessionActor | null | undefined,
  relationships: RelationshipEdge[],
  subjectType: ProfileSubjectType,
  subjectId: string,
) {
  if (!actor) {
    return false;
  }
  return relationships.some(
    (edge) =>
      edge.type === "follows" &&
      edge.toType === subjectType &&
      edge.toId === subjectId &&
      edge.fromType === "user" &&
      edge.fromId === actor.userId,
  );
}

export async function getHomepageData() {
  const catalog = await getReadCatalog();
  const leaderboards = buildLeaderboards(catalog.agents);
  const dynamicFeatureSlots =
    getStorageMode() === "sample"
      ? featureSlots
      : await (await getRepositoryBundle()).catalogRepository.listFeatureSlots();

  return {
    featuredAgents: dynamicFeatureSlots
      .map((slot) => catalog.agents.find((agent) => agent.slug === slot.agentSlug))
      .filter((agent): agent is AgentRecord => Boolean(agent)),
    builders: catalog.builders.slice(0, 3),
    leaderboards,
    featureSlots: dynamicFeatureSlots.map((slot) => ({ ...slot, provenance: slot.provenance ?? sampleProvenance })),
    suites: benchmarkSuites.map((suite) => ({ ...suite, provenance: suite.provenance ?? sampleProvenance })),
    metrics: catalog.metrics,
    publicDataMode: catalog.metrics.liveAgentCount > 0 ? "mixed" : "sample",
  };
}

export async function getFilteredAgentsPageData(filters: {
  query?: string;
  category?: string;
  status?: string;
  trustTier?: string;
  riskLevel?: string;
  credential?: string;
  activity?: string;
}) {
  return filterAgents((await getReadCatalog()).agents, filters);
}

export async function getAgentPageData(slug: string, versionId?: string, actor?: SessionActor | null) {
  const catalog = await getReadCatalog();
  const agent = catalog.agents.find((entry) => entry.slug === slug);
  if (!agent) {
    return undefined;
  }
  const withFollowState = { ...agent, following: isFollowing(actor, catalog.relationships, "agent", agent.id) };
  if (!versionId) {
    return {
      ...withFollowState,
      arena: await getArenaAgentView(slug),
    };
  }
  return {
    ...withFollowState,
    versions: withFollowState.versions.filter((version) => version.id === versionId),
    reviews: withFollowState.reviews.filter((review) => review.versionId === versionId),
    arena: await getArenaAgentView(slug),
  };
}

export async function getBuilderPageData(handle: string, actor?: SessionActor | null) {
  const catalog = await getReadCatalog();
  const builder = catalog.builders.find((entry) => entry.handle === handle);
  if (!builder) {
    return undefined;
  }
  const builderWithFollowState = {
    ...builder,
    following: isFollowing(actor, catalog.relationships, "builder", builder.id),
  };

  const publishedAgents = catalog.agents.filter((agent) => agent.builderHandle === handle);
  const reviews = publishedAgents.flatMap((agent) => agent.reviews);

  return {
    builder: builderWithFollowState,
    publishedAgents,
    reviews,
    arena: await getArenaBuilderView(handle),
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

export async function getArenaPageData() {
  const catalog = await getReadCatalog();
  return getArenaHomeView(catalog.organizations, catalog.relationships);
}

export async function getLeaguesPageData() {
  return listArenaLeagues();
}

export async function getLeaguePageData(slug: string) {
  return getArenaLeagueBySlug(slug);
}

export async function getFeedPageData() {
  return listArenaFeedItems();
}

export async function getReportsPageData() {
  return listArenaReports();
}

export async function getReportPageData(reportId: string) {
  return getArenaReportById(reportId);
}

export async function getReplayPageData(runId: string) {
  return getArenaReplayByRunId(runId);
}

export async function getTeamsPageData() {
  const catalog = await getReadCatalog();
  return listArenaTeams(catalog.organizations, catalog.relationships);
}

export async function getTeamPageData(slug: string, actor?: SessionActor | null) {
  const catalog = await getReadCatalog();
  const payload = await getArenaTeamBySlug(slug, catalog.organizations, catalog.relationships);
  if (!payload) {
    return undefined;
  }
  return {
    ...payload,
    following: actor
      ? isFollowing(actor, catalog.relationships, "organization", payload.organization.id)
      : false,
  };
}

export async function getWorkspaceData(actor: SessionActor, locale: Locale) {
  const bundle = await getRepositoryBundle();
  const [submissions, builderAgents, installs, reviews, shortlists, decisionMemos, benchmarkRequests, moderationCases, relationships] =
    await Promise.all([
      bundle.agentRepository.listSubmissionsForActor(actor),
      bundle.agentRepository.listBuilderAgents(actor),
      bundle.installRepository.listInstallsForActor(actor),
      bundle.reviewRepository.listReviewsForActor(actor),
      bundle.shortlistRepository.listShortlistsForActor(actor),
      bundle.shortlistRepository.listDecisionMemosForActor(actor),
      bundle.benchmarkRepository.listRequestsForActor(actor),
      bundle.moderationRepository.listModerationCases(actor),
      bundle.relationshipRepository.listRelationships(),
    ]);
  const [arenaTradingConfigs, arenaEntries, arenaRuns, arenaLiveCredentials, arenaWatchlist] = await Promise.all([
    listArenaTradingVersionConfigsForActor(actor),
    listArenaEntriesForActor(actor),
    listArenaRunsForActor(actor),
    listArenaLiveCredentialsForActor(actor),
    listArenaWatchlistForActor(actor),
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
    arenaTradingConfigs,
    arenaEntries,
    arenaRuns,
    arenaLiveCredentials,
    arenaWatchlist,
    followingCount: relationships.filter((edge) => edge.type === "follows" && edge.fromType === "user" && edge.fromId === actor.userId).length,
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
