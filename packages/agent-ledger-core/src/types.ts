export type Locale = "en" | "zh-CN";

export interface LocalizedText {
  en: string;
  "zh-CN": string;
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
  scorecard: BenchmarkScorecard;
  notes: LocalizedText;
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
}

export interface VerifiedInstall {
  id: string;
  agentSlug: string;
  versionId: string;
  verificationToken: string;
  packageHash: string;
  anonymousRuntimeFingerprint: string;
  verifiedAt: string;
}

export interface Collection {
  id: string;
  name: LocalizedText;
  owner: string;
  agentSlugs: string[];
  buyerType: "individual" | "team" | "enterprise";
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
}

export interface FeatureSlot {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  agentSlug: string;
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
