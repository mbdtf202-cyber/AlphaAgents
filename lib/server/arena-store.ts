import { randomUUID } from "node:crypto";

import {
  arenaCompetitions,
  arenaLeagues,
  arenaTeams,
  type ArenaCompetition,
  type ArenaCompetitionEntry,
  type ArenaFeedItem,
  type ArenaHomeView,
  type ArenaLeaderboardEntry,
  type ArenaLiveCredential,
  type ArenaReportArtifact,
  type ArenaReplayArtifact,
  type ArenaRun,
  type ArenaTeamSummary,
  type ArenaWatchlistEntry,
  type TradingVersionConfig,
  tradingVersionConfigInputSchema,
  arenaCompetitionEntryInputSchema,
  arenaLiveCredentialInputSchema,
  arenaRunRequestSchema,
  arenaWatchlistInputSchema,
} from "@openclaw/alpha-agents-arena-core";
import { executeBuiltinPaperRun, isBuiltinRuntimeImage, simulateArenaRun } from "@openclaw/alpha-agents-arena-runner";
import {
  agentRecords,
  agentVersions,
  arenaCompetitionEntriesTable,
  arenaCompetitionsTable,
  arenaLeaderboardRowsTable,
  arenaLiveCredentialsTable,
  arenaReplayBundlesTable,
  arenaReportArtifactsTable,
  arenaRunsTable,
  arenaWatchlistEntriesTable,
  builderProfiles,
  organizations,
  tradingVersionConfigsTable,
} from "@openclaw/alpha-agents-core/db/schema";
import type { LocalizedText, OrganizationProfile, RelationshipEdge, SessionActor } from "@openclaw/alpha-agents-core";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { localizedTextArrayFromUnknown, localizedTextFromUnknown, stringArrayFromUnknown } from "./catalog";
import { getDb } from "./db";
import { getStorageMode, isArenaLiveEnabled, isArenaManagedKeysEnabled, isArenaPublicEnabled, isArenaUserAgentEnabled } from "./env";
import { ConfigurationError, ForbiddenError, NotFoundError } from "./errors";
import { getMemoryState } from "./memory-store";

interface ArenaState {
  tradingVersionConfigs: TradingVersionConfig[];
  competitions: ArenaCompetition[];
  entries: ArenaCompetitionEntry[];
  runs: ArenaRun[];
  leaderboards: ArenaLeaderboardEntry[];
  replays: ArenaReplayArtifact[];
  reports: ArenaReportArtifact[];
  feed: ArenaFeedItem[];
  liveCredentials: ArenaLiveCredential[];
  watchlist: ArenaWatchlistEntry[];
}

function ownableMatch(actor: SessionActor, ownerUserId?: string, ownerOrganizationId?: string): boolean {
  if (ownerUserId && ownerUserId === actor.userId) {
    return true;
  }
  if (ownerOrganizationId && actor.memberships.some((membership) => membership.organizationId === ownerOrganizationId)) {
    return true;
  }
  return false;
}

function requireArenaWritesEnabled() {
  if (getStorageMode() === "sample") {
    throw new ConfigurationError("Arena writes are unavailable in sample mode.");
  }
}

function currentProofModes() {
  return isArenaLiveEnabled() ? ["paper", "verified_live"] : ["paper"];
}

function isSyntheticExecutionAllowed() {
  return process.env.NODE_ENV === "test";
}

function isBuildPhase() {
  return process.env.NEXT_PHASE === "phase-production-build" || process.env.__NEXT_PRIVATE_BUILD_WORKER === "true" || process.env.npm_lifecycle_event === "build";
}

function emptyArenaState(): ArenaState {
  return {
    tradingVersionConfigs: [],
    competitions: arenaCompetitions,
    entries: [],
    runs: [],
    leaderboards: [],
    replays: [],
    reports: [],
    feed: [],
    liveCredentials: [],
    watchlist: [],
  };
}

function asLocalizedText(value: unknown, fallback?: LocalizedText): LocalizedText {
  return localizedTextFromUnknown(value, fallback);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function buildValidationDescriptor(runtimeImage: string) {
  const builtinReady = isBuiltinRuntimeImage(runtimeImage);
  return {
    builtinReady,
    buildStatus: (builtinReady ? "ready" : "pending") as TradingVersionConfig["buildStatus"],
    validationStatus: (builtinReady ? "passed" : "pending") as TradingVersionConfig["validationStatus"],
    validationReport: {
      en: builtinReady
        ? "Built-in runtime located and trading manifest contract validated."
        : "Runtime declaration persisted. External build and validation are still pending.",
      "zh-CN": builtinReady
        ? "已定位内建运行时，并通过交易 manifest 契约校验。"
        : "运行时声明已持久化，仍需等待外部构建与校验。",
    },
  };
}

function priorPaperStateFromRun(run?: ArenaRun) {
  const state = asRecord((run as { state?: unknown } | undefined)?.state);
  return {
    initialCapitalUsd: Number(state.initialCapitalUsd ?? 100000),
    cashBalanceUsd: Number(state.cashBalanceUsd ?? 100000),
    positionQty: Number(state.positionQty ?? 0),
    lastPrice: Number(state.lastPrice ?? 0),
    peakEquityUsd: Number(state.peakEquityUsd ?? 100000),
    completedRuns: Number(state.completedRuns ?? 0),
  };
}

async function buildPostgresArenaState(): Promise<ArenaState> {
  const db = getDb();
  const [
    competitionRows,
    configRows,
    entryRows,
    runRows,
    leaderboardRows,
    replayRows,
    reportRows,
    liveCredentialRows,
    watchlistRows,
    agentRows,
    organizationRows,
  ] = await Promise.all([
    db.select().from(arenaCompetitionsTable).orderBy(desc(arenaCompetitionsTable.startsAt)),
    db.select().from(tradingVersionConfigsTable),
    db.select().from(arenaCompetitionEntriesTable),
    db.select().from(arenaRunsTable).orderBy(desc(arenaRunsTable.startedAt)),
    db.select().from(arenaLeaderboardRowsTable).orderBy(arenaLeaderboardRowsTable.rank),
    db.select().from(arenaReplayBundlesTable).orderBy(desc(arenaReplayBundlesTable.createdAt)),
    db.select().from(arenaReportArtifactsTable).orderBy(desc(arenaReportArtifactsTable.publishedAt)),
    db.select().from(arenaLiveCredentialsTable).orderBy(desc(arenaLiveCredentialsTable.updatedAt)),
    db.select().from(arenaWatchlistEntriesTable).orderBy(desc(arenaWatchlistEntriesTable.createdAt)),
    db
      .select({
        id: agentRecords.id,
        slug: agentRecords.slug,
        name: agentRecords.name,
        builderHandle: builderProfiles.handle,
      })
      .from(agentRecords)
      .leftJoin(builderProfiles, eq(builderProfiles.id, agentRecords.builderProfileId)),
    db.select({ id: organizations.id, slug: organizations.slug, name: organizations.name }).from(organizations),
  ]);

  const agentById = new Map(agentRows.map((row) => [row.id, row]));
  const competitionById = new Map(competitionRows.map((row) => [row.id, row]));
  const organizationById = new Map(organizationRows.map((row) => [row.id, row]));

  const competitions: ArenaCompetition[] =
    competitionRows.length > 0
      ? competitionRows.map((row) => ({
          id: row.id,
          leagueId: row.leagueSlug,
          leagueSlug: row.leagueSlug,
          slug: row.slug,
          title: asLocalizedText(row.title),
          summary: asLocalizedText(row.summary),
          status: row.status as ArenaCompetition["status"],
          proofMode: row.proofMode as ArenaCompetition["proofMode"],
          rankingScope: row.rankingScope as ArenaCompetition["rankingScope"],
          startsAt: row.startsAt.toISOString(),
          endsAt: row.endsAt.toISOString(),
          initialCapitalUsd: Number(row.initialCapitalUsd),
          marketScope: stringArrayFromUnknown(row.marketScope),
          rulesetName: row.rulesetName,
        }))
      : arenaCompetitions;

  const tradingVersionConfigs: TradingVersionConfig[] = configRows.map((row) => ({
    id: row.id,
    agentSlug: agentById.get(row.agentId)?.slug ?? "unknown-agent",
    agentVersionId: row.agentVersionId,
    sourceKind: row.sourceKind as TradingVersionConfig["sourceKind"],
    runtimeImage: row.runtimeImage,
    buildStatus: row.buildStatus as TradingVersionConfig["buildStatus"],
    validationStatus: row.validationStatus as TradingVersionConfig["validationStatus"],
    validationReport: asLocalizedText(row.validationReport),
    executionMode: row.executionMode as TradingVersionConfig["executionMode"],
    promptMode: row.promptMode as TradingVersionConfig["promptMode"],
    strategySummary: asLocalizedText(row.strategySummary),
    marketScope: stringArrayFromUnknown(row.marketScope),
    supportedProviders: stringArrayFromUnknown(row.supportedProviders) as TradingVersionConfig["supportedProviders"],
    modelMetadata: (row.modelMetadata as TradingVersionConfig["modelMetadata"]) ?? {},
    riskProfile: row.riskProfile as TradingVersionConfig["riskProfile"],
    publishedAt: row.publishedAt?.toISOString(),
    frozenAt: row.frozenAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));

  const entries: ArenaCompetitionEntry[] = entryRows.map((row) => {
    const agent = agentById.get(row.agentId);
    const competition = competitionById.get(row.competitionId);
    const organization = row.ownerOrganizationId ? organizationById.get(row.ownerOrganizationId) : undefined;
    return {
      id: row.id,
      competitionId: row.competitionId,
      competitionSlug: competition?.slug ?? "unknown-competition",
      leagueSlug: competition?.leagueSlug ?? "unknown-league",
      agentSlug: agent?.slug ?? "unknown-agent",
      agentName: agent?.name ?? "Unknown agent",
      builderHandle: agent?.builderHandle ?? "",
      organizationSlug: organization?.slug,
      organizationName: organization?.name,
      agentVersionId: row.agentVersionId,
      tradingVersionConfigId: row.tradingVersionConfigId,
      entryStatus: row.entryStatus as ArenaCompetitionEntry["entryStatus"],
      proofMode: row.proofMode as ArenaCompetitionEntry["proofMode"],
      verificationLevel: row.verificationLevel as ArenaCompetitionEntry["verificationLevel"],
      liveStatus: row.liveStatus as ArenaCompetitionEntry["liveStatus"],
      promptMode: row.promptMode as ArenaCompetitionEntry["promptMode"],
      rankingScope: row.rankingScope as ArenaCompetitionEntry["rankingScope"],
      ruleViolationCount: row.ruleViolationCount,
      joinedAt: row.joinedAt.toISOString(),
    };
  });

  const entryById = new Map(entries.map((row) => [row.id, row]));

  const runs: ArenaRun[] = runRows.map((row) => {
    const entry = entryById.get(row.entryId);
    const metrics = (row.metrics as Partial<Record<string, number>>) ?? {};
    return {
      id: row.id,
      competitionId: row.competitionId,
      competitionSlug: entry?.competitionSlug ?? "unknown-competition",
      leagueSlug: entry?.leagueSlug ?? "unknown-league",
      entryId: row.entryId,
      agentSlug: entry?.agentSlug ?? "unknown-agent",
      agentVersionId: row.agentVersionId,
      providerKind: row.providerKind as ArenaRun["providerKind"],
      proofMode: row.proofMode as ArenaRun["proofMode"],
      verificationLevel: row.verificationLevel as ArenaRun["verificationLevel"],
      liveStatus: row.liveStatus as ArenaRun["liveStatus"],
      rankingScope: row.rankingScope as ArenaRun["rankingScope"],
      status: row.runStatus as ArenaRun["status"],
      rationaleSummary: asLocalizedText(row.rationaleSummary),
      actionSummary: stringArrayFromUnknown(row.actionSummary),
      instrument: row.instrument,
      netReturnPct: Number(metrics.netReturnPct ?? 0),
      maxDrawdownPct: Number(metrics.maxDrawdownPct ?? 0),
      sharpe: Number(metrics.sharpe ?? 0),
      calmar: Number(metrics.calmar ?? 0),
      consistencyScore: Number(metrics.consistencyScore ?? 0),
      survivalScore: Number(metrics.survivalScore ?? 0),
      executionQualityScore: Number(metrics.executionQualityScore ?? 0),
      disciplineScore: Number(metrics.disciplineScore ?? 0),
      totalScore: Number(metrics.totalScore ?? 0),
      startedAt: row.startedAt.toISOString(),
      completedAt: row.completedAt?.toISOString(),
    };
  });

  const runById = new Map(runs.map((row) => [row.id, row]));

  const leaderboards: ArenaLeaderboardEntry[] = leaderboardRows.map((row) => {
    const entry = entryById.get(row.entryId);
    const metrics = (row.metrics as Partial<Record<string, number>>) ?? {};
    return {
      id: row.id,
      competitionId: row.competitionId,
      competitionSlug: entry?.competitionSlug ?? "unknown-competition",
      leagueSlug: entry?.leagueSlug ?? "unknown-league",
      entryId: row.entryId,
      agentSlug: entry?.agentSlug ?? "unknown-agent",
      agentName: entry?.agentName ?? "Unknown agent",
      builderHandle: entry?.builderHandle ?? "",
      organizationSlug: entry?.organizationSlug,
      proofMode: row.proofMode as ArenaLeaderboardEntry["proofMode"],
      verificationLevel: row.verificationLevel as ArenaLeaderboardEntry["verificationLevel"],
      liveStatus: row.liveStatus as ArenaLeaderboardEntry["liveStatus"],
      promptMode: row.promptMode as ArenaLeaderboardEntry["promptMode"],
      rankingScope: row.rankingScope as ArenaLeaderboardEntry["rankingScope"],
      rank: row.rank,
      totalScore: Number(row.totalScore),
      netReturnPct: Number(metrics.netReturnPct ?? 0),
      maxDrawdownPct: Number(metrics.maxDrawdownPct ?? 0),
      sharpe: Number(metrics.sharpe ?? 0),
      calmar: Number(metrics.calmar ?? 0),
      consistencyScore: Number(metrics.consistencyScore ?? 0),
      survivalScore: Number(metrics.survivalScore ?? 0),
      executionQualityScore: Number(metrics.executionQualityScore ?? 0),
      disciplineScore: Number(metrics.disciplineScore ?? 0),
      ruleViolationCount: Number(metrics.ruleViolationCount ?? entry?.ruleViolationCount ?? 0),
      asOf: row.asOf.toISOString(),
    };
  });

  const replays = replayRows
    .map((row) => {
      const run = runById.get(row.runId);
      if (!run) {
        return undefined;
      }
      return {
        id: row.id,
        runId: row.runId,
        title: asLocalizedText(row.title),
        summary: asLocalizedText(row.summary),
        artifactUrl: row.artifactUrl,
        chartUrl: row.chartUrl ?? undefined,
        keyMoments: localizedTextArrayFromUnknown(row.keyMoments),
        createdAt: row.createdAt.toISOString(),
      } as ArenaReplayArtifact;
    })
    .filter(Boolean) as ArenaReplayArtifact[];

  const reports: ArenaReportArtifact[] = reportRows.map((row) => ({
    id: row.id,
    subjectType: row.subjectType as ArenaReportArtifact["subjectType"],
    subjectId: row.subjectId,
    kind: row.kind as ArenaReportArtifact["kind"],
    title: asLocalizedText(row.title),
    summary: asLocalizedText(row.summary),
    highlights: localizedTextArrayFromUnknown(row.highlights),
    windowLabel: row.windowLabel,
    scoreVersion: row.scoreVersion,
    proofModes: stringArrayFromUnknown(row.proofModes) as ArenaReportArtifact["proofModes"],
    artifactUrl: row.artifactUrl,
    publishedAt: row.publishedAt.toISOString(),
  }));

  const feed: ArenaFeedItem[] = [
    ...reports.slice(0, 4).map((report) => ({
      id: `feed-report-${report.id}`,
      kind: "report" as const,
      title: report.title,
      summary: report.summary,
      href: `/reports/${report.id}`,
      subjectType: report.subjectType,
      subjectId: report.subjectId,
      proofModes: report.proofModes,
      publishedAt: report.publishedAt,
    })),
    ...replays.slice(0, 4).map((replay) => {
      const run = runById.get(replay.runId);
      return {
        id: `feed-replay-${replay.id}`,
        kind: "replay" as const,
        title: replay.title,
        summary: replay.summary,
        href: replay.artifactUrl,
        subjectType: "run" as const,
        subjectId: replay.runId,
        proofModes: run ? [run.proofMode] : (["paper"] as ArenaFeedItem["proofModes"]),
        publishedAt: replay.createdAt,
      };
    }),
  ].sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime());

  const liveCredentials: ArenaLiveCredential[] = liveCredentialRows.map((row) => ({
    id: row.id,
    agentSlug: agentById.get(row.agentId)?.slug ?? "unknown-agent",
    agentVersionId: row.agentVersionId,
    accountLabel: row.accountLabel,
    exchange: row.exchange,
    credentialMode: row.credentialMode as ArenaLiveCredential["credentialMode"],
    providerKind: row.providerKind as ArenaLiveCredential["providerKind"],
    status: row.status as ArenaLiveCredential["status"],
    verificationLevel: row.verificationLevel as ArenaLiveCredential["verificationLevel"],
    lastSyncedAt: row.lastSyncedAt?.toISOString(),
    ownerUserId: row.ownerUserId ?? undefined,
    ownerOrganizationId: row.ownerOrganizationId ?? undefined,
    createdByUserId: row.createdByUserId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));

  const watchlist: ArenaWatchlistEntry[] = watchlistRows.map((row) => ({
    id: row.id,
    targetType: row.targetType as ArenaWatchlistEntry["targetType"],
    targetId: row.targetId,
    label: asLocalizedText(row.label),
    ownerUserId: row.ownerUserId ?? undefined,
    ownerOrganizationId: row.ownerOrganizationId ?? undefined,
    createdByUserId: row.createdByUserId,
    createdAt: row.createdAt.toISOString(),
  }));

  return {
    tradingVersionConfigs,
    competitions,
    entries,
    runs,
    leaderboards,
    replays,
    reports,
    feed,
    liveCredentials,
    watchlist,
  };
}

function createArenaReplayArtifact(entry: ArenaCompetitionEntry, parsed: z.infer<typeof arenaRunRequestSchema>, runId: string): ArenaReplayArtifact {
  return {
    id: randomUUID(),
    runId,
    title: { en: `${entry.agentName} replay`, "zh-CN": `${entry.agentName} 回放` },
    summary: {
      en: `Replay generated for ${parsed.proofMode} execution on ${parsed.instrument}.`,
      "zh-CN": `已为 ${parsed.instrument} 上的 ${parsed.proofMode} 执行生成回放。`,
    },
    artifactUrl: `/arena/replays/${runId}`,
    keyMoments: [
      {
        en: `${parsed.providerKind} stayed inside the unified risk boundary.`,
        "zh-CN": `${parsed.providerKind} 全程位于统一风控边界内。`,
      },
    ],
    createdAt: new Date().toISOString(),
  };
}

function createArenaReportArtifact(entry: ArenaCompetitionEntry, parsed: z.infer<typeof arenaRunRequestSchema>): ArenaReportArtifact {
  return {
    id: randomUUID(),
    subjectType: "agent",
    subjectId: entry.agentSlug,
    kind: parsed.proofMode === "verified_live" ? "daily" : "agent_card",
    title: { en: `${entry.agentName} arena update`, "zh-CN": `${entry.agentName} 竞技场更新` },
    summary: {
      en: `${parsed.proofMode} execution completed with a replayable result and updated score.`,
      "zh-CN": `${parsed.proofMode} 执行已完成，并生成可回放结果和更新后的得分。`,
    },
    highlights: [
      {
        en: `${parsed.providerKind} route completed under the current score version.`,
        "zh-CN": `在当前评分版本下已完成 ${parsed.providerKind} 路由。`,
      },
    ],
    windowLabel: "Latest run",
    scoreVersion: "arena-score-v1",
    proofModes: [parsed.proofMode],
    artifactUrl: `/reports/${randomUUID()}`,
    publishedAt: new Date().toISOString(),
  };
}

function createArenaFeedItem(parsed: z.infer<typeof arenaRunRequestSchema>, report: ArenaReportArtifact, replay: ArenaReplayArtifact): ArenaFeedItem {
  return {
    id: randomUUID(),
    kind: parsed.proofMode === "verified_live" ? "report" : "replay",
    title: report.title,
    summary: report.summary,
    href: replay.artifactUrl,
    subjectType: "run",
    subjectId: replay.runId,
    proofModes: [parsed.proofMode],
    publishedAt: new Date().toISOString(),
  };
}

async function getArenaState(): Promise<ArenaState> {
  if (isBuildPhase()) {
    return emptyArenaState();
  }
  const mode = getStorageMode();
  if (mode === "sample") {
    return emptyArenaState();
  }
  if (mode === "memory") {
    const state = getMemoryState();
    return {
      tradingVersionConfigs: state.arenaTradingVersionConfigs,
      competitions: state.arenaCompetitions,
      entries: state.arenaEntries,
      runs: state.arenaRuns,
      leaderboards: state.arenaLeaderboards,
      replays: state.arenaReplays,
      reports: state.arenaReports,
      feed: state.arenaFeed,
      liveCredentials: state.arenaLiveCredentials,
      watchlist: state.arenaWatchlist,
    };
  }
  return buildPostgresArenaState();
}

function buildTeamSummaryFromState(state: ArenaState, organizationsInput: OrganizationProfile[], relationships: RelationshipEdge[]): ArenaTeamSummary[] {
  return organizationsInput.map((organization) => {
    const managedAgentCount = new Set(
      state.entries.filter((entry) => entry.organizationSlug === organization.slug).map((entry) => entry.agentSlug),
    ).size;
    const activeEntryCount = state.entries.filter((entry) => entry.organizationSlug === organization.slug && entry.entryStatus === "active").length;
    const liveCoverageCount = state.entries.filter((entry) => entry.organizationSlug === organization.slug && entry.liveStatus !== "paper_only").length;
    const followers = relationships.filter((edge) => edge.type === "follows" && edge.toType === "organization" && edge.toId === organization.id).length;
    const bestRow = state.leaderboards
      .filter((row) => row.organizationSlug === organization.slug)
      .sort((left, right) => left.rank - right.rank)[0];
    const fallback = arenaTeams.find((team) => team.organizationSlug === organization.slug);

    return {
      organizationSlug: organization.slug,
      organizationName: organization.name,
      headline: fallback?.headline ?? organization.headline,
      summary: fallback?.summary ?? organization.summary,
      managedAgentCount,
      activeEntryCount,
      liveCoverageCount,
      followers,
      bestLeagueSlug: bestRow?.leagueSlug ?? fallback?.bestLeagueSlug,
      bestRank: bestRow?.rank ?? fallback?.bestRank,
    };
  });
}

async function upsertLeaderboardRowsForCompetition(competitionId: string) {
  if (getStorageMode() !== "memory") {
    return;
  }

  const state = getMemoryState();
  const entries = state.arenaEntries.filter((entry) => entry.competitionId === competitionId);
  const latestRuns = entries
    .map((entry) => {
      const run = state.arenaRuns
        .filter((candidate) => candidate.entryId === entry.id && candidate.status === "completed")
        .sort((left, right) => new Date(right.completedAt ?? right.startedAt).getTime() - new Date(left.completedAt ?? left.startedAt).getTime())[0];
      return run ? { entry, run } : undefined;
    })
    .filter((item): item is { entry: ArenaCompetitionEntry; run: ArenaRun } => Boolean(item))
    .sort((left, right) => right.run.totalScore - left.run.totalScore);

  state.arenaLeaderboards = [
    ...state.arenaLeaderboards.filter((row) => row.competitionId !== competitionId),
    ...latestRuns.map(({ entry, run }, index) => ({
      id: `leaderboard-${entry.id}`,
      competitionId: entry.competitionId,
      competitionSlug: entry.competitionSlug,
      leagueSlug: entry.leagueSlug,
      entryId: entry.id,
      agentSlug: entry.agentSlug,
      agentName: entry.agentName,
      builderHandle: entry.builderHandle,
      organizationSlug: entry.organizationSlug,
      proofMode: run.proofMode,
      verificationLevel: run.verificationLevel,
      liveStatus: run.liveStatus,
      promptMode: entry.promptMode,
      rankingScope: entry.rankingScope,
      rank: index + 1,
      totalScore: run.totalScore,
      netReturnPct: run.netReturnPct,
      maxDrawdownPct: run.maxDrawdownPct,
      sharpe: run.sharpe,
      calmar: run.calmar,
      consistencyScore: run.consistencyScore,
      survivalScore: run.survivalScore,
      executionQualityScore: run.executionQualityScore,
      disciplineScore: run.disciplineScore,
      ruleViolationCount: entry.ruleViolationCount,
      asOf: run.completedAt ?? run.startedAt,
    })),
  ];
}

export async function getArenaHomeView(organizationsInput: OrganizationProfile[], relationships: RelationshipEdge[]): Promise<ArenaHomeView> {
  const state = await getArenaState();
  return {
    leagues: arenaLeagues.filter((league) => currentProofModes().some((mode) => league.proofModes.includes(mode as never))),
    featuredCompetition: state.competitions[0],
    featuredLeaderboard: state.leaderboards.slice(0, 4),
    reports: state.reports.slice(0, 3),
    feed: state.feed.slice(0, 6),
    teams: buildTeamSummaryFromState(state, organizationsInput, relationships).slice(0, 3),
  };
}

export async function listArenaLeagues() {
  if (!isArenaPublicEnabled()) {
    return [];
  }
  return arenaLeagues.filter((league) => currentProofModes().some((mode) => league.proofModes.includes(mode as never)));
}

export async function getArenaLeagueBySlug(slug: string) {
  const state = await getArenaState();
  const league = (await listArenaLeagues()).find((item) => item.slug === slug);
  if (!league) {
    return undefined;
  }
  return {
    league,
    competitions: state.competitions.filter((competition) => competition.leagueSlug === slug),
    leaderboard: state.leaderboards.filter((row) => row.leagueSlug === slug),
    reports: state.reports.filter((report) => report.subjectId === slug || report.subjectType === "league"),
    feed: state.feed.filter((item) => item.subjectId === slug && item.subjectType === "league"),
  };
}

export async function listArenaReports() {
  return (await getArenaState()).reports
    .slice()
    .sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime());
}

export async function getArenaReportById(reportId: string) {
  return (await getArenaState()).reports.find((report) => report.id === reportId);
}

export async function listArenaFeedItems() {
  return (await getArenaState()).feed
    .slice()
    .sort((left, right) => new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime());
}

export async function getArenaReplayByRunId(runId: string) {
  const state = await getArenaState();
  const run = state.runs.find((item) => item.id === runId);
  const replay = state.replays.find((item) => item.runId === runId);
  if (!run || !replay) {
    return undefined;
  }
  return { run, replay };
}

export async function getArenaAgentView(agentSlug: string) {
  const state = await getArenaState();
  return {
    tradingVersionConfigs: state.tradingVersionConfigs.filter((config) => config.agentSlug === agentSlug),
    entries: state.entries.filter((entry) => entry.agentSlug === agentSlug),
    runs: state.runs.filter((run) => run.agentSlug === agentSlug),
    leaderboard: state.leaderboards.filter((row) => row.agentSlug === agentSlug),
    reports: state.reports.filter((report) => report.subjectId === agentSlug),
    liveCredentials: state.liveCredentials.filter((credential) => credential.agentSlug === agentSlug),
  };
}

export async function getArenaBuilderView(builderHandle: string) {
  const state = await getArenaState();
  return {
    entries: state.entries.filter((entry) => entry.builderHandle === builderHandle),
    runs: state.runs.filter((run) => state.entries.some((entry) => entry.id === run.entryId && entry.builderHandle === builderHandle)),
    leaderboard: state.leaderboards.filter((row) => row.builderHandle === builderHandle),
  };
}

export async function listArenaTeams(organizationsInput: OrganizationProfile[], relationships: RelationshipEdge[]) {
  return buildTeamSummaryFromState(await getArenaState(), organizationsInput, relationships);
}

export async function getArenaTeamBySlug(slug: string, organizationsInput: OrganizationProfile[], relationships: RelationshipEdge[]) {
  const organization = organizationsInput.find((item) => item.slug === slug);
  if (!organization) {
    return undefined;
  }
  const state = await getArenaState();
  const summary = buildTeamSummaryFromState(state, organizationsInput, relationships).find((item) => item.organizationSlug === slug);
  return {
    organization,
    summary,
    entries: state.entries.filter((entry) => entry.organizationSlug === slug),
    leaderboard: state.leaderboards.filter((row) => row.organizationSlug === slug),
    reports: state.reports.filter((report) => report.subjectId === slug || report.subjectType === "organization"),
  };
}

export async function listArenaTradingVersionConfigsForActor(actor: SessionActor) {
  const state = await getArenaState();
  if (actor.role === "admin") {
    return state.tradingVersionConfigs;
  }
  const source =
    getStorageMode() === "memory"
      ? getMemoryState().agents
      : (
          await getDb()
            .select({ slug: agentRecords.slug, builderHandle: builderProfiles.handle })
            .from(agentRecords)
            .leftJoin(builderProfiles, eq(builderProfiles.id, agentRecords.builderProfileId))
        ).map((row) => ({ slug: row.slug, builderHandle: row.builderHandle ?? "" }));
  const ownedAgentSlugs = new Set(source.filter((agent) => agent.builderHandle === actor.githubHandle).map((agent) => agent.slug));
  return state.tradingVersionConfigs.filter((config) => ownedAgentSlugs.has(config.agentSlug));
}

export async function listArenaEntriesForActor(actor: SessionActor) {
  const state = await getArenaState();
  if (actor.role === "admin") {
    return state.entries;
  }
  const visibleConfigs = await listArenaTradingVersionConfigsForActor(actor);
  const visibleAgentSlugs = new Set(visibleConfigs.map((config) => config.agentSlug));
  return state.entries.filter((entry) => visibleAgentSlugs.has(entry.agentSlug));
}

export async function listArenaRunsForActor(actor: SessionActor) {
  const entryIds = new Set((await listArenaEntriesForActor(actor)).map((entry) => entry.id));
  return (await getArenaState()).runs.filter((run) => actor.role === "admin" || entryIds.has(run.entryId));
}

export async function listArenaLiveCredentialsForActor(actor: SessionActor) {
  return (await getArenaState()).liveCredentials.filter((credential) => ownableMatch(actor, credential.ownerUserId, credential.ownerOrganizationId));
}

export async function listArenaWatchlistForActor(actor: SessionActor) {
  return (await getArenaState()).watchlist.filter((entry) => ownableMatch(actor, entry.ownerUserId, entry.ownerOrganizationId));
}

export async function createTradingVersionConfig(actor: SessionActor, input: unknown) {
  requireArenaWritesEnabled();
  const parsed = tradingVersionConfigInputSchema.parse(input);

  if (getStorageMode() === "memory") {
    const state = getMemoryState();
    const agent = state.agents.find((item) => item.slug === parsed.agentSlug);
    if (!agent) {
      throw new NotFoundError("Agent not found.");
    }
    const version = agent.versions.find((item) => item.id === parsed.agentVersionId);
    if (!version) {
      throw new NotFoundError("Agent version not found.");
    }
    if (actor.role !== "admin" && actor.githubHandle !== agent.builderHandle) {
      throw new ForbiddenError("Only the owning builder can create a trading config.");
    }

    const existing = state.arenaTradingVersionConfigs.find((config) => config.agentVersionId === parsed.agentVersionId);
    const validation = buildValidationDescriptor(parsed.runtimeImage);
    const next: TradingVersionConfig = {
      id: existing?.id ?? randomUUID(),
      agentSlug: parsed.agentSlug,
      agentVersionId: parsed.agentVersionId,
      sourceKind: parsed.sourceKind,
      runtimeImage: parsed.runtimeImage,
      buildStatus: validation.buildStatus,
      validationStatus: validation.validationStatus,
      validationReport: validation.validationReport,
      executionMode: parsed.manifest.executionMode,
      promptMode: parsed.manifest.promptMode,
      strategySummary: parsed.manifest.strategySummary,
      marketScope: parsed.manifest.marketScope,
      supportedProviders: parsed.manifest.supportedProviders,
      modelMetadata: parsed.manifest.modelMetadata,
      riskProfile: parsed.manifest.riskProfile,
      publishedAt: existing?.publishedAt,
      frozenAt: existing?.frozenAt,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (existing) {
      state.arenaTradingVersionConfigs = state.arenaTradingVersionConfigs.map((config) => (config.id === existing.id ? next : config));
      return next;
    }

    state.arenaTradingVersionConfigs.push(next);
    return next;
  }

  const db = getDb();
  const [agent] = await db
    .select({
      id: agentRecords.id,
      slug: agentRecords.slug,
      builderHandle: builderProfiles.handle,
      ownerUserId: agentRecords.ownerUserId,
      ownerOrganizationId: agentRecords.ownerOrganizationId,
    })
    .from(agentRecords)
    .leftJoin(builderProfiles, eq(builderProfiles.id, agentRecords.builderProfileId))
    .where(eq(agentRecords.slug, parsed.agentSlug))
    .limit(1);

  if (!agent) {
    throw new NotFoundError("Agent not found.");
  }
  if (!ownableMatch(actor, agent.ownerUserId ?? undefined, agent.ownerOrganizationId ?? undefined) && actor.githubHandle !== agent.builderHandle) {
    throw new ForbiddenError("Only the owning builder can create a trading config.");
  }

  const [version] = await db.select({ id: agentVersions.id }).from(agentVersions).where(eq(agentVersions.id, parsed.agentVersionId)).limit(1);
  if (!version) {
    throw new NotFoundError("Agent version not found.");
  }

  const [existing] = await db
    .select()
    .from(tradingVersionConfigsTable)
    .where(eq(tradingVersionConfigsTable.agentVersionId, parsed.agentVersionId))
    .limit(1);

  const validation = buildValidationDescriptor(parsed.runtimeImage);
  const payload = {
    agentId: agent.id,
    agentVersionId: parsed.agentVersionId,
    ownerUserId: agent.ownerUserId ?? undefined,
    ownerOrganizationId: agent.ownerOrganizationId ?? undefined,
    sourceKind: parsed.sourceKind,
    runtimeImage: parsed.runtimeImage,
    buildStatus: validation.buildStatus,
    validationStatus: validation.validationStatus,
    validationReport: validation.validationReport,
    executionMode: parsed.manifest.executionMode,
    promptMode: parsed.manifest.promptMode,
    strategySummary: parsed.manifest.strategySummary,
    marketScope: parsed.manifest.marketScope,
    supportedProviders: parsed.manifest.supportedProviders,
    modelMetadata: parsed.manifest.modelMetadata,
    riskProfile: parsed.manifest.riskProfile,
  };

  if (existing) {
    await db.update(tradingVersionConfigsTable).set({ ...payload, updatedAt: new Date() }).where(eq(tradingVersionConfigsTable.id, existing.id));
  } else {
    await db.insert(tradingVersionConfigsTable).values(payload);
  }

  return (await listArenaTradingVersionConfigsForActor({ ...actor, role: "admin" })).find((config) => config.agentVersionId === parsed.agentVersionId)!;
}

export async function createArenaCompetitionEntry(actor: SessionActor, input: unknown) {
  requireArenaWritesEnabled();
  const parsed = arenaCompetitionEntryInputSchema.parse(input);

  if (getStorageMode() === "memory") {
    const state = getMemoryState();
    const config = state.arenaTradingVersionConfigs.find((item) => item.id === parsed.tradingVersionConfigId);
    if (!config) {
      throw new NotFoundError("Trading version config not found.");
    }
    if (config.validationStatus !== "passed") {
      throw new ForbiddenError("Trading version config must pass validation before it can enter a competition.");
    }
    const entry: ArenaCompetitionEntry = {
      id: randomUUID(),
      competitionId: parsed.competitionId,
      competitionSlug: parsed.competitionSlug,
      leagueSlug: parsed.leagueSlug,
      agentSlug: parsed.agentSlug,
      agentName: parsed.agentName,
      builderHandle: parsed.builderHandle,
      organizationSlug: parsed.organizationSlug,
      organizationName: parsed.organizationName,
      agentVersionId: parsed.agentVersionId,
      tradingVersionConfigId: parsed.tradingVersionConfigId,
      entryStatus: "active",
      proofMode: parsed.proofMode,
      verificationLevel: parsed.verificationLevel,
      liveStatus: parsed.liveStatus,
      promptMode: parsed.promptMode,
      rankingScope: parsed.rankingScope,
      ruleViolationCount: 0,
      joinedAt: new Date().toISOString(),
    };
    state.arenaEntries.push(entry);
    return entry;
  }

  const db = getDb();
  const [config] = await db
    .select()
    .from(tradingVersionConfigsTable)
    .where(eq(tradingVersionConfigsTable.id, parsed.tradingVersionConfigId))
    .limit(1);
  if (!config) {
    throw new NotFoundError("Trading version config not found.");
  }
  if (config.validationStatus !== "passed") {
    throw new ForbiddenError("Trading version config must pass validation before it can enter a competition.");
  }
  await db.insert(arenaCompetitionEntriesTable).values({
    competitionId: parsed.competitionId,
    agentId: config.agentId,
    agentVersionId: parsed.agentVersionId,
    tradingVersionConfigId: parsed.tradingVersionConfigId,
    ownerUserId: config.ownerUserId ?? undefined,
    ownerOrganizationId: config.ownerOrganizationId ?? undefined,
    entryStatus: "active",
    proofMode: parsed.proofMode,
    verificationLevel: parsed.verificationLevel,
    liveStatus: parsed.liveStatus,
    promptMode: parsed.promptMode,
    rankingScope: parsed.rankingScope,
    ruleViolationCount: 0,
  });

  const entries = await listArenaEntriesForActor({ ...actor, role: "admin" });
  return entries.sort((left, right) => new Date(right.joinedAt).getTime() - new Date(left.joinedAt).getTime())[0]!;
}

export async function triggerArenaRun(actor: SessionActor, input: unknown) {
  requireArenaWritesEnabled();
  const parsed = arenaRunRequestSchema.parse(input);
  if (parsed.providerKind === "managed_secret_broker" && !isArenaManagedKeysEnabled()) {
    throw new ForbiddenError("Managed live routing is disabled.");
  }
  if (parsed.providerKind === "user_execution_agent" && !isArenaUserAgentEnabled()) {
    throw new ForbiddenError("User execution agent routing is disabled.");
  }

  if (getStorageMode() === "memory") {
    const state = getMemoryState();
    const entry = state.arenaEntries.find((item) => item.id === parsed.entryId);
    if (!entry) {
      throw new NotFoundError("Arena entry not found.");
    }
    const config = state.arenaTradingVersionConfigs.find((item) => item.id === entry.tradingVersionConfigId);
    if (!config) {
      throw new NotFoundError("Trading version config not found.");
    }
    if (!config.supportedProviders.includes(parsed.providerKind)) {
      throw new ForbiddenError("Selected provider is not enabled for this trading config.");
    }

    const canExecuteBuiltinPaper =
      isBuiltinRuntimeImage(config.runtimeImage) && parsed.providerKind === "paper_matching_engine" && parsed.proofMode === "paper";

    if (!isSyntheticExecutionAllowed() && !canExecuteBuiltinPaper) {
      const queuedRun: ArenaRun = {
        id: randomUUID(),
        competitionId: parsed.competitionId,
        competitionSlug: parsed.competitionSlug,
        leagueSlug: parsed.leagueSlug,
        entryId: parsed.entryId,
        agentSlug: parsed.agentSlug,
        agentVersionId: parsed.agentVersionId,
        providerKind: parsed.providerKind,
        proofMode: parsed.proofMode,
        verificationLevel: parsed.proofMode === "verified_live" ? "review" : "review",
        liveStatus: parsed.liveStatus,
        rankingScope: parsed.rankingScope,
        status: "queued",
        rationaleSummary: {
          en: "Run request persisted and waiting for a real arena executor.",
          "zh-CN": "运行请求已持久化，等待真实竞技场执行器处理。",
        },
        actionSummary: [],
        instrument: parsed.instrument,
        netReturnPct: 0,
        maxDrawdownPct: 0,
        sharpe: 0,
        calmar: 0,
        consistencyScore: 0,
        survivalScore: 0,
        executionQualityScore: 0,
        disciplineScore: 0,
        totalScore: 0,
        startedAt: new Date().toISOString(),
      };
      state.arenaRuns.push(queuedRun);
      return { run: queuedRun };
    }
    const previousRun = state.arenaRuns
      .filter((item) => item.entryId === entry.id && item.status === "completed")
      .sort((left, right) => new Date(right.completedAt ?? right.startedAt).getTime() - new Date(left.completedAt ?? left.startedAt).getTime())[0];

    const completedRun = canExecuteBuiltinPaper && !isSyntheticExecutionAllowed()
      ? await executeBuiltinPaperRun({
          runtimeImage: config.runtimeImage,
          instrument: parsed.instrument,
          priorState: priorPaperStateFromRun(previousRun),
          riskProfile: config.riskProfile,
        })
      : undefined;

    const run = completedRun
      ? ({
          id: randomUUID(),
          competitionId: parsed.competitionId,
          competitionSlug: parsed.competitionSlug,
          leagueSlug: parsed.leagueSlug,
          entryId: parsed.entryId,
          agentSlug: parsed.agentSlug,
          agentVersionId: parsed.agentVersionId,
          providerKind: parsed.providerKind,
          proofMode: parsed.proofMode,
          verificationLevel: "verified",
          liveStatus: parsed.liveStatus,
          rankingScope: parsed.rankingScope,
          status: "completed",
          rationaleSummary: completedRun.rationaleSummary,
          actionSummary: completedRun.actionSummary,
          instrument: parsed.instrument,
          netReturnPct: completedRun.metrics.netReturnPct,
          maxDrawdownPct: completedRun.metrics.maxDrawdownPct,
          sharpe: completedRun.metrics.sharpe,
          calmar: completedRun.metrics.calmar,
          consistencyScore: completedRun.metrics.consistencyScore,
          survivalScore: completedRun.metrics.survivalScore,
          executionQualityScore: completedRun.metrics.executionQualityScore,
          disciplineScore: completedRun.metrics.disciplineScore,
          totalScore: completedRun.metrics.totalScore,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          state: completedRun.state,
        } as ArenaRun & { state: unknown })
      : simulateArenaRun({
          competitionId: parsed.competitionId,
          competitionSlug: parsed.competitionSlug,
          leagueSlug: parsed.leagueSlug,
          entryId: parsed.entryId,
          agentSlug: parsed.agentSlug,
          agentVersionId: parsed.agentVersionId,
          providerKind: parsed.providerKind,
          proofMode: parsed.proofMode,
          liveStatus: parsed.liveStatus,
          rankingScope: parsed.rankingScope,
          instrument: parsed.instrument,
          rationaleSummary: {
            en: `${entry.agentName} generated a simulated ${parsed.proofMode} decision routed through ${parsed.providerKind}.`,
            "zh-CN": `${entry.agentName} 生成了一次通过 ${parsed.providerKind} 路由的模拟 ${parsed.proofMode} 决策。`,
          },
          actionSummary: [`route ${parsed.instrument} via ${parsed.providerKind}`],
        });

    const replay = createArenaReplayArtifact(entry, parsed, run.id);
    const report = createArenaReportArtifact(entry, parsed);
    const feedItem = createArenaFeedItem(parsed, report, replay);

    state.arenaRuns.push({ ...run, replayId: replay.id, reportId: report.id } as ArenaRun);
    state.arenaReplays.push(replay);
    state.arenaReports.push(report);
    state.arenaFeed.unshift(feedItem);
    await upsertLeaderboardRowsForCompetition(parsed.competitionId);
    return { run: { ...run, replayId: replay.id, reportId: report.id }, replay, report };
  }

  const db = getDb();
  const [entry] = await db.select().from(arenaCompetitionEntriesTable).where(eq(arenaCompetitionEntriesTable.id, parsed.entryId)).limit(1);
  if (!entry) {
    throw new NotFoundError("Arena entry not found.");
  }
  const [config] = await db
    .select()
    .from(tradingVersionConfigsTable)
    .where(eq(tradingVersionConfigsTable.id, entry.tradingVersionConfigId))
    .limit(1);
  if (!config) {
    throw new NotFoundError("Trading version config not found.");
  }
  if (!(stringArrayFromUnknown(config.supportedProviders) as string[]).includes(parsed.providerKind)) {
    throw new ForbiddenError("Selected provider is not enabled for this trading config.");
  }

  const [latestRunRow] = await db
    .select()
    .from(arenaRunsTable)
    .where(and(eq(arenaRunsTable.entryId, parsed.entryId), eq(arenaRunsTable.runStatus, "completed")))
    .orderBy(desc(arenaRunsTable.completedAt))
    .limit(1);

  const canExecuteBuiltinPaper =
    isBuiltinRuntimeImage(config.runtimeImage) && parsed.providerKind === "paper_matching_engine" && parsed.proofMode === "paper";
  const builtinResult =
    canExecuteBuiltinPaper && !isSyntheticExecutionAllowed()
      ? await executeBuiltinPaperRun({
          runtimeImage: config.runtimeImage,
          instrument: parsed.instrument,
          priorState: asRecord(latestRunRow?.metrics).state as Record<string, unknown> | undefined,
          riskProfile: asRecord(config.riskProfile) as {
            maxLeverage?: number;
            maxOrderNotionalUsd?: number;
            maxDailyLossPct?: number;
            maxDrawdownPct?: number;
          },
        })
      : undefined;
  const syntheticRun = isSyntheticExecutionAllowed()
    ? simulateArenaRun({
        competitionId: parsed.competitionId,
        competitionSlug: parsed.competitionSlug,
        leagueSlug: parsed.leagueSlug,
        entryId: parsed.entryId,
        agentSlug: parsed.agentSlug,
        agentVersionId: parsed.agentVersionId,
        providerKind: parsed.providerKind,
        proofMode: parsed.proofMode,
        liveStatus: parsed.liveStatus,
        rankingScope: parsed.rankingScope,
        instrument: parsed.instrument,
        rationaleSummary: {
          en: "Synthetic test execution.",
          "zh-CN": "测试环境合成执行。",
        },
        actionSummary: [],
      })
    : undefined;

  const runStatus =
    builtinResult || syntheticRun ? ("completed" as const) : ("queued" as const);
  const metrics =
    builtinResult
      ? { ...builtinResult.metrics, state: builtinResult.state }
      : syntheticRun
        ? {
            netReturnPct: syntheticRun.netReturnPct,
            maxDrawdownPct: syntheticRun.maxDrawdownPct,
            sharpe: syntheticRun.sharpe,
            calmar: syntheticRun.calmar,
            consistencyScore: syntheticRun.consistencyScore,
            survivalScore: syntheticRun.survivalScore,
            executionQualityScore: syntheticRun.executionQualityScore,
            disciplineScore: syntheticRun.disciplineScore,
            totalScore: syntheticRun.totalScore,
          }
        : {};
  const rationaleSummary =
    builtinResult?.rationaleSummary ??
    (runStatus === "queued"
      ? {
          en: "Run request persisted and awaiting a real arena executor.",
          "zh-CN": "运行请求已持久化，等待真实竞技场执行器处理。",
        }
      : {
          en: "Synthetic test execution completed.",
          "zh-CN": "测试环境合成执行已完成。",
        });
  const actionSummary = builtinResult?.actionSummary ?? [];

  const runId = randomUUID();
  await db.insert(arenaRunsTable).values({
    id: runId,
    competitionId: parsed.competitionId,
    entryId: parsed.entryId,
    agentVersionId: parsed.agentVersionId,
    ownerUserId: entry.ownerUserId ?? undefined,
    ownerOrganizationId: entry.ownerOrganizationId ?? undefined,
    providerKind: parsed.providerKind,
    proofMode: parsed.proofMode,
    verificationLevel: parsed.proofMode === "verified_live" ? "review" : "review",
    liveStatus: parsed.liveStatus,
    rankingScope: parsed.rankingScope,
    runStatus,
    instrument: parsed.instrument,
    rationaleSummary,
    actionSummary,
    metrics,
    completedAt: runStatus === "completed" ? new Date() : undefined,
  });

  if (runStatus === "completed") {
    await db.insert(arenaLeaderboardRowsTable).values({
      competitionId: parsed.competitionId,
      entryId: parsed.entryId,
      runId,
      proofMode: parsed.proofMode,
      verificationLevel: "review",
      liveStatus: parsed.liveStatus,
      promptMode: entry.promptMode,
      rankingScope: parsed.rankingScope,
      rank: 1,
      totalScore: String((metrics as Record<string, unknown>).totalScore ?? 0),
      metrics,
      asOf: new Date(),
    });
    const entryState = (await listArenaEntriesForActor({ ...actor, role: "admin" })).find((item) => item.id === parsed.entryId);
    if (entryState) {
      const replay = createArenaReplayArtifact(entryState, parsed, runId);
      const report = createArenaReportArtifact(entryState, parsed);
      await db.insert(arenaReplayBundlesTable).values({
        runId,
        title: replay.title,
        summary: replay.summary,
        artifactUrl: replay.artifactUrl,
        chartUrl: replay.chartUrl,
        keyMoments: replay.keyMoments,
      });
      await db.insert(arenaReportArtifactsTable).values({
        subjectType: report.subjectType,
        subjectId: report.subjectId,
        kind: report.kind,
        title: report.title,
        summary: report.summary,
        highlights: report.highlights,
        windowLabel: report.windowLabel,
        scoreVersion: report.scoreVersion,
        proofModes: report.proofModes,
        artifactUrl: report.artifactUrl,
      });
    }
  }

  return { run: (await listArenaRunsForActor({ ...actor, role: "admin" })).find((run) => run.id === runId)! };
}

export async function createArenaLiveCredential(actor: SessionActor, input: unknown) {
  requireArenaWritesEnabled();
  const parsed = arenaLiveCredentialInputSchema.parse(input);

  if (getStorageMode() === "memory") {
    const state = getMemoryState();
    const agent = state.agents.find((item) => item.slug === parsed.agentSlug);
    if (!agent) {
      throw new NotFoundError("Agent not found.");
    }
    const credential: ArenaLiveCredential = {
      id: randomUUID(),
      agentSlug: parsed.agentSlug,
      agentVersionId: parsed.agentVersionId,
      accountLabel: parsed.accountLabel,
      exchange: parsed.exchange,
      credentialMode: parsed.credentialMode,
      providerKind: parsed.providerKind,
      status: isSyntheticExecutionAllowed() ? "verified" : "pending",
      verificationLevel: isSyntheticExecutionAllowed() ? "verified" : "review",
      lastSyncedAt: isSyntheticExecutionAllowed() ? new Date().toISOString() : undefined,
      ownerUserId: actor.userId,
      ownerOrganizationId: actor.activeOrganizationId,
      createdByUserId: actor.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.arenaLiveCredentials.push(credential);
    return credential;
  }

  const db = getDb();
  const [agent] = await db.select({ id: agentRecords.id }).from(agentRecords).where(eq(agentRecords.slug, parsed.agentSlug)).limit(1);
  if (!agent) {
    throw new NotFoundError("Agent not found.");
  }
  const credentialId = randomUUID();
  await db.insert(arenaLiveCredentialsTable).values({
    id: credentialId,
    agentId: agent.id,
    agentVersionId: parsed.agentVersionId,
    ownerUserId: actor.userId,
    ownerOrganizationId: actor.activeOrganizationId,
    createdByUserId: actor.userId,
    accountLabel: parsed.accountLabel,
    exchange: parsed.exchange,
    credentialMode: parsed.credentialMode,
    providerKind: parsed.providerKind,
    status: "pending",
    verificationLevel: "review",
  });
  return (await listArenaLiveCredentialsForActor({ ...actor, role: "admin" })).find((credential) => credential.id === credentialId)!;
}

export async function createArenaWatchlistEntry(actor: SessionActor, input: unknown) {
  requireArenaWritesEnabled();
  const parsed = arenaWatchlistInputSchema.parse(input);

  if (getStorageMode() === "memory") {
    const state = getMemoryState();
    const existing = state.arenaWatchlist.find(
      (entry) =>
        entry.targetType === parsed.targetType &&
        entry.targetId === parsed.targetId &&
        ownableMatch(actor, entry.ownerUserId, entry.ownerOrganizationId),
    );
    if (existing) {
      return existing;
    }
    const watchlistEntry: ArenaWatchlistEntry = {
      id: randomUUID(),
      targetType: parsed.targetType,
      targetId: parsed.targetId,
      label: parsed.label,
      ownerUserId: actor.userId,
      ownerOrganizationId: actor.activeOrganizationId,
      createdByUserId: actor.userId,
      createdAt: new Date().toISOString(),
    };
    state.arenaWatchlist.push(watchlistEntry);
    return watchlistEntry;
  }

  const db = getDb();
  const [existing] = await db
    .select()
    .from(arenaWatchlistEntriesTable)
    .where(
      and(
        eq(arenaWatchlistEntriesTable.targetType, parsed.targetType),
        eq(arenaWatchlistEntriesTable.targetId, parsed.targetId),
        eq(arenaWatchlistEntriesTable.createdByUserId, actor.userId),
      ),
    )
    .limit(1);
  if (existing) {
    return (await listArenaWatchlistForActor(actor)).find((entry) => entry.id === existing.id)!;
  }

  const watchlistId = randomUUID();
  await db.insert(arenaWatchlistEntriesTable).values({
    id: watchlistId,
    ownerUserId: actor.userId,
    ownerOrganizationId: actor.activeOrganizationId,
    createdByUserId: actor.userId,
    targetType: parsed.targetType,
    targetId: parsed.targetId,
    label: parsed.label,
  });
  return (await listArenaWatchlistForActor(actor)).find((entry) => entry.id === watchlistId)!;
}
