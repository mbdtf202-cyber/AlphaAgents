import { createHash } from "node:crypto";

import { getBenchmarkQueue, stopBoss } from "@openclaw/alpha-agents-runner";
import { agentRecords, agentSources, agentVersions, authAccounts, authSessions, builderProfiles, magicLinkChallenges, permissionManifests, users } from "@openclaw/alpha-agents-core/db/schema";
import type { SessionActor } from "@openclaw/alpha-agents-core";
import { sql } from "drizzle-orm";

import { ensurePlatformBootstrap, resetPlatformBootstrap } from "../../lib/server/bootstrap";
import { closeDb, getDb, runMigrations } from "../../lib/server/db";
import { closeRateLimitPool } from "../../lib/server/rate-limit";

export const POSTGRES_FIXTURE = {
  builderProfileId: "11111111-1111-4111-8111-111111111111",
  agentId: "22222222-2222-4222-8222-222222222222",
  versionId: "33333333-3333-4333-8333-333333333333",
  builderSessionToken: "builder-session-token",
  buyerSessionToken: "buyer-session-token",
  builderMagicToken: "builder-magic-link-token",
  buyerMagicToken: "buyer-magic-link-token",
  builderEmail: "builder@example.com",
  buyerEmail: "buyer@example.com",
  builderHandle: "releasebuilder",
  agentSlug: "release-swe-agent",
  agentName: "Release SWE Agent",
  githubAccountId: "github-release-builder-1",
};

export function setPostgresTestEnv() {
  if (!process.env.DATABASE_URL) {
    return false;
  }

  (process.env as Record<string, string | undefined>).NODE_ENV = process.env.NODE_ENV || "test";
  process.env.ALPHA_AGENTS_STORAGE = process.env.ALPHA_AGENTS_STORAGE || "postgres";
  process.env.ALPHA_AGENTS_AUTH_SECRET = process.env.ALPHA_AGENTS_AUTH_SECRET || "test-secret";
  process.env.ALPHA_AGENTS_APP_URL = process.env.ALPHA_AGENTS_APP_URL || "http://127.0.0.1:3100";
  process.env.NEXT_PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.ALPHA_AGENTS_APP_URL;
  process.env.GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "github-client-id";
  process.env.GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "github-client-secret";
  process.env.POSTMARK_SERVER_TOKEN = process.env.POSTMARK_SERVER_TOKEN || "postmark-token";
  process.env.POSTMARK_FROM_EMAIL = process.env.POSTMARK_FROM_EMAIL || "noreply@example.com";
  process.env.POSTMARK_MESSAGE_STREAM = process.env.POSTMARK_MESSAGE_STREAM || "outbound";
  process.env.SENTRY_DSN = process.env.SENTRY_DSN || "https://public@example.ingest.sentry.io/1";
  process.env.SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || "test";
  process.env.SENTRY_RELEASE = process.env.SENTRY_RELEASE || "v0.5.0-rc.3-test";
  process.env.ALPHA_AGENTS_ENABLE_TEST_MAILER = process.env.ALPHA_AGENTS_ENABLE_TEST_MAILER || "true";

  return true;
}

export async function migrateAndResetPostgres() {
  await runMigrations();
  await resetPostgresState();
}

export async function resetPostgresState() {
  if (!process.env.DATABASE_URL) {
    return;
  }

  try {
    const boss = await getBenchmarkQueue(process.env.DATABASE_URL);
    await boss.deleteAllJobs("benchmark-runs");
  } catch {
    // Queue may not exist yet on the first migration pass.
  } finally {
    await stopBoss(process.env.DATABASE_URL);
  }

  const db = getDb();
  const tables = [
    "alpha_agents_rate_limit_buckets",
    "alpha_agents_service_heartbeats",
    "alpha_agents_benchmark_scorecards",
    "alpha_agents_benchmark_artifacts",
    "alpha_agents_benchmark_requests",
    "alpha_agents_benchmark_runs",
    "alpha_agents_benchmark_tasks",
    "alpha_agents_benchmark_suites",
    "alpha_agents_verified_reviews",
    "alpha_agents_verified_installs",
    "alpha_agents_relationship_edges",
    "alpha_agents_decision_memos",
    "alpha_agents_shortlists",
    "alpha_agents_submissions",
    "alpha_agents_moderation_cases",
    "alpha_agents_featured_work",
    "alpha_agents_endorsements",
    "alpha_agents_claim_verifications",
    "alpha_agents_agent_versions",
    "alpha_agents_permission_manifests",
    "alpha_agents_agent_sources",
    "alpha_agents_agents",
    "alpha_agents_builder_profiles",
    "alpha_agents_magic_link_challenges",
    "alpha_agents_auth_sessions",
    "alpha_agents_auth_accounts",
    "alpha_agents_organization_memberships",
    "alpha_agents_organizations",
    "alpha_agents_users",
    "alpha_agents_audit_logs",
  ];
  await db.execute(sql.raw(`TRUNCATE TABLE ${tables.map((table) => `"${table}"`).join(", ")} RESTART IDENTITY CASCADE`));
  resetPlatformBootstrap();
  await ensurePlatformBootstrap();
}

export async function resetRateLimitBuckets() {
  await getDb().execute(sql.raw('TRUNCATE TABLE "alpha_agents_rate_limit_buckets"'));
}

export async function seedLiveAgentFixture() {
  const db = getDb();
  const [user] = await db
    .insert(users)
    .values({
      email: POSTGRES_FIXTURE.builderEmail,
      githubHandle: POSTGRES_FIXTURE.builderHandle,
      role: "builder",
    })
    .returning();

  await db.insert(authAccounts).values({
    userId: user!.id,
    provider: "github",
    providerAccountId: POSTGRES_FIXTURE.githubAccountId,
    email: POSTGRES_FIXTURE.builderEmail,
    profile: { name: "Release Builder" },
  });

  const rawSessionToken = POSTGRES_FIXTURE.builderSessionToken;
  const [session] = await db
    .insert(authSessions)
    .values({
      userId: user!.id,
      tokenHash: hashSessionToken(rawSessionToken),
      role: "builder",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    })
    .returning();

  const actor: SessionActor = {
    sessionId: session!.id,
    userId: user!.id,
    email: user!.email,
    role: "builder",
    githubHandle: user!.githubHandle ?? undefined,
    memberships: [],
  };

  const [builderProfile] = await db
    .insert(builderProfiles)
    .values({
      id: POSTGRES_FIXTURE.builderProfileId,
      userId: user!.id,
      handle: POSTGRES_FIXTURE.builderHandle,
      name: "Release Builder",
      kind: "studio",
      headline: {
        en: "Release hardening builder profile.",
        "zh-CN": "发布加固 Builder 档案。",
      },
      bio: {
        en: "Owns the live release fixture used by CI and smoke tests.",
        "zh-CN": "负责 CI 和烟测使用的 live 发布夹具。",
      },
      specialties: ["release", "benchmarking"],
    })
    .returning();

  const [agent] = await db
    .insert(agentRecords)
    .values({
      id: POSTGRES_FIXTURE.agentId,
      builderProfileId: builderProfile!.id,
      ownerUserId: user!.id,
      slug: POSTGRES_FIXTURE.agentSlug,
      name: POSTGRES_FIXTURE.agentName,
      status: "verified",
      tagline: {
        en: "Live fixture for release hardening.",
        "zh-CN": "用于发布加固的 live 夹具。",
      },
      summary: {
        en: "A live test fixture agent used to verify publish, install, review, follow, and benchmark workflows.",
        "zh-CN": "一个用于验证发布、安装、评价、关注和 benchmark 工作流的 live 测试夹具 Agent。",
      },
      categories: ["coding", "release"],
      searchDocument: "release swe agent live fixture",
    })
    .returning();

  await db.insert(agentSources).values({
    agentId: agent!.id,
    kind: "github",
    label: "GitHub",
    url: "https://github.com/openclaw/release-swe-agent",
    installCommand: "git clone https://github.com/openclaw/release-swe-agent",
  });

  await db.insert(permissionManifests).values({
    agentId: agent!.id,
    summary: {
      en: "Release fixture permissions.",
      "zh-CN": "发布夹具权限。",
    },
    skills: ["software-architecture", "playwright"],
    secrets: [],
    networkAccess: ["api.github.com"],
    fileAccess: ["workspace read/write"],
    shellAccess: 1,
    automationHooks: 0,
    riskLevel: "medium",
  });

  const [version] = await db
    .insert(agentVersions)
    .values({
      id: POSTGRES_FIXTURE.versionId,
      agentId: agent!.id,
      version: "1.0.0",
      bundleHash: "sha256:release-swe-agent-100",
      status: "verified",
      releasedAt: new Date("2026-03-18T00:00:00.000Z"),
      changelog: [
        {
          en: "Initial release candidate fixture.",
          "zh-CN": "初始候选版夹具。",
        },
      ],
    })
    .returning();

  return {
    actor,
    rawSessionToken,
    builderHandle: builderProfile!.handle,
    agentId: agent!.id,
    agentSlug: agent!.slug,
    versionId: version!.id,
  };
}

export async function createBuyerSession() {
  const db = getDb();
  const [user] = await db
    .insert(users)
    .values({
      email: POSTGRES_FIXTURE.buyerEmail,
      role: "buyer",
    })
    .returning();

  const rawSessionToken = POSTGRES_FIXTURE.buyerSessionToken;
  const [session] = await db
    .insert(authSessions)
    .values({
      userId: user!.id,
      tokenHash: hashSessionToken(rawSessionToken),
      role: "buyer",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    })
    .returning();

  const actor: SessionActor = {
    sessionId: session!.id,
    userId: user!.id,
    email: user!.email,
    role: "buyer",
    memberships: [],
  };

  return {
    actor,
    rawSessionToken,
    redirectTo: "/workspace",
  };
}

export async function createMagicLinkChallenge(email: string, role: "buyer" | "builder", rawToken: string) {
  await getDb().insert(magicLinkChallenges).values({
    email,
    role,
    redirectTo: "/workspace",
    tokenHash: hashSessionToken(rawToken),
    expiresAt: new Date(Date.now() + 1000 * 60 * 15),
  });
}

export async function closePostgresTestResources() {
  if (process.env.DATABASE_URL) {
    await stopBoss(process.env.DATABASE_URL);
  }
  await closeRateLimitPool();
  await closeDb();
}

function hashSessionToken(rawToken: string) {
  return createHash("sha256")
    .update(`${process.env.ALPHA_AGENTS_AUTH_SECRET ?? "alpha-agents-dev-secret"}:${rawToken}`)
    .digest("hex");
}
