import { NextResponse } from "next/server";

import { buildTransientCookie, generateOpaqueToken, requireConfiguredAuthForWrite, OAUTH_STATE_COOKIE_NAME } from "../../../../../lib/server/auth";
import { getAppUrl, getGitHubConfig } from "../../../../../lib/server/env";

export async function GET(request: Request) {
  try {
    requireConfiguredAuthForWrite();
    const { clientId } = getGitHubConfig();
    if (!clientId) {
      return NextResponse.json({ error: "GitHub OAuth is not configured." }, { status: 503 });
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
    return NextResponse.json({ error: error instanceof Error ? error.message : "GitHub OAuth could not start." }, { status: 503 });
  }
}
