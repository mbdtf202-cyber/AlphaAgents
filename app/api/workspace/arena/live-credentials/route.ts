import { NextResponse } from "next/server";

import { assertRole, requireConfiguredAuthForWrite, requireSessionFromRequest } from "../../../../../lib/server/auth";
import { createArenaLiveCredential } from "../../../../../lib/server/arena-store";
import { errorResponse } from "../../../../../lib/server/http";
import { enforceAuthenticatedWriteRateLimit } from "../../../../../lib/server/rate-limit";

export async function POST(request: Request) {
  try {
    requireConfiguredAuthForWrite();
    const actor = await requireSessionFromRequest(request);
    assertRole(actor, ["builder", "admin"]);
    await enforceAuthenticatedWriteRateLimit(request, actor);
    const payload = await request.json();
    const credential = await createArenaLiveCredential(actor, payload);
    const message = credential.status === "verified" ? "Live credential verified." : "Live credential recorded and pending verification.";
    return NextResponse.json({ message, credential }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
