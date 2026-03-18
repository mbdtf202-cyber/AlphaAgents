import type {
  ActivityEvent,
  AgentProfileView,
  AgentRecord,
  BuilderProfile,
  BuilderProfileView,
  ClaimVerification,
  CompletenessCheck,
  Endorsement,
  FeaturedWork,
  LocalizedText,
  OrganizationProfile,
  ProfileBadge,
  ProfileCredential,
  ProfileSubjectType,
  RelationshipEdge,
  SessionActor,
  TrustProfile,
  TrustTier,
  VerifiedInstall,
  VerifiedReview,
} from "./types";
import { isVerifiedBenchmarkRun } from "./scoring";

function text(en: string, zh = en): LocalizedText {
  return { en, "zh-CN": zh };
}

function timestamp(value?: string) {
  return value ? new Date(value).getTime() : 0;
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
}

function sortByOccurredAt<T extends { occurredAt?: string; awardedAt?: string; createdAt?: string; issuedAt?: string; publishedAt?: string }>(items: T[]): T[] {
  return [...items].sort(
    (left, right) =>
      timestamp(right.occurredAt ?? right.awardedAt ?? right.createdAt ?? right.issuedAt ?? right.publishedAt) -
      timestamp(left.occurredAt ?? left.awardedAt ?? left.createdAt ?? left.issuedAt ?? left.publishedAt),
  );
}

function trustTierScore(tier: TrustTier): number {
  if (tier === "Established") {
    return 3;
  }
  if (tier === "Verified") {
    return 2;
  }
  return 1;
}

function average(numbers: number[]): number {
  if (numbers.length === 0) {
    return 0;
  }
  return numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
}

function isFollowing(actor: SessionActor | null | undefined, subjectType: ProfileSubjectType, subjectId: string, edges: RelationshipEdge[]): boolean {
  if (!actor) {
    return false;
  }
  return edges.some((edge) => {
    if (edge.type !== "follows" || edge.toType !== subjectType || edge.toId !== subjectId) {
      return false;
    }
    if (edge.fromType === "user" && edge.fromId === actor.userId) {
      return true;
    }
    return edge.fromType === "organization" && Boolean(actor.activeOrganizationId) && edge.fromId === actor.activeOrganizationId;
  });
}

function followerCount(subjectType: ProfileSubjectType, subjectId: string, edges: RelationshipEdge[]): number {
  return edges.filter((edge) => edge.type === "follows" && edge.toType === subjectType && edge.toId === subjectId).length;
}

function relatedOrganizations(
  subjectType: ProfileSubjectType,
  subjectId: string,
  organizations: OrganizationProfile[],
  edges: RelationshipEdge[],
): OrganizationProfile[] {
  const ids = edges
    .filter((edge) => {
      if (edge.type === "follows") {
        return false;
      }
      return (
        (edge.fromType === subjectType && edge.fromId === subjectId && edge.toType === "organization") ||
        (edge.toType === subjectType && edge.toId === subjectId && edge.fromType === "organization")
      );
    })
    .map((edge) => (edge.fromType === "organization" ? edge.fromId : edge.toId));
  return uniqueById(organizations.filter((organization) => ids.includes(organization.id)));
}

function relatedNetworkEdges(subjectType: ProfileSubjectType, subjectId: string, edges: RelationshipEdge[]): RelationshipEdge[] {
  return sortByOccurredAt(
    edges.filter((edge) => {
      if (edge.type === "follows") {
        return false;
      }
      return (edge.fromType === subjectType && edge.fromId === subjectId) || (edge.toType === subjectType && edge.toId === subjectId);
    }).map((edge) => ({ ...edge, occurredAt: edge.createdAt })),
  ).map(({ occurredAt: _occurredAt, ...edge }) => edge);
}

function buildAgentChecks(
  agent: AgentRecord,
  credentials: ProfileCredential[],
  activity: ActivityEvent[],
  featuredWork: FeaturedWork[],
): CompletenessCheck[] {
  return [
    {
      id: "identity-basics",
      label: text("Identity basics", "身份基础信息"),
      complete: Boolean(agent.name && agent.slug && agent.tagline.en && agent.summary.en),
    },
    {
      id: "install-source",
      label: text("Install source", "安装来源"),
      complete: Boolean(agent.source.url && agent.source.installCommand),
    },
    {
      id: "permission-manifest",
      label: text("Permission manifest", "权限清单"),
      complete: Boolean(agent.permissionManifest.summary.en && agent.permissionManifest.skills.length > 0 && agent.permissionManifest.riskLevel),
    },
    {
      id: "scope-and-limits",
      label: text("Scope and limits", "范围与限制"),
      complete: agent.useCases.length > 0 && agent.knownLimits.length > 0,
    },
    {
      id: "version-history",
      label: text("Version history", "版本历史"),
      complete: agent.versions.length > 0 && agent.versions.every((version) => version.changelog.length > 0),
    },
    {
      id: "verified-credential",
      label: text("Verified credential", "已验证凭证"),
      complete: credentials.some((credential) => credential.verified),
    },
    {
      id: "activity-or-work",
      label: text("Activity or featured work", "动态或代表作品"),
      complete: activity.length > 0 || featuredWork.length > 0,
    },
  ];
}

function buildBuilderChecks(
  builder: BuilderProfile,
  credentials: ProfileCredential[],
  activity: ActivityEvent[],
  featuredWork: FeaturedWork[],
  publishedAgentSlugs: string[],
): CompletenessCheck[] {
  return [
    {
      id: "identity-basics",
      label: text("Identity basics", "身份基础信息"),
      complete: Boolean(builder.name && builder.handle && builder.headline.en && builder.bio.en),
    },
    {
      id: "install-source",
      label: text("Published profile surface", "已发布公开档案"),
      complete: publishedAgentSlugs.length > 0,
    },
    {
      id: "permission-manifest",
      label: text("Permission-backed output", "权限支撑的输出"),
      complete: credentials.some((credential) => credential.type === "benchmark" || credential.type === "deployment"),
    },
    {
      id: "scope-and-limits",
      label: text("Specialties and working style", "专长与工作风格"),
      complete: builder.specialties.length > 0 && Boolean(builder.bio.en),
    },
    {
      id: "version-history",
      label: text("Version history", "版本历史"),
      complete: activity.some((entry) => entry.type === "version-published"),
    },
    {
      id: "verified-credential",
      label: text("Verified credential", "已验证凭证"),
      complete: credentials.some((credential) => credential.verified),
    },
    {
      id: "activity-or-work",
      label: text("Activity or featured work", "动态或代表作品"),
      complete: activity.length > 0 || featuredWork.length > 0,
    },
  ];
}

function buildTrustProfile(
  checks: CompletenessCheck[],
  primaryBadges: ProfileBadge[],
  verifiedClaimTypes: Set<string>,
  disputedClaimCount: number,
  followerCountValue: number,
  lastVerifiedEventAt?: string,
): TrustProfile {
  const completenessPercent = Math.round((checks.filter((check) => check.complete).length / checks.length) * 100);
  let tier: TrustTier = "Emerging";

  if (verifiedClaimTypes.size >= 1 && disputedClaimCount === 0) {
    tier = "Verified";
  }
  if (completenessPercent >= 86 && verifiedClaimTypes.size >= 2 && disputedClaimCount === 0) {
    tier = "Established";
  }

  return {
    tier,
    completenessPercent,
    checks,
    primaryBadges: primaryBadges.slice(0, 4),
    verifiedClaimCount: verifiedClaimTypes.size,
    disputedClaimCount,
    followerCount: followerCountValue,
    lastVerifiedEventAt,
  };
}

function badge(id: string, type: ProfileBadge["type"], label: LocalizedText, description: LocalizedText, awardedAt: string, provenance?: ProfileBadge["provenance"]): ProfileBadge {
  return { id, type, label, description, awardedAt, provenance };
}

function buildAgentCredentials(
  agent: AgentRecord,
  installs: VerifiedInstall[],
  reviews: VerifiedReview[],
  claims: ClaimVerification[],
): ProfileCredential[] {
  const benchmarkCredentials = agent.versions.flatMap((version) =>
    version.benchmarkRuns.filter(isVerifiedBenchmarkRun).map((run) => ({
      id: `credential-${agent.slug}-${run.id}`,
      type: "benchmark" as const,
      title: text(`Benchmark credential: ${run.suiteSlug}`, `基准凭证：${run.suiteSlug}`),
      summary: run.notes,
      issuedAt: run.evaluatedAt,
      verified: true,
      badgeType: "benchmark-credential" as const,
      relatedUrl: `/benchmarks/${run.suiteSlug}`,
      relatedVersionId: version.id,
      relatedSuiteSlug: run.suiteSlug,
      score: run.scorecard.overall,
      rank: run.publicRank,
      provenance: run.provenance,
    })),
  );
  const deploymentCredentials = installs.map((install) => ({
    id: `credential-install-${install.id}`,
    type: "deployment" as const,
    title: text("Verified deployment", "已验证部署"),
    summary: text(`Deployment proof recorded for ${agent.name}.`, `${agent.name} 的部署证明已记录。`),
    issuedAt: install.verifiedAt,
    verified: true,
    badgeType: "verified-deployment" as const,
    relatedVersionId: install.versionId,
    provenance: install.provenance,
  }));
  const reviewCredentials = reviews.map((review) => ({
    id: `credential-review-${review.id}`,
    type: "review" as const,
    title: review.headline,
    summary: review.body,
    issuedAt: review.createdAt,
    verified: true,
    badgeType: "versioned-reviews" as const,
    relatedVersionId: review.versionId,
    score: review.rating,
    provenance: review.provenance,
  }));
  const claimCredentials = claims.map((claim) => ({
    id: `credential-claim-${claim.id}`,
    type: "claim" as const,
    title: claim.label,
    summary: claim.summary,
    issuedAt: claim.verifiedAt ?? "1970-01-01T00:00:00.000Z",
    verified: claim.status === "verified",
    relatedUrl: claim.evidenceUrl,
    relatedVersionId: claim.relatedVersionId,
    provenance: claim.provenance,
  }));

  return sortByOccurredAt([...benchmarkCredentials, ...deploymentCredentials, ...reviewCredentials, ...claimCredentials].map((credential) => ({
    ...credential,
    occurredAt: credential.issuedAt,
  }))).map(({ occurredAt: _occurredAt, ...credential }) => credential);
}

function buildBuilderCredentials(
  builder: BuilderProfile,
  builtAgents: AgentProfileView[],
  claims: ClaimVerification[],
): ProfileCredential[] {
  const benchmarkWins = builtAgents.flatMap((agent) => agent.credentials.filter((credential) => credential.type === "benchmark"));
  const deploymentProofs = builtAgents.flatMap((agent) => agent.credentials.filter((credential) => credential.type === "deployment"));
  const claimCredentials = claims.map((claim) => ({
    id: `credential-claim-${claim.id}`,
    type: "claim" as const,
    title: claim.label,
    summary: claim.summary,
    issuedAt: claim.verifiedAt ?? "1970-01-01T00:00:00.000Z",
    verified: claim.status === "verified",
    relatedUrl: claim.evidenceUrl,
    provenance: claim.provenance,
  }));

  return sortByOccurredAt([...benchmarkWins, ...deploymentProofs, ...claimCredentials].map((credential) => ({
    ...credential,
    occurredAt: credential.issuedAt,
  }))).map(({ occurredAt: _occurredAt, ...credential }) => credential);
}

function buildAgentBadges(
  agent: AgentRecord,
  reviews: VerifiedReview[],
  installs: VerifiedInstall[],
  completenessPercent: number,
  benchmarkAt?: string,
): ProfileBadge[] {
  const badges: ProfileBadge[] = [];

  if (agent.verificationStatus === "verified") {
    badges.push(
      badge(
        `badge-${agent.slug}-identity`,
        "identity-verified",
        text("Identity verified", "身份已验证"),
        text("Public source and profile identity were verified.", "公开来源与档案身份已完成验证。"),
        agent.versions[0]?.releasedAt ?? new Date().toISOString(),
        agent.provenance,
      ),
    );
  }
  if (agent.permissionManifest.skills.length > 0) {
    badges.push(
      badge(
        `badge-${agent.slug}-permissions`,
        "permissions-declared",
        text("Permissions declared", "权限已声明"),
        text("Skills, network surfaces, file scope, and risk are declared.", "技能、网络面、文件范围与风险等级都已声明。"),
        agent.versions[0]?.releasedAt ?? new Date().toISOString(),
        agent.provenance,
      ),
    );
  }
  if (reviews.length > 0) {
    badges.push(
      badge(
        `badge-${agent.slug}-reviews`,
        "versioned-reviews",
        text("Version-scoped reviews", "版本绑定评价"),
        text("The profile has reviews tied to verified installs and explicit versions.", "该档案已有绑定已验证安装和明确版本的评价。"),
        reviews[0]!.createdAt,
        agent.provenance,
      ),
    );
  }
  if (benchmarkAt) {
    badges.push(
      badge(
        `badge-${agent.slug}-benchmark`,
        "benchmark-credential",
        text("Benchmark credential", "基准凭证"),
        text("The profile includes public benchmark-backed credentials.", "该档案包含基于公开 benchmark 的凭证。"),
        benchmarkAt,
        agent.provenance,
      ),
    );
  }
  if (installs.length > 0) {
    badges.push(
      badge(
        `badge-${agent.slug}-deployment`,
        "verified-deployment",
        text("Verified deployment", "已验证部署"),
        text("This profile includes at least one verified deployment proof.", "该档案至少包含一条已验证部署证明。"),
        installs[0]!.verifiedAt,
        agent.provenance,
      ),
    );
  }
  if (completenessPercent === 100) {
    badges.push(
      badge(
        `badge-${agent.slug}-complete`,
        "profile-complete",
        text("Profile complete", "档案完整"),
        text("The public profile covers identity, permissions, versions, credentials, and work evidence.", "该公开档案覆盖了身份、权限、版本、凭证和作品证据。"),
        agent.versions[0]?.releasedAt ?? new Date().toISOString(),
        agent.provenance,
      ),
    );
  }

  return badges;
}

function buildBuilderBadges(
  builder: BuilderProfile,
  credentials: ProfileCredential[],
  completenessPercent: number,
): ProfileBadge[] {
  const badges: ProfileBadge[] = [];
  const latestCredentialAt = credentials[0]?.issuedAt ?? new Date().toISOString();

  if (credentials.some((credential) => credential.type === "claim" && credential.verified)) {
    badges.push(
      badge(
        `badge-${builder.handle}-identity`,
        "identity-verified",
        text("Identity verified", "身份已验证"),
        text("This builder has at least one verified identity or affiliation claim.", "该 Builder 至少有一项已验证身份或关联声明。"),
        latestCredentialAt,
        builder.provenance,
      ),
    );
  }
  if (credentials.some((credential) => credential.type === "benchmark")) {
    badges.push(
      badge(
        `badge-${builder.handle}-benchmark`,
        "benchmark-credential",
        text("Benchmark-backed output", "基准支撑输出"),
        text("Published agents from this builder carry benchmark credentials.", "该 Builder 发布的 Agent 具备 benchmark 凭证。"),
        latestCredentialAt,
        builder.provenance,
      ),
    );
  }
  if (credentials.some((credential) => credential.type === "deployment")) {
    badges.push(
      badge(
        `badge-${builder.handle}-deployment`,
        "verified-deployment",
        text("Verified deployments", "已验证部署"),
        text("Published agents from this builder have verified deployment proofs.", "该 Builder 发布的 Agent 已有验证部署证明。"),
        latestCredentialAt,
        builder.provenance,
      ),
    );
  }
  if (completenessPercent === 100) {
    badges.push(
      badge(
        `badge-${builder.handle}-complete`,
        "profile-complete",
        text("Profile complete", "档案完整"),
        text("The public builder profile includes work history, credentials, activity, and network proof.", "该 Builder 档案已包含作品经历、凭证、动态和网络证明。"),
        latestCredentialAt,
        builder.provenance,
      ),
    );
  }

  return badges;
}

function buildAgentActivity(
  agent: AgentRecord,
  badges: ProfileBadge[],
  installs: VerifiedInstall[],
  reviews: VerifiedReview[],
  claims: ClaimVerification[],
  endorsements: Endorsement[],
  featuredWork: FeaturedWork[],
): ActivityEvent[] {
  const versionEvents = agent.versions.map((version) => ({
    id: `activity-version-${version.id}`,
    type: "version-published" as const,
    subjectType: "agent" as const,
    subjectId: agent.id,
    occurredAt: version.releasedAt,
    title: text(`Released v${version.version}`, `发布 v${version.version}`),
    summary: version.changelog[0] ?? text(`${agent.name} published a new version.`, `${agent.name} 发布了一个新版本。`),
    verified: version.status === "verified",
    relatedVersionId: version.id,
    relatedAgentSlug: agent.slug,
    provenance: version.provenance,
  }));
  const benchmarkEvents = agent.versions.flatMap((version) =>
    version.benchmarkRuns.filter(isVerifiedBenchmarkRun).map((run) => ({
      id: `activity-benchmark-${run.id}`,
      type: "benchmark-completed" as const,
      subjectType: "agent" as const,
      subjectId: agent.id,
      occurredAt: run.evaluatedAt,
      title: text(`Earned benchmark credential in ${run.suiteSlug}`, `在 ${run.suiteSlug} 中获得基准凭证`),
      summary: run.notes,
      verified: true,
      relatedUrl: `/benchmarks/${run.suiteSlug}`,
      relatedVersionId: version.id,
      relatedAgentSlug: agent.slug,
      provenance: run.provenance,
    })),
  );
  const installEvents = installs.map((install) => ({
    id: `activity-install-${install.id}`,
    type: "install-verified" as const,
    subjectType: "agent" as const,
    subjectId: agent.id,
    occurredAt: install.verifiedAt,
    title: text("Verified deployment recorded", "记录了一次已验证部署"),
    summary: text(`A deployment proof was recorded for ${agent.name}.`, `${agent.name} 新增了一条部署证明。`),
    verified: true,
    relatedVersionId: install.versionId,
    relatedAgentSlug: agent.slug,
    provenance: install.provenance,
  }));
  const reviewEvents = reviews.map((review) => ({
    id: `activity-review-${review.id}`,
    type: "review-published" as const,
    subjectType: "agent" as const,
    subjectId: agent.id,
    occurredAt: review.createdAt,
    title: text("Published a verified review", "发布了一条已验证评价"),
    summary: review.headline,
    verified: true,
    relatedVersionId: review.versionId,
    relatedAgentSlug: agent.slug,
    provenance: review.provenance,
  }));
  const claimEvents = claims
    .filter((claim) => claim.verifiedAt)
    .map((claim) => ({
      id: `activity-claim-${claim.id}`,
      type: claim.claimType === "affiliation" || claim.claimType === "deployment" ? ("adoption-verified" as const) : ("badge-awarded" as const),
      subjectType: "agent" as const,
      subjectId: agent.id,
      occurredAt: claim.verifiedAt!,
      title: claim.label,
      summary: claim.summary,
      verified: claim.status === "verified",
      relatedUrl: claim.evidenceUrl,
      relatedVersionId: claim.relatedVersionId,
      relatedAgentSlug: agent.slug,
      provenance: claim.provenance,
    }));
  const badgeEvents = badges.map((entry) => ({
    id: `activity-badge-${entry.id}`,
    type: "badge-awarded" as const,
    subjectType: "agent" as const,
    subjectId: agent.id,
    occurredAt: entry.awardedAt,
    title: entry.label,
    summary: entry.description,
    verified: true,
    relatedAgentSlug: agent.slug,
    provenance: entry.provenance,
  }));
  const endorsementEvents = endorsements.map((endorsement) => ({
    id: `activity-endorsement-${endorsement.id}`,
    type: "endorsement-received" as const,
    subjectType: "agent" as const,
    subjectId: agent.id,
    occurredAt: endorsement.createdAt,
    title: text(`Received endorsement from ${endorsement.authorName}`, `获得来自 ${endorsement.authorName} 的背书`),
    summary: endorsement.body,
    verified: endorsement.verified,
    relatedAgentSlug: agent.slug,
    provenance: endorsement.provenance,
  }));
  const workEvents = featuredWork.map((work) => ({
    id: `activity-work-${work.id}`,
    type: "featured-work-added" as const,
    subjectType: "agent" as const,
    subjectId: agent.id,
    occurredAt: work.publishedAt,
    title: work.title,
    summary: work.summary,
    verified: work.verified,
    relatedUrl: work.artifactUrl,
    relatedAgentSlug: agent.slug,
    provenance: work.provenance,
  }));

  return sortByOccurredAt([
    ...versionEvents,
    ...benchmarkEvents,
    ...installEvents,
    ...reviewEvents,
    ...claimEvents,
    ...badgeEvents,
    ...endorsementEvents,
    ...workEvents,
  ]);
}

function buildBuilderActivity(
  builder: BuilderProfile,
  builtAgents: AgentProfileView[],
  badges: ProfileBadge[],
  claims: ClaimVerification[],
  endorsements: Endorsement[],
  featuredWork: FeaturedWork[],
): ActivityEvent[] {
  const agentVersionEvents = builtAgents.flatMap((agent) =>
    agent.activity
      .filter((entry) => entry.type === "version-published" || entry.type === "benchmark-completed" || entry.type === "install-verified")
      .map((entry) => ({
        ...entry,
        id: `builder-${builder.handle}-${entry.id}`,
        subjectType: "builder" as const,
        subjectId: builder.id,
        relatedBuilderHandle: builder.handle,
      })),
  );
  const claimEvents = claims
    .filter((claim) => claim.verifiedAt)
    .map((claim) => ({
      id: `activity-claim-${claim.id}`,
      type: "badge-awarded" as const,
      subjectType: "builder" as const,
      subjectId: builder.id,
      occurredAt: claim.verifiedAt!,
      title: claim.label,
      summary: claim.summary,
      verified: claim.status === "verified",
      relatedBuilderHandle: builder.handle,
      relatedUrl: claim.evidenceUrl,
      provenance: claim.provenance,
    }));
  const badgeEvents = badges.map((entry) => ({
    id: `activity-badge-${entry.id}`,
    type: "badge-awarded" as const,
    subjectType: "builder" as const,
    subjectId: builder.id,
    occurredAt: entry.awardedAt,
    title: entry.label,
    summary: entry.description,
    verified: true,
    relatedBuilderHandle: builder.handle,
    provenance: entry.provenance,
  }));
  const endorsementEvents = endorsements.map((endorsement) => ({
    id: `activity-endorsement-${endorsement.id}`,
    type: "endorsement-received" as const,
    subjectType: "builder" as const,
    subjectId: builder.id,
    occurredAt: endorsement.createdAt,
    title: text(`Received endorsement from ${endorsement.authorName}`, `获得来自 ${endorsement.authorName} 的背书`),
    summary: endorsement.body,
    verified: endorsement.verified,
    relatedBuilderHandle: builder.handle,
    provenance: endorsement.provenance,
  }));
  const workEvents = featuredWork.map((work) => ({
    id: `activity-work-${work.id}`,
    type: "featured-work-added" as const,
    subjectType: "builder" as const,
    subjectId: builder.id,
    occurredAt: work.publishedAt,
    title: work.title,
    summary: work.summary,
    verified: work.verified,
    relatedBuilderHandle: builder.handle,
    relatedUrl: work.artifactUrl,
    provenance: work.provenance,
  }));

  return sortByOccurredAt([...agentVersionEvents, ...claimEvents, ...badgeEvents, ...endorsementEvents, ...workEvents]);
}

function relatedItems<T extends { subjectType: ProfileSubjectType; subjectId: string }>(items: T[], subjectType: ProfileSubjectType, subjectId: string): T[] {
  return items.filter((item) => item.subjectType === subjectType && item.subjectId === subjectId);
}

export function hydratePublicCatalog(input: {
  agents: AgentRecord[];
  builders: BuilderProfile[];
  organizations: OrganizationProfile[];
  relationshipEdges: RelationshipEdge[];
  claimVerifications: ClaimVerification[];
  endorsements: Endorsement[];
  featuredWork: FeaturedWork[];
  verifiedInstalls: VerifiedInstall[];
  verifiedReviews: VerifiedReview[];
  actor?: SessionActor | null;
}) {
  const actor = input.actor ?? null;

  const hydratedAgents: AgentProfileView[] = input.agents.map((agent) => {
    const installs = input.verifiedInstalls.filter((install) => install.agentSlug === agent.slug);
    const reviews = input.verifiedReviews.filter((review) => review.agentSlug === agent.slug);
    const claims = relatedItems(input.claimVerifications, "agent", agent.id);
    const featuredWork = relatedItems(input.featuredWork, "agent", agent.id);
    const endorsements = relatedItems(input.endorsements, "agent", agent.id);
    const affiliatedOrganizations = relatedOrganizations("agent", agent.id, input.organizations, input.relationshipEdges);
    const preliminaryChecks = buildAgentChecks(agent, [], [], featuredWork);
    const preliminaryPercent = Math.round((preliminaryChecks.filter((check) => check.complete).length / preliminaryChecks.length) * 100);
    const benchmarkAt = agent.versions
      .flatMap((version) => version.benchmarkRuns)
      .filter(isVerifiedBenchmarkRun)
      .sort((left, right) => timestamp(right.evaluatedAt) - timestamp(left.evaluatedAt))[0]?.evaluatedAt;
    const primaryBadges = buildAgentBadges(agent, reviews, installs, preliminaryPercent, benchmarkAt);
    const credentials = buildAgentCredentials(agent, installs, reviews, claims);
    const activity = buildAgentActivity(agent, primaryBadges, installs, reviews, claims, endorsements, featuredWork);
    const checks = buildAgentChecks(agent, credentials, activity, featuredWork);
    const verifiedClaimTypes = new Set<string>();
    if (agent.versions.some((version) => version.benchmarkRuns.some(isVerifiedBenchmarkRun))) {
      verifiedClaimTypes.add("benchmark");
    }
    if (installs.length > 0) {
      verifiedClaimTypes.add("deployment");
    }
    if (reviews.length > 0) {
      verifiedClaimTypes.add("capability");
    }
    claims.filter((claim) => claim.status === "verified").forEach((claim) => verifiedClaimTypes.add(claim.claimType));
    const disputedClaimCount = claims.filter((claim) => claim.status === "disputed").length;
    const trust = buildTrustProfile(
      checks,
      buildAgentBadges(
        agent,
        reviews,
        installs,
        Math.round((checks.filter((check) => check.complete).length / checks.length) * 100),
        benchmarkAt,
      ),
      verifiedClaimTypes,
      disputedClaimCount,
      followerCount("agent", agent.id, input.relationshipEdges),
      activity.find((entry) => entry.verified)?.occurredAt,
    );

    return {
      ...agent,
      reviews,
      affiliatedOrganizations,
      trust,
      activity,
      credentials,
      network: {
        organizations: affiliatedOrganizations,
        edges: relatedNetworkEdges("agent", agent.id, input.relationshipEdges),
      },
      featuredWork,
      endorsements,
      claimVerifications: claims,
      followerCount: trust.followerCount,
      following: isFollowing(actor, "agent", agent.id, input.relationshipEdges),
    };
  });

  const hydratedBuilders: BuilderProfileView[] = input.builders.map((builder) => {
    const builtAgents = hydratedAgents.filter((agent) => agent.builderHandle === builder.handle);
    const claims = relatedItems(input.claimVerifications, "builder", builder.id);
    const featuredWork = relatedItems(input.featuredWork, "builder", builder.id);
    const endorsements = relatedItems(input.endorsements, "builder", builder.id);
    const affiliatedOrganizations = relatedOrganizations("builder", builder.id, input.organizations, input.relationshipEdges);
    const credentials = buildBuilderCredentials(builder, builtAgents, claims);
    const initialChecks = buildBuilderChecks(builder, credentials, [], featuredWork, builtAgents.map((agent) => agent.slug));
    const initialPercent = Math.round((initialChecks.filter((check) => check.complete).length / initialChecks.length) * 100);
    const primaryBadges = buildBuilderBadges(builder, credentials, initialPercent);
    const activity = buildBuilderActivity(builder, builtAgents, primaryBadges, claims, endorsements, featuredWork);
    const checks = buildBuilderChecks(builder, credentials, activity, featuredWork, builtAgents.map((agent) => agent.slug));
    const verifiedClaimTypes = new Set<string>();
    if (builtAgents.some((agent) => agent.credentials.some((credential) => credential.type === "benchmark"))) {
      verifiedClaimTypes.add("benchmark");
    }
    if (builtAgents.some((agent) => agent.credentials.some((credential) => credential.type === "deployment"))) {
      verifiedClaimTypes.add("deployment");
    }
    claims.filter((claim) => claim.status === "verified").forEach((claim) => verifiedClaimTypes.add(claim.claimType));
    const trust = buildTrustProfile(
      checks,
      buildBuilderBadges(
        builder,
        credentials,
        Math.round((checks.filter((check) => check.complete).length / checks.length) * 100),
      ),
      verifiedClaimTypes,
      claims.filter((claim) => claim.status === "disputed").length,
      followerCount("builder", builder.id, input.relationshipEdges),
      activity.find((entry) => entry.verified)?.occurredAt,
    );

    return {
      ...builder,
      publishedAgentSlugs: builtAgents.map((agent) => agent.slug),
      affiliatedOrganizations,
      trust,
      activity,
      credentials,
      network: {
        organizations: affiliatedOrganizations,
        edges: relatedNetworkEdges("builder", builder.id, input.relationshipEdges),
      },
      featuredWork,
      endorsements,
      claimVerifications: claims,
      followerCount: trust.followerCount,
      following: isFollowing(actor, "builder", builder.id, input.relationshipEdges),
      verifiedDeploymentCount: builtAgents.filter((agent) =>
        agent.credentials.some((credential) => credential.type === "deployment" && credential.verified),
      ).length,
      benchmarkWins: builtAgents
        .flatMap((agent) => agent.versions)
        .flatMap((version) => version.benchmarkRuns)
        .filter((run) => isVerifiedBenchmarkRun(run) && run.publicRank === 1).length,
      verifiedReviewCount: builtAgents.reduce((sum, agent) => sum + agent.reviews.length, 0),
    };
  });

  return {
    agents: hydratedAgents,
    builders: hydratedBuilders,
    organizations: input.organizations,
  };
}

export function sortAgentProfiles(agents: AgentProfileView[]): AgentProfileView[] {
  return [...agents].sort((left, right) => {
    const trustDelta = trustTierScore(right.trust.tier) - trustTierScore(left.trust.tier);
    if (trustDelta !== 0) {
      return trustDelta;
    }
    const completenessDelta = right.trust.completenessPercent - left.trust.completenessPercent;
    if (completenessDelta !== 0) {
      return completenessDelta;
    }
    const activityDelta = timestamp(right.trust.lastVerifiedEventAt) - timestamp(left.trust.lastVerifiedEventAt);
    if (activityDelta !== 0) {
      return activityDelta;
    }
    const reviewDelta = average(right.reviews.map((review) => review.rating)) - average(left.reviews.map((review) => review.rating));
    if (reviewDelta !== 0) {
      return reviewDelta > 0 ? 1 : -1;
    }
    const benchmarkDelta =
      average(
        right.versions.flatMap((version) =>
          version.benchmarkRuns.filter(isVerifiedBenchmarkRun).map((run) => run.scorecard.overall),
        ),
      ) -
      average(
        left.versions.flatMap((version) =>
          version.benchmarkRuns.filter(isVerifiedBenchmarkRun).map((run) => run.scorecard.overall),
        ),
      );
    if (benchmarkDelta !== 0) {
      return benchmarkDelta > 0 ? 1 : -1;
    }
    const riskOrder = { low: 0, medium: 1, high: 2 } as const;
    return riskOrder[left.permissionManifest.riskLevel] - riskOrder[right.permissionManifest.riskLevel];
  });
}

export function sortBuilderProfiles(builders: BuilderProfileView[]): BuilderProfileView[] {
  return [...builders].sort((left, right) => {
    const trustDelta = trustTierScore(right.trust.tier) - trustTierScore(left.trust.tier);
    if (trustDelta !== 0) {
      return trustDelta;
    }
    const deploymentDelta = right.verifiedDeploymentCount - left.verifiedDeploymentCount;
    if (deploymentDelta !== 0) {
      return deploymentDelta;
    }
    const reviewDelta = right.verifiedReviewCount - left.verifiedReviewCount;
    if (reviewDelta !== 0) {
      return reviewDelta;
    }
    const activityDelta = timestamp(right.trust.lastVerifiedEventAt) - timestamp(left.trust.lastVerifiedEventAt);
    if (activityDelta !== 0) {
      return activityDelta;
    }
    return right.followerCount - left.followerCount;
  });
}
