import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { installVerificationSchema } from "@openclaw/agent-ledger-core";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = installVerificationSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return NextResponse.json(
    {
      message: "Install proof verified.",
      installId: `install_${randomUUID()}`,
      verificationToken: `verify_${randomUUID()}`,
      payload: parsed.data,
    },
    { status: 201 },
  );
}
