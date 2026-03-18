import { renderMetrics } from "../../../lib/server/metrics";
import { getReadinessSnapshot } from "../../../lib/server/health";

export async function GET() {
  await getReadinessSnapshot();
  return new Response(await renderMetrics(), {
    status: 200,
    headers: {
      "Content-Type": "text/plain; version=0.0.4; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
