import { NextResponse } from "next/server";

import { getLeaderboardsPageData } from "../../../lib/server/repository";

export async function GET() {
  return NextResponse.json(await getLeaderboardsPageData());
}
