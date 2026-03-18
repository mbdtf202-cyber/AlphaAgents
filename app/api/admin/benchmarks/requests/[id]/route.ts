import { NextResponse } from "next/server";

import { benchmarkAdminActionSchema } from "@openclaw/alpha-agents-core";

import { assertRole, requireConfiguredAuthForWrite, requireSessionFromRequest } from "../../../../../../lib/server/auth";
import { enqueuePersistedBenchmarkRequest } from "../../../../../../lib/server/benchmark-queue";
import { errorResponse, parseRequestWithSchema } from "../../../../../../lib/server/http";
import { enforceAuthenticatedWriteRateLimit } from "../../../../../../lib/server/rate-limit";
import { getRepositoryBundle } from "../../../../../../lib/server/repositories";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireConfiguredAuthForWrite();
    const actor = await requireSessionFromRequest(request);
    assertRole(actor, ["admin"]);
    await enforceAuthenticatedWriteRateLimit(request, actor);
    const { id } = await params;
    const parsed = await parseRequestWithSchema(request, benchmarkAdminActionSchema);
    const bundle = await getRepositoryBundle();

    if (parsed.action === "fail") {
      const failed = await bundle.benchmarkRepository.failRequest(id, parsed.failureReason ?? "admin_failed_request");
      await bundle.auditRepository.append({
        actor,
        eventType: "benchmark.request_failed_by_admin",
        entityType: "benchmark-request",
        entityId: id,
        metadata: { failureReason: parsed.failureReason },
        newState: failed,
      });
      return NextResponse.json({ message: "Benchmark request marked failed.", request: failed });
    }

    const rerun = await bundle.benchmarkRepository.rerunRequest(actor, id);
    await enqueuePersistedBenchmarkRequest(rerun);
    await bundle.auditRepository.append({
      actor,
      eventType: "benchmark.request_rerun",
      entityType: "benchmark-request",
      entityId: rerun.id,
      metadata: { sourceRequestId: id },
      newState: rerun,
    });
    return NextResponse.json({ message: "Benchmark rerun queued.", request: rerun });
  } catch (error) {
    return errorResponse(error);
  }
}
