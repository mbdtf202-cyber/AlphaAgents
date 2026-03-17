import { NextResponse } from "next/server";

import { getFilteredAgentsPageData } from "../../../lib/server/repository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? undefined;
  const items = await getFilteredAgentsPageData({ query });

  return NextResponse.json({
    items,
    total: items.length,
  });
}
