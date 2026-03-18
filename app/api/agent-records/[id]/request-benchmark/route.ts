import crypto from "node:crypto";

import { NextResponse } from "next/server";

import { benchmarkRequestSchema } from "@openclaw/alpha-agents-core";

import { assertRole, requireConfiguredAuthForWrite, requireSessionFromRequest } from "../../../../../lib/server/auth";
import { enqueuePersistedBenchmarkRequest } from "../../../../../lib/server/benchmark-queue";
import { errorResponse, parseRequestWithSchema } from "../../../../../lib/server/http";
import { incrementBenchmarkRequest } from "../../../../../lib/server/metrics";
import { enforceAuthenticatedWriteRateLimit } from "../../../../../lib/server/rate-limit";
import { getRepositoryBundle } from "../../../../../lib/server/repositories";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireConfiguredAuthForWrite();
    const actor = await requireSessionFromRequest(request);
    assertRole(actor, ["buyer", "builder", "admin"]);
    await enforceAuthenticatedWriteRateLimit(request, actor);
    const { id: agentSlug } = await params;
    const parsed = await parseRequestWithSchema(request, benchmarkRequestSchema);
    const bundle = await getRepositoryBundle();
    if (actor.role === "builder") {
      await bundle.versionRepository.assertBuilderOwnsVersion(actor, agentSlug, parsed.versionId);
    }
    const requestId = crypto.randomUUID();
    const benchmarkRequest = await bundle.benchmarkRepository.queueRequest(actor, {
      id: requestId,
      ownerUserId: actor.userId,
      ownerOrganizationId: actor.activeOrganizationId,
      createdByUserId: actor.userId,
      agentSlug,
      versionId: parsed.versionId,
      suiteSlug: parsed.suiteSlug,
      objective: parsed.objective,
      status: "queued",
      queueJobId: requestId,
      queuedAt: new Date().toISOString(),
    });
    try {
      await enqueuePersistedBenchmarkRequest(benchmarkRequest);
    } catch (error) {
      incrementBenchmarkRequest("failed");
      await bundle.benchmarkRepository.failRequest(benchmarkRequest.id, error instanceof Error ? error.message : "benchmark_queue_failed");
      throw error;
    }
    await bundle.auditRepository.append({
      actor,
      eventType: "benchmark.requested",
      entityType: "benchmark-request",
      entityId: benchmarkRequest.id,
      newState: benchmarkRequest,
    });
    return NextResponse.json({
      message: `Benchmark request queued for ${agentSlug}.`,
      request: benchmarkRequest,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
