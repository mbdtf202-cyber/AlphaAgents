import { NextResponse } from "next/server";

import { followProfileSchema } from "@openclaw/alpha-agents-core";

import { requireConfiguredAuthForWrite, requireSessionFromRequest } from "../../../lib/server/auth";
import { errorResponse, parseRequestWithSchema } from "../../../lib/server/http";
import { enforceAuthenticatedWriteRateLimit } from "../../../lib/server/rate-limit";
import { getRepositoryBundle } from "../../../lib/server/repositories";

export async function POST(request: Request) {
  try {
    requireConfiguredAuthForWrite();
    const actor = await requireSessionFromRequest(request);
    await enforceAuthenticatedWriteRateLimit(request, actor);
    const parsed = await parseRequestWithSchema(request, followProfileSchema);
    const bundle = await getRepositoryBundle();
    const edge = await bundle.relationshipRepository.followProfile(actor, {
      toType: parsed.subjectType,
      toId: parsed.subjectId,
    });
    await bundle.auditRepository.append({
      actor,
      eventType: "profile.followed",
      entityType: parsed.subjectType,
      entityId: parsed.subjectId,
      newState: edge,
    });
    return NextResponse.json({ message: "Profile followed.", edge }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    requireConfiguredAuthForWrite();
    const actor = await requireSessionFromRequest(request);
    await enforceAuthenticatedWriteRateLimit(request, actor);
    const parsed = await parseRequestWithSchema(request, followProfileSchema);
    const bundle = await getRepositoryBundle();
    await bundle.relationshipRepository.unfollowProfile(actor, {
      toType: parsed.subjectType,
      toId: parsed.subjectId,
    });
    await bundle.auditRepository.append({
      actor,
      eventType: "profile.unfollowed",
      entityType: parsed.subjectType,
      entityId: parsed.subjectId,
    });
    return NextResponse.json({ message: "Profile unfollowed." });
  } catch (error) {
    return errorResponse(error);
  }
}
