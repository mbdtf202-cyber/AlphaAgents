import crypto from "node:crypto";

import { NextResponse } from "next/server";

import { shortlistInputSchema } from "@openclaw/alpha-agents-core";

import { requireConfiguredAuthForWrite, requireSessionFromRequest } from "../../../../lib/server/auth";
import { errorResponse, parseRequestWithSchema } from "../../../../lib/server/http";
import { getRepositoryBundle } from "../../../../lib/server/repositories";

export async function POST(request: Request) {
  try {
    requireConfiguredAuthForWrite();
    const actor = await requireSessionFromRequest(request);
    const parsed = await parseRequestWithSchema(request, shortlistInputSchema);
    const bundle = await getRepositoryBundle();
    const shortlist = await bundle.shortlistRepository.createShortlist(actor, {
      id: crypto.randomUUID(),
      name: parsed.name,
      ownerUserId: actor.userId,
      ownerOrganizationId: actor.activeOrganizationId,
      createdByUserId: actor.userId,
      agentSlugs: parsed.agentSlugs,
      buyerType: parsed.buyerType,
      constraints: parsed.constraints,
      scoreWeights: parsed.scoreWeights,
      internalNotes: parsed.internalNotes,
    });
    await bundle.auditRepository.append({
      actor,
      eventType: "shortlist.created",
      entityType: "shortlist",
      entityId: shortlist.id,
      newState: shortlist,
    });
    return NextResponse.json(
      {
        message: "Shortlist persisted.",
        shortlist,
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
