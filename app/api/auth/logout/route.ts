import { NextResponse } from "next/server";

import { clearSessionCookie, getSessionFromRequest, hashToken } from "../../../../lib/server/auth";
import { getRepositoryBundle } from "../../../../lib/server/repositories";

export async function POST(request: Request) {
  const session = await getSessionFromRequest(request);
  const response = NextResponse.json({ ok: true });
  response.headers.append("Set-Cookie", clearSessionCookie());

  if (!session) {
    return response;
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const rawToken = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("agent_ledger_session="))
    ?.split("=")[1];

  if (rawToken) {
    const bundle = await getRepositoryBundle();
    await bundle.authRepository.destroySessionByTokenHash(hashToken(rawToken));
  }

  return response;
}
