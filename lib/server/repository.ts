import {
  benchmarkSuites,
  builders as sampleBuilders,
  decisionMemos as sampleDecisionMemos,
  featureSlots,
  getLeaderboards,
  agents as sampleAgents,
  getVerifiedReviews,
  moderationCases as sampleModerationCases,
  resolveText,
  shortlists as sampleShortlists,
  type AgentRecord,
  type BuilderProfile,
  type Locale,
  type SessionActor,
} from "@openclaw/alpha-agents-core";

import { getReadCatalog, getRepositoryBundle } from "./repositories";
import { sampleProvenance } from "./provenance";

function filterReviewsToVersion(agent: AgentRecord, versionId?: string): AgentRecord {
  const selectedVersionId = versionId ?? agent.versions[0]?.id;
  return {
    ...agent,
    reviews: agent.reviews.filter((review) => review.versionId === selectedVersionId),
  };
}

function hydrateSampleAgent(agent: AgentRecord, versionId?: string): AgentRecord {
  const reviews = getVerifiedReviews().filter((review) => review.agentSlug === agent.slug);
  const merged = {
    ...agent,
    provenance: agent.provenance ?? sampleProvenance,
    reviews: reviews.map((review) => ({
      ...review,
      provenance: review.provenance ?? sampleProvenance,
    })),
    versions: agent.versions.map((version) => ({
      ...version,
      provenance: version.provenance ?? sampleProvenance,
      benchmarkRuns: version.benchmarkRuns.map((run) => ({
        ...run,
        provenance: run.provenance ?? sampleProvenance,
      })),
    })),
  };
  return filterReviewsToVersion(merged, versionId);
}

function sampleBuilder(builder: BuilderProfile): BuilderProfile {
  return {
    ...builder,
    provenance: builder.provenance ?? sampleProvenance,
  };
}

function sampleAgentList(): AgentRecord[] {
  return sampleAgents.map((agent) => hydrateSampleAgent(agent));
}

export async function getHomepageData() {
  const catalog = await getReadCatalog();
  return {
    featuredAgents: featureSlots
      .map((slot) => catalog.agents.find((agent) => agent.slug === slot.agentSlug))
      .filter((agent): agent is AgentRecord => Boolean(agent)),
    builders: catalog.builders.slice(0, 3),
    leaderboards: getLeaderboards(),
    featureSlots: featureSlots.map((slot) => ({ ...slot, provenance: slot.provenance ?? sampleProvenance })),
    suites: benchmarkSuites.map((suite) => ({ ...suite, provenance: suite.provenance ?? sampleProvenance })),
    metrics: catalog.metrics,
    publicDataMode: catalog.metrics.liveAgentCount > 0 ? "mixed" : "sample",
  };
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
  const catalog = await getReadCatalog();
  return catalog.agents
    .filter((agent) => {
      if (query) {
        const haystack = [agent.name, agent.slug, agent.summary.en, agent.summary["zh-CN"], ...agent.categories].join(" ").toLowerCase();
        if (!haystack.includes(query.toLowerCase())) {
          return false;
        }
      }
      if (category && category !== "all" && !agent.categories.includes(category)) {
        return false;
      }
      if (status && status !== "all" && agent.verificationStatus !== status) {
        return false;
      }
      return true;
    })
    .map((agent) => hydrateSampleAgent(agent));
}

export async function getAgentPageData(slug: string, versionId?: string) {
  const catalog = await getReadCatalog();
  const agent = catalog.agents.find((entry) => entry.slug === slug);
  return agent ? hydrateSampleAgent(agent, versionId) : undefined;
}

export async function getBuilderPageData(handle: string) {
  const builder = sampleBuilders.find((entry) => entry.handle === handle);
  if (!builder) {
    return undefined;
  }

  const catalog = await getReadCatalog();
  const publishedAgents = builder.publishedAgentSlugs
    .map((slug) => catalog.agents.find((entry) => entry.slug === slug))
    .filter((agent): agent is AgentRecord => Boolean(agent))
    .map((agent) => hydrateSampleAgent(agent));

  return {
    builder: sampleBuilder(builder),
    publishedAgents,
    reviews: getVerifiedReviews().filter((review) => review.builderHandle === handle).map((review) => ({ ...review, provenance: review.provenance ?? sampleProvenance })),
  };
}

export async function getBenchmarksPageData() {
  return benchmarkSuites.map((suite) => ({
    ...suite,
    provenance: suite.provenance ?? sampleProvenance,
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

  const catalog = await getReadCatalog();
  const runs = catalog.agents
    .flatMap((agent) =>
      agent.versions
        .flatMap((version) => version.benchmarkRuns)
        .filter((run) => run.suiteSlug === slug)
        .map((run) => ({ agent: hydrateSampleAgent(agent, run.id), run })),
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
    .slice(0, 4)
    .map((agent) => hydrateSampleAgent(agent));
}

export async function getWorkspaceData(actor: SessionActor, locale: Locale) {
  const bundle = await getRepositoryBundle();
  const [submissions, builderAgents, installs, reviews, shortlists, decisionMemos, benchmarkRequests, moderationCases] = await Promise.all([
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
  return {
    moderationCases: await bundle.moderationRepository.listModerationCases(actor),
    flaggedAgents: sampleAgentList().filter((agent) => agent.verificationStatus !== "verified"),
  };
}

export async function getBuildersDirectory() {
  return sampleBuilders.map(sampleBuilder);
}

export function getSampleBuyerArtifacts() {
  return {
    shortlists: sampleShortlists,
    decisionMemos: sampleDecisionMemos,
    moderationCases: sampleModerationCases,
  };
}
