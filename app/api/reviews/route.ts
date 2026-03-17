import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { reviewInputSchema } from "@openclaw/agent-ledger-core";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = reviewInputSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json(
    {
      message: "Verified review accepted for moderation.",
      reviewId: `review_${randomUUID()}`,
      status: "pending",
      payload: parsed.data,
    },
    { status: 201 },
  );
}
