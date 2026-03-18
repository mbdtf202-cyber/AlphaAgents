import { NextResponse } from "next/server";

import { magicLinkRequestSchema } from "@openclaw/alpha-agents-core";

import { generateOpaqueToken, hashToken, normalizeRedirectPath, requireConfiguredAuthForWrite } from "../../../../../lib/server/auth";
import { deliverMagicLinkEmail } from "../../../../../lib/server/mailer";
import { enforceRateLimit, getClientIp } from "../../../../../lib/server/rate-limit";
import { errorResponse, parseRequestWithSchema } from "../../../../../lib/server/http";
import { getRepositoryBundle } from "../../../../../lib/server/repositories";

function rebasePreviewUrl(previewUrl: string | undefined, request: Request) {
  if (!previewUrl) {
    return undefined;
  }

  const preview = new URL(previewUrl, request.url);
  return new URL(`${preview.pathname}${preview.search}`, request.url).toString();
}

export async function POST(request: Request) {
  try {
    requireConfiguredAuthForWrite();
    const parsed = await parseRequestWithSchema(request, magicLinkRequestSchema);
    await enforceRateLimit("magic-link-ip", getClientIp(request));
    await enforceRateLimit("magic-link-email", parsed.email.toLowerCase());

    const rawToken = generateOpaqueToken();
    const bundle = await getRepositoryBundle();
    const record = await bundle.authRepository.createMagicLink({
      ...parsed,
      redirectTo: normalizeRedirectPath(parsed.redirectTo),
      rawToken,
      tokenHash: hashToken(rawToken),
    });
    const delivery = await deliverMagicLinkEmail({
      email: parsed.email,
      rawToken,
      role: parsed.role,
    });

    return NextResponse.json({
      message: "If the email is registered, a sign-in link is on the way.",
      expiresAt: record.expiresAt,
      previewUrl: rebasePreviewUrl(delivery.previewUrl, request),
    }, { status: 202 });
  } catch (error) {
    return errorResponse(error);
  }
}
