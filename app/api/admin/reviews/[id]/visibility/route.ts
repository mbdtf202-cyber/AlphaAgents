import { NextResponse } from "next/server";

import { reviewModerationSchema } from "@openclaw/alpha-agents-core";

import { assertRole, requireConfiguredAuthForWrite, requireSessionFromRequest } from "../../../../../../lib/server/auth";
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
    const parsed = await parseRequestWithSchema(request, reviewModerationSchema);
    const bundle = await getRepositoryBundle();
    const review = await bundle.reviewRepository.updateVisibility(actor, id, parsed.visibilityStatus);
    await bundle.moderationRepository.upsertCase(actor, {
      entityType: "review",
      entityId: id,
      title: `${review.agentSlug} review moderation`,
      status: parsed.visibilityStatus === "hidden" ? "changes-requested" : "approved",
      reason: {
        en: parsed.note,
        "zh-CN": parsed.note,
      },
      assignedTo: "trust-team",
      ownerUserId: review.ownerUserId,
      ownerOrganizationId: review.ownerOrganizationId,
    });
    await bundle.auditRepository.append({
      actor,
      eventType: "review.visibility_updated",
      entityType: "review",
      entityId: id,
      metadata: { visibilityStatus: parsed.visibilityStatus, note: parsed.note },
      newState: review,
    });
    return NextResponse.json({ message: "Review visibility updated.", review });
  } catch (error) {
    return errorResponse(error);
  }
}
