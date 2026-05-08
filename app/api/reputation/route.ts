import { NextResponse } from "next/server";

import { getReputationModel } from "../../../lib/alphaagents/view-models";

export function GET() {
  return NextResponse.json(getReputationModel());
}
