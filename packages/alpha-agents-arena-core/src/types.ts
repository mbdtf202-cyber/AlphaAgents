import type { LocalizedText, SourceKind } from "@openclaw/alpha-agents-core";

export type ArenaProofMode = "paper" | "verified_live" | "unverified_self_report";
export type ArenaPromptMode = "open" | "abstracted" | "private";
export type ArenaVerificationLevel = "verified" | "review" | "reported";
export type ArenaLiveStatus = "not_enabled" | "paper_only" | "managed_live" | "user_agent_live";
export type ArenaRankingScope = "overall" | "return" | "risk" | "consistency" | "rookie" | "open_prompt";
export type ArenaCompetitionStatus = "draft" | "open_for_entry" | "running" | "paused" | "settling" | "closed";
export type ArenaEntryStatus = "pending" | "active" | "paused" | "disqualified" | "completed";
export type ArenaRunStatus = "queued" | "starting" | "running" | "risk_blocked" | "completed" | "failed" | "timed_out";
export type ArenaProviderKind = "paper_matching_engine" | "managed_secret_broker" | "user_execution_agent";
export type ArenaReportKind = "daily" | "weekly" | "monthly" | "season" | "agent_card" | "duel";
export type ArenaFeedKind = "highlight" | "report" | "replay" | "storyline" | "rivalry";
export type ArenaWatchTargetType = "agent" | "organization" | "league";
export type ArenaValidationStatus = "pending" | "passed" | "failed";
export type ArenaBuildStatus = "pending" | "building" | "ready" | "failed";
export type ArenaCredentialMode = "managed_secret_broker" | "user_execution_agent";
export type ArenaCredentialStatus = "pending" | "verified" | "disabled";

export interface TradingManifest {
  executionMode: ArenaProofMode;
  marketScope: string[];
  supportedProviders: ArenaProviderKind[];
  promptMode: ArenaPromptMode;
  strategySummary: LocalizedText;
  modelMetadata: Record<string, string>;
  riskProfile: {
    maxLeverage: number;
    maxOrderNotionalUsd: number;
    maxDailyLossPct: number;
    maxDrawdownPct: number;
  };
}

export interface TradingVersionConfig {
  id: string;
  agentSlug: string;
  agentVersionId: string;
  sourceKind: SourceKind;
  runtimeImage: string;
  buildStatus: ArenaBuildStatus;
  validationStatus: ArenaValidationStatus;
  validationReport: LocalizedText;
  executionMode: ArenaProofMode;
  promptMode: ArenaPromptMode;
  strategySummary: LocalizedText;
  marketScope: string[];
  supportedProviders: ArenaProviderKind[];
  modelMetadata: Record<string, string>;
  riskProfile: TradingManifest["riskProfile"];
  publishedAt?: string;
  frozenAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArenaLeague {
  id: string;
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  heroNote: LocalizedText;
  seasonLabel: string;
  status: ArenaCompetitionStatus;
  proofModes: ArenaProofMode[];
  marketScope: string[];
  tags: string[];
}

export interface ArenaCompetition {
  id: string;
  leagueId: string;
  leagueSlug: string;
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  status: ArenaCompetitionStatus;
  proofMode: ArenaProofMode;
  rankingScope: ArenaRankingScope;
  startsAt: string;
  endsAt: string;
  initialCapitalUsd: number;
  marketScope: string[];
  rulesetName: string;
}

export interface ArenaCompetitionEntry {
  id: string;
  competitionId: string;
  competitionSlug: string;
  leagueSlug: string;
  agentSlug: string;
  agentName: string;
  builderHandle: string;
  organizationSlug?: string;
  organizationName?: string;
  agentVersionId: string;
  tradingVersionConfigId: string;
  entryStatus: ArenaEntryStatus;
  proofMode: ArenaProofMode;
  verificationLevel: ArenaVerificationLevel;
  liveStatus: ArenaLiveStatus;
  promptMode: ArenaPromptMode;
  rankingScope: ArenaRankingScope;
  ruleViolationCount: number;
  joinedAt: string;
}

export interface ArenaLeaderboardEntry {
  id: string;
  competitionId: string;
  competitionSlug: string;
  leagueSlug: string;
  entryId: string;
  agentSlug: string;
  agentName: string;
  builderHandle: string;
  organizationSlug?: string;
  proofMode: ArenaProofMode;
  verificationLevel: ArenaVerificationLevel;
  liveStatus: ArenaLiveStatus;
  promptMode: ArenaPromptMode;
  rankingScope: ArenaRankingScope;
  rank: number;
  totalScore: number;
  netReturnPct: number;
  maxDrawdownPct: number;
  sharpe: number;
  calmar: number;
  consistencyScore: number;
  survivalScore: number;
  executionQualityScore: number;
  disciplineScore: number;
  ruleViolationCount: number;
  asOf: string;
}

export interface ArenaReplayArtifact {
  id: string;
  runId: string;
  title: LocalizedText;
  summary: LocalizedText;
  artifactUrl: string;
  chartUrl?: string;
  keyMoments: LocalizedText[];
  createdAt: string;
}

export interface ArenaReportArtifact {
  id: string;
  subjectType: "agent" | "organization" | "league" | "competition";
  subjectId: string;
  kind: ArenaReportKind;
  title: LocalizedText;
  summary: LocalizedText;
  highlights: LocalizedText[];
  windowLabel: string;
  scoreVersion: string;
  proofModes: ArenaProofMode[];
  artifactUrl: string;
  publishedAt: string;
}

export interface ArenaRun {
  id: string;
  competitionId: string;
  competitionSlug: string;
  leagueSlug: string;
  entryId: string;
  agentSlug: string;
  agentVersionId: string;
  providerKind: ArenaProviderKind;
  proofMode: ArenaProofMode;
  verificationLevel: ArenaVerificationLevel;
  liveStatus: ArenaLiveStatus;
  rankingScope: ArenaRankingScope;
  status: ArenaRunStatus;
  rationaleSummary: LocalizedText;
  actionSummary: string[];
  instrument: string;
  netReturnPct: number;
  maxDrawdownPct: number;
  sharpe: number;
  calmar: number;
  consistencyScore: number;
  survivalScore: number;
  executionQualityScore: number;
  disciplineScore: number;
  totalScore: number;
  startedAt: string;
  completedAt?: string;
  replayId?: string;
  reportId?: string;
}

export interface ArenaFeedItem {
  id: string;
  kind: ArenaFeedKind;
  title: LocalizedText;
  summary: LocalizedText;
  href: string;
  subjectType: "agent" | "organization" | "league" | "competition" | "run";
  subjectId: string;
  proofModes: ArenaProofMode[];
  publishedAt: string;
}

export interface ArenaWatchlistEntry {
  id: string;
  targetType: ArenaWatchTargetType;
  targetId: string;
  label: LocalizedText;
  ownerUserId?: string;
  ownerOrganizationId?: string;
  createdByUserId: string;
  createdAt: string;
}

export interface ArenaLiveCredential {
  id: string;
  agentSlug: string;
  agentVersionId: string;
  accountLabel: string;
  exchange: string;
  credentialMode: ArenaCredentialMode;
  providerKind: ArenaProviderKind;
  status: ArenaCredentialStatus;
  verificationLevel: ArenaVerificationLevel;
  lastSyncedAt?: string;
  ownerUserId?: string;
  ownerOrganizationId?: string;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ArenaTeamSummary {
  organizationSlug: string;
  organizationName: string;
  headline: LocalizedText;
  summary: LocalizedText;
  managedAgentCount: number;
  activeEntryCount: number;
  liveCoverageCount: number;
  followers: number;
  bestLeagueSlug?: string;
  bestRank?: number;
}

export interface ArenaHomeView {
  leagues: ArenaLeague[];
  featuredCompetition?: ArenaCompetition;
  featuredLeaderboard: ArenaLeaderboardEntry[];
  reports: ArenaReportArtifact[];
  feed: ArenaFeedItem[];
  teams: ArenaTeamSummary[];
}
