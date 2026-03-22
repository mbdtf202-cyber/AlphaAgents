import { randomUUID } from "node:crypto";

import type {
  ArenaCompetition,
  ArenaCompetitionEntry,
  ArenaFeedItem,
  ArenaLeague,
  ArenaLeaderboardEntry,
  ArenaLiveCredential,
  ArenaReportArtifact,
  ArenaReplayArtifact,
  ArenaRun,
  ArenaWatchlistEntry,
  TradingVersionConfig,
} from "@openclaw/alpha-agents-arena-core";
import {
  arenaCompetitions,
  arenaLeagues,
} from "@openclaw/alpha-agents-arena-core";
import type {
  ActorRole,
  AgentRecord,
  AgentSubmissionRecord,
  AuditLogRecord,
  BenchmarkRequestRecord,
  BuilderProfile,
  ClaimVerification,
  DecisionMemo,
  Endorsement,
  FeatureSlot,
  FeaturedWork,
  ModerationCase,
  OrganizationProfile,
  OrganizationMembership,
  RelationshipEdge,
  SessionActor,
  ShortlistRecord,
  VerifiedInstall,
  VerifiedReview,
} from "@openclaw/alpha-agents-core";
import {
  agents,
  benchmarkSuites,
  builders,
  claimVerifications,
  decisionMemos,
  endorsements,
  featuredWorks,
  featureSlots,
  moderationCases,
  organizations,
  relationshipEdges,
  shortlists,
  verifiedInstalls,
  verifiedReviews,
} from "@openclaw/alpha-agents-core";

import { sampleProvenance } from "./provenance";

export interface MemoryUser {
  id: string;
  email: string;
  role: ActorRole;
  githubHandle?: string;
}

export interface MemorySessionRecord {
  id: string;
  tokenHash: string;
  userId: string;
  role: ActorRole;
  activeOrganizationId?: string;
  expiresAt: string;
}

export interface MemoryMagicLink {
  id: string;
  email: string;
  role: ActorRole;
  tokenHash: string;
  redirectTo: string;
  expiresAt: string;
  consumedAt?: string;
}

export interface MemoryState {
  users: MemoryUser[];
  memberships: OrganizationMembership[];
  sessions: MemorySessionRecord[];
  magicLinks: MemoryMagicLink[];
  agents: AgentRecord[];
  builders: BuilderProfile[];
  organizations: OrganizationProfile[];
  relationships: RelationshipEdge[];
  claimVerifications: ClaimVerification[];
  endorsements: Endorsement[];
  featuredWork: FeaturedWork[];
  featureSlots: FeatureSlot[];
  installs: VerifiedInstall[];
  reviews: VerifiedReview[];
  shortlists: ShortlistRecord[];
  decisionMemos: DecisionMemo[];
  moderationCases: ModerationCase[];
  submissions: AgentSubmissionRecord[];
  benchmarkRequests: BenchmarkRequestRecord[];
  arenaLeagues: ArenaLeague[];
  arenaCompetitions: ArenaCompetition[];
  arenaTradingVersionConfigs: TradingVersionConfig[];
  arenaEntries: ArenaCompetitionEntry[];
  arenaRuns: ArenaRun[];
  arenaLeaderboards: ArenaLeaderboardEntry[];
  arenaReplays: ArenaReplayArtifact[];
  arenaReports: ArenaReportArtifact[];
  arenaFeed: ArenaFeedItem[];
  arenaLiveCredentials: ArenaLiveCredential[];
  arenaWatchlist: ArenaWatchlistEntry[];
  auditLogs: AuditLogRecord[];
}

function sampleUser(id: string, email: string, role: ActorRole, githubHandle?: string): MemoryUser {
  return { id, email, role, githubHandle };
}

function sampleMembership(id: string, userId: string, organizationId: string, role: OrganizationMembership["role"], organizationName: string, organizationSlug: string): OrganizationMembership {
  return { id, userId, organizationId, role, organizationName, organizationSlug };
}

function withSampleAgent(agent: AgentRecord): AgentRecord {
  return {
    ...agent,
    provenance: sampleProvenance,
    versions: agent.versions.map((version) => ({
      ...version,
      provenance: sampleProvenance,
      benchmarkRuns: version.benchmarkRuns.map((run) => ({
        ...run,
        provenance: sampleProvenance,
      })),
    })),
  };
}

function withSampleBuilder(builder: BuilderProfile): BuilderProfile {
  return {
    ...builder,
    provenance: sampleProvenance,
  };
}

declare global {
  var __agentLedgerMemoryState: MemoryState | undefined;
}

function createInitialState(): MemoryState {
  return {
    users: [
      sampleUser("user-sample-buyer", "buyer@example.com", "buyer"),
      sampleUser("user-sample-builder", "builder@example.com", "builder", "northframe"),
      sampleUser("user-sample-admin", "admin@example.com", "admin"),
    ],
    memberships: [
      sampleMembership("membership-1", "user-sample-builder", "org-sample-studio", "owner", "Northframe Studio", "northframe-studio"),
      sampleMembership("membership-2", "user-sample-buyer", "org-sample-buyers", "member", "Sample Buyers", "sample-buyers"),
      sampleMembership("membership-3", "user-sample-admin", "org-sample-ops", "owner", "AlphaAgents Ops", "alpha-agents-ops"),
    ],
    sessions: [],
    magicLinks: [],
    agents: agents.map(withSampleAgent),
    builders: builders.map(withSampleBuilder),
    organizations: organizations.map((organization) => ({ ...organization })),
    relationships: relationshipEdges.map((edge) => ({ ...edge })),
    claimVerifications: claimVerifications.map((claim) => ({ ...claim })),
    endorsements: endorsements.map((endorsement) => ({ ...endorsement })),
    featuredWork: featuredWorks.map((work) => ({ ...work })),
    featureSlots: featureSlots.map((slot) => ({ ...slot, provenance: sampleProvenance })),
    installs: verifiedInstalls.map((install) => ({ ...install, provenance: sampleProvenance })),
    reviews: verifiedReviews.map((review) => ({ ...review, provenance: sampleProvenance })),
    shortlists: shortlists.map((shortlist) => ({ ...shortlist })),
    decisionMemos: decisionMemos.map((memo) => ({ ...memo })),
    moderationCases: moderationCases.map((item) => ({ ...item })),
    submissions: [],
    benchmarkRequests: [],
    arenaLeagues: arenaLeagues.map((item) => ({ ...item })),
    arenaCompetitions: arenaCompetitions.map((item) => ({ ...item })),
    arenaTradingVersionConfigs: [],
    arenaEntries: [],
    arenaRuns: [],
    arenaLeaderboards: [],
    arenaReplays: [],
    arenaReports: [],
    arenaFeed: [],
    arenaLiveCredentials: [],
    arenaWatchlist: [],
    auditLogs: [],
  };
}

export function getMemoryState(): MemoryState {
  if (!globalThis.__agentLedgerMemoryState) {
    globalThis.__agentLedgerMemoryState = createInitialState();
  }
  return globalThis.__agentLedgerMemoryState;
}

export function resetMemoryState() {
  globalThis.__agentLedgerMemoryState = createInitialState();
}

export function getActorFromMemorySession(tokenHash: string): SessionActor | undefined {
  const state = getMemoryState();
  const session = state.sessions.find((entry) => entry.tokenHash === tokenHash);
  if (!session) {
    return undefined;
  }
  const user = state.users.find((entry) => entry.id === session.userId);
  if (!user) {
    return undefined;
  }
  return {
    sessionId: session.id,
    userId: user.id,
    email: user.email,
    role: session.role,
    githubHandle: user.githubHandle,
    activeOrganizationId: session.activeOrganizationId,
    memberships: state.memberships.filter((entry) => entry.userId === user.id),
  };
}

export function createMemorySession(userId: string, role: ActorRole, tokenHash: string, activeOrganizationId?: string) {
  const state = getMemoryState();
  const session: MemorySessionRecord = {
    id: randomUUID(),
    tokenHash,
    userId,
    role,
    activeOrganizationId,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString(),
  };
  state.sessions.push(session);
  return session;
}
