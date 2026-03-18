import {
  type AgentRecord,
  type AgentVersionRecord,
  type BenchmarkRun,
  type BuilderProfile,
  type LeaderboardEntry,
  type LocalizedText,
  type PermissionManifest,
  type ScoreDimension,
  type VersionRegressionSummary,
} from "@openclaw/alpha-agents-core";
import { isVerifiedBenchmarkRun, toLeaderboardEntry } from "@openclaw/alpha-agents-core";

const SCORE_DIMENSIONS: ScoreDimension[] = [
  "taskSuccess",
  "reliability",
  "costEfficiency",
  "latency",
  "safetyFootprint",
  "setupFriction",
  "operatorBurden",
  "domainFit",
];

const emptyLocalizedText = (): LocalizedText => ({ en: "", "zh-CN": "" });

export const mergeLocalizedText = (
  primary?: Partial<LocalizedText> | null,
  fallback?: LocalizedText | null,
): LocalizedText => ({
  en: primary?.en ?? fallback?.en ?? "",
  "zh-CN": primary?.["zh-CN"] ?? fallback?.["zh-CN"] ?? primary?.en ?? fallback?.en ?? "",
});

export const localizedTextFromUnknown = (
  value: unknown,
  fallback?: LocalizedText | null,
): LocalizedText => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Partial<Record<keyof LocalizedText, unknown>>;
    return mergeLocalizedText(
      {
        en: typeof record.en === "string" ? record.en : undefined,
        "zh-CN": typeof record["zh-CN"] === "string" ? record["zh-CN"] : undefined,
      },
      fallback ?? undefined,
    );
  }
  return fallback ?? emptyLocalizedText();
};

export const stringArrayFromUnknown = (value: unknown, fallback: string[] = []): string[] => {
  if (!Array.isArray(value)) {
    return [...fallback];
  }
  return value.filter((entry): entry is string => typeof entry === "string");
};

export const localizedTextArrayFromUnknown = (value: unknown, fallback: LocalizedText[] = []): LocalizedText[] => {
  if (!Array.isArray(value)) {
    return [...fallback];
  }
  return value.map((entry, index) => localizedTextFromUnknown(entry, fallback[index]));
};

export const booleanFromStorage = (value: unknown, fallback = false): boolean => {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value > 0;
  }
  return fallback;
};

const scoreDelta = (current: number, previous: number) => current - previous;

export const buildRegressionSummary = (
  currentVersion: AgentVersionRecord,
  previousVersion: AgentVersionRecord | undefined,
  permissionManifest: PermissionManifest,
): VersionRegressionSummary | undefined => {
  if (!previousVersion) {
    return undefined;
  }

  const currentRuns = new Map(currentVersion.benchmarkRuns.map((run) => [run.suiteSlug, run]));
  const previousRuns = new Map(previousVersion.benchmarkRuns.map((run) => [run.suiteSlug, run]));
  const improvedMetrics = new Set<ScoreDimension>();
  const regressedMetrics = new Set<ScoreDimension>();

  currentRuns.forEach((run, suiteSlug) => {
    const previousRun = previousRuns.get(suiteSlug);
    if (!previousRun) {
      return;
    }

    for (const dimension of SCORE_DIMENSIONS) {
      const delta = scoreDelta(run.scorecard[dimension], previousRun.scorecard[dimension]);
      if (delta >= 3) {
        improvedMetrics.add(dimension);
      }
      if (delta <= -3) {
        regressedMetrics.add(dimension);
      }
    }
  });

  if (improvedMetrics.size === 0 && regressedMetrics.size === 0) {
    return {
      improvedMetrics: [],
      regressedMetrics: [],
      rerunRequired: permissionManifest.riskLevel !== "low",
      permissionDelta: permissionManifest.summary,
    };
  }

  return {
    improvedMetrics: [...improvedMetrics],
    regressedMetrics: [...regressedMetrics],
    rerunRequired: regressedMetrics.size > 0 || permissionManifest.riskLevel !== "low",
    permissionDelta: permissionManifest.summary,
  };
};

export const withRegressionSummaries = (agent: AgentRecord): AgentRecord => ({
  ...agent,
  versions: agent.versions.map((version, index) => ({
    ...version,
    regressionSummary:
      version.regressionSummary ??
      buildRegressionSummary(version, agent.versions[index + 1], agent.permissionManifest),
  })),
});

export const buildLeaderboardsFromAgents = (agents: AgentRecord[]): Record<string, LeaderboardEntry[]> => {
  const entries = agents.flatMap((agent) =>
    agent.versions.flatMap((version) =>
      version.benchmarkRuns
        .filter(isVerifiedBenchmarkRun)
        .map((run) => toLeaderboardEntry(run, { ...agent, versions: [version] })),
    ),
  );

  return entries.reduce<Record<string, LeaderboardEntry[]>>((accumulator, entry) => {
    const rows = accumulator[entry.suiteSlug] ?? [];
    rows.push(entry);
    accumulator[entry.suiteSlug] = rows.sort((left, right) => left.rank - right.rank);
    return accumulator;
  }, {});
};

const normalizedAgentText = (agent: AgentRecord): string =>
  [
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

export const filterAgents = (
  agents: AgentRecord[],
  filters?: {
    query?: string;
    category?: string;
    status?: string;
    trustTier?: string;
    riskLevel?: string;
    credential?: string;
    activity?: string;
  },
): AgentRecord[] => {
  const query = filters?.query?.trim().toLowerCase();

  return agents.filter((agent) => {
    if (query && !normalizedAgentText(agent).includes(query)) {
      return false;
    }
    if (filters?.category && filters.category !== "all" && !agent.categories.includes(filters.category)) {
      return false;
    }
    if (filters?.status && filters.status !== "all" && agent.verificationStatus !== filters.status) {
      return false;
    }
    if (filters?.trustTier && filters.trustTier !== "all" && agent.trust?.tier !== filters.trustTier) {
      return false;
    }
    if (filters?.riskLevel && filters.riskLevel !== "all" && agent.permissionManifest.riskLevel !== filters.riskLevel) {
      return false;
    }
    if (
      filters?.credential &&
      filters.credential !== "all" &&
      !agent.credentials?.some(
        (credential) => credential.type === filters.credential || credential.relatedSuiteSlug === filters.credential,
      )
    ) {
      return false;
    }
    if (filters?.activity === "recent") {
      const latestActivityAt = agent.activity?.[0]?.occurredAt;
      if (!latestActivityAt || Date.now() - new Date(latestActivityAt).getTime() > 1000 * 60 * 60 * 24 * 14) {
        return false;
      }
    }
    return true;
  });
};

export const mergeAgentsBySlug = (sampleAgents: AgentRecord[], liveAgents: AgentRecord[]): AgentRecord[] => {
  const merged = new Map(sampleAgents.map((agent) => [agent.slug, withRegressionSummaries(agent)]));

  for (const agent of liveAgents) {
    const sample = merged.get(agent.slug);
    merged.set(agent.slug, withRegressionSummaries(sample ? mergeAgent(sample, agent) : agent));
  }

  return [...merged.values()];
};

export const mergeBuildersByHandle = (
  sampleBuilders: BuilderProfile[],
  liveBuilders: BuilderProfile[],
): BuilderProfile[] => {
  const merged = new Map(sampleBuilders.map((builder) => [builder.handle, builder]));

  for (const builder of liveBuilders) {
    const sample = merged.get(builder.handle);
    merged.set(builder.handle, sample ? mergeBuilder(sample, builder) : builder);
  }

  return [...merged.values()];
};

const mergeVersions = (
  sampleVersions: AgentVersionRecord[],
  liveVersions: AgentVersionRecord[],
  permissionManifest: PermissionManifest,
): AgentVersionRecord[] => {
  const merged = new Map(sampleVersions.map((version) => [version.id, version]));

  for (const version of liveVersions) {
    const sample = merged.get(version.id);
    merged.set(version.id, {
      ...sample,
      ...version,
      changelog: version.changelog.length > 0 ? version.changelog : sample?.changelog ?? [],
      benchmarkRuns: mergeRuns(sample?.benchmarkRuns ?? [], version.benchmarkRuns),
      regressionSummary:
        version.regressionSummary ?? sample?.regressionSummary ?? buildRegressionSummary(version, undefined, permissionManifest),
    });
  }

  return [...merged.values()].sort(
    (left, right) => new Date(right.releasedAt).getTime() - new Date(left.releasedAt).getTime(),
  );
};

const mergeRuns = (sampleRuns: BenchmarkRun[], liveRuns: BenchmarkRun[]): BenchmarkRun[] => {
  const merged = new Map(sampleRuns.map((run) => [run.id, run]));

  for (const run of liveRuns) {
    const sample = sampleRuns.find((entry) => entry.suiteSlug === run.suiteSlug);
    merged.set(run.id, {
      ...sample,
      ...run,
      notes: mergeLocalizedText(run.notes, sample?.notes),
    });
  }

  return [...merged.values()].sort(
    (left, right) => new Date(right.evaluatedAt).getTime() - new Date(left.evaluatedAt).getTime(),
  );
};

export const mergeAgent = (sample: AgentRecord, live: AgentRecord): AgentRecord => {
  const permissionManifest = {
    ...sample.permissionManifest,
    ...live.permissionManifest,
    summary: mergeLocalizedText(live.permissionManifest.summary, sample.permissionManifest.summary),
    skills: live.permissionManifest.skills.length > 0 ? live.permissionManifest.skills : sample.permissionManifest.skills,
    secrets: live.permissionManifest.secrets.length > 0 ? live.permissionManifest.secrets : sample.permissionManifest.secrets,
    networkAccess:
      live.permissionManifest.networkAccess.length > 0
        ? live.permissionManifest.networkAccess
        : sample.permissionManifest.networkAccess,
    fileAccess:
      live.permissionManifest.fileAccess.length > 0 ? live.permissionManifest.fileAccess : sample.permissionManifest.fileAccess,
  };

  return {
    ...sample,
    ...live,
    tagline: mergeLocalizedText(live.tagline, sample.tagline),
    summary: mergeLocalizedText(live.summary, sample.summary),
    source: live.source.url === "#" ? sample.source : live.source,
    permissionManifest,
    useCases: live.useCases.length > 0 ? live.useCases : sample.useCases,
    notFor: live.notFor.length > 0 ? live.notFor : sample.notFor,
    categories: live.categories.length > 0 ? live.categories : sample.categories,
    versions: mergeVersions(sample.versions, live.versions, permissionManifest),
    overview: live.overview.length > 0 ? live.overview : sample.overview,
    capabilities: live.capabilities.length > 0 ? live.capabilities : sample.capabilities,
    dependencies: live.dependencies.length > 0 ? live.dependencies : sample.dependencies,
    demoRuns: live.demoRuns.length > 0 ? live.demoRuns : sample.demoRuns,
    reviews: live.reviews.length > 0 ? live.reviews : sample.reviews,
    knownLimits: live.knownLimits.length > 0 ? live.knownLimits : sample.knownLimits,
  };
};

export const mergeBuilder = (sample: BuilderProfile, live: BuilderProfile): BuilderProfile => ({
  ...sample,
  ...live,
  headline: mergeLocalizedText(live.headline, sample.headline),
  bio: mergeLocalizedText(live.bio, sample.bio),
  specialties: live.specialties.length > 0 ? live.specialties : sample.specialties,
  organizationsWorkedWith:
    live.organizationsWorkedWith && live.organizationsWorkedWith.length > 0
      ? live.organizationsWorkedWith
      : sample.organizationsWorkedWith,
  publishedAgentSlugs:
    live.publishedAgentSlugs.length > 0 ? live.publishedAgentSlugs : sample.publishedAgentSlugs,
  githubUrl: live.githubUrl ?? sample.githubUrl,
  location: live.location ?? sample.location,
});
