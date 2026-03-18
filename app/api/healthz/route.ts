import { NextResponse } from "next/server";

import { getHealthSnapshot } from "../../../lib/server/health";

export async function GET() {
  return NextResponse.json(await getHealthSnapshot(), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
