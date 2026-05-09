import { NextResponse } from "next/server";

import { getCatalogModel } from "../../../lib/alphaagents/view-models";
import { createDemoEnvelope } from "../../../lib/alphaagents/commands";
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
  const actorRole = body.actorRole ?? "operator";
  const result = executeRuntimeCommand(
    body.commandName,
    {
      ...createDemoEnvelope(actorRole, body.payload ?? {}),
      sourceChannel: "api",
      expectedVersion: body.expectedVersion,
      tokenScopes: body.tokenScopes ?? createDemoEnvelope(actorRole, {}).tokenScopes
    },
    { stateFile: resolveStateFile() }
  );
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
