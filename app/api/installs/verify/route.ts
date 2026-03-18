import crypto from "node:crypto";

import { NextResponse } from "next/server";

import { installVerificationSchema } from "@openclaw/alpha-agents-core";

import { generateOpaqueToken, requireConfiguredAuthForWrite, requireSessionFromRequest } from "../../../../lib/server/auth";
import { errorResponse, parseRequestWithSchema } from "../../../../lib/server/http";
import { enforceAuthenticatedWriteRateLimit } from "../../../../lib/server/rate-limit";
import { getRepositoryBundle } from "../../../../lib/server/repositories";

export async function POST(request: Request) {
  try {
    requireConfiguredAuthForWrite();
    const actor = await requireSessionFromRequest(request);
    await enforceAuthenticatedWriteRateLimit(request, actor);
    const parsed = await parseRequestWithSchema(request, installVerificationSchema);
    const bundle = await getRepositoryBundle();
    const install = await bundle.installRepository.createVerifiedInstall(actor, {
      id: crypto.randomUUID(),
      ...parsed,
      verificationToken: generateOpaqueToken(),
      verifiedAt: new Date().toISOString(),
    });
    await bundle.auditRepository.append({
      actor,
      eventType: "install.verified",
      entityType: "install",
      entityId: install.id,
      newState: install,
    });
    return NextResponse.json(
      {
        message: "Install proof verified and persisted.",
        install,
      },
      { status: 201 },
    );
  } catch (error) {
    return errorResponse(error);
  }
}
