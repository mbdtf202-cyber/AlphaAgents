import { NextResponse } from "next/server";

import { getRuntimeSnapshot } from "../../../lib/alphaagents/runtime-queries";
import { resetRuntimeState, resolveStateFile } from "../../../lib/alphaagents/runtime-state";

export function GET() {
  return NextResponse.json(getRuntimeSnapshot({ stateFile: resolveStateFile() }));
}

export function DELETE() {
  const stateFile = resolveStateFile();
  resetRuntimeState(stateFile);
  return NextResponse.json({ ok: true, stateFile });
}
