import { NextResponse } from "next/server";

import { moderationDecisionSchema } from "@openclaw/agent-ledger-core";

import { assertRole, requireConfiguredAuthForWrite, requireSessionFromRequest } from "../../../../../../lib/server/auth";
import { errorResponse, parseRequestWithSchema } from "../../../../../../lib/server/http";
import { getRepositoryBundle } from "../../../../../../lib/server/repositories";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireConfiguredAuthForWrite();
    const actor = await requireSessionFromRequest(request);
    assertRole(actor, ["admin"]);
    const { id } = await params;
    const parsed = await parseRequestWithSchema(request, moderationDecisionSchema);
    const bundle = await getRepositoryBundle();
    const moderationCase = await bundle.moderationRepository.recordDecision(actor, id, parsed.status, parsed.note);
    await bundle.auditRepository.append({
      actor,
      eventType: "moderation.decision",
      entityType: "moderation-case",
      entityId: id,
      newState: moderationCase,
      metadata: { note: parsed.note },
    });
    return NextResponse.json({
      message: `Moderation decision recorded for ${id}.`,
      moderationCase,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
