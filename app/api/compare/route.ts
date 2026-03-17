import { NextResponse } from "next/server";

import { compareInputSchema } from "@openclaw/alpha-agents-core";

import { getComparePageData } from "../../../lib/server/repository";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = compareInputSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json({
    agents: await getComparePageData(parsed.data.slugs),
  });
}
