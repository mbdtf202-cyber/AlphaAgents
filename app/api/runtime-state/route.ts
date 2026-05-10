import { NextResponse } from "next/server";

import { canResetRuntimeState, requireRuntimeApiAuth } from "../../../lib/alphaagents/api-auth";
import { getRuntimeSnapshot } from "../../../lib/alphaagents/runtime-queries";
import { resetRuntimeState, resolveStateFile } from "../../../lib/alphaagents/runtime-state";

export function GET() {
  return NextResponse.json(getRuntimeSnapshot({ stateFile: resolveStateFile() }));
}

export function DELETE(request: Request) {
  const auth = requireRuntimeApiAuth(request);
  if (auth.error) {
    const { error } = auth;
    return NextResponse.json({ ok: false, errorCode: error.errorCode, message: error.message }, { status: error.status });
  }

  if (!canResetRuntimeState(auth)) {
    return NextResponse.json(
      { ok: false, errorCode: "TOKEN_SCOPE_FORBIDDEN", message: "Runtime state reset requires internal token, operator role, and runtime:state.reset scope." },
      { status: 403 }
    );
  }

  const stateFile = resolveStateFile();
  resetRuntimeState(stateFile);
  return NextResponse.json({ ok: true, stateFile });
}
