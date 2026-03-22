import { NextResponse } from "next/server";

import { assertRole, requireConfiguredAuthForWrite, requireSessionFromRequest } from "../../../../../lib/server/auth";
import { createArenaWatchlistEntry } from "../../../../../lib/server/arena-store";
import { errorResponse } from "../../../../../lib/server/http";
import { enforceAuthenticatedWriteRateLimit } from "../../../../../lib/server/rate-limit";

export async function POST(request: Request) {
  try {
    requireConfiguredAuthForWrite();
    const actor = await requireSessionFromRequest(request);
    assertRole(actor, ["buyer", "admin"]);
    await enforceAuthenticatedWriteRateLimit(request, actor);
    const payload = await request.json();
    const entry = await createArenaWatchlistEntry(actor, payload);
    return NextResponse.json({ message: "Watchlist updated.", entry }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
