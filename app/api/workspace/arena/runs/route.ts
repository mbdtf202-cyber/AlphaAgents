import { NextResponse } from "next/server";

import { assertRole, requireConfiguredAuthForWrite, requireSessionFromRequest } from "../../../../../lib/server/auth";
import { triggerArenaRun } from "../../../../../lib/server/arena-store";
import { errorResponse } from "../../../../../lib/server/http";
import { enforceAuthenticatedWriteRateLimit } from "../../../../../lib/server/rate-limit";

export async function POST(request: Request) {
  try {
    requireConfiguredAuthForWrite();
    const actor = await requireSessionFromRequest(request);
    assertRole(actor, ["builder", "admin"]);
    await enforceAuthenticatedWriteRateLimit(request, actor);
    const payload = await request.json();
    const result = await triggerArenaRun(actor, payload);
    return NextResponse.json({ message: result.run.status === "completed" ? "Arena run completed." : "Arena run queued.", ...result }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
