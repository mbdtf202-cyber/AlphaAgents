import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { submissionInputSchema } from "@openclaw/agent-ledger-core";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = submissionInputSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json(
    {
      message: "Submission draft accepted. Continue with permission review and benchmark request.",
      submissionId: `submission_${randomUUID()}`,
      status: "pending",
      payload: parsed.data,
    },
    { status: 201 },
  );
}
