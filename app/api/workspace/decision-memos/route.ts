import crypto from "node:crypto";

import { NextResponse } from "next/server";

import { decisionMemoInputSchema } from "@openclaw/agent-ledger-core";

import { assertRole, requireConfiguredAuthForWrite, requireSessionFromRequest } from "../../../../lib/server/auth";
import { errorResponse, parseRequestWithSchema } from "../../../../lib/server/http";
import { getRepositoryBundle } from "../../../../lib/server/repositories";

export async function POST(request: Request) {
  try {
    requireConfiguredAuthForWrite();
    const actor = await requireSessionFromRequest(request);
    assertRole(actor, ["buyer", "admin"]);
    const parsed = await parseRequestWithSchema(request, decisionMemoInputSchema);
    const bundle = await getRepositoryBundle();
    const memo = await bundle.shortlistRepository.createDecisionMemo(actor, {
      id: crypto.randomUUID(),
      ownerUserId: actor.userId,
      ownerOrganizationId: actor.activeOrganizationId,
      createdByUserId: actor.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...parsed,
    });
    await bundle.auditRepository.append({
      actor,
      eventType: "decision-memo.created",
      entityType: "decision-memo",
      entityId: memo.id,
      newState: memo,
    });
    return NextResponse.json({ message: "Decision memo persisted.", memo }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
