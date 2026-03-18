import { NextResponse } from "next/server";

import { publishInputSchema } from "@openclaw/alpha-agents-core";

import { assertRole, requireConfiguredAuthForWrite, requireSessionFromRequest } from "../../../../../lib/server/auth";
import { errorResponse, parseRequestWithSchema } from "../../../../../lib/server/http";
import { enforceAuthenticatedWriteRateLimit } from "../../../../../lib/server/rate-limit";
import { getRepositoryBundle } from "../../../../../lib/server/repositories";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    requireConfiguredAuthForWrite();
    const actor = await requireSessionFromRequest(request);
    assertRole(actor, ["builder", "admin"]);
    await enforceAuthenticatedWriteRateLimit(request, actor);
    const { id: agentSlug } = await params;
    const parsed = await parseRequestWithSchema(request, publishInputSchema);
    const bundle = await getRepositoryBundle();
    await bundle.versionRepository.assertBuilderOwnsVersion(actor, agentSlug, parsed.versionId);
    await bundle.agentRepository.publishVersion(actor, agentSlug, parsed.versionId, parsed.publishNote);
    const moderationCase = await bundle.moderationRepository.upsertCase(actor, {
      entityType: "version",
      entityId: parsed.versionId,
      title: `${agentSlug} version publish review`,
      status: "pending",
      reason: {
        en: parsed.publishNote || "Version publish requested and awaiting moderation review.",
        "zh-CN": parsed.publishNote || "版本发布请求已提交，等待审核。",
      },
      assignedTo: "trust-team",
      ownerUserId: actor.userId,
      ownerOrganizationId: actor.activeOrganizationId,
    });
    await bundle.auditRepository.append({
      actor,
      eventType: "version.publish_requested",
      entityType: "agent-version",
      entityId: parsed.versionId,
      metadata: { note: parsed.publishNote, agentSlug, moderationCaseId: moderationCase.id },
    });
    return NextResponse.json({
      message: `Agent ${agentSlug} queued for publish moderation.`,
      queued: true,
      agentSlug,
      versionId: parsed.versionId,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
