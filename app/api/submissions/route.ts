import crypto from "node:crypto";

import { NextResponse } from "next/server";

import { submissionInputSchema } from "@openclaw/alpha-agents-core";

import { requireConfiguredAuthForWrite, requireSessionFromRequest } from "../../../lib/server/auth";
import { errorResponse, parseRequestWithSchema } from "../../../lib/server/http";
import { enforceAuthenticatedWriteRateLimit } from "../../../lib/server/rate-limit";
import { getRepositoryBundle } from "../../../lib/server/repositories";

export async function POST(request: Request) {
  try {
    requireConfiguredAuthForWrite();
    const actor = await requireSessionFromRequest(request);
    await enforceAuthenticatedWriteRateLimit(request, actor);
    const parsed = await parseRequestWithSchema(request, submissionInputSchema);
    const bundle = await getRepositoryBundle();
    const submission = await bundle.agentRepository.createSubmission({
      id: crypto.randomUUID(),
      ownerUserId: actor.userId,
      ownerOrganizationId: actor.activeOrganizationId,
      createdByUserId: actor.userId,
      agentName: parsed.agentName,
      agentSlug: parsed.agentSlug,
      builderHandle: parsed.builderHandle,
      sourceKind: parsed.sourceKind,
      sourceUrl: parsed.sourceUrl,
      installCommand: parsed.installCommand,
      summary: parsed.summary,
      permissionManifest: {
        id: crypto.randomUUID(),
        ...parsed.permissionManifest,
      },
      dependencies: parsed.dependencies,
      knownLimits: parsed.knownLimits,
      supportedEnvironments: parsed.supportedEnvironments,
      initialVersion: parsed.initialVersion,
      initialBundleHash: parsed.initialBundleHash,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    await bundle.auditRepository.append({
      actor,
      eventType: "submission.created",
      entityType: "submission",
      entityId: submission.id,
      newState: submission,
    });
    await bundle.moderationRepository.upsertCase(actor, {
      entityType: "submission",
      entityId: submission.id,
      title: `${submission.agentName} submission review`,
      status: "pending",
      reason: {
        en: "New builder submission requires moderation before public publication.",
        "zh-CN": "新的 Builder 投稿需要在公开发布前完成审核。",
      },
      assignedTo: "marketplace-ops",
      ownerUserId: submission.ownerUserId,
      ownerOrganizationId: submission.ownerOrganizationId,
    });
    return NextResponse.json(
      {
        message: "Submission persisted and queued for moderation.",
        submission,
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
