import { NextResponse } from "next/server";

import { publishInputSchema } from "@openclaw/agent-ledger-core";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const json = await request.json();
  const parsed = publishInputSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json({
    message: `Agent ${id} queued for publish moderation.`,
    entityId: id,
    decision: "queued",
    payload: parsed.data,
  });
}
