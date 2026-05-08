import { NextResponse } from "next/server";

import { contract } from "../../../lib/alphaagents/data";

export function GET() {
  return NextResponse.json(contract);
}
