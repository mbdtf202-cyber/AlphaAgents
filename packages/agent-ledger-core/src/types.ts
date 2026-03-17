export type Locale = "en" | "zh-CN";
export type DataMode = "sample" | "live";
export type SourceType = "user-event" | "internal-seed" | "benchmark-run";
export type ActorRole = "buyer" | "builder" | "admin";
export type MembershipRole = "member" | "manager" | "owner";
export type BenchmarkRequestStatus = "queued" | "running" | "completed" | "failed";
export type DecisionState = "hold" | "pilot" | "rollout" | "reject";

export interface LocalizedText {
  en: string;
  "zh-CN": string;
}

export interface ProvenanceInfo {
  dataMode: DataMode;
  sourceType: SourceType;
  label: LocalizedText;
}

export type VerificationStatus = "verified" | "review" | "draft";
export type BuilderType = "solo" | "studio" | "organization";
export type SourceKind = "clawhub" | "github" | "agent-pack";
export type PermissionRiskLevel = "low" | "medium" | "high";
export type BenchmarkTrack = "coding" | "research" | "support-ops" | "workflow-automation";
export type ModerationStatus = "pending" | "changes-requested" | "approved" | "rejected";

export interface ScoreBreakdown {
  taskSuccess: number;
  reliability: number;
  costEfficiency: number;
  latency: number;
  safetyFootprint: number;
  setupFriction: number;
  operatorBurden: number;
  domainFit: number;
}

export interface BuilderProfile {
  id: string;
  handle: string;
  name: string;
  type: BuilderType;
  location: string;
  headline: LocalizedText;
  bio: LocalizedText;
  specialties: string[];
  organizationsWorkedWith: string[];
  publishedAgentSlugs: string[];
  benchmarkWins: number;
  shortlistCount: number;
  verifiedReviewCount: number;
  githubUrl: string;
  provenance?: ProvenanceInfo;
}

export interface AgentSourceRecord {
  id: string;
  kind: SourceKind;
  label: string;
  url: string;
  installCommand: string;
}

export interface PermissionManifest {
  id: string;
  summary: LocalizedText;
  skills: string[];
  secrets: string[];
  networkAccess: string[];
  fileAccess: string[];
  shellAccess: boolean;
  automationHooks: boolean;
  riskLevel: PermissionRiskLevel;
}

export interface BenchmarkSuite {
  id: string;
  slug: string;
  title: LocalizedText;
  summary: LocalizedText;
  track: BenchmarkTrack;
  publicDevSetSize: number;
  heldOutSetSize: number;
  measurementFocus: string[];
  methodology: LocalizedText[];
  sampleTasks: LocalizedText[];
  provenance?: ProvenanceInfo;
}

export interface BenchmarkScorecard extends ScoreBreakdown {
  overall: number;
}

export interface BenchmarkRun {
  id: string;
  suiteSlug: string;
  evaluatedAt: string;
  publicRank: number;
  peerGroupSize: number;
  bundleHash: string;
  costPerSuccessfulRun: number;
  medianLatencySeconds: number;
  stability: number;
  freshnessDays: number;
  transcriptUrl: string;
  toolTraceUrl: string;
  finalArtifactUrl?: string;
  screenshotUrl?: string;
  htmlArtifactUrl?: string;
  scorecard: BenchmarkScorecard;
  notes: LocalizedText;
  provenance?: ProvenanceInfo;
}

export interface DemoRun {
  id: string;
  title: LocalizedText;
  summary: LocalizedText;
  outcome: "success" | "guarded" | "needs-review";
  industry: string;
}

export interface AgentVersionRecord {
  id: string;
  version: string;
  releasedAt: string;
  status: VerificationStatus;
  bundleHash: string;
  changelog: LocalizedText[];
  benchmarkRuns: BenchmarkRun[];
  reviewAverage: number;
  reviewCount: number;
  provenance?: ProvenanceInfo;
}

export interface VerifiedReview {
  id: string;
  agentSlug: string;
  versionId: string;
  builderHandle: string;
  installId: string;
  company: string;
  role: string;
  headline: LocalizedText;
  body: LocalizedText;
  rating: number;
  dimensions: ScoreBreakdown;
  createdAt: string;
  ownerUserId?: string;
  ownerOrganizationId?: string;
  provenance?: ProvenanceInfo;
}

export interface VerifiedInstall {
  id: string;
  agentSlug: string;
  versionId: string;
  verificationToken: string;
  packageHash: string;
  anonymousRuntimeFingerprint: string;
  verifiedAt: string;
  ownerUserId?: string;
  ownerOrganizationId?: string;
  provenance?: ProvenanceInfo;
}

export interface ShortlistRecord {
  id: string;
  name: LocalizedText;
  ownerUserId?: string;
  ownerOrganizationId?: string;
  createdByUserId: string;
  agentSlugs: string[];
  buyerType: "individual" | "team" | "enterprise";
  provenance?: ProvenanceInfo;
}

export interface DecisionMemo {
  id: string;
  shortlistId: string;
  ownerUserId?: string;
  ownerOrganizationId?: string;
  createdByUserId: string;
  title: LocalizedText;
  summary: LocalizedText;
  recommendationState: DecisionState;
  rolloutRecommendation: LocalizedText;
  tradeoffs: LocalizedText[];
  createdAt: string;
  updatedAt: string;
  provenance?: ProvenanceInfo;
}

export interface ModerationCase {
  id: string;
  entityType: "submission" | "version" | "review" | "benchmark-run";
  entityId: string;
  title: string;
  status: ModerationStatus;
  reason: LocalizedText;
  assignedTo: string;
  updatedAt: string;
  ownerUserId?: string;
  ownerOrganizationId?: string;
  provenance?: ProvenanceInfo;
}

export interface FeatureSlot {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  agentSlug: string;
  provenance?: ProvenanceInfo;
}

export interface AgentRecord {
  id: string;
  slug: string;
  name: string;
  builderHandle: string;
  tagline: LocalizedText;
  summary: LocalizedText;
  useCases: LocalizedText[];
  notFor: LocalizedText[];
  categories: string[];
  verificationStatus: VerificationStatus;
  source: AgentSourceRecord;
  permissionManifest: PermissionManifest;
  versions: AgentVersionRecord[];
  overview: LocalizedText[];
  capabilities: LocalizedText[];
  dependencies: string[];
  demoRuns: DemoRun[];
  reviews: VerifiedReview[];
  knownLimits: LocalizedText[];
  provenance?: ProvenanceInfo;
}

export interface AgentSubmissionRecord {
  id: string;
  ownerUserId?: string;
  ownerOrganizationId?: string;
  createdByUserId: string;
  agentName: string;
  agentSlug: string;
  builderHandle: string;
  sourceKind: SourceKind;
  sourceUrl: string;
  installCommand: string;
  summary: LocalizedText;
  permissionManifest: PermissionManifest;
  dependencies: string[];
  knownLimits: LocalizedText[];
  supportedEnvironments: string[];
  status: ModerationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BenchmarkArtifactBundle {
  bundleHash: string;
  transcriptUrl: string;
  toolTraceUrl: string;
  finalArtifactUrl?: string;
  screenshotUrl?: string;
  htmlArtifactUrl?: string;
  rubric: Record<string, number | string>;
}

export interface BenchmarkRequestRecord {
  id: string;
  ownerUserId?: string;
  ownerOrganizationId?: string;
  createdByUserId: string;
  agentId: string;
  versionId: string;
  suiteSlug: string;
  objective?: string;
  status: BenchmarkRequestStatus;
  queuedAt: string;
  startedAt?: string;
  completedAt?: string;
  artifactBundle?: BenchmarkArtifactBundle;
}

export interface OrganizationMembership {
  id: string;
  userId: string;
  organizationId: string;
  role: MembershipRole;
  organizationName: string;
  organizationSlug: string;
}

export interface SessionActor {
  sessionId: string;
  userId: string;
  email: string;
  role: ActorRole;
  githubHandle?: string;
  activeOrganizationId?: string;
  memberships: OrganizationMembership[];
}

export interface PublicMetricsSummary {
  liveAgentCount: number;
  liveInstallCount: number;
  liveReviewCount: number;
  liveBenchmarkRunCount: number;
  sampleAgentCount: number;
}

export interface AuditLogRecord {
  id: string;
  actorUserId: string;
  actorOrganizationId?: string;
  eventType: string;
  entityType: string;
  entityId: string;
  previousState?: unknown;
  newState?: unknown;
  metadata?: unknown;
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  suiteSlug: string;
  agentSlug: string;
  agentName: string;
  builderHandle: string;
  overall: number;
  taskSuccess: number;
  reliability: number;
  costEfficiency: number;
  latency: number;
  safetyFootprint: number;
  operatorBurden: number;
  freshnessDays: number;
}
