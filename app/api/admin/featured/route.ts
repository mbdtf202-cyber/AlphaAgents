import { NextResponse } from "next/server";

import { featureSlotUpdateSchema } from "@openclaw/alpha-agents-core";

import { assertRole, requireConfiguredAuthForWrite, requireSessionFromRequest } from "../../../../lib/server/auth";
import { errorResponse, parseRequestWithSchema } from "../../../../lib/server/http";
import { enforceAuthenticatedWriteRateLimit } from "../../../../lib/server/rate-limit";
import { getRepositoryBundle } from "../../../../lib/server/repositories";

export async function POST(request: Request) {
  try {
    requireConfiguredAuthForWrite();
    const actor = await requireSessionFromRequest(request);
    assertRole(actor, ["admin"]);
    await enforceAuthenticatedWriteRateLimit(request, actor);
    const parsed = await parseRequestWithSchema(request, featureSlotUpdateSchema);
    const bundle = await getRepositoryBundle();
    const slot = await bundle.catalogRepository.upsertFeatureSlot(actor, {
      id: parsed.slotKey,
      slotKey: parsed.slotKey,
      agentSlug: parsed.agentSlug,
      title: parsed.title,
      description: parsed.description,
    });
    await bundle.auditRepository.append({
      actor,
      eventType: "featured-slot.updated",
      entityType: "feature-slot",
      entityId: slot.slotKey,
      newState: slot,
    });
    return NextResponse.json({ message: "Featured slot updated.", slot });
  } catch (error) {
    return errorResponse(error);
  }
}
