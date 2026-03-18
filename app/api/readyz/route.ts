import { NextResponse } from "next/server";

import { getReadinessSnapshot } from "../../../lib/server/health";

export async function GET() {
  const snapshot = await getReadinessSnapshot();
  return NextResponse.json(snapshot, {
    status: snapshot.ready ? 200 : 503,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
