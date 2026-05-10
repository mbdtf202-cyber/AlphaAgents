import { NextResponse } from "next/server";

import { isDemoWriteApiEnabled } from "../../../lib/alphaagents/api-auth";
import { resetRuntimeState, resolveStateFile } from "../../../lib/alphaagents/runtime-state";

export function POST() {
  if (!isDemoWriteApiEnabled()) {
    return NextResponse.json(
      { ok: false, errorCode: "DEMO_WRITE_API_DISABLED", message: "UI runtime reset requires explicit non-production demo write mode." },
      { status: 403 }
    );
  }

  const stateFile = resolveStateFile();
  resetRuntimeState(stateFile);
  return NextResponse.json({ ok: true, stateFile });
}
