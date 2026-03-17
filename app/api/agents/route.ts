import { NextResponse } from "next/server";

import { listAgents } from "@openclaw/alpha-agents-core";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? undefined;

  return NextResponse.json({
    items: listAgents(query),
    total: listAgents(query).length,
  });
}
