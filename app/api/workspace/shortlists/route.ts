import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { shortlistInputSchema } from "@openclaw/agent-ledger-core";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = shortlistInputSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json(
    {
      message: "Shortlist created.",
      shortlistId: `shortlist_${randomUUID()}`,
      payload: parsed.data,
    },
    { status: 201 },
  );
}
