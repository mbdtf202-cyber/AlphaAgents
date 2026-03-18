import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { runBenchmarkWorkerOnce } from "@openclaw/alpha-agents-runner";

import { hashToken } from "../../lib/server/auth";
import { processBenchmarkRequestJob } from "../../lib/server/benchmark-queue";
import { checkDbConnection, runMigrations } from "../../lib/server/db";
import { BENCHMARK_WORKER_SERVICE_NAME, getReadinessSnapshot } from "../../lib/server/health";
import { getReadCatalog, getRepositoryBundle } from "../../lib/server/repositories";
import { upsertServiceHeartbeat } from "../../lib/server/service-heartbeats";
import { GET as verifyMagicLink } from "../../app/api/auth/magic-link/verify/route";
import { POST as requestMagicLink } from "../../app/api/auth/magic-link/request/route";
import { POST as publishVersion } from "../../app/api/agent-records/[id]/publish/route";
import { POST as requestBenchmark } from "../../app/api/agent-records/[id]/request-benchmark/route";
import { DELETE as unfollowProfile, POST as followProfile } from "../../app/api/follows/route";
import { POST as verifyInstall } from "../../app/api/installs/verify/route";
import { POST as createReview } from "../../app/api/reviews/route";
import { POST as createDecisionMemo } from "../../app/api/workspace/decision-memos/route";
import { POST as createShortlist } from "../../app/api/workspace/shortlists/route";
import { closePostgresTestResources, createBuyerSession, migrateAndResetPostgres, seedLiveAgentFixture, setPostgresTestEnv } from "../support/postgres";

const describeIfDatabase = process.env.DATABASE_URL ? describe : describe.skip;

describeIfDatabase("postgres integration", () => {
  beforeAll(async () => {
    setPostgresTestEnv();
    await runMigrations();
  });

  beforeEach(async () => {
    await migrateAndResetPostgres();
  });

  afterAll(async () => {
    await closePostgresTestResources();
  });

  it("runs migrations, supports single-use magic links, and reports ready with a healthy worker heartbeat", async () => {
    setPostgresTestEnv();
    await checkDbConnection();

    const requestResponse = await requestMagicLink(
      new Request("http://localhost/api/auth/magic-link/request", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "127.0.0.1" },
        body: JSON.stringify({
          email: "buyer@example.com",
          redirectTo: "/workspace",
          role: "buyer",
        }),
      }),
    );
    const requestJson = await requestResponse.json();
    const verifyResponse = await verifyMagicLink(
      new Request(requestJson.previewUrl, {
        method: "GET",
      }),
    );

    expect(requestResponse.status).toBe(202);
    expect(verifyResponse.headers.get("location")).toBe("http://localhost/workspace");

    const bundle = await getRepositoryBundle();
    await expect(bundle.authRepository.consumeMagicLink(hashToken(new URL(requestJson.previewUrl).searchParams.get("token")!))).rejects.toThrow(
      "Magic link has expired or was already consumed.",
    );

    await upsertServiceHeartbeat({
      serviceName: BENCHMARK_WORKER_SERVICE_NAME,
      instanceId: "integration-worker",
    });
    const readiness = await getReadinessSnapshot();
    expect(readiness.ready).toBe(true);
    expect(readiness.checks.database).toEqual({ ok: true });
  });

  it("persists live publish, install, review, follow, shortlist, and benchmark flows in postgres", async () => {
    setPostgresTestEnv();
    const fixture = await seedLiveAgentFixture();
    const buyerSession = await createBuyerSession();

    const installResponse = await verifyInstall(
      new Request("http://localhost/api/installs/verify", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `alpha_agents_session=${fixture.rawSessionToken}`,
        },
        body: JSON.stringify({
          agentSlug: fixture.agentSlug,
          versionId: fixture.versionId,
          packageHash: "sha256:fixture-install-package",
          anonymousRuntimeFingerprint: "fixture-runtime-fingerprint",
        }),
      }),
    );
    const installJson = await installResponse.json();

    const reviewResponse = await createReview(
      new Request("http://localhost/api/reviews", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `alpha_agents_session=${fixture.rawSessionToken}`,
        },
        body: JSON.stringify({
          installId: installJson.install.id,
          agentSlug: fixture.agentSlug,
          versionId: fixture.versionId,
          company: "OpenClaw QA",
          role: "Release Engineer",
          headline: {
            en: "Release fixture performed well.",
            "zh-CN": "发布夹具表现良好。",
          },
          body: {
            en: "The fixture stayed stable throughout publish and benchmark verification.",
            "zh-CN": "这个夹具在发布和 benchmark 验证期间保持稳定。",
          },
          rating: 5,
          dimensions: {
            taskSuccess: 95,
            reliability: 95,
            costEfficiency: 90,
            latency: 88,
            safetyFootprint: 92,
            setupFriction: 85,
            operatorBurden: 87,
            domainFit: 93,
          },
        }),
      }),
    );

    const followResponse = await followProfile(
      new Request("http://localhost/api/follows", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `alpha_agents_session=${fixture.rawSessionToken}`,
        },
        body: JSON.stringify({
          subjectType: "agent",
          subjectId: fixture.agentId,
        }),
      }),
    );
    const unfollowResponse = await unfollowProfile(
      new Request("http://localhost/api/follows", {
        method: "DELETE",
        headers: {
          "content-type": "application/json",
          cookie: `alpha_agents_session=${fixture.rawSessionToken}`,
        },
        body: JSON.stringify({
          subjectType: "agent",
          subjectId: fixture.agentId,
        }),
      }),
    );

    const shortlistResponse = await createShortlist(
      new Request("http://localhost/api/workspace/shortlists", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `alpha_agents_session=${buyerSession.rawSessionToken}`,
        },
        body: JSON.stringify({
          name: {
            en: "Release shortlist",
            "zh-CN": "发布 shortlist",
          },
          agentSlugs: [fixture.agentSlug],
          buyerType: "team",
        }),
      }),
    );
    const shortlistJson = await shortlistResponse.json();

    const decisionMemoResponse = await createDecisionMemo(
      new Request("http://localhost/api/workspace/decision-memos", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `alpha_agents_session=${buyerSession.rawSessionToken}`,
        },
        body: JSON.stringify({
          shortlistId: shortlistJson.shortlist.id,
          title: {
            en: "Release decision",
            "zh-CN": "发布决策",
          },
          summary: {
            en: "Pilot the release fixture.",
            "zh-CN": "试点发布夹具。",
          },
          recommendationState: "pilot",
          rolloutRecommendation: {
            en: "Pilot with release engineering first.",
            "zh-CN": "先在发布工程团队试点。",
          },
          tradeoffs: [
            {
              en: "High confidence in release controls.",
              "zh-CN": "对发布控制有较高信心。",
            },
          ],
        }),
      }),
    );

    const publishResponse = await publishVersion(
      new Request(`http://localhost/api/agent-records/${fixture.agentSlug}/publish`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `alpha_agents_session=${fixture.rawSessionToken}`,
        },
        body: JSON.stringify({
          versionId: fixture.versionId,
          publishNote: "Release candidate moderation requested.",
        }),
      }),
      { params: Promise.resolve({ id: fixture.agentSlug }) },
    );

    const benchmarkResponse = await requestBenchmark(
      new Request(`http://localhost/api/agent-records/${fixture.agentSlug}/request-benchmark`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: `alpha_agents_session=${fixture.rawSessionToken}`,
        },
        body: JSON.stringify({
          suiteSlug: "coding-command",
          versionId: fixture.versionId,
          objective: "Validate release candidate benchmark flow.",
        }),
      }),
      { params: Promise.resolve({ id: fixture.agentSlug }) },
    );

    expect(installResponse.status).toBe(201);
    expect(reviewResponse.status).toBe(201);
    expect(followResponse.status).toBe(201);
    expect(unfollowResponse.status).toBe(200);
    expect(shortlistResponse.status).toBe(201);
    expect(decisionMemoResponse.status).toBe(201);
    expect(publishResponse.status).toBe(200);
    expect(benchmarkResponse.status).toBe(200);

    await runBenchmarkWorkerOnce(process.env.DATABASE_URL!, processBenchmarkRequestJob);

    const bundle = await getRepositoryBundle();
    const benchmarkRequests = await bundle.benchmarkRepository.listRequestsForActor(fixture.actor);
    const installs = await bundle.installRepository.listInstallsForActor(fixture.actor);
    const reviews = await bundle.reviewRepository.listReviewsForActor(fixture.actor);
    const shortlists = await bundle.shortlistRepository.listShortlistsForActor(buyerSession.actor);
    const memos = await bundle.shortlistRepository.listDecisionMemosForActor(buyerSession.actor);
    const catalog = await getReadCatalog();

    expect(benchmarkRequests).toHaveLength(1);
    expect(benchmarkRequests[0]?.status).toBe("completed");
    expect(benchmarkRequests[0]?.artifactBundle?.bundleHash).toMatch(/^sha256:/);
    expect(installs).toHaveLength(1);
    expect(reviews).toHaveLength(1);
    expect(shortlists).toHaveLength(1);
    expect(memos).toHaveLength(1);
    expect(catalog.agents.some((agent) => agent.slug === fixture.agentSlug)).toBe(true);
    expect(catalog.builders.some((builder) => builder.handle === fixture.builderHandle)).toBe(true);
  });
});
