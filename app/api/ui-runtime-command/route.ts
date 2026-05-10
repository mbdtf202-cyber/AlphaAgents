import { NextResponse } from "next/server";

import { buildAuthorizedCommandEnvelope, hasForbiddenPrivilegeFields, isDemoWriteApiEnabled, requireRuntimeApiAuth } from "../../../lib/alphaagents/api-auth";
import { executeRuntimeCommand } from "../../../lib/alphaagents/runtime-engine";
import { resolveStateFile } from "../../../lib/alphaagents/runtime-state";

export async function POST(request: Request) {
  if (!isDemoWriteApiEnabled()) {
    return NextResponse.json(
      { ok: false, errorCode: "DEMO_WRITE_API_DISABLED", message: "UI runtime writes require explicit non-production demo write mode." },
      { status: 403 }
    );
  }

  const body = await request.json();
  const forbiddenFields = hasForbiddenPrivilegeFields(body);
  if (forbiddenFields.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        errorCode: "FORBIDDEN_PRIVILEGE_FIELDS",
        message: `Privilege fields must be resolved server-side: ${forbiddenFields.join(", ")}`
      },
      { status: 400 }
    );
  }

  const auth = requireRuntimeApiAuth(request, { allowDemo: true });
  if (auth.error) {
    const { error } = auth;
    return NextResponse.json({ ok: false, errorCode: error.errorCode, message: error.message }, { status: error.status });
  }

  const result = executeRuntimeCommand(
    body.commandName,
    buildAuthorizedCommandEnvelope(body.commandName, body, auth),
    { stateFile: resolveStateFile() }
  );
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
