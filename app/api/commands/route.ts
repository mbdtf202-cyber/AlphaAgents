import { NextResponse } from "next/server";
import crypto from "node:crypto";

import { createDemoEnvelope } from "../../../lib/alphaagents/commands";
import { executeRuntimeCommand } from "../../../lib/alphaagents/runtime-engine";
import { resolveStateFile } from "../../../lib/alphaagents/runtime-state";

export async function POST(request: Request) {
  const body = await request.json();
  const actorRole = body.actorRole ?? "buyer";
  const baseline = createDemoEnvelope(actorRole, body.payload ?? {});
  const result = executeRuntimeCommand(
    body.commandName,
    {
      ...baseline,
      commandId: body.commandId ?? `cmd_${crypto.randomUUID().slice(0, 12)}`,
      idempotencyKey: body.idempotencyKey ?? `idem_${crypto.randomUUID().slice(0, 12)}`,
      correlationId: body.correlationId ?? `corr_${crypto.randomUUID().slice(0, 12)}`,
      sourceChannel: "api",
      expectedVersion: body.expectedVersion ?? baseline.expectedVersion,
      tokenScopes: body.tokenScopes ?? baseline.tokenScopes,
      tenantId: body.tenantId ?? baseline.tenantId
    },
    { stateFile: resolveStateFile() }
  );
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
