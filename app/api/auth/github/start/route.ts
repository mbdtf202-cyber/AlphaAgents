import { NextResponse } from "next/server";

import { buildTransientCookie, generateOpaqueToken, requireConfiguredAuthForWrite, OAUTH_STATE_COOKIE_NAME } from "../../../../../lib/server/auth";
import { getAppUrl, getGitHubConfig } from "../../../../../lib/server/env";
import { enforceRateLimit, getClientIp } from "../../../../../lib/server/rate-limit";

function redirectToLoginError(request: Request, error: string) {
  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, request.url));
}

export async function GET(request: Request) {
  try {
    requireConfiguredAuthForWrite();
    await enforceRateLimit("github-start-ip", getClientIp(request));
    const { clientId } = getGitHubConfig();
    if (!clientId) {
      return redirectToLoginError(request, "github_not_configured");
    }
    const state = generateOpaqueToken();
    const callbackUrl = `${getAppUrl()}/api/auth/github/callback`;
    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", callbackUrl);
    url.searchParams.set("scope", "read:user user:email");
    url.searchParams.set("state", state);

    const response = NextResponse.redirect(url);
    response.headers.append("Set-Cookie", buildTransientCookie(OAUTH_STATE_COOKIE_NAME, state, 600));
    return response;
  } catch (error) {
    return redirectToLoginError(request, error instanceof Error ? error.message : "github_start_failed");
  }
}
