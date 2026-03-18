import { benchmarkSuites } from "@openclaw/alpha-agents-core";
import { benchmarkSuitesTable } from "@openclaw/alpha-agents-core/db/schema";

import { getDb } from "./db";
import { getStorageMode } from "./env";

declare global {
  var __alphaAgentsBootstrapPromise: Promise<void> | undefined;
}

async function seedBenchmarkSuites() {
  const db = getDb();
  await db
    .insert(benchmarkSuitesTable)
    .values(
      benchmarkSuites.map((suite) => ({
        slug: suite.slug,
        track: suite.track,
        title: suite.title,
        summary: suite.summary,
        methodology: suite.methodology,
        publicDevSetSize: suite.publicDevSetSize,
        heldOutSetSize: suite.heldOutSetSize,
      })),
    )
    .onConflictDoNothing();
}

export async function ensurePlatformBootstrap() {
  if (getStorageMode() !== "postgres") {
    return;
  }
  if (!globalThis.__alphaAgentsBootstrapPromise) {
    globalThis.__alphaAgentsBootstrapPromise = seedBenchmarkSuites();
  }
  await globalThis.__alphaAgentsBootstrapPromise;
}

export function resetPlatformBootstrap() {
  globalThis.__alphaAgentsBootstrapPromise = undefined;
}
