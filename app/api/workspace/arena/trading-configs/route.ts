import { NextResponse } from "next/server";

import { assertRole, requireConfiguredAuthForWrite, requireSessionFromRequest } from "../../../../../lib/server/auth";
import { createTradingVersionConfig } from "../../../../../lib/server/arena-store";
import { errorResponse } from "../../../../../lib/server/http";
import { enforceAuthenticatedWriteRateLimit } from "../../../../../lib/server/rate-limit";

export async function POST(request: Request) {
  try {
    requireConfiguredAuthForWrite();
    const actor = await requireSessionFromRequest(request);
    assertRole(actor, ["builder", "admin"]);
    await enforceAuthenticatedWriteRateLimit(request, actor);
    const payload = await request.json();
    const config = await createTradingVersionConfig(actor, payload);
    const message = config.validationStatus === "passed" ? "Trading runtime validated." : "Trading runtime declaration recorded; validation pending.";
    return NextResponse.json({ message, config }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
