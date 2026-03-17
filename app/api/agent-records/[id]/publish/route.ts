import { NextResponse } from "next/server";

import { publishInputSchema } from "@openclaw/agent-ledger-core";

import { assertRole, requireConfiguredAuthForWrite, requireSessionFromRequest } from "../../../../../lib/server/auth";
import { errorResponse, parseRequestWithSchema } from "../../../../../lib/server/http";
import { getRepositoryBundle } from "../../../../../lib/server/repositories";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireConfiguredAuthForWrite();
    const actor = await requireSessionFromRequest(request);
    assertRole(actor, ["builder", "admin"]);
    const { id } = await params;
    const parsed = await parseRequestWithSchema(request, publishInputSchema);
    const bundle = await getRepositoryBundle();
    await bundle.versionRepository.assertBuilderOwnsVersion(actor, id, parsed.versionId);
    await bundle.agentRepository.publishVersion(actor, id, parsed.versionId, parsed.publishNote);
    await bundle.auditRepository.append({
      actor,
      eventType: "version.publish_requested",
      entityType: "agent-version",
      entityId: parsed.versionId,
      metadata: { note: parsed.publishNote, agentId: id },
    });
    return NextResponse.json({
      message: `Agent ${id} queued for publish moderation.`,
      queued: true,
      agentId: id,
      versionId: parsed.versionId,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
