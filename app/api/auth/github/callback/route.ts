import { NextResponse } from "next/server";

import {
  buildSessionCookie,
  clearTransientCookie,
  OAUTH_STATE_COOKIE_NAME,
  requireConfiguredAuthForWrite,
} from "../../../../../lib/server/auth";
import { getAppUrl, getGitHubConfig } from "../../../../../lib/server/env";
import { getRepositoryBundle } from "../../../../../lib/server/repositories";

function readCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get("cookie") ?? "";
  return cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`))
    ?.split("=")[1];
}

export async function GET(request: Request) {
  try {
    requireConfiguredAuthForWrite();
    const { clientId, clientSecret } = getGitHubConfig();
    if (!clientId || !clientSecret) {
      return NextResponse.redirect(new URL("/login?error=github_not_configured", request.url));
    }
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const cookieState = readCookie(request, OAUTH_STATE_COOKIE_NAME);
    if (!code || !state || !cookieState || state !== cookieState) {
      return NextResponse.redirect(new URL("/login?error=invalid_oauth_state", request.url));
    }

    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${getAppUrl()}/api/auth/github/callback`,
      }),
    });
    const tokenJson = (await tokenResponse.json()) as { access_token?: string };
    if (!tokenJson.access_token) {
      return NextResponse.redirect(new URL("/login?error=github_exchange_failed", request.url));
    }

    const [userResponse, emailResponse] = await Promise.all([
      fetch("https://api.github.com/user", {
        headers: {
          authorization: `Bearer ${tokenJson.access_token}`,
          accept: "application/vnd.github+json",
        },
      }),
      fetch("https://api.github.com/user/emails", {
        headers: {
          authorization: `Bearer ${tokenJson.access_token}`,
          accept: "application/vnd.github+json",
        },
      }),
    ]);
    const githubUser = (await userResponse.json()) as { id: number; login: string; email?: string | null; name?: string | null };
    const emails = (await emailResponse.json()) as Array<{ email: string; primary: boolean; verified: boolean }>;
    const primaryEmail = githubUser.email || emails.find((entry) => entry.primary && entry.verified)?.email || emails[0]?.email;
    if (!primaryEmail) {
      return NextResponse.redirect(new URL("/login?error=github_email_missing", request.url));
    }

    const bundle = await getRepositoryBundle();
    const { rawSessionToken } = await bundle.authRepository.upsertGitHubAccount({
      providerAccountId: String(githubUser.id),
      email: primaryEmail,
      githubHandle: githubUser.login,
      profile: githubUser,
    });

    const response = NextResponse.redirect(new URL("/workspace", request.url));
    response.headers.append("Set-Cookie", clearTransientCookie(OAUTH_STATE_COOKIE_NAME));
    response.headers.append("Set-Cookie", buildSessionCookie(rawSessionToken, new Date(Date.now() + 1000 * 60 * 60 * 24 * 14)));
    return response;
  } catch (error) {
    return NextResponse.redirect(new URL("/login?error=github_login_failed", request.url));
  }
}
