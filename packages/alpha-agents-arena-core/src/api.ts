import { z } from "zod";

import { localizedTextSchema } from "@openclaw/alpha-agents-core";

export const tradingManifestSchema = z.object({
  executionMode: z.enum(["paper", "verified_live", "unverified_self_report"]),
  marketScope: z.array(z.string().min(1)).min(1),
  supportedProviders: z.array(z.enum(["paper_matching_engine", "managed_secret_broker", "user_execution_agent"])).min(1),
  promptMode: z.enum(["open", "abstracted", "private"]),
  strategySummary: localizedTextSchema,
  modelMetadata: z.record(z.string(), z.string()).default({}),
  riskProfile: z.object({
    maxLeverage: z.number().min(1).max(20),
    maxOrderNotionalUsd: z.number().min(100),
    maxDailyLossPct: z.number().min(1).max(100),
    maxDrawdownPct: z.number().min(1).max(100),
  }),
});

export const tradingVersionConfigInputSchema = z.object({
  agentSlug: z.string().min(1),
  agentVersionId: z.string().min(1),
  sourceKind: z.enum(["clawhub", "github", "agent-pack"]),
  runtimeImage: z.string().min(3),
  manifest: tradingManifestSchema,
});

export const arenaCompetitionEntryInputSchema = z.object({
  competitionId: z.string().min(1),
  competitionSlug: z.string().min(1),
  leagueSlug: z.string().min(1),
  agentSlug: z.string().min(1),
  agentName: z.string().min(1),
  builderHandle: z.string().min(1),
  organizationSlug: z.string().optional(),
  organizationName: z.string().optional(),
  agentVersionId: z.string().min(1),
  tradingVersionConfigId: z.string().min(1),
  proofMode: z.enum(["paper", "verified_live", "unverified_self_report"]),
  verificationLevel: z.enum(["verified", "review", "reported"]).default("review"),
  liveStatus: z.enum(["not_enabled", "paper_only", "managed_live", "user_agent_live"]).default("paper_only"),
  promptMode: z.enum(["open", "abstracted", "private"]),
  rankingScope: z.enum(["overall", "return", "risk", "consistency", "rookie", "open_prompt"]).default("overall"),
});

export const arenaRunRequestSchema = z.object({
  entryId: z.string().min(1),
  competitionId: z.string().min(1),
  competitionSlug: z.string().min(1),
  leagueSlug: z.string().min(1),
  agentSlug: z.string().min(1),
  agentVersionId: z.string().min(1),
  providerKind: z.enum(["paper_matching_engine", "managed_secret_broker", "user_execution_agent"]),
  proofMode: z.enum(["paper", "verified_live", "unverified_self_report"]),
  liveStatus: z.enum(["not_enabled", "paper_only", "managed_live", "user_agent_live"]),
  rankingScope: z.enum(["overall", "return", "risk", "consistency", "rookie", "open_prompt"]).default("overall"),
  instrument: z.string().min(1).default("BTCUSDT"),
});

export const arenaLiveCredentialInputSchema = z.object({
  agentSlug: z.string().min(1),
  agentVersionId: z.string().min(1),
  accountLabel: z.string().min(2).max(120),
  exchange: z.string().min(2).max(40),
  credentialMode: z.enum(["managed_secret_broker", "user_execution_agent"]),
  providerKind: z.enum(["managed_secret_broker", "user_execution_agent"]),
});

export const arenaWatchlistInputSchema = z.object({
  targetType: z.enum(["agent", "organization", "league"]),
  targetId: z.string().min(1),
  label: localizedTextSchema,
});
