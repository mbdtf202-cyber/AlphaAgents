import { NextResponse } from "next/server";

import { compareInputSchema, compareAgents } from "@openclaw/alpha-agents-core";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = compareInputSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json({
    agents: compareAgents(parsed.data.slugs),
  });
}
