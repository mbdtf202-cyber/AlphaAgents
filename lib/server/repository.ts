import {
  agents,
  benchmarkSuites,
  builders,
  compareAgents,
  featureSlots,
  getLeaderboards,
  getModerationCases,
  getVerifiedReviews,
  listAgents,
  listBuilders,
  resolveText,
  verifiedInstalls,
  type AgentRecord,
  type Locale,
} from "@openclaw/agent-ledger-core";

export function hydrateAgent(agent: AgentRecord): AgentRecord {
  const reviews = getVerifiedReviews().filter((review) => review.agentSlug === agent.slug);
  return {
    ...agent,
    reviews,
  };
}

export async function getHomepageData() {
  return {
    featuredAgents: featureSlots
      .map((slot) => agents.find((agent) => agent.slug === slot.agentSlug))
      .filter((agent): agent is AgentRecord => Boolean(agent))
      .map(hydrateAgent),
    builders: listBuilders().slice(0, 3),
    leaderboards: getLeaderboards(),
    featureSlots,
    suites: benchmarkSuites,
  };
}

export async function getAgentsPageData(query?: string) {
  return listAgents(query).map(hydrateAgent);
}

export async function getFilteredAgentsPageData({
  query,
  category,
  status,
}: {
  query?: string;
  category?: string;
  status?: string;
}) {
  return listAgents(query)
    .map(hydrateAgent)
    .filter((agent) => {
      if (category && category !== "all" && !agent.categories.includes(category)) {
        return false;
      }
      if (status && status !== "all" && agent.verificationStatus !== status) {
        return false;
      }
      return true;
    });
}

export async function getAgentPageData(slug: string) {
  const agent = agents.find((entry) => entry.slug === slug);
  return agent ? hydrateAgent(agent) : undefined;
}

export async function getBuilderPageData(handle: string) {
  const builder = builders.find((entry) => entry.handle === handle);
  if (!builder) {
    return undefined;
  }

  const publishedAgents = builder.publishedAgentSlugs
    .map((slug) => agents.find((entry) => entry.slug === slug))
    .filter((agent): agent is AgentRecord => Boolean(agent))
    .map(hydrateAgent);

  return {
    builder,
    publishedAgents,
    reviews: getVerifiedReviews().filter((review) => review.builderHandle === handle),
  };
}

export async function getBenchmarksPageData() {
  return benchmarkSuites.map((suite) => ({
    ...suite,
    entries: Object.values(getLeaderboards())
      .flat()
      .filter((entry) => entry.suiteSlug === suite.slug)
      .slice(0, 5),
  }));
}

export async function getBenchmarkDetailPageData(slug: string) {
  const suite = benchmarkSuites.find((entry) => entry.slug === slug);
  if (!suite) {
    return undefined;
  }

  const runs = agents
    .flatMap((agent) =>
      agent.versions[0]?.benchmarkRuns
        .filter((run) => run.suiteSlug === slug)
        .map((run) => ({ agent: hydrateAgent(agent), run })) ?? [],
    )
    .sort((left, right) => left.run.publicRank - right.run.publicRank);

  return {
    suite,
    runs,
  };
}

export async function getComparePageData(slugs: string[]) {
  return compareAgents(slugs).map(hydrateAgent);
}

export async function getWorkspaceData(locale: Locale) {
  return {
    submissions: agents.slice(0, 4).map(hydrateAgent),
    moderationCases: getModerationCases(),
    verifiedInstalls,
    reviewHighlights: getVerifiedReviews().map((review) => ({
      ...review,
      headlineText: resolveText(review.headline, locale),
    })),
  };
}

export async function getAdminData() {
  return {
    moderationCases: getModerationCases(),
    flaggedAgents: agents.filter((agent) => agent.verificationStatus !== "verified").map(hydrateAgent),
  };
}

export async function getBuildersDirectory() {
  return listBuilders();
}
