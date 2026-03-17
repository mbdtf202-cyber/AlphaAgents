import crypto from "node:crypto";

import { NextResponse } from "next/server";

import { reviewInputSchema } from "@openclaw/alpha-agents-core";

import { requireConfiguredAuthForWrite, requireSessionFromRequest } from "../../../lib/server/auth";
import { errorResponse, parseRequestWithSchema } from "../../../lib/server/http";
import { getRepositoryBundle } from "../../../lib/server/repositories";

export async function POST(request: Request) {
  try {
    requireConfiguredAuthForWrite();
    const actor = await requireSessionFromRequest(request);
    const parsed = await parseRequestWithSchema(request, reviewInputSchema);
    const bundle = await getRepositoryBundle();
    const review = await bundle.reviewRepository.createVerifiedReview(actor, {
      id: crypto.randomUUID(),
      ...parsed,
      builderHandle: "",
      createdAt: new Date().toISOString(),
    });
    await bundle.auditRepository.append({
      actor,
      eventType: "review.created",
      entityType: "review",
      entityId: review.id,
      newState: review,
    });
    return NextResponse.json(
      {
        message: "Verified review persisted.",
        review,
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
