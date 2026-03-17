import type {
  AgentRecord,
  AgentSubmissionRecord,
  BenchmarkRequestRecord,
  BuilderProfile,
  DecisionMemo,
  ModerationCase,
  PublicMetricsSummary,
  SessionActor,
  ShortlistRecord,
  VerifiedInstall,
  VerifiedReview,
} from "./types";

export interface AgentRepository {
  listPublicAgents(filters?: { query?: string; category?: string; status?: string }): Promise<AgentRecord[]>;
  getPublicAgentBySlug(slug: string, versionId?: string): Promise<AgentRecord | undefined>;
  listBuilderAgents(actor: SessionActor): Promise<AgentRecord[]>;
  listSubmissionsForActor(actor: SessionActor): Promise<AgentSubmissionRecord[]>;
  createSubmission(input: AgentSubmissionRecord): Promise<AgentSubmissionRecord>;
  publishVersion(actor: SessionActor, agentSlug: string, versionId: string, note?: string): Promise<void>;
}

export interface VersionRepository {
  assertBuilderOwnsVersion(actor: SessionActor, agentSlug: string, versionId: string): Promise<void>;
  getLatestPublicVersionId(agentSlug: string): Promise<string | undefined>;
}

export interface InstallRepository {
  createVerifiedInstall(actor: SessionActor, input: VerifiedInstall): Promise<VerifiedInstall>;
  getOwnedInstall(actor: SessionActor, installId: string): Promise<VerifiedInstall | undefined>;
  listInstallsForActor(actor: SessionActor): Promise<VerifiedInstall[]>;
}

export interface ReviewRepository {
  createVerifiedReview(actor: SessionActor, input: VerifiedReview): Promise<VerifiedReview>;
  listReviewsForActor(actor: SessionActor): Promise<VerifiedReview[]>;
}

export interface ShortlistRepository {
  createShortlist(actor: SessionActor, input: ShortlistRecord): Promise<ShortlistRecord>;
  listShortlistsForActor(actor: SessionActor): Promise<ShortlistRecord[]>;
  createDecisionMemo(actor: SessionActor, input: DecisionMemo): Promise<DecisionMemo>;
  listDecisionMemosForActor(actor: SessionActor): Promise<DecisionMemo[]>;
}

export interface ModerationRepository {
  listModerationCases(actor: SessionActor): Promise<ModerationCase[]>;
  recordDecision(actor: SessionActor, caseId: string, nextStatus: ModerationCase["status"], note: string): Promise<ModerationCase>;
  upsertCase(
    actor: SessionActor,
    input: Omit<ModerationCase, "id" | "updatedAt"> & { id?: string; updatedAt?: string },
  ): Promise<ModerationCase>;
}

export interface BenchmarkRepository {
  queueRequest(actor: SessionActor, input: BenchmarkRequestRecord): Promise<BenchmarkRequestRecord>;
  listRequestsForActor(actor: SessionActor): Promise<BenchmarkRequestRecord[]>;
  listQueuedRequests(): Promise<BenchmarkRequestRecord[]>;
  claimQueuedRequest(requestId: string): Promise<BenchmarkRequestRecord | undefined>;
  completeRequest(requestId: string, artifactBundle: BenchmarkRequestRecord["artifactBundle"]): Promise<BenchmarkRequestRecord>;
}

export interface CatalogRepository {
  listBuilders(): Promise<BuilderProfile[]>;
  getBuilderByHandle(handle: string): Promise<BuilderProfile | undefined>;
  getPublicMetricsSummary(): Promise<PublicMetricsSummary>;
}

export interface AuditRepository {
  append(input: {
    actor: SessionActor;
    eventType: string;
    entityType: string;
    entityId: string;
    previousState?: unknown;
    newState?: unknown;
    metadata?: unknown;
  }): Promise<void>;
}
