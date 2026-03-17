import { randomUUID } from "node:crypto";

import {
  agents as sampleAgents,
  benchmarkSuites,
  builders as sampleBuilders,
  type AgentRecord,
  type AgentRepository,
  type AgentSubmissionRecord,
  type AuditLogRecord,
  type AuditRepository,
  type BenchmarkRepository,
  type BenchmarkRequestRecord,
  type BuilderProfile,
  type CatalogRepository,
  type DecisionMemo,
  type InstallRepository,
  type MembershipRole,
  type ModerationCase,
  type ModerationRepository,
  type PublicMetricsSummary,
  type ReviewRepository,
  type SessionActor,
  type ShortlistRecord,
  type ShortlistRepository,
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
  benchmarkSuitesTable,
  builderProfiles,
  decisionMemosTable,
  magicLinkChallenges,
  moderationCasesTable,
  organizationMemberships,
  organizations,
  permissionManifests,
  shortlistsTable,
  submissionsTable,
  users,
  verifiedInstallsTable,
  verifiedReviewsTable,
} from "@openclaw/alpha-agents-core/db/schema";
import { and, desc, eq, isNull, or, sql } from "drizzle-orm";

import { hashToken } from "./auth";
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
  consumeMagicLink(tokenHash: string): Promise<{ actor: SessionActor; rawSessionToken: string }>;
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
  auditRepository: AuditRepository;
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
  return sampleAgents.map((agent) => ({
    ...agent,
    provenance: sampleProvenance,
    versions: agent.versions.map((version) => ({
      ...version,
      provenance: sampleProvenance,
      benchmarkRuns: version.benchmarkRuns.map((run) => ({ ...run, provenance: sampleProvenance })),
    })),
  }));
}

function liveMetricsFromMemory(): PublicMetricsSummary {
  const state = getMemoryState();
  return {
    liveAgentCount: 0,
    liveInstallCount: state.installs.filter((item) => item.provenance?.dataMode === "live").length,
    liveReviewCount: state.reviews.filter((item) => item.provenance?.dataMode === "live").length,
    liveBenchmarkRunCount: state.benchmarkRequests.filter((item) => item.status === "completed").length,
    sampleAgentCount: sampleAgents.length,
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
      if (!session) {
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
      if (!challenge) {
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
      return { actor, rawSessionToken };
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
      const all = sampleAgentList();
      return all.filter((agent) => {
        if (filters?.query) {
          const haystack = [agent.name, agent.slug, agent.summary.en, agent.summary["zh-CN"], ...agent.categories].join(" ").toLowerCase();
          if (!haystack.includes(filters.query.toLowerCase())) {
            return false;
          }
        }
        if (filters?.category && filters.category !== "all" && !agent.categories.includes(filters.category)) {
          return false;
        }
        if (filters?.status && filters.status !== "all" && agent.verificationStatus !== filters.status) {
          return false;
        }
        return true;
      });
    },
    async getPublicAgentBySlug(slug, versionId) {
      const agent = sampleAgentList().find((entry) => entry.slug === slug);
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
    async publishVersion(actor, agentId, versionId) {
      const agent = state.agents.find((entry) => entry.id === agentId || entry.slug === agentId);
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
    async assertBuilderOwnsVersion(actor, agentId, versionId) {
      const agent = state.agents.find((entry) => entry.id === agentId || entry.slug === agentId);
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
      const review = { ...input, ownerUserId: actor.userId, ownerOrganizationId: actor.activeOrganizationId, provenance: liveProvenance };
      state.reviews.push(review);
      const agent = state.agents.find((entry) => entry.slug === review.agentSlug);
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

  const catalogRepository: CatalogRepository = {
    async listBuilders() {
      return sampleBuilderList();
    },
    async getBuilderByHandle(handle) {
      return sampleBuilderList().find((builder) => builder.handle === handle);
    },
    async getPublicMetricsSummary() {
      return liveMetricsFromMemory();
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
      return { actor, rawSessionToken };
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
      return sampleAgentList().filter((agent) => {
        if (filters?.query) {
          const haystack = [agent.name, agent.slug, agent.summary.en, agent.summary["zh-CN"], ...agent.categories].join(" ").toLowerCase();
          if (!haystack.includes(filters.query.toLowerCase())) {
            return false;
          }
        }
        if (filters?.category && filters.category !== "all" && !agent.categories.includes(filters.category)) {
          return false;
        }
        if (filters?.status && filters.status !== "all" && agent.verificationStatus !== filters.status) {
          return false;
        }
        return true;
      });
    },
    async getPublicAgentBySlug(slug, versionId) {
      const agent = sampleAgentList().find((entry) => entry.slug === slug);
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
        .select({
          id: agentRecords.id,
          slug: agentRecords.slug,
          name: agentRecords.name,
          status: agentRecords.status,
          summary: agentRecords.summary,
          tagline: agentRecords.tagline,
          categories: agentRecords.categories,
        })
        .from(agentRecords)
        .where(
          or(
            eq(agentRecords.ownerUserId, actor.userId),
            actor.activeOrganizationId ? eq(agentRecords.ownerOrganizationId, actor.activeOrganizationId) : sql`false`,
          ),
        );
      return rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        builderHandle: actor.githubHandle ?? "builder",
        tagline: row.tagline as AgentRecord["tagline"],
        summary: row.summary as AgentRecord["summary"],
        useCases: [],
        notFor: [],
        categories: row.categories as string[],
        verificationStatus: row.status as AgentRecord["verificationStatus"],
        source: {
          id: `source-${row.id}`,
          kind: "github",
          label: "Live submission",
          url: "#",
          installCommand: "pending",
        },
        permissionManifest: {
          id: `perm-${row.id}`,
          summary: { en: "Pending live manifest", "zh-CN": "待补全权限清单" },
          skills: [],
          secrets: [],
          networkAccess: [],
          fileAccess: [],
          shellAccess: false,
          automationHooks: false,
          riskLevel: "low",
        },
        versions: [],
        overview: [],
        capabilities: [],
        dependencies: [],
        demoRuns: [],
        reviews: [],
        knownLimits: [],
        provenance: liveProvenance,
      }));
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
    async publishVersion(actor, agentId, versionId) {
      const [version] = await db
        .select({
          id: agentVersions.id,
          agentId: agentVersions.agentId,
          ownerUserId: agentRecords.ownerUserId,
          ownerOrganizationId: agentRecords.ownerOrganizationId,
        })
        .from(agentVersions)
        .innerJoin(agentRecords, eq(agentRecords.id, agentVersions.agentId))
        .where(and(eq(agentVersions.id, versionId), eq(agentVersions.agentId, agentId)))
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
    async assertBuilderOwnsVersion(actor, agentId, versionId) {
      const [version] = await db
        .select({
          id: agentVersions.id,
          ownerUserId: agentRecords.ownerUserId,
          ownerOrganizationId: agentRecords.ownerOrganizationId,
        })
        .from(agentVersions)
        .innerJoin(agentRecords, eq(agentRecords.id, agentVersions.agentId))
        .where(and(eq(agentVersions.id, versionId), eq(agentVersions.agentId, agentId)))
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
      const [row] = await db.select().from(verifiedInstallsTable).where(eq(verifiedInstallsTable.id, installId)).limit(1);
      if (!row) {
        return undefined;
      }
      if (!ownableMatch(actor, row.ownerUserId ?? undefined, row.ownerOrganizationId ?? undefined)) {
        return undefined;
      }
      return {
        id: row.id,
        agentSlug: "",
        versionId: row.agentVersionId,
        verificationToken: row.verificationToken,
        packageHash: row.packageHash,
        anonymousRuntimeFingerprint: row.anonymousRuntimeFingerprint,
        verifiedAt: row.verifiedAt.toISOString(),
        ownerUserId: row.ownerUserId ?? undefined,
        ownerOrganizationId: row.ownerOrganizationId ?? undefined,
        provenance: liveProvenance,
      };
    },
    async listInstallsForActor(actor) {
      const rows = await db
        .select()
        .from(verifiedInstallsTable)
        .where(
          or(
            eq(verifiedInstallsTable.ownerUserId, actor.userId),
            actor.activeOrganizationId ? eq(verifiedInstallsTable.ownerOrganizationId, actor.activeOrganizationId) : sql`false`,
          ),
        );
      return rows.map((row) => ({
        id: row.id,
        agentSlug: "",
        versionId: row.agentVersionId,
        verificationToken: row.verificationToken,
        packageHash: row.packageHash,
        anonymousRuntimeFingerprint: row.anonymousRuntimeFingerprint,
        verifiedAt: row.verifiedAt.toISOString(),
        ownerUserId: row.ownerUserId ?? undefined,
        ownerOrganizationId: row.ownerOrganizationId ?? undefined,
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
      const [agent] = await db.select({ id: agentRecords.id }).from(agentRecords).where(eq(agentRecords.slug, input.agentSlug)).limit(1);
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
      }).returning();
      return {
        ...input,
        id: row!.id,
        ownerUserId: actor.userId,
        ownerOrganizationId: actor.activeOrganizationId,
        createdAt: row!.createdAt.toISOString(),
        provenance: liveProvenance,
      };
    },
    async listReviewsForActor(actor) {
      const rows = await db
        .select()
        .from(verifiedReviewsTable)
        .where(
          or(
            eq(verifiedReviewsTable.ownerUserId, actor.userId),
            actor.activeOrganizationId ? eq(verifiedReviewsTable.ownerOrganizationId, actor.activeOrganizationId) : sql`false`,
          ),
        );
      return rows.map((row) => ({
        id: row.id,
        agentSlug: "",
        versionId: row.agentVersionId,
        builderHandle: "",
        installId: row.installId,
        company: row.company,
        role: row.role,
        headline: row.headline as VerifiedReview["headline"],
        body: row.body as VerifiedReview["body"],
        rating: row.rating,
        dimensions: row.dimensions as VerifiedReview["dimensions"],
        createdAt: row.createdAt.toISOString(),
        ownerUserId: row.ownerUserId ?? undefined,
        ownerOrganizationId: row.ownerOrganizationId ?? undefined,
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
      const [row] = await db
        .insert(benchmarkRequestsTable)
        .values({
          ownerUserId: actor.userId,
          ownerOrganizationId: actor.activeOrganizationId,
          createdByUserId: actor.userId,
          agentId: input.agentId,
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
          suiteSlug: benchmarkSuitesTable.slug,
          artifact: benchmarkArtifactsTable,
        })
        .from(benchmarkRequestsTable)
        .innerJoin(benchmarkSuitesTable, eq(benchmarkSuitesTable.id, benchmarkRequestsTable.suiteId))
        .leftJoin(benchmarkArtifactsTable, eq(benchmarkArtifactsTable.benchmarkRequestId, benchmarkRequestsTable.id))
        .where(or(eq(benchmarkRequestsTable.ownerUserId, actor.userId), actor.activeOrganizationId ? eq(benchmarkRequestsTable.ownerOrganizationId, actor.activeOrganizationId) : sql`false`))
        .orderBy(desc(benchmarkRequestsTable.queuedAt));
      return rows.map(({ request, suiteSlug, artifact }) => ({
        id: request.id,
        ownerUserId: request.ownerUserId ?? undefined,
        ownerOrganizationId: request.ownerOrganizationId ?? undefined,
        createdByUserId: request.createdByUserId,
        agentId: request.agentId,
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
          suiteSlug: benchmarkSuitesTable.slug,
        })
        .from(benchmarkRequestsTable)
        .innerJoin(benchmarkSuitesTable, eq(benchmarkSuitesTable.id, benchmarkRequestsTable.suiteId))
        .where(eq(benchmarkRequestsTable.status, "queued"))
        .orderBy(benchmarkRequestsTable.queuedAt);
      return rows.map(({ request, suiteSlug }) => ({
        id: request.id,
        ownerUserId: request.ownerUserId ?? undefined,
        ownerOrganizationId: request.ownerOrganizationId ?? undefined,
        createdByUserId: request.createdByUserId,
        agentId: request.agentId,
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
      const [suite] = await db.select().from(benchmarkSuitesTable).where(eq(benchmarkSuitesTable.id, row.suiteId)).limit(1);
      return {
        id: row.id,
        ownerUserId: row.ownerUserId ?? undefined,
        ownerOrganizationId: row.ownerOrganizationId ?? undefined,
        createdByUserId: row.createdByUserId,
        agentId: row.agentId,
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
      return {
        id: request.id,
        ownerUserId: request.ownerUserId ?? undefined,
        ownerOrganizationId: request.ownerOrganizationId ?? undefined,
        createdByUserId: request.createdByUserId,
        agentId: request.agentId,
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

  const catalogRepository: CatalogRepository = {
    async listBuilders() {
      return sampleBuilderList();
    },
    async getBuilderByHandle(handle) {
      return sampleBuilderList().find((builder) => builder.handle === handle);
    },
    async getPublicMetricsSummary() {
      const [agentCountRow] = await db.select({ count: sql<number>`count(*)` }).from(agentRecords).where(eq(agentRecords.status, "verified"));
      const [installCountRow] = await db.select({ count: sql<number>`count(*)` }).from(verifiedInstallsTable);
      const [reviewCountRow] = await db.select({ count: sql<number>`count(*)` }).from(verifiedReviewsTable);
      const [benchmarkCountRow] = await db.select({ count: sql<number>`count(*)` }).from(benchmarkRunsTable);
      return {
        liveAgentCount: Number(agentCountRow?.count ?? 0),
        liveInstallCount: Number(installCountRow?.count ?? 0),
        liveReviewCount: Number(reviewCountRow?.count ?? 0),
        liveBenchmarkRunCount: Number(benchmarkCountRow?.count ?? 0),
        sampleAgentCount: sampleAgents.length,
      };
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
    return {
      agents: sampleAgentList(),
      builders: sampleBuilderList(),
      metrics: {
        liveAgentCount: 0,
        liveInstallCount: 0,
        liveReviewCount: 0,
        liveBenchmarkRunCount: 0,
        sampleAgentCount: sampleAgents.length,
      } satisfies PublicMetricsSummary,
    };
  }
  const bundle = await getRepositoryBundle();
  return {
    agents: await bundle.agentRepository.listPublicAgents(),
    builders: await bundle.catalogRepository.listBuilders(),
    metrics: await bundle.catalogRepository.getPublicMetricsSummary(),
  };
}
