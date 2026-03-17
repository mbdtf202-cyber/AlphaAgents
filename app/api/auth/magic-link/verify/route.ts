import { NextResponse } from "next/server";

import { buildSessionCookie, hashToken, requireConfiguredAuthForWrite } from "../../../../../lib/server/auth";
import { getRepositoryBundle } from "../../../../../lib/server/repositories";

export async function GET(request: Request) {
  try {
    requireConfiguredAuthForWrite();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const redirectTo = searchParams.get("redirectTo") || "/workspace";
    if (!token) {
      return NextResponse.redirect(new URL("/login?error=missing_token", request.url));
    }
    const bundle = await getRepositoryBundle();
    const { rawSessionToken } = await bundle.authRepository.consumeMagicLink(hashToken(token));
    const response = NextResponse.redirect(new URL(redirectTo, request.url));
    response.headers.append("Set-Cookie", buildSessionCookie(rawSessionToken, new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)));
    return response;
  } catch (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error instanceof Error ? error.message : "invalid_magic_link")}`, request.url));
  }
}
