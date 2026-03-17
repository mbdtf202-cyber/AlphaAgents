import { NextResponse } from "next/server";

import { moderationDecisionSchema } from "@openclaw/agent-ledger-core";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const json = await request.json();
  const parsed = moderationDecisionSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json({
    message: `Moderation decision recorded for ${id}.`,
    entityId: id,
    payload: parsed.data,
  });
}
