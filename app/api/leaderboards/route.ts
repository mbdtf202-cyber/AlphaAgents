import { NextResponse } from "next/server";

import { getLeaderboards } from "@openclaw/alpha-agents-core";

export async function GET() {
  return NextResponse.json(getLeaderboards());
}
