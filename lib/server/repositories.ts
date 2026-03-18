import { randomUUID } from "node:crypto";

import {
  agents as sampleAgents,
  benchmarkSuites,
  claimVerifications as sampleClaimVerifications,
  type BenchmarkRun,
  builders as sampleBuilders,
  endorsements as sampleEndorsements,
  featuredWorks as sampleFeaturedWorks,
  hydratePublicCatalog,
  organizations as sampleOrganizations,
  type AgentRecord,
  type AgentRepository,
  type AgentSubmissionRecord,
  type AgentProfileView,
  type AgentVersionRecord,
  type AuditLogRecord,
  type AuditRepository,
  type BenchmarkRepository,
  type BenchmarkRequestRecord,
  type BuilderProfile,
  type BuilderProfileView,
  type CatalogRepository,
  type ClaimVerification,
  type DecisionMemo,
  type Endorsement,
  type FeaturedWork,
  type InstallRepository,
  type MembershipRole,
  type ModerationCase,
  type ModerationRepository,
  type PublicMetricsSummary,
  type RelationshipEdge,
  type RelationshipRepository,
  relationshipEdges as sampleRelationshipEdges,
  type ReviewRepository,
  type SessionActor,
  type ShortlistRecord,
  type ShortlistRepository,
  sortAgentProfiles,
  sortBuilderProfiles,
  verifiedInstalls as sampleVerifiedInstalls,
  verifiedReviews as sampleVerifiedReviews,
  type VerifiedInstall,
  type VerifiedReview,
  type VersionRepository,
} from "@openclaw/alpha-agents-core";
import {
  agentRecords,
  agentSources,
  agentVersions,
  auditLogsTable,
  authAccounts,
  authSessions,
  benchmarkArtifactsTable,
  benchmarkRequestsTable,
  benchmarkRunsTable,
  benchmarkScorecards,
  benchmarkSuitesTable,
  builderProfiles,
  claimVerificationsTable,
  decisionMemosTable,
  endorsementsTable,
  featuredWorkTable,
  magicLinkChallenges,
  moderationCasesTable,
  organizationMemberships,
  organizations,
  permissionManifests,
  relationshipEdgesTable,
  shortlistsTable,
  submissionsTable,
  users,
  verifiedInstallsTable,
  verifiedReviewsTable,
} from "@openclaw/alpha-agents-core/db/schema";
import { and, desc, eq, isNull, or, sql } from "drizzle-orm";

import { hashToken } from "./auth";
import {
  booleanFromStorage,
  filterAgents,
  localizedTextArrayFromUnknown,
  localizedTextFromUnknown,
  mergeAgentsBySlug,
  mergeBuildersByHandle,
  stringArrayFromUnknown,
  withRegressionSummaries,
} from "./catalog";
import { getDb } from "./db";
import { getStorageMode } from "./env";
import { ConfigurationError, ForbiddenError, NotFoundError } from "./errors";
import { createMemorySession, getMemoryState } from "./memory-store";
import { liveProvenance, sampleProvenance } from "./provenance";

export interface MagicLinkRecord {
  token: string;
  redirectTo: string;
  role: SessionActor["role"];
  email: string;
  expiresAt: string;
}

export interface AuthRepository {
  getSessionByTokenHash(tokenHash: string): Promise<SessionActor | null>;
  destroySessionByTokenHash(tokenHash: string): Promise<void>;
  createMagicLink(input: { email: string; role: SessionActor["role"]; redirectTo: string; tokenHash: string; rawToken: string }): Promise<MagicLinkRecord>;
  consumeMagicLink(tokenHash: string): Promise<{ actor: SessionActor; rawSessionToken: string; redirectTo: string }>;
  upsertGitHubAccount(input: {
    providerAccountId: string;
    email: string;
    githubHandle: string;
    profile?: Record<string, unknown>;
  }): Promise<{ actor: SessionActor; rawSessionToken: string }>;
}

export interface RepositoryBundle {
  authRepository: AuthRepository;
  agentRepository: AgentRepository;
  versionRepository: VersionRepository;
  installRepository: InstallRepository;
  reviewRepository: ReviewRepository;
  shortlistRepository: ShortlistRepository;
  moderationRepository: ModerationRepository;
  benchmarkRepository: BenchmarkRepository;
  catalogRepository: CatalogRepository;
  relationshipRepository: RelationshipRepository;
  auditRepository: AuditRepository;
}

interface PublicCatalog {
  agents: AgentProfileView[];
  builders: BuilderProfileView[];
  relationships: RelationshipEdge[];
  metrics: PublicMetricsSummary;
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

function sampleBuilderList(): BuilderProfile[] {
  return sampleBuilders.map((builder) => ({ ...builder, provenance: sampleProvenance }));
}

function sampleAgentList(): AgentRecord[] {
  return sampleAgents.map((agent) =>
    withRegressionSummaries({
      ...agent,
      provenance: sampleProvenance,
      versions: agent.versions.map((version) => ({
        ...version,
        provenance: sampleProvenance,
        benchmarkRuns: version.benchmarkRuns.map((run) => ({ ...run, provenance: sampleProvenance })),
      })),
    }),
  );
}

function buildSampleCatalog(): PublicCatalog {
  const hydrated = hydratePublicCatalog({
    agents: sampleAgentList(),
    builders: sampleBuilderList(),
    organizations: sampleOrganizations,
    relationshipEdges: sampleRelationshipEdges,
    claimVerifications: sampleClaimVerifications,
    endorsements: sampleEndorsements,
    featuredWork: sampleFeaturedWorks,
    verifiedInstalls: sampleVerifiedInstalls,
    verifiedReviews: sampleVerifiedReviews,
  });
  return {
    agents: sortAgentProfiles(hydrated.agents),
    builders: sortBuilderProfiles(hydrated.builders),
    relationships: sampleRelationshipEdges,
    metrics: {
      liveAgentCount: 0,
      liveInstallCount: 0,
      liveReviewCount: 0,
      liveBenchmarkRunCount: 0,
      sampleAgentCount: sampleAgents.length,
    },
  };
}

function buildMemoryPublicCatalog(state = getMemoryState()): PublicCatalog {
  const mergedAgents = state.agents.map((agent) =>
    withRegressionSummaries({
      ...agent,
      reviews: state.reviews.filter((review) => review.agentSlug === agent.slug),
      versions: agent.versions.map((version) => ({
        ...version,
        benchmarkRuns: version.benchmarkRuns.slice().sort((left, right) => left.publicRank - right.publicRank),
      })),
    }),
  );

  const mergedBuilders = state.builders.map((builder) => {
    const publishedAgentSlugs = mergedAgents
      .filter((agent) => agent.builderHandle === builder.handle)
      .map((agent) => agent.slug);
    const builderReviews = state.reviews.filter((review) => review.builderHandle === builder.handle);
    const shortlistCount = state.shortlists.filter((shortlist) =>
      shortlist.agentSlugs.some((slug) => publishedAgentSlugs.includes(slug)),
    ).length;
    const benchmarkWins = mergedAgents
      .filter((agent) => agent.builderHandle === builder.handle)
      .flatMap((agent) => agent.versions)
      .flatMap((version) => version.benchmarkRuns)
      .filter((run) => run.publicRank === 1).length;

    return {
      ...builder,
      publishedAgentSlugs,
      shortlistCount,
      benchmarkWins,
      verifiedReviewCount: builderReviews.length,
    };
  });

  const hydrated = hydratePublicCatalog({
    agents: mergedAgents,
    builders: mergedBuilders,
    organizations: state.organizations,
    relationshipEdges: state.relationships,
    claimVerifications: state.claimVerifications,
    endorsements: state.endorsements,
    featuredWork: state.featuredWork,
    verifiedInstalls: state.installs,
    verifiedReviews: state.reviews,
  });

  return {
    agents: sortAgentProfiles(hydrated.agents),
    builders: sortBuilderProfiles(hydrated.builders),
    relationships: state.relationships,
    metrics: {
      liveAgentCount: mergedAgents.filter((item) => item.provenance?.dataMode === "live").length,
      liveInstallCount: state.installs.filter((item) => item.provenance?.dataMode === "live").length,
      liveReviewCount: state.reviews.filter((item) => item.provenance?.dataMode === "live").length,
      liveBenchmarkRunCount: state.benchmarkRequests.filter((item) => item.status === "completed").length,
      sampleAgentCount: sampleAgents.length,
    },
  };
}

function createMemoryBundle(): RepositoryBundle {
  const state = getMemoryState();

  const auditRepository: AuditRepository = {
    async append(input) {
      const log: AuditLogRecord = {
        id: randomUUID(),
        actorUserId: input.actor.userId,
        actorOrganizationId: input.actor.activeOrganizationId,
        eventType: input.eventType,
        entityType: input.entityType,
        entityId: input.entityId,
        previousState: input.previousState,
        newState: input.newState,
        metadata: input.metadata,
        createdAt: new Date().toISOString(),
      };
      state.auditLogs.push(log);
    },
  };

  const authRepository: AuthRepository = {
    async getSessionByTokenHash(tokenHash) {
      const session = state.sessions.find((entry) => entry.tokenHash === tokenHash);
      if (!session || new Date(session.expiresAt).getTime() < Date.now()) {
        return null;
      }
      const user = state.users.find((entry) => entry.id === session.userId);
      if (!user) {
        return null;
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
    },
    async destroySessionByTokenHash(tokenHash) {
      const next = state.sessions.filter((entry) => entry.tokenHash !== tokenHash);
      state.sessions = next;
    },
    async createMagicLink(input) {
      const record = {
        id: randomUUID(),
        email: input.email,
        role: input.role,
        tokenHash: input.tokenHash,
        redirectTo: input.redirectTo,
        expiresAt: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      };
      state.magicLinks.push(record);
      return {
        token: input.rawToken,
        redirectTo: input.redirectTo,
        role: input.role,
        email: input.email,
        expiresAt: record.expiresAt,
      };
    },
    async consumeMagicLink(tokenHash) {
      const challenge = state.magicLinks.find((entry) => entry.tokenHash === tokenHash && !entry.consumedAt);
      if (!challenge || new Date(challenge.expiresAt).getTime() < Date.now()) {
        throw new NotFoundError("Magic link has expired or was already consumed.");
      }
      challenge.consumedAt = new Date().toISOString();
      let user = state.users.find((entry) => entry.email === challenge.email);
      if (!user) {
        user = {
          id: randomUUID(),
          email: challenge.email,
          role: challenge.role,
        };
        state.users.push(user);
      }
      const rawSessionToken = randomUUID();
      createMemorySession(user.id, challenge.role, hashToken(rawSessionToken), state.memberships.find((entry) => entry.userId === user.id)?.organizationId);
      const actor = await this.getSessionByTokenHash(hashToken(rawSessionToken));
      if (!actor) {
        throw new NotFoundError("Session could not be created.");
      }
      return { actor, rawSessionToken, redirectTo: challenge.redirectTo };
    },
    async upsertGitHubAccount(input) {
      let user = state.users.find((entry) => entry.githubHandle === input.githubHandle || entry.email === input.email);
      if (!user) {
        user = {
          id: randomUUID(),
          email: input.email,
          role: "builder",
          githubHandle: input.githubHandle,
        };
        state.users.push(user);
      } else {
        user.githubHandle = input.githubHandle;
      }
      const rawSessionToken = randomUUID();
      createMemorySession(user.id, user.role, hashToken(rawSessionToken), state.memberships.find((entry) => entry.userId === user.id)?.organizationId);
      const actor = await this.getSessionByTokenHash(hashToken(rawSessionToken));
      if (!actor) {
        throw new NotFoundError("Session could not be created.");
      }
      return { actor, rawSessionToken };
    },
  };

  const agentRepository: AgentRepository = {
    async listPublicAgents(filters) {
      return filterAgents(buildMemoryPublicCatalog(state).agents, filters);
    },
    async getPublicAgentBySlug(slug, versionId) {
      const agent = buildMemoryPublicCatalog(state).agents.find((entry) => entry.slug === slug);
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
    },
    async listBuilderAgents(actor) {
      return state.agents.filter((agent) => actor.role === "admin" || actor.githubHandle === agent.builderHandle);
    },
    async listSubmissionsForActor(actor) {
      return state.submissions.filter((entry) => ownableMatch(actor, entry.ownerUserId, entry.ownerOrganizationId));
    },
    async createSubmission(input) {
      state.submissions.push(input);
      return input;
    },
    async publishVersion(actor, agentSlug, versionId) {
      const agent = state.agents.find((entry) => entry.slug === agentSlug);
      if (!agent) {
        throw new NotFoundError("Agent not found.");
      }
      if (actor.role !== "admin" && actor.githubHandle !== agent.builderHandle) {
        throw new ForbiddenError();
      }
      const version = agent.versions.find((entry) => entry.id === versionId);
      if (!version) {
        throw new NotFoundError("Version not found.");
      }
      version.status = "review";
    },
  };

  const versionRepository: VersionRepository = {
    async assertBuilderOwnsVersion(actor, agentSlug, versionId) {
      const agent = state.agents.find((entry) => entry.slug === agentSlug);
      if (!agent) {
        throw new NotFoundError("Agent not found.");
      }
      if (actor.role !== "admin" && actor.githubHandle !== agent.builderHandle) {
        throw new ForbiddenError();
      }
      const version = agent.versions.find((entry) => entry.id === versionId);
      if (!version) {
        throw new NotFoundError("Version not found.");
      }
    },
    async getLatestPublicVersionId(agentSlug) {
      return state.agents.find((entry) => entry.slug === agentSlug)?.versions[0]?.id;
    },
  };

  const installRepository: InstallRepository = {
    async createVerifiedInstall(actor, input) {
      const install = { ...input, ownerUserId: actor.userId, ownerOrganizationId: actor.activeOrganizationId, provenance: liveProvenance };
      state.installs.push(install);
      return install;
    },
    async getOwnedInstall(actor, installId) {
      const install = state.installs.find((entry) => entry.id === installId);
      if (!install) {
        return undefined;
      }
      return ownableMatch(actor, install.ownerUserId, install.ownerOrganizationId) ? install : undefined;
    },
    async listInstallsForActor(actor) {
      return state.installs.filter((entry) => ownableMatch(actor, entry.ownerUserId, entry.ownerOrganizationId));
    },
  };

  const reviewRepository: ReviewRepository = {
    async createVerifiedReview(actor, input) {
      const install = state.installs.find((entry) => entry.id === input.installId);
      if (!install || !ownableMatch(actor, install.ownerUserId, install.ownerOrganizationId)) {
        throw new ForbiddenError("Verified review requires an install owned by the current actor.");
      }
      if (install.versionId !== input.versionId || install.agentSlug !== input.agentSlug) {
        throw new ForbiddenError("Review must match the owned install version and agent.");
      }
      const agent = state.agents.find((entry) => entry.slug === input.agentSlug);
      const review = {
        ...input,
        builderHandle: agent?.builderHandle ?? input.builderHandle,
        ownerUserId: actor.userId,
        ownerOrganizationId: actor.activeOrganizationId,
        provenance: liveProvenance,
      };
      state.reviews.push(review);
      if (agent) {
        agent.reviews = agent.reviews.filter((entry) => entry.versionId !== review.versionId).concat(review);
      }
      return review;
    },
    async listReviewsForActor(actor) {
      return state.reviews.filter((entry) => ownableMatch(actor, entry.ownerUserId, entry.ownerOrganizationId));
    },
  };

  const shortlistRepository: ShortlistRepository = {
    async createShortlist(actor, input) {
      const shortlist = { ...input, ownerUserId: actor.userId, ownerOrganizationId: actor.activeOrganizationId, provenance: liveProvenance };
      state.shortlists.push(shortlist);
      return shortlist;
    },
    async listShortlistsForActor(actor) {
      return state.shortlists.filter((entry) => ownableMatch(actor, entry.ownerUserId, entry.ownerOrganizationId));
    },
    async createDecisionMemo(actor, input) {
      const memo = { ...input, ownerUserId: actor.userId, ownerOrganizationId: actor.activeOrganizationId, provenance: liveProvenance };
      state.decisionMemos.push(memo);
      return memo;
    },
    async listDecisionMemosForActor(actor) {
      return state.decisionMemos.filter((entry) => ownableMatch(actor, entry.ownerUserId, entry.ownerOrganizationId));
    },
  };

  const moderationRepository: ModerationRepository = {
    async listModerationCases(actor) {
      if (actor.role === "admin") {
        return state.moderationCases;
      }
      return state.moderationCases.filter((entry) => ownableMatch(actor, entry.ownerUserId, entry.ownerOrganizationId));
    },
    async upsertCase(actor, input) {
      const existing = state.moderationCases.find(
        (entry) => entry.entityType === input.entityType && entry.entityId === input.entityId,
      );
      if (existing) {
        existing.title = input.title;
        existing.status = input.status;
        existing.reason = input.reason;
        existing.assignedTo = input.assignedTo;
        existing.ownerUserId = input.ownerUserId;
        existing.ownerOrganizationId = input.ownerOrganizationId;
        existing.updatedAt = new Date().toISOString();
        existing.provenance = liveProvenance;
        return existing;
      }

      const created: ModerationCase = {
        id: input.id ?? randomUUID(),
        entityType: input.entityType,
        entityId: input.entityId,
        title: input.title,
        status: input.status,
        reason: input.reason,
        assignedTo: input.assignedTo,
        updatedAt: input.updatedAt ?? new Date().toISOString(),
        ownerUserId: input.ownerUserId,
        ownerOrganizationId: input.ownerOrganizationId,
        provenance: liveProvenance,
      };
      state.moderationCases.push(created);
      return created;
    },
    async recordDecision(actor, caseId, nextStatus) {
      if (actor.role !== "admin") {
        throw new ForbiddenError();
      }
      const item = state.moderationCases.find((entry) => entry.id === caseId);
      if (!item) {
        throw new NotFoundError("Moderation case not found.");
      }
      item.status = nextStatus;
      item.updatedAt = new Date().toISOString();
      item.provenance = liveProvenance;
      return item;
    },
  };

  const benchmarkRepository: BenchmarkRepository = {
    async queueRequest(actor, input) {
      const request = { ...input, ownerUserId: actor.userId, ownerOrganizationId: actor.activeOrganizationId };
      state.benchmarkRequests.push(request);
      return request;
    },
    async listRequestsForActor(actor) {
      return state.benchmarkRequests.filter((entry) => ownableMatch(actor, entry.ownerUserId, entry.ownerOrganizationId));
    },
    async listQueuedRequests() {
      return state.benchmarkRequests.filter((entry) => entry.status === "queued");
    },
    async claimQueuedRequest(requestId) {
      const request = state.benchmarkRequests.find((entry) => entry.id === requestId && entry.status === "queued");
      if (!request) {
        return undefined;
      }
      request.status = "running";
      request.startedAt = new Date().toISOString();
      return request;
    },
    async completeRequest(requestId, artifactBundle) {
      const request = state.benchmarkRequests.find((entry) => entry.id === requestId);
      if (!request) {
        throw new NotFoundError("Benchmark request not found.");
      }
      request.status = "completed";
      request.completedAt = new Date().toISOString();
      request.artifactBundle = artifactBundle;
      return request;
    },
  };

  const relationshipRepository: RelationshipRepository = {
    async listRelationships() {
      return state.relationships;
    },
    async followProfile(actor, input) {
      const existing = state.relationships.find(
        (edge) => edge.type === "follows" && edge.fromType === "user" && edge.fromId === actor.userId && edge.toType === input.toType && edge.toId === input.toId,
      );
      if (existing) {
        return existing;
      }
      const next: RelationshipEdge = {
        id: randomUUID(),
        type: "follows",
        fromType: "user",
        fromId: actor.userId,
        toType: input.toType,
        toId: input.toId,
        verified: true,
        createdAt: new Date().toISOString(),
        provenance: liveProvenance,
      };
      state.relationships.push(next);
      return next;
    },
    async unfollowProfile(actor, input) {
      state.relationships = state.relationships.filter(
        (edge) => !(edge.type === "follows" && edge.fromType === "user" && edge.fromId === actor.userId && edge.toType === input.toType && edge.toId === input.toId),
      );
    },
  };

  const catalogRepository: CatalogRepository = {
    async listBuilders() {
      return buildMemoryPublicCatalog(state).builders;
    },
    async getBuilderByHandle(handle) {
      return buildMemoryPublicCatalog(state).builders.find((builder) => builder.handle === handle);
    },
    async getPublicMetricsSummary() {
      return buildMemoryPublicCatalog(state).metrics;
    },
  };

  return {
    authRepository,
    agentRepository,
    versionRepository,
    installRepository,
    reviewRepository,
    shortlistRepository,
    moderationRepository,
    benchmarkRepository,
    catalogRepository,
    relationshipRepository,
    auditRepository,
  };
}

async function buildActorFromDb(
  sessionRow: typeof authSessions.$inferSelect,
): Promise<SessionActor | null> {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, sessionRow.userId)).limit(1);
  if (!user) {
    return null;
  }
  const membershipRows = await db
    .select({
      id: organizationMemberships.id,
      userId: organizationMemberships.userId,
      organizationId: organizationMemberships.organizationId,
      role: organizationMemberships.role,
      organizationName: organizations.name,
      organizationSlug: organizations.slug,
    })
    .from(organizationMemberships)
    .innerJoin(organizations, eq(organizationMemberships.organizationId, organizations.id))
    .where(eq(organizationMemberships.userId, user.id));

  return {
    sessionId: sessionRow.id,
    userId: user.id,
    email: user.email,
    role: sessionRow.role as SessionActor["role"],
    githubHandle: user.githubHandle ?? undefined,
    activeOrganizationId: sessionRow.activeOrganizationId ?? undefined,
    memberships: membershipRows.map((membership) => ({
      ...membership,
      role: membership.role as MembershipRole,
    })),
  };
}

async function buildPostgresPublicCatalog(): Promise<PublicCatalog> {
  const db = getDb();
  const sampleCatalog = buildSampleCatalog();
  const sampleAgentsBySlug = new Map(sampleCatalog.agents.map((agent) => [agent.slug, agent]));
  const sampleBuildersByHandle = new Map(sampleCatalog.builders.map((builder) => [builder.handle, builder]));

  const [
    agentRows,
    sourceRows,
    permissionRows,
    versionRows,
    runRows,
    installRows,
    reviewRows,
    builderRows,
    shortlistRows,
    relationshipRows,
    claimRows,
    endorsementRows,
    featuredWorkRows,
    metricsRows,
  ] = await Promise.all([
    db.select().from(agentRecords),
    db.select().from(agentSources),
    db.select().from(permissionManifests),
    db.select().from(agentVersions),
    db
      .select({
        id: benchmarkRunsTable.id,
        agentVersionId: benchmarkRunsTable.agentVersionId,
        suiteSlug: benchmarkSuitesTable.slug,
        createdAt: benchmarkRunsTable.createdAt,
        publicRank: benchmarkRunsTable.publicRank,
        peerGroupSize: benchmarkRunsTable.peerGroupSize,
        bundleHash: benchmarkRunsTable.bundleHash,
        costPerSuccessfulRun: benchmarkRunsTable.costPerSuccessfulRun,
        medianLatencySeconds: benchmarkRunsTable.medianLatencySeconds,
        stability: benchmarkRunsTable.stability,
        freshnessDays: benchmarkRunsTable.freshnessDays,
        transcriptUrl: benchmarkRunsTable.transcriptUrl,
        toolTraceUrl: benchmarkRunsTable.toolTraceUrl,
        notes: benchmarkRunsTable.notes,
        overall: benchmarkScorecards.overall,
        taskSuccess: benchmarkScorecards.taskSuccess,
        reliability: benchmarkScorecards.reliability,
        costEfficiency: benchmarkScorecards.costEfficiency,
        latency: benchmarkScorecards.latency,
        safetyFootprint: benchmarkScorecards.safetyFootprint,
        setupFriction: benchmarkScorecards.setupFriction,
        operatorBurden: benchmarkScorecards.operatorBurden,
        domainFit: benchmarkScorecards.domainFit,
      })
      .from(benchmarkRunsTable)
      .innerJoin(benchmarkSuitesTable, eq(benchmarkSuitesTable.id, benchmarkRunsTable.suiteId))
      .leftJoin(benchmarkScorecards, eq(benchmarkScorecards.benchmarkRunId, benchmarkRunsTable.id)),
    db
      .select({
        id: verifiedInstallsTable.id,
        agentSlug: agentRecords.slug,
        versionId: verifiedInstallsTable.agentVersionId,
        verificationToken: verifiedInstallsTable.verificationToken,
        packageHash: verifiedInstallsTable.packageHash,
        anonymousRuntimeFingerprint: verifiedInstallsTable.anonymousRuntimeFingerprint,
        verifiedAt: verifiedInstallsTable.verifiedAt,
        ownerUserId: verifiedInstallsTable.ownerUserId,
        ownerOrganizationId: verifiedInstallsTable.ownerOrganizationId,
      })
      .from(verifiedInstallsTable)
      .innerJoin(agentRecords, eq(agentRecords.id, verifiedInstallsTable.agentId)),
    db
      .select({
        id: verifiedReviewsTable.id,
        agentId: verifiedReviewsTable.agentId,
        agentSlug: agentRecords.slug,
        versionId: verifiedReviewsTable.agentVersionId,
        builderHandle: builderProfiles.handle,
        installId: verifiedReviewsTable.installId,
        company: verifiedReviewsTable.company,
        role: verifiedReviewsTable.role,
        headline: verifiedReviewsTable.headline,
        body: verifiedReviewsTable.body,
        rating: verifiedReviewsTable.rating,
        dimensions: verifiedReviewsTable.dimensions,
        context: verifiedReviewsTable.context,
        createdAt: verifiedReviewsTable.createdAt,
        ownerUserId: verifiedReviewsTable.ownerUserId,
        ownerOrganizationId: verifiedReviewsTable.ownerOrganizationId,
      })
      .from(verifiedReviewsTable)
      .innerJoin(agentRecords, eq(agentRecords.id, verifiedReviewsTable.agentId))
      .leftJoin(builderProfiles, eq(builderProfiles.id, agentRecords.builderProfileId)),
    db
      .select({
        id: builderProfiles.id,
        userId: builderProfiles.userId,
        organizationId: builderProfiles.organizationId,
        handle: builderProfiles.handle,
        name: builderProfiles.name,
        kind: builderProfiles.kind,
        headline: builderProfiles.headline,
        bio: builderProfiles.bio,
        specialties: builderProfiles.specialties,
        githubHandle: users.githubHandle,
      })
      .from(builderProfiles)
      .leftJoin(users, eq(users.id, builderProfiles.userId)),
    db.select().from(shortlistsTable),
    db.select().from(relationshipEdgesTable),
    db.select().from(claimVerificationsTable),
    db.select().from(endorsementsTable),
    db.select().from(featuredWorkTable),
    Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(agentRecords).where(eq(agentRecords.status, "verified")),
      db.select({ count: sql<number>`count(*)` }).from(verifiedInstallsTable),
      db.select({ count: sql<number>`count(*)` }).from(verifiedReviewsTable),
      db.select({ count: sql<number>`count(*)` }).from(benchmarkRunsTable),
    ]),
  ]);

  const sourceByAgentId = new Map(sourceRows.map((row) => [row.agentId, row]));
  const permissionByAgentId = new Map(permissionRows.map((row) => [row.agentId, row]));
  const versionsByAgentId = new Map<string, typeof versionRows>();
  const runsByVersionId = new Map<string, BenchmarkRun[]>();
  const reviewsByAgentId = new Map<string, AgentRecord["reviews"]>();

  for (const row of versionRows) {
    const next = versionsByAgentId.get(row.agentId) ?? [];
    next.push(row);
    versionsByAgentId.set(row.agentId, next);
  }

  for (const row of runRows) {
    const next = runsByVersionId.get(row.agentVersionId) ?? [];
    next.push({
      id: row.id,
      suiteSlug: row.suiteSlug,
      evaluatedAt: row.createdAt.toISOString(),
      publicRank: row.publicRank,
      peerGroupSize: row.peerGroupSize,
      bundleHash: row.bundleHash,
      costPerSuccessfulRun: Number(row.costPerSuccessfulRun ?? 0),
      medianLatencySeconds: row.medianLatencySeconds,
      stability: row.stability,
      freshnessDays: row.freshnessDays,
      transcriptUrl: row.transcriptUrl,
      toolTraceUrl: row.toolTraceUrl,
      scorecard: {
        overall: row.overall ?? 0,
        taskSuccess: row.taskSuccess ?? 0,
        reliability: row.reliability ?? 0,
        costEfficiency: row.costEfficiency ?? 0,
        latency: row.latency ?? 0,
        safetyFootprint: row.safetyFootprint ?? 0,
        setupFriction: row.setupFriction ?? 0,
        operatorBurden: row.operatorBurden ?? 0,
        domainFit: row.domainFit ?? 0,
      },
      notes: localizedTextFromUnknown(row.notes),
      provenance: liveProvenance,
    });
    runsByVersionId.set(row.agentVersionId, next);
  }

  for (const row of reviewRows) {
    const next = reviewsByAgentId.get(row.agentId) ?? [];
    next.push({
      id: row.id,
      agentSlug: row.agentSlug,
      versionId: row.versionId,
      builderHandle: row.builderHandle ?? sampleAgentsBySlug.get(row.agentSlug)?.builderHandle ?? "",
      installId: row.installId,
      company: row.company,
      role: row.role,
      headline: localizedTextFromUnknown(row.headline),
      body: localizedTextFromUnknown(row.body),
      rating: row.rating,
      dimensions: row.dimensions as AgentRecord["reviews"][number]["dimensions"],
      context: row.context as AgentRecord["reviews"][number]["context"],
      createdAt: row.createdAt.toISOString(),
      ownerUserId: row.ownerUserId ?? undefined,
      ownerOrganizationId: row.ownerOrganizationId ?? undefined,
      provenance: liveProvenance,
    });
    reviewsByAgentId.set(row.agentId, next);
  }

  const liveAgents = agentRows.map((row) => {
    const sampleAgent = sampleAgentsBySlug.get(row.slug);
    const source = sourceByAgentId.get(row.id);
    const permission = permissionByAgentId.get(row.id);
    const builder = builderRows.find((entry) => entry.id === row.builderProfileId);
    const versions = (versionsByAgentId.get(row.id) ?? [])
      .sort((left, right) => new Date(right.releasedAt).getTime() - new Date(left.releasedAt).getTime())
      .map((version) => {
        const sampleVersion =
          sampleAgent?.versions.find((entry) => entry.id === version.id || entry.version === version.version);
        return {
          id: version.id,
          version: version.version,
          releasedAt: version.releasedAt.toISOString(),
          status: version.status as AgentVersionRecord["status"],
          bundleHash: version.bundleHash,
          changelog: localizedTextArrayFromUnknown(version.changelog, sampleVersion?.changelog ?? []),
          benchmarkRuns: runsByVersionId.get(version.id) ?? sampleVersion?.benchmarkRuns ?? [],
          reviewAverage: Number(version.reviewAverage ?? 0),
          reviewCount: version.reviewCount,
          provenance: liveProvenance,
        };
      });

    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      builderHandle: builder?.handle ?? sampleAgent?.builderHandle ?? "builder",
      tagline: localizedTextFromUnknown(row.tagline, sampleAgent?.tagline),
      summary: localizedTextFromUnknown(row.summary, sampleAgent?.summary),
      useCases: sampleAgent?.useCases ?? [],
      notFor: sampleAgent?.notFor ?? [],
      categories: stringArrayFromUnknown(row.categories, sampleAgent?.categories ?? []),
      verificationStatus: row.status as AgentRecord["verificationStatus"],
      source: source
        ? {
            id: source.id,
            kind: source.kind as AgentRecord["source"]["kind"],
            label: source.label,
            url: source.url,
            installCommand: source.installCommand,
          }
        : sampleAgent?.source ?? {
            id: `source-${row.id}`,
            kind: "github",
            label: "Live source",
            url: "#",
            installCommand: "pending",
          },
      permissionManifest: permission
        ? {
            id: permission.id,
            summary: localizedTextFromUnknown(permission.summary, sampleAgent?.permissionManifest.summary),
            skills: stringArrayFromUnknown(permission.skills, sampleAgent?.permissionManifest.skills ?? []),
            secrets: stringArrayFromUnknown(permission.secrets, sampleAgent?.permissionManifest.secrets ?? []),
            networkAccess: stringArrayFromUnknown(permission.networkAccess, sampleAgent?.permissionManifest.networkAccess ?? []),
            fileAccess: stringArrayFromUnknown(permission.fileAccess, sampleAgent?.permissionManifest.fileAccess ?? []),
            shellAccess: booleanFromStorage(permission.shellAccess, sampleAgent?.permissionManifest.shellAccess ?? false),
            automationHooks: booleanFromStorage(
              permission.automationHooks,
              sampleAgent?.permissionManifest.automationHooks ?? false,
            ),
            riskLevel: permission.riskLevel as AgentRecord["permissionManifest"]["riskLevel"],
          }
        : sampleAgent?.permissionManifest ?? {
            id: `perm-${row.id}`,
            summary: localizedTextFromUnknown(undefined),
            skills: [],
            secrets: [],
            networkAccess: [],
            fileAccess: [],
            shellAccess: false,
            automationHooks: false,
            riskLevel: "low",
          },
      versions: versions.length > 0 ? versions : sampleAgent?.versions ?? [],
      overview: sampleAgent?.overview ?? [],
      capabilities: sampleAgent?.capabilities ?? [],
      dependencies: sampleAgent?.dependencies ?? [],
      demoRuns: sampleAgent?.demoRuns ?? [],
      reviews: reviewsByAgentId.get(row.id) ?? sampleAgent?.reviews ?? [],
      knownLimits: sampleAgent?.knownLimits ?? [],
      provenance: liveProvenance,
    } satisfies AgentRecord;
  });

  const mergedAgents = mergeAgentsBySlug(sampleCatalog.agents, liveAgents);
  const liveBuilders = builderRows.map((row) => {
    const sampleBuilder = sampleBuildersByHandle.get(row.handle);
    const publishedAgentSlugs = mergedAgents
      .filter((agent) => agent.builderHandle === row.handle)
      .map((agent) => agent.slug);
    const builderReviewCount = mergedAgents
      .filter((agent) => agent.builderHandle === row.handle)
      .flatMap((agent) => agent.reviews).length;
    const shortlistCount = shortlistRows.filter((shortlist) =>
      stringArrayFromUnknown(shortlist.agentSlugs).some((slug) => publishedAgentSlugs.includes(slug)),
    ).length;
    const benchmarkWins = mergedAgents
      .filter((agent) => agent.builderHandle === row.handle)
      .flatMap((agent) => agent.versions)
      .flatMap((version) => version.benchmarkRuns)
      .filter((run) => run.publicRank === 1).length;

    return {
      id: row.id,
      handle: row.handle,
      name: row.name,
      type: row.kind as BuilderProfile["type"],
      location: sampleBuilder?.location,
      headline: localizedTextFromUnknown(row.headline, sampleBuilder?.headline),
      bio: localizedTextFromUnknown(row.bio, sampleBuilder?.bio),
      specialties: stringArrayFromUnknown(row.specialties, sampleBuilder?.specialties ?? []),
      organizationsWorkedWith: sampleBuilder?.organizationsWorkedWith,
      publishedAgentSlugs,
      benchmarkWins,
      shortlistCount,
      verifiedReviewCount: builderReviewCount,
      githubUrl: row.githubHandle ? `https://github.com/${row.githubHandle}` : sampleBuilder?.githubUrl,
      provenance: liveProvenance,
    } satisfies BuilderProfile;
  });

  const mergedBuilders = mergeBuildersByHandle(sampleCatalog.builders, liveBuilders).sort(
    (left, right) => right.shortlistCount - left.shortlistCount,
  );

  const liveRelationships: RelationshipEdge[] = relationshipRows.map((row) => ({
    id: row.id,
    type: row.type as RelationshipEdge["type"],
    fromType: row.fromType as RelationshipEdge["fromType"],
    fromId: row.fromId,
    toType: row.toType as RelationshipEdge["toType"],
    toId: row.toId,
    verified: booleanFromStorage(row.verified, false),
    createdAt: row.createdAt.toISOString(),
    note: row.note ? localizedTextFromUnknown(row.note) : undefined,
    provenance: liveProvenance,
  }));

  const liveClaims = claimRows.map((row) => ({
    id: row.id,
    subjectType: row.subjectType as ClaimVerification["subjectType"],
    subjectId: row.subjectId,
    claimType: row.claimType as ClaimVerification["claimType"],
    label: localizedTextFromUnknown(row.label),
    summary: localizedTextFromUnknown(row.summary),
    status: row.status as ClaimVerification["status"],
    verifiedAt: row.verifiedAt?.toISOString(),
    evidenceUrl: row.evidenceUrl ?? undefined,
    relatedVersionId: row.relatedVersionId ?? undefined,
    provenance: liveProvenance,
  }));

  const liveEndorsements = endorsementRows.map((row) => ({
    id: row.id,
    subjectType: row.subjectType as Endorsement["subjectType"],
    subjectId: row.subjectId,
    authorType: row.authorType as Endorsement["authorType"],
    authorId: row.authorId,
    authorName: row.authorName,
    authorHeadline: localizedTextFromUnknown(row.authorHeadline),
    body: localizedTextFromUnknown(row.body),
    createdAt: row.createdAt.toISOString(),
    verified: booleanFromStorage(row.verified, false),
    provenance: liveProvenance,
  }));

  const liveFeaturedWork = featuredWorkRows.map((row) => ({
    id: row.id,
    subjectType: row.subjectType as FeaturedWork["subjectType"],
    subjectId: row.subjectId,
    title: localizedTextFromUnknown(row.title),
    summary: localizedTextFromUnknown(row.summary),
    artifactUrl: row.artifactUrl ?? undefined,
    publishedAt: row.publishedAt.toISOString(),
    verified: booleanFromStorage(row.verified, false),
    provenance: liveProvenance,
  }));

  const liveInstalls = installRows.map((row) => ({
    id: row.id,
    agentSlug: row.agentSlug,
    versionId: row.versionId,
    verificationToken: row.verificationToken,
    packageHash: row.packageHash,
    anonymousRuntimeFingerprint: row.anonymousRuntimeFingerprint,
    verifiedAt: row.verifiedAt.toISOString(),
    ownerUserId: row.ownerUserId ?? undefined,
    ownerOrganizationId: row.ownerOrganizationId ?? undefined,
    provenance: liveProvenance,
  }));

  const hydrated = hydratePublicCatalog({
    agents: mergedAgents,
    builders: mergedBuilders,
    organizations: sampleOrganizations,
    relationshipEdges: [...sampleRelationshipEdges, ...liveRelationships],
    claimVerifications: [...sampleClaimVerifications, ...liveClaims],
    endorsements: [...sampleEndorsements, ...liveEndorsements],
    featuredWork: [...sampleFeaturedWorks, ...liveFeaturedWork],
    verifiedInstalls: liveInstalls,
    verifiedReviews: reviewRows.map((row) => ({
      id: row.id,
      agentSlug: row.agentSlug,
      versionId: row.versionId,
      builderHandle: row.builderHandle ?? sampleAgentsBySlug.get(row.agentSlug)?.builderHandle ?? "",
      installId: row.installId,
      company: row.company,
      role: row.role,
      headline: localizedTextFromUnknown(row.headline),
      body: localizedTextFromUnknown(row.body),
      rating: row.rating,
      dimensions: row.dimensions as VerifiedReview["dimensions"],
      context: row.context as VerifiedReview["context"],
      createdAt: row.createdAt.toISOString(),
      ownerUserId: row.ownerUserId ?? undefined,
      ownerOrganizationId: row.ownerOrganizationId ?? undefined,
      provenance: liveProvenance,
    })),
  });

  return {
    agents: sortAgentProfiles(hydrated.agents),
    builders: sortBuilderProfiles(hydrated.builders),
    relationships: [...sampleRelationshipEdges, ...liveRelationships],
    metrics: {
      liveAgentCount: Number(metricsRows[0][0]?.count ?? 0),
      liveInstallCount: Number(metricsRows[1][0]?.count ?? 0),
      liveReviewCount: Number(metricsRows[2][0]?.count ?? 0),
      liveBenchmarkRunCount: Number(metricsRows[3][0]?.count ?? 0),
      sampleAgentCount: sampleAgents.length,
    },
  };
}

function createPostgresBundle(): RepositoryBundle {
  const db = getDb();

  const auditRepository: AuditRepository = {
    async append(input) {
      await db.insert(auditLogsTable).values({
        actorUserId: input.actor.userId,
        actorOrganizationId: input.actor.activeOrganizationId,
        eventType: input.eventType,
        entityType: input.entityType,
        entityId: input.entityId,
        previousState: input.previousState,
        newState: input.newState,
        metadata: input.metadata,
      });
    },
  };

  const authRepository: AuthRepository = {
    async getSessionByTokenHash(tokenHash) {
      const [session] = await db.select().from(authSessions).where(eq(authSessions.tokenHash, tokenHash)).limit(1);
      if (!session || new Date(session.expiresAt).getTime() < Date.now()) {
        return null;
      }
      return buildActorFromDb(session);
    },
    async destroySessionByTokenHash(tokenHash) {
      await db.delete(authSessions).where(eq(authSessions.tokenHash, tokenHash));
    },
    async createMagicLink(input) {
      await db.insert(magicLinkChallenges).values({
        email: input.email,
        role: input.role,
        redirectTo: input.redirectTo,
        tokenHash: input.tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 15),
      });
      return {
        token: input.rawToken,
        redirectTo: input.redirectTo,
        role: input.role,
        email: input.email,
        expiresAt: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
      };
    },
    async consumeMagicLink(tokenHash) {
      const [challenge] = await db
        .select()
        .from(magicLinkChallenges)
        .where(and(eq(magicLinkChallenges.tokenHash, tokenHash), isNull(magicLinkChallenges.consumedAt)))
        .limit(1);
      if (!challenge || new Date(challenge.expiresAt).getTime() < Date.now()) {
        throw new NotFoundError("Magic link has expired or was already consumed.");
      }
      let [user] = await db.select().from(users).where(eq(users.email, challenge.email)).limit(1);
      if (!user) {
        const inserted = await db
          .insert(users)
          .values({ email: challenge.email, role: challenge.role })
          .returning();
        user = inserted[0]!;
      }
      await db.update(magicLinkChallenges).set({ consumedAt: new Date() }).where(eq(magicLinkChallenges.id, challenge.id));
      const rawSessionToken = randomUUID();
      const sessionTokenHash = hashToken(rawSessionToken);
      const [session] = await db
        .insert(authSessions)
        .values({
          userId: user.id,
          tokenHash: sessionTokenHash,
          role: challenge.role,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        })
        .returning();
      const actor = await buildActorFromDb(session!);
      if (!actor) {
        throw new NotFoundError("Session could not be created.");
      }
      return { actor, rawSessionToken, redirectTo: challenge.redirectTo };
    },
    async upsertGitHubAccount(input) {
      let [account] = await db
        .select()
        .from(authAccounts)
        .where(and(eq(authAccounts.provider, "github"), eq(authAccounts.providerAccountId, input.providerAccountId)))
        .limit(1);
      let user;
      if (account) {
        [user] = await db.select().from(users).where(eq(users.id, account.userId)).limit(1);
      } else {
        [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (!user) {
          const insertedUser = await db
            .insert(users)
            .values({
              email: input.email,
              role: "builder",
              githubHandle: input.githubHandle,
            })
            .returning();
          user = insertedUser[0]!;
        }
        const insertedAccount = await db
          .insert(authAccounts)
          .values({
            userId: user.id,
            provider: "github",
            providerAccountId: input.providerAccountId,
            email: input.email,
            profile: input.profile ?? {},
          })
          .returning();
        account = insertedAccount[0]!;
      }
      const rawSessionToken = randomUUID();
      const tokenHash = hashToken(rawSessionToken);
      const [session] = await db
        .insert(authSessions)
        .values({
          userId: user.id,
          tokenHash,
          role: (user.role as SessionActor["role"]) ?? "builder",
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
        })
        .returning();
      const actor = await buildActorFromDb(session!);
      if (!actor) {
        throw new NotFoundError("Session could not be created.");
      }
      return { actor, rawSessionToken };
    },
  };

  const agentRepository: AgentRepository = {
    async listPublicAgents(filters) {
      return filterAgents((await buildPostgresPublicCatalog()).agents, filters);
    },
    async getPublicAgentBySlug(slug, versionId) {
      const agent = (await buildPostgresPublicCatalog()).agents.find((entry) => entry.slug === slug);
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
    },
    async listBuilderAgents(actor) {
      const rows = await db
        .select({ slug: agentRecords.slug })
        .from(agentRecords)
        .where(
          or(
            eq(agentRecords.ownerUserId, actor.userId),
            actor.activeOrganizationId ? eq(agentRecords.ownerOrganizationId, actor.activeOrganizationId) : sql`false`,
          ),
        );
      const catalog = await buildPostgresPublicCatalog();
      const ownedSlugs = new Set(rows.map((row) => row.slug));
      return catalog.agents.filter((agent) => ownedSlugs.has(agent.slug));
    },
    async listSubmissionsForActor(actor) {
      const rows = await db
        .select()
        .from(submissionsTable)
        .where(or(eq(submissionsTable.ownerUserId, actor.userId), actor.activeOrganizationId ? eq(submissionsTable.ownerOrganizationId, actor.activeOrganizationId) : sql`false`))
        .orderBy(desc(submissionsTable.createdAt));
      return rows.map((row) => ({
        id: row.id,
        ownerUserId: row.ownerUserId ?? undefined,
        ownerOrganizationId: row.ownerOrganizationId ?? undefined,
        createdByUserId: row.createdByUserId,
        agentName: row.agentName,
        agentSlug: row.agentSlug,
        builderHandle: row.builderHandle,
        sourceKind: row.sourceKind as AgentSubmissionRecord["sourceKind"],
        sourceUrl: row.sourceUrl,
        installCommand: row.installCommand,
        summary: row.summary as AgentSubmissionRecord["summary"],
        permissionManifest: row.permissionManifest as AgentSubmissionRecord["permissionManifest"],
        dependencies: row.dependencies as string[],
        knownLimits: row.knownLimits as AgentSubmissionRecord["knownLimits"],
        supportedEnvironments: row.supportedEnvironments as string[],
        status: row.status as AgentSubmissionRecord["status"],
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      }));
    },
    async createSubmission(input) {
      const [row] = await db.insert(submissionsTable).values({
        ownerUserId: input.ownerUserId,
        ownerOrganizationId: input.ownerOrganizationId,
        createdByUserId: input.createdByUserId,
        agentName: input.agentName,
        agentSlug: input.agentSlug,
        builderHandle: input.builderHandle,
        sourceKind: input.sourceKind,
        sourceUrl: input.sourceUrl,
        installCommand: input.installCommand,
        summary: input.summary,
        permissionManifest: input.permissionManifest,
        dependencies: input.dependencies,
        knownLimits: input.knownLimits,
        supportedEnvironments: input.supportedEnvironments,
        status: input.status,
      }).returning();
      return {
        ...input,
        id: row!.id,
        createdAt: row!.createdAt.toISOString(),
        updatedAt: row!.updatedAt.toISOString(),
      };
    },
    async publishVersion(actor, agentSlug, versionId) {
      const [version] = await db
        .select({
          id: agentVersions.id,
          agentId: agentVersions.agentId,
          ownerUserId: agentRecords.ownerUserId,
          ownerOrganizationId: agentRecords.ownerOrganizationId,
        })
        .from(agentVersions)
        .innerJoin(agentRecords, eq(agentRecords.id, agentVersions.agentId))
        .where(and(eq(agentVersions.id, versionId), eq(agentRecords.slug, agentSlug)))
        .limit(1);
      if (!version) {
        throw new NotFoundError("Version not found.");
      }
      if (!ownableMatch(actor, version.ownerUserId ?? undefined, version.ownerOrganizationId ?? undefined) && actor.role !== "admin") {
        throw new ForbiddenError();
      }
      await db.update(agentVersions).set({ status: "review" }).where(eq(agentVersions.id, versionId));
    },
  };

  const versionRepository: VersionRepository = {
    async assertBuilderOwnsVersion(actor, agentSlug, versionId) {
      const [version] = await db
        .select({
          id: agentVersions.id,
          ownerUserId: agentRecords.ownerUserId,
          ownerOrganizationId: agentRecords.ownerOrganizationId,
        })
        .from(agentVersions)
        .innerJoin(agentRecords, eq(agentRecords.id, agentVersions.agentId))
        .where(and(eq(agentVersions.id, versionId), eq(agentRecords.slug, agentSlug)))
        .limit(1);
      if (!version) {
        throw new NotFoundError("Version not found.");
      }
      if (!ownableMatch(actor, version.ownerUserId ?? undefined, version.ownerOrganizationId ?? undefined) && actor.role !== "admin") {
        throw new ForbiddenError();
      }
    },
    async getLatestPublicVersionId(agentSlug) {
      const [version] = await db
        .select({ id: agentVersions.id })
        .from(agentVersions)
        .innerJoin(agentRecords, eq(agentRecords.id, agentVersions.agentId))
        .where(eq(agentRecords.slug, agentSlug))
        .orderBy(desc(agentVersions.releasedAt))
        .limit(1);
      return version?.id;
    },
  };

  const installRepository: InstallRepository = {
    async createVerifiedInstall(actor, input) {
      const [agent] = await db.select({ id: agentRecords.id }).from(agentRecords).where(eq(agentRecords.slug, input.agentSlug)).limit(1);
      if (!agent) {
        throw new NotFoundError("Agent not found.");
      }
      const [row] = await db.insert(verifiedInstallsTable).values({
        ownerUserId: actor.userId,
        ownerOrganizationId: actor.activeOrganizationId,
        agentId: agent.id,
        agentVersionId: input.versionId,
        verificationToken: input.verificationToken,
        packageHash: input.packageHash,
        anonymousRuntimeFingerprint: input.anonymousRuntimeFingerprint,
        verifiedAt: new Date(input.verifiedAt),
      }).returning();
      return {
        ...input,
        id: row!.id,
        ownerUserId: actor.userId,
        ownerOrganizationId: actor.activeOrganizationId,
        provenance: liveProvenance,
      };
    },
    async getOwnedInstall(actor, installId) {
      const [row] = await db
        .select({
          install: verifiedInstallsTable,
          agentSlug: agentRecords.slug,
        })
        .from(verifiedInstallsTable)
        .innerJoin(agentRecords, eq(agentRecords.id, verifiedInstallsTable.agentId))
        .where(eq(verifiedInstallsTable.id, installId))
        .limit(1);
      if (!row) {
        return undefined;
      }
      if (!ownableMatch(actor, row.install.ownerUserId ?? undefined, row.install.ownerOrganizationId ?? undefined)) {
        return undefined;
      }
      return {
        id: row.install.id,
        agentSlug: row.agentSlug,
        versionId: row.install.agentVersionId,
        verificationToken: row.install.verificationToken,
        packageHash: row.install.packageHash,
        anonymousRuntimeFingerprint: row.install.anonymousRuntimeFingerprint,
        verifiedAt: row.install.verifiedAt.toISOString(),
        ownerUserId: row.install.ownerUserId ?? undefined,
        ownerOrganizationId: row.install.ownerOrganizationId ?? undefined,
        provenance: liveProvenance,
      };
    },
    async listInstallsForActor(actor) {
      const rows = await db
        .select({
          install: verifiedInstallsTable,
          agentSlug: agentRecords.slug,
        })
        .from(verifiedInstallsTable)
        .innerJoin(agentRecords, eq(agentRecords.id, verifiedInstallsTable.agentId))
        .where(
          or(
            eq(verifiedInstallsTable.ownerUserId, actor.userId),
            actor.activeOrganizationId ? eq(verifiedInstallsTable.ownerOrganizationId, actor.activeOrganizationId) : sql`false`,
          ),
        );
      return rows.map((row) => ({
        id: row.install.id,
        agentSlug: row.agentSlug,
        versionId: row.install.agentVersionId,
        verificationToken: row.install.verificationToken,
        packageHash: row.install.packageHash,
        anonymousRuntimeFingerprint: row.install.anonymousRuntimeFingerprint,
        verifiedAt: row.install.verifiedAt.toISOString(),
        ownerUserId: row.install.ownerUserId ?? undefined,
        ownerOrganizationId: row.install.ownerOrganizationId ?? undefined,
        provenance: liveProvenance,
      }));
    },
  };

  const reviewRepository: ReviewRepository = {
    async createVerifiedReview(actor, input) {
      const [install] = await db.select().from(verifiedInstallsTable).where(eq(verifiedInstallsTable.id, input.installId)).limit(1);
      if (!install || !ownableMatch(actor, install.ownerUserId ?? undefined, install.ownerOrganizationId ?? undefined)) {
        throw new ForbiddenError("Verified review requires an owned install.");
      }
      if (install.agentVersionId !== input.versionId) {
        throw new ForbiddenError("Review must target the verified install version.");
      }
      const [agent] = await db
        .select({ id: agentRecords.id, builderHandle: builderProfiles.handle })
        .from(agentRecords)
        .leftJoin(builderProfiles, eq(builderProfiles.id, agentRecords.builderProfileId))
        .where(eq(agentRecords.slug, input.agentSlug))
        .limit(1);
      if (!agent || install.agentId !== agent.id) {
        throw new ForbiddenError("Review must match the verified install agent.");
      }
      const [row] = await db.insert(verifiedReviewsTable).values({
        ownerUserId: actor.userId,
        ownerOrganizationId: actor.activeOrganizationId,
        agentId: agent.id,
        agentVersionId: input.versionId,
        installId: input.installId,
        company: input.company,
        role: input.role,
        headline: input.headline,
        body: input.body,
        rating: input.rating,
        dimensions: input.dimensions,
        context: input.context ?? {},
      }).returning();
      return {
        ...input,
        id: row!.id,
        builderHandle: agent.builderHandle ?? input.builderHandle,
        ownerUserId: actor.userId,
        ownerOrganizationId: actor.activeOrganizationId,
        createdAt: row!.createdAt.toISOString(),
        provenance: liveProvenance,
      };
    },
    async listReviewsForActor(actor) {
      const joinedRows = await db
        .select({
          review: verifiedReviewsTable,
          agentSlug: agentRecords.slug,
          builderHandle: builderProfiles.handle,
        })
        .from(verifiedReviewsTable)
        .innerJoin(agentRecords, eq(agentRecords.id, verifiedReviewsTable.agentId))
        .leftJoin(builderProfiles, eq(builderProfiles.id, agentRecords.builderProfileId))
        .where(
          or(
            eq(verifiedReviewsTable.ownerUserId, actor.userId),
            actor.activeOrganizationId ? eq(verifiedReviewsTable.ownerOrganizationId, actor.activeOrganizationId) : sql`false`,
          ),
        );
      return joinedRows.map(({ review, agentSlug, builderHandle }) => ({
        id: review.id,
        agentSlug,
        versionId: review.agentVersionId,
        builderHandle: builderHandle ?? sampleAgents.find((agent) => agent.slug === agentSlug)?.builderHandle ?? "",
        installId: review.installId,
        company: review.company,
        role: review.role,
        headline: review.headline as VerifiedReview["headline"],
        body: review.body as VerifiedReview["body"],
        rating: review.rating,
        dimensions: review.dimensions as VerifiedReview["dimensions"],
        context: review.context as VerifiedReview["context"],
        createdAt: review.createdAt.toISOString(),
        ownerUserId: review.ownerUserId ?? undefined,
        ownerOrganizationId: review.ownerOrganizationId ?? undefined,
        provenance: liveProvenance,
      }));
    },
  };

  const shortlistRepository: ShortlistRepository = {
    async createShortlist(actor, input) {
      const [row] = await db.insert(shortlistsTable).values({
        ownerUserId: actor.userId,
        ownerOrganizationId: actor.activeOrganizationId,
        createdByUserId: actor.userId,
        name: input.name,
        buyerType: input.buyerType,
        agentSlugs: input.agentSlugs,
        constraints: input.constraints ?? null,
        scoreWeights: input.scoreWeights ?? null,
        internalNotes: input.internalNotes ?? null,
      }).returning();
      return {
        ...input,
        id: row!.id,
        ownerUserId: actor.userId,
        ownerOrganizationId: actor.activeOrganizationId,
        createdByUserId: actor.userId,
        provenance: liveProvenance,
      };
    },
    async listShortlistsForActor(actor) {
      const rows = await db
        .select()
        .from(shortlistsTable)
        .where(or(eq(shortlistsTable.ownerUserId, actor.userId), actor.activeOrganizationId ? eq(shortlistsTable.ownerOrganizationId, actor.activeOrganizationId) : sql`false`));
      return rows.map((row) => ({
        id: row.id,
        name: row.name as ShortlistRecord["name"],
        ownerUserId: row.ownerUserId ?? undefined,
        ownerOrganizationId: row.ownerOrganizationId ?? undefined,
        createdByUserId: row.createdByUserId,
        agentSlugs: row.agentSlugs as string[],
        buyerType: row.buyerType as ShortlistRecord["buyerType"],
        constraints: row.constraints as ShortlistRecord["constraints"],
        scoreWeights: row.scoreWeights as ShortlistRecord["scoreWeights"],
        internalNotes: row.internalNotes ?? undefined,
        provenance: liveProvenance,
      }));
    },
    async createDecisionMemo(actor, input) {
      const [row] = await db.insert(decisionMemosTable).values({
        shortlistId: input.shortlistId,
        ownerUserId: actor.userId,
        ownerOrganizationId: actor.activeOrganizationId,
        createdByUserId: actor.userId,
        title: input.title,
        summary: input.summary,
        recommendationState: input.recommendationState,
        rolloutRecommendation: input.rolloutRecommendation,
        tradeoffs: input.tradeoffs,
        evidenceSummary: input.evidenceSummary ?? null,
        riskSummary: input.riskSummary ?? null,
        scoreWeights: input.scoreWeights ?? null,
      }).returning();
      return {
        ...input,
        id: row!.id,
        ownerUserId: actor.userId,
        ownerOrganizationId: actor.activeOrganizationId,
        createdByUserId: actor.userId,
        createdAt: row!.createdAt.toISOString(),
        updatedAt: row!.updatedAt.toISOString(),
        provenance: liveProvenance,
      };
    },
    async listDecisionMemosForActor(actor) {
      const rows = await db
        .select()
        .from(decisionMemosTable)
        .where(or(eq(decisionMemosTable.ownerUserId, actor.userId), actor.activeOrganizationId ? eq(decisionMemosTable.ownerOrganizationId, actor.activeOrganizationId) : sql`false`));
      return rows.map((row) => ({
        id: row.id,
        shortlistId: row.shortlistId,
        ownerUserId: row.ownerUserId ?? undefined,
        ownerOrganizationId: row.ownerOrganizationId ?? undefined,
        createdByUserId: row.createdByUserId,
        title: row.title as DecisionMemo["title"],
        summary: row.summary as DecisionMemo["summary"],
        recommendationState: row.recommendationState as DecisionMemo["recommendationState"],
        rolloutRecommendation: row.rolloutRecommendation as DecisionMemo["rolloutRecommendation"],
        tradeoffs: row.tradeoffs as DecisionMemo["tradeoffs"],
        evidenceSummary: row.evidenceSummary as DecisionMemo["evidenceSummary"],
        riskSummary: row.riskSummary as DecisionMemo["riskSummary"],
        scoreWeights: row.scoreWeights as DecisionMemo["scoreWeights"],
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        provenance: liveProvenance,
      }));
    },
  };

  const moderationRepository: ModerationRepository = {
    async listModerationCases(actor) {
      const rows = actor.role === "admin"
        ? await db.select().from(moderationCasesTable).orderBy(desc(moderationCasesTable.updatedAt))
        : await db
            .select()
            .from(moderationCasesTable)
            .where(or(eq(moderationCasesTable.ownerUserId, actor.userId), actor.activeOrganizationId ? eq(moderationCasesTable.ownerOrganizationId, actor.activeOrganizationId) : sql`false`))
            .orderBy(desc(moderationCasesTable.updatedAt));
      return rows.map((row) => ({
        id: row.id,
        entityType: row.entityType as ModerationCase["entityType"],
        entityId: row.entityId,
        title: row.title,
        status: row.status as ModerationCase["status"],
        reason: row.reason as ModerationCase["reason"],
        assignedTo: row.assignedTo,
        updatedAt: row.updatedAt.toISOString(),
        ownerUserId: row.ownerUserId ?? undefined,
        ownerOrganizationId: row.ownerOrganizationId ?? undefined,
        provenance: liveProvenance,
      }));
    },
    async upsertCase(actor, input) {
      const existing = await db
        .select()
        .from(moderationCasesTable)
        .where(and(eq(moderationCasesTable.entityType, input.entityType), eq(moderationCasesTable.entityId, input.entityId)))
        .limit(1);
      if (existing[0]) {
        const [row] = await db
          .update(moderationCasesTable)
          .set({
            ownerUserId: input.ownerUserId,
            ownerOrganizationId: input.ownerOrganizationId,
            title: input.title,
            status: input.status,
            reason: input.reason,
            assignedTo: input.assignedTo,
            updatedAt: new Date(),
          })
          .where(eq(moderationCasesTable.id, existing[0].id))
          .returning();
        return {
          id: row!.id,
          entityType: row!.entityType as ModerationCase["entityType"],
          entityId: row!.entityId,
          title: row!.title,
          status: row!.status as ModerationCase["status"],
          reason: row!.reason as ModerationCase["reason"],
          assignedTo: row!.assignedTo,
          updatedAt: row!.updatedAt.toISOString(),
          ownerUserId: row!.ownerUserId ?? undefined,
          ownerOrganizationId: row!.ownerOrganizationId ?? undefined,
          provenance: liveProvenance,
        };
      }

      const [row] = await db
        .insert(moderationCasesTable)
        .values({
          ownerUserId: input.ownerUserId,
          ownerOrganizationId: input.ownerOrganizationId,
          entityType: input.entityType,
          entityId: input.entityId,
          title: input.title,
          status: input.status,
          reason: input.reason,
          assignedTo: input.assignedTo,
        })
        .returning();

      return {
        id: row!.id,
        entityType: row!.entityType as ModerationCase["entityType"],
        entityId: row!.entityId,
        title: row!.title,
        status: row!.status as ModerationCase["status"],
        reason: row!.reason as ModerationCase["reason"],
        assignedTo: row!.assignedTo,
        updatedAt: row!.updatedAt.toISOString(),
        ownerUserId: row!.ownerUserId ?? undefined,
        ownerOrganizationId: row!.ownerOrganizationId ?? undefined,
        provenance: liveProvenance,
      };
    },
    async recordDecision(actor, caseId, nextStatus) {
      if (actor.role !== "admin") {
        throw new ForbiddenError();
      }
      const [row] = await db.update(moderationCasesTable).set({ status: nextStatus, updatedAt: new Date() }).where(eq(moderationCasesTable.id, caseId)).returning();
      if (!row) {
        throw new NotFoundError("Moderation case not found.");
      }
      return {
        id: row.id,
        entityType: row.entityType as ModerationCase["entityType"],
        entityId: row.entityId,
        title: row.title,
        status: row.status as ModerationCase["status"],
        reason: row.reason as ModerationCase["reason"],
        assignedTo: row.assignedTo,
        updatedAt: row.updatedAt.toISOString(),
        ownerUserId: row.ownerUserId ?? undefined,
        ownerOrganizationId: row.ownerOrganizationId ?? undefined,
        provenance: liveProvenance,
      };
    },
  };

  const benchmarkRepository: BenchmarkRepository = {
    async queueRequest(actor, input) {
      const [suite] = await db.select().from(benchmarkSuitesTable).where(eq(benchmarkSuitesTable.slug, input.suiteSlug)).limit(1);
      if (!suite) {
        throw new NotFoundError("Benchmark suite not found.");
      }
      const [agent] = await db.select({ id: agentRecords.id }).from(agentRecords).where(eq(agentRecords.slug, input.agentSlug)).limit(1);
      if (!agent) {
        throw new NotFoundError("Agent not found.");
      }
      const [row] = await db
        .insert(benchmarkRequestsTable)
        .values({
          ownerUserId: actor.userId,
          ownerOrganizationId: actor.activeOrganizationId,
          createdByUserId: actor.userId,
          agentId: agent.id,
          agentVersionId: input.versionId,
          suiteId: suite.id,
          objective: input.objective,
          status: input.status,
          queuedAt: new Date(input.queuedAt),
        })
        .returning();
      return {
        ...input,
        id: row!.id,
        ownerUserId: actor.userId,
        ownerOrganizationId: actor.activeOrganizationId,
        createdByUserId: actor.userId,
      };
    },
    async listRequestsForActor(actor) {
      const rows = await db
        .select({
          request: benchmarkRequestsTable,
          agentSlug: agentRecords.slug,
          suiteSlug: benchmarkSuitesTable.slug,
          artifact: benchmarkArtifactsTable,
        })
        .from(benchmarkRequestsTable)
        .innerJoin(agentRecords, eq(agentRecords.id, benchmarkRequestsTable.agentId))
        .innerJoin(benchmarkSuitesTable, eq(benchmarkSuitesTable.id, benchmarkRequestsTable.suiteId))
        .leftJoin(benchmarkArtifactsTable, eq(benchmarkArtifactsTable.benchmarkRequestId, benchmarkRequestsTable.id))
        .where(or(eq(benchmarkRequestsTable.ownerUserId, actor.userId), actor.activeOrganizationId ? eq(benchmarkRequestsTable.ownerOrganizationId, actor.activeOrganizationId) : sql`false`))
        .orderBy(desc(benchmarkRequestsTable.queuedAt));
      return rows.map(({ request, agentSlug, suiteSlug, artifact }) => ({
        id: request.id,
        ownerUserId: request.ownerUserId ?? undefined,
        ownerOrganizationId: request.ownerOrganizationId ?? undefined,
        createdByUserId: request.createdByUserId,
        agentSlug,
        versionId: request.agentVersionId,
        suiteSlug,
        objective: request.objective ?? undefined,
        status: request.status as BenchmarkRequestRecord["status"],
        queuedAt: request.queuedAt.toISOString(),
        startedAt: request.startedAt?.toISOString(),
        completedAt: request.completedAt?.toISOString(),
        artifactBundle: artifact
          ? {
              bundleHash: artifact.bundleHash,
              transcriptUrl: artifact.transcriptUrl,
              toolTraceUrl: artifact.toolTraceUrl,
              finalArtifactUrl: artifact.finalArtifactUrl ?? undefined,
              screenshotUrl: artifact.screenshotUrl ?? undefined,
              htmlArtifactUrl: artifact.htmlArtifactUrl ?? undefined,
              rubric: artifact.rubric as NonNullable<BenchmarkRequestRecord["artifactBundle"]>["rubric"],
            }
          : undefined,
      }));
    },
    async listQueuedRequests() {
      const rows = await db
        .select({
          request: benchmarkRequestsTable,
          agentSlug: agentRecords.slug,
          suiteSlug: benchmarkSuitesTable.slug,
        })
        .from(benchmarkRequestsTable)
        .innerJoin(agentRecords, eq(agentRecords.id, benchmarkRequestsTable.agentId))
        .innerJoin(benchmarkSuitesTable, eq(benchmarkSuitesTable.id, benchmarkRequestsTable.suiteId))
        .where(eq(benchmarkRequestsTable.status, "queued"))
        .orderBy(benchmarkRequestsTable.queuedAt);
      return rows.map(({ request, agentSlug, suiteSlug }) => ({
        id: request.id,
        ownerUserId: request.ownerUserId ?? undefined,
        ownerOrganizationId: request.ownerOrganizationId ?? undefined,
        createdByUserId: request.createdByUserId,
        agentSlug,
        versionId: request.agentVersionId,
        suiteSlug,
        objective: request.objective ?? undefined,
        status: request.status as BenchmarkRequestRecord["status"],
        queuedAt: request.queuedAt.toISOString(),
        startedAt: request.startedAt?.toISOString(),
        completedAt: request.completedAt?.toISOString(),
      }));
    },
    async claimQueuedRequest(requestId) {
      const [row] = await db
        .update(benchmarkRequestsTable)
        .set({ status: "running", startedAt: new Date() })
        .where(and(eq(benchmarkRequestsTable.id, requestId), eq(benchmarkRequestsTable.status, "queued")))
        .returning();
      if (!row) {
        return undefined;
      }
      const [agent] = await db.select({ slug: agentRecords.slug }).from(agentRecords).where(eq(agentRecords.id, row.agentId)).limit(1);
      const [suite] = await db.select().from(benchmarkSuitesTable).where(eq(benchmarkSuitesTable.id, row.suiteId)).limit(1);
      return {
        id: row.id,
        ownerUserId: row.ownerUserId ?? undefined,
        ownerOrganizationId: row.ownerOrganizationId ?? undefined,
        createdByUserId: row.createdByUserId,
        agentSlug: agent?.slug ?? "",
        versionId: row.agentVersionId,
        suiteSlug: suite?.slug ?? "",
        objective: row.objective ?? undefined,
        status: row.status as BenchmarkRequestRecord["status"],
        queuedAt: row.queuedAt.toISOString(),
        startedAt: row.startedAt?.toISOString(),
      };
    },
    async completeRequest(requestId, artifactBundle) {
      const [request] = await db
        .update(benchmarkRequestsTable)
        .set({ status: "completed", completedAt: new Date() })
        .where(eq(benchmarkRequestsTable.id, requestId))
        .returning();
      if (!request) {
        throw new NotFoundError("Benchmark request not found.");
      }
      await db.insert(benchmarkArtifactsTable).values({
        benchmarkRequestId: requestId,
        bundleHash: artifactBundle?.bundleHash ?? "",
        transcriptUrl: artifactBundle?.transcriptUrl ?? "",
        toolTraceUrl: artifactBundle?.toolTraceUrl ?? "",
        finalArtifactUrl: artifactBundle?.finalArtifactUrl,
        screenshotUrl: artifactBundle?.screenshotUrl,
        htmlArtifactUrl: artifactBundle?.htmlArtifactUrl,
        rubric: artifactBundle?.rubric ?? {},
      });
      const [suite] = await db.select().from(benchmarkSuitesTable).where(eq(benchmarkSuitesTable.id, request.suiteId)).limit(1);
      const [agent] = await db.select().from(agentRecords).where(eq(agentRecords.id, request.agentId)).limit(1);
      const [run] = await db
        .insert(benchmarkRunsTable)
        .values({
          suiteId: request.suiteId,
          agentVersionId: request.agentVersionId,
          publicRank: Number(artifactBundle?.rubric?.publicRank ?? 0),
          peerGroupSize: Number(artifactBundle?.rubric?.peerGroupSize ?? 0),
          bundleHash: artifactBundle?.bundleHash ?? "",
          costPerSuccessfulRun: String(Number(artifactBundle?.rubric?.costPerSuccessfulRun ?? 0)),
          medianLatencySeconds: Number(artifactBundle?.rubric?.medianLatencySeconds ?? 0),
          stability: Number(artifactBundle?.rubric?.stability ?? 0),
          freshnessDays: Number(artifactBundle?.rubric?.freshnessDays ?? 0),
          transcriptUrl: artifactBundle?.transcriptUrl ?? "",
          toolTraceUrl: artifactBundle?.toolTraceUrl ?? "",
          notes: {
            en: String(artifactBundle?.rubric?.note ?? `Benchmark completed for ${agent?.slug ?? "agent"}.`),
            "zh-CN": String(artifactBundle?.rubric?.noteZh ?? artifactBundle?.rubric?.note ?? `已完成 benchmark。`),
          },
        })
        .returning();
      await db.insert(benchmarkScorecards).values({
        benchmarkRunId: run!.id,
        overall: Number(artifactBundle?.rubric?.overall ?? 0),
        taskSuccess: Number(artifactBundle?.rubric?.taskSuccess ?? 0),
        reliability: Number(artifactBundle?.rubric?.reliability ?? 0),
        costEfficiency: Number(artifactBundle?.rubric?.costEfficiency ?? 0),
        latency: Number(artifactBundle?.rubric?.latency ?? 0),
        safetyFootprint: Number(artifactBundle?.rubric?.safetyFootprint ?? 0),
        setupFriction: Number(artifactBundle?.rubric?.setupFriction ?? 0),
        operatorBurden: Number(artifactBundle?.rubric?.operatorBurden ?? 0),
        domainFit: Number(artifactBundle?.rubric?.domainFit ?? 0),
      });
      return {
        id: request.id,
        ownerUserId: request.ownerUserId ?? undefined,
        ownerOrganizationId: request.ownerOrganizationId ?? undefined,
        createdByUserId: request.createdByUserId,
        agentSlug: agent?.slug ?? "",
        versionId: request.agentVersionId,
        suiteSlug: suite?.slug ?? "",
        objective: request.objective ?? undefined,
        status: "completed",
        queuedAt: request.queuedAt.toISOString(),
        startedAt: request.startedAt?.toISOString(),
        completedAt: new Date().toISOString(),
        artifactBundle,
      };
    },
  };

  const relationshipRepository: RelationshipRepository = {
    async listRelationships() {
      const rows = await db.select().from(relationshipEdgesTable).orderBy(desc(relationshipEdgesTable.createdAt));
      return rows.map((row) => ({
        id: row.id,
        type: row.type as RelationshipEdge["type"],
        fromType: row.fromType as RelationshipEdge["fromType"],
        fromId: row.fromId,
        toType: row.toType as RelationshipEdge["toType"],
        toId: row.toId,
        verified: booleanFromStorage(row.verified, false),
        createdAt: row.createdAt.toISOString(),
        note: row.note ? localizedTextFromUnknown(row.note) : undefined,
        provenance: liveProvenance,
      }));
    },
    async followProfile(actor, input) {
      const [existing] = await db
        .select()
        .from(relationshipEdgesTable)
        .where(
          and(
            eq(relationshipEdgesTable.type, "follows"),
            eq(relationshipEdgesTable.fromType, "user"),
            eq(relationshipEdgesTable.fromId, actor.userId),
            eq(relationshipEdgesTable.toType, input.toType),
            eq(relationshipEdgesTable.toId, input.toId),
          ),
        )
        .limit(1);
      if (existing) {
        return {
          id: existing.id,
          type: existing.type as RelationshipEdge["type"],
          fromType: existing.fromType as RelationshipEdge["fromType"],
          fromId: existing.fromId,
          toType: existing.toType as RelationshipEdge["toType"],
          toId: existing.toId,
          verified: booleanFromStorage(existing.verified, false),
          createdAt: existing.createdAt.toISOString(),
          note: existing.note ? localizedTextFromUnknown(existing.note) : undefined,
          provenance: liveProvenance,
        };
      }
      const [row] = await db
        .insert(relationshipEdgesTable)
        .values({
          type: "follows",
          fromType: "user",
          fromId: actor.userId,
          toType: input.toType,
          toId: input.toId,
          verified: 1,
        })
        .returning();
      return {
        id: row!.id,
        type: "follows",
        fromType: "user",
        fromId: actor.userId,
        toType: input.toType,
        toId: input.toId,
        verified: true,
        createdAt: row!.createdAt.toISOString(),
        provenance: liveProvenance,
      };
    },
    async unfollowProfile(actor, input) {
      await db
        .delete(relationshipEdgesTable)
        .where(
          and(
            eq(relationshipEdgesTable.type, "follows"),
            eq(relationshipEdgesTable.fromType, "user"),
            eq(relationshipEdgesTable.fromId, actor.userId),
            eq(relationshipEdgesTable.toType, input.toType),
            eq(relationshipEdgesTable.toId, input.toId),
          ),
        );
    },
  };

  const catalogRepository: CatalogRepository = {
    async listBuilders() {
      return (await buildPostgresPublicCatalog()).builders;
    },
    async getBuilderByHandle(handle) {
      return (await buildPostgresPublicCatalog()).builders.find((builder) => builder.handle === handle);
    },
    async getPublicMetricsSummary() {
      return (await buildPostgresPublicCatalog()).metrics;
    },
  };

  return {
    authRepository,
    agentRepository,
    versionRepository,
    installRepository,
    reviewRepository,
    shortlistRepository,
    moderationRepository,
    benchmarkRepository,
    catalogRepository,
    relationshipRepository,
    auditRepository,
  };
}

export async function getRepositoryBundle(): Promise<RepositoryBundle> {
  const mode = getStorageMode();
  if (mode === "sample") {
    throw new ConfigurationError("Repository bundle is unavailable in sample-only mode.");
  }
  if (mode === "memory") {
    return createMemoryBundle();
  }
  return createPostgresBundle();
}

export async function getReadCatalog() {
  const mode = getStorageMode();
  if (mode === "sample") {
    return buildSampleCatalog();
  }
  const bundle = await getRepositoryBundle();
  return {
    agents: await bundle.agentRepository.listPublicAgents(),
    builders: await bundle.catalogRepository.listBuilders(),
    relationships: await bundle.relationshipRepository.listRelationships(),
    metrics: await bundle.catalogRepository.getPublicMetricsSummary(),
  };
}
