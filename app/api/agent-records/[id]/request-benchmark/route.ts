import crypto from "node:crypto";

import { NextResponse } from "next/server";

import { benchmarkRequestSchema } from "@openclaw/agent-ledger-core";

import { assertRole, requireConfiguredAuthForWrite, requireSessionFromRequest } from "../../../../../lib/server/auth";
import { errorResponse, parseRequestWithSchema } from "../../../../../lib/server/http";
import { getRepositoryBundle } from "../../../../../lib/server/repositories";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireConfiguredAuthForWrite();
    const actor = await requireSessionFromRequest(request);
    assertRole(actor, ["buyer", "builder", "admin"]);
    const { id } = await params;
    const parsed = await parseRequestWithSchema(request, benchmarkRequestSchema);
    const bundle = await getRepositoryBundle();
    if (actor.role === "builder") {
      await bundle.versionRepository.assertBuilderOwnsVersion(actor, id, parsed.versionId);
    }
    const benchmarkRequest = await bundle.benchmarkRepository.queueRequest(actor, {
      id: crypto.randomUUID(),
      ownerUserId: actor.userId,
      ownerOrganizationId: actor.activeOrganizationId,
      createdByUserId: actor.userId,
      agentId: id,
      versionId: parsed.versionId,
      suiteSlug: parsed.suiteSlug,
      objective: parsed.objective,
      status: "queued",
      queuedAt: new Date().toISOString(),
    });
    await bundle.auditRepository.append({
      actor,
      eventType: "benchmark.requested",
      entityType: "benchmark-request",
      entityId: benchmarkRequest.id,
      newState: benchmarkRequest,
    });
    return NextResponse.json({
      message: `Benchmark request queued for ${id}.`,
      request: benchmarkRequest,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
