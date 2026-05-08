import { NextResponse } from "next/server";

import { getEvidenceRoomModel } from "../../../lib/alphaagents/view-models";

export function GET() {
  return NextResponse.json(getEvidenceRoomModel());
}
