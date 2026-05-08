import { NextResponse } from "next/server";

import { getOrderWorkspaceModel } from "../../../lib/alphaagents/view-models";

export function GET() {
  return NextResponse.json(getOrderWorkspaceModel());
}
