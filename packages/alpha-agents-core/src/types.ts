export type Locale = "en" | "zh-CN";
export type DataMode = "sample" | "live";
export type SourceType = "user-event" | "internal-seed" | "benchmark-run";
export type ActorRole = "buyer" | "builder" | "admin";
export type MembershipRole = "member" | "manager" | "owner";
export type BenchmarkRequestStatus = "queued" | "running" | "completed" | "failed";
export type DecisionState = "hold" | "pilot" | "rollout" | "reject";
export type ProfileSubjectType = "agent" | "builder" | "organization";
export type RelationshipNodeType = ProfileSubjectType | "user";
export type ActivityEventType =
  | "version-published"
  | "benchmark-completed"
  | "install-verified"
  | "review-published"
  | "permission-changed"
  | "badge-awarded"
  | "featured-work-added"
  | "endorsement-received"
  | "adoption-verified";
export type RelationshipEdgeType =
  | "built-by"
  | "affiliated-with"
  | "adopted-by"
  | "collaborates-with"
  | "verified-by"
  | "follows";
export type ProfileBadgeType =
  | "identity-verified"
  | "permissions-declared"
  | "versioned-reviews"
  | "benchmark-credential"
  | "verified-deployment"
  | "profile-complete";
export type TrustTier = "Emerging" | "Verified" | "Established";
export type ClaimVerificationStatus = "verified" | "pending" | "disputed";
export type ClaimVerificationType = "identity" | "deployment" | "benchmark" | "affiliation" | "capability" | "permission";
export type ProfileCredentialType = "benchmark" | "claim" | "deployment" | "review";

export interface LocalizedText {
  en: string;
  "zh-CN": string;
}

export interface ProvenanceInfo {
  dataMode: DataMode;
  sourceType: SourceType;
  label: LocalizedText;
}

export interface OrganizationProfile {
  id: string;
  slug: string;
  name: string;
  headline: LocalizedText;
  summary: LocalizedText;
  location?: string;
  websiteUrl?: string;
  verificationStatus: VerificationStatus;
  provenance?: ProvenanceInfo;
}

export interface CompletenessCheck {
  id:
    | "identity-basics"
    | "install-source"
    | "permission-manifest"
    | "scope-and-limits"
    | "version-history"
    | "verified-credential"
    | "activity-or-work";
  label: LocalizedText;
  complete: boolean;
}

export interface ProfileBadge {
  id: string;
  type: ProfileBadgeType;
  label: LocalizedText;
  description: LocalizedText;
  awardedAt: string;
  provenance?: ProvenanceInfo;
}

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  subjectType: ProfileSubjectType;
  subjectId: string;
  occurredAt: string;
  title: LocalizedText;
  summary: LocalizedText;
  verified: boolean;
  relatedUrl?: string;
  relatedVersionId?: string;
  relatedAgentSlug?: string;
  relatedBuilderHandle?: string;
  relatedOrganizationId?: string;
  provenance?: ProvenanceInfo;
}

export interface RelationshipEdge {
  id: string;
  type: RelationshipEdgeType;
  fromType: RelationshipNodeType;
  fromId: string;
  toType: RelationshipNodeType;
  toId: string;
  verified: boolean;
  createdAt: string;
  note?: LocalizedText;
  provenance?: ProvenanceInfo;
}

export interface ClaimVerification {
  id: string;
  subjectType: ProfileSubjectType;
  subjectId: string;
  claimType: ClaimVerificationType;
  label: LocalizedText;
  summary: LocalizedText;
  status: ClaimVerificationStatus;
  verifiedAt?: string;
  evidenceUrl?: string;
  relatedVersionId?: string;
  provenance?: ProvenanceInfo;
}

export interface Endorsement {
  id: string;
  subjectType: ProfileSubjectType;
  subjectId: string;
  authorType: ProfileSubjectType;
  authorId: string;
  authorName: string;
  authorHeadline: LocalizedText;
  body: LocalizedText;
  createdAt: string;
  verified: boolean;
  provenance?: ProvenanceInfo;
}

export interface FeaturedWork {
  id: string;
  subjectType: ProfileSubjectType;
  subjectId: string;
  title: LocalizedText;
  summary: LocalizedText;
  artifactUrl?: string;
  publishedAt: string;
  verified: boolean;
  provenance?: ProvenanceInfo;
}

export interface ProfileCredential {
  id: string;
  type: ProfileCredentialType;
  title: LocalizedText;
  summary: LocalizedText;
  issuedAt: string;
  verified: boolean;
  badgeType?: ProfileBadgeType;
  relatedUrl?: string;
  relatedVersionId?: string;
  relatedSuiteSlug?: string;
  score?: number;
  rank?: number;
  provenance?: ProvenanceInfo;
}

export interface ProfileNetwork {
  organizations: OrganizationProfile[];
  edges: RelationshipEdge[];
}

export interface TrustProfile {
  tier: TrustTier;
  completenessPercent: number;
  checks: CompletenessCheck[];
  primaryBadges: ProfileBadge[];
  verifiedClaimCount: number;
  disputedClaimCount: number;
  followerCount: number;
  lastVerifiedEventAt?: string;
}

export type VerificationStatus = "verified" | "review" | "draft";
export type BuilderType = "solo" | "studio" | "organization";
export type SourceKind = "clawhub" | "github" | "agent-pack";
export type PermissionRiskLevel = "low" | "medium" | "high";
export type BenchmarkTrack = "coding" | "research" | "support-ops" | "workflow-automation";
export type ModerationStatus = "pending" | "changes-requested" | "approved" | "rejected";

export type RepoSize = "small" | "medium" | "large";
export type DataSensitivity = "low" | "medium" | "high" | "restricted";
export type ApprovalModel = "single-owner" | "team-review" | "change-advisory-board";
export type SupervisionLevel = "light" | "medium" | "high";

export type ScoreDimension =
  | "taskSuccess"
  | "reliability"
  | "costEfficiency"
  | "latency"
  | "safetyFootprint"
  | "setupFriction"
  | "operatorBurden"
  | "domainFit";

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

export type ScoreWeightProfile = Partial<Record<ScoreDimension, number>>;

export interface EnvironmentConstraintProfile {
  repoSize: RepoSize;
  dataSensitivity: DataSensitivity;
  approvalModel: ApprovalModel;
  allowShell: boolean;
  allowNetwork: boolean;
  allowAutoCommit: boolean;
}

export interface ReviewContext {
  teamSize?: string;
  taskFrequency?: string;
  deploymentEnvironment?: string;
  supervisionLevel?: SupervisionLevel;
  failureModes?: string[];
  alternativeTools?: string[];
}

export interface VersionRegressionSummary {
  improvedMetrics: ScoreDimension[];
  regressedMetrics: ScoreDimension[];
  rerunRequired: boolean;
  permissionDelta: LocalizedText;
}

export interface BuilderProfile {
  id: string;
  handle: string;
  name: string;
  type: BuilderType;
  location?: string;
  headline: LocalizedText;
  bio: LocalizedText;
  specialties: string[];
  organizationsWorkedWith?: string[];
  publishedAgentSlugs: string[];
  benchmarkWins: number;
  shortlistCount: number;
  verifiedReviewCount: number;
  githubUrl?: string;
  affiliatedOrganizations?: OrganizationProfile[];
  trust?: TrustProfile;
  activity?: ActivityEvent[];
  credentials?: ProfileCredential[];
  network?: ProfileNetwork;
  featuredWork?: FeaturedWork[];
  endorsements?: Endorsement[];
  claimVerifications?: ClaimVerification[];
  followerCount?: number;
  following?: boolean;
  verifiedDeploymentCount?: number;
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
  regressionSummary?: VersionRegressionSummary;
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
  context?: ReviewContext;
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
  constraints?: EnvironmentConstraintProfile;
  scoreWeights?: ScoreWeightProfile;
  internalNotes?: string;
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
  evidenceSummary?: LocalizedText;
  riskSummary?: LocalizedText;
  scoreWeights?: ScoreWeightProfile;
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
  affiliatedOrganizations?: OrganizationProfile[];
  trust?: TrustProfile;
  activity?: ActivityEvent[];
  credentials?: ProfileCredential[];
  network?: ProfileNetwork;
  featuredWork?: FeaturedWork[];
  endorsements?: Endorsement[];
  claimVerifications?: ClaimVerification[];
  followerCount?: number;
  following?: boolean;
  provenance?: ProvenanceInfo;
}

export interface AgentProfileView extends AgentRecord {
  affiliatedOrganizations: OrganizationProfile[];
  trust: TrustProfile;
  activity: ActivityEvent[];
  credentials: ProfileCredential[];
  network: ProfileNetwork;
  featuredWork: FeaturedWork[];
  endorsements: Endorsement[];
  claimVerifications: ClaimVerification[];
  followerCount: number;
  following: boolean;
}

export interface BuilderProfileView extends BuilderProfile {
  affiliatedOrganizations: OrganizationProfile[];
  trust: TrustProfile;
  activity: ActivityEvent[];
  credentials: ProfileCredential[];
  network: ProfileNetwork;
  featuredWork: FeaturedWork[];
  endorsements: Endorsement[];
  claimVerifications: ClaimVerification[];
  followerCount: number;
  following: boolean;
  verifiedDeploymentCount: number;
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
  agentSlug: string;
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

export type ProfileListRecord = ShortlistRecord;
export type EvaluationBrief = DecisionMemo;
