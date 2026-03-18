import { NextResponse } from "next/server";

import { buildSessionCookie, hashToken, requireConfiguredAuthForWrite } from "../../../../../lib/server/auth";
import { getCanonicalRequestRedirect } from "../../../../../lib/server/env";
import { getPreferredWorkspacePathFromRequest } from "../../../../../lib/server/preferences";
import { getRepositoryBundle } from "../../../../../lib/server/repositories";

export async function GET(request: Request) {
  try {
    const canonicalRedirect = getCanonicalRequestRedirect(request);
    if (canonicalRedirect) {
      return NextResponse.redirect(canonicalRedirect);
    }
    requireConfiguredAuthForWrite();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    if (!token) {
      return NextResponse.redirect(new URL("/login?error=missing_token", request.url));
    }
    const bundle = await getRepositoryBundle();
    const { actor, rawSessionToken, redirectTo } = await bundle.authRepository.consumeMagicLink(hashToken(token));
    const nextRedirect = redirectTo === "/workspace" ? getPreferredWorkspacePathFromRequest(request, actor.role) : redirectTo;
    const response = NextResponse.redirect(new URL(nextRedirect, request.url));
    response.headers.append("Set-Cookie", buildSessionCookie(rawSessionToken, new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)));
    return response;
  } catch (error) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error instanceof Error ? error.message : "invalid_magic_link")}`, request.url));
  }
}
