import { NextResponse } from "next/server";

import { getCatalogModel } from "../../../lib/alphaagents/view-models";
import { buildAuthorizedCommandEnvelope, hasForbiddenPrivilegeFields, requireRuntimeApiAuth } from "../../../lib/alphaagents/api-auth";
import { executeRuntimeCommand } from "../../../lib/alphaagents/runtime-engine";
import { listRuntimeCategories, listRuntimeListings } from "../../../lib/alphaagents/runtime-queries";
import { resolveStateFile } from "../../../lib/alphaagents/runtime-state";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filters = Object.fromEntries(searchParams.entries());
  return NextResponse.json({
    ...getCatalogModel(filters),
    runtime: {
      categories: listRuntimeCategories({ stateFile: resolveStateFile() }),
      listings: listRuntimeListings({ stateFile: resolveStateFile() })
    }
  });
}

export async function POST(request: Request) {
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

  const auth = requireRuntimeApiAuth(request);
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
