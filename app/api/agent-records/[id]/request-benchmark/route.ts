import { NextResponse } from "next/server";

import { benchmarkRequestSchema } from "@openclaw/agent-ledger-core";
import { runDemoBenchmark } from "@openclaw/agent-ledger-runner";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const json = await request.json();
  const parsed = benchmarkRequestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const demo = runDemoBenchmark({
    ...parsed.data,
    agentSlug: id,
    initiatedBy: "workspace",
  });

  return NextResponse.json({
    message: `Benchmark run scheduled for ${id}.`,
    scheduled: true,
    previewArtifact: demo,
  });
}
