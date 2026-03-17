import { NextResponse } from "next/server";

import { getLeaderboards } from "@openclaw/agent-ledger-core";

export async function GET() {
  return NextResponse.json(getLeaderboards());
}
