import { NextResponse } from "next/server";

import { getWorkbenchModel } from "../../../lib/alphaagents/view-models";

export function GET() {
  return NextResponse.json(getWorkbenchModel());
}
