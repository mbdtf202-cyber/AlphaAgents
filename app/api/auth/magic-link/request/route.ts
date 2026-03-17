import { NextResponse } from "next/server";

import { magicLinkRequestSchema } from "@openclaw/alpha-agents-core";

import { generateOpaqueToken, hashToken, normalizeRedirectPath, requireConfiguredAuthForWrite } from "../../../../../lib/server/auth";
import { getAppUrl } from "../../../../../lib/server/env";
import { errorResponse, parseRequestWithSchema } from "../../../../../lib/server/http";
import { getRepositoryBundle } from "../../../../../lib/server/repositories";

export async function POST(request: Request) {
  try {
    requireConfiguredAuthForWrite();
    const parsed = await parseRequestWithSchema(request, magicLinkRequestSchema);

    const rawToken = generateOpaqueToken();
    const bundle = await getRepositoryBundle();
    const record = await bundle.authRepository.createMagicLink({
      ...parsed,
      redirectTo: normalizeRedirectPath(parsed.redirectTo),
      rawToken,
      tokenHash: hashToken(rawToken),
    });
    const previewUrl = `${getAppUrl()}/api/auth/magic-link/verify?token=${rawToken}`;

    return NextResponse.json({
      message: "Magic link created.",
      expiresAt: record.expiresAt,
      previewUrl: process.env.NODE_ENV === "production" ? undefined : previewUrl,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
