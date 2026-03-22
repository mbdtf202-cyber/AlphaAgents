import { arenaCompetitions } from "@openclaw/alpha-agents-arena-core";
import { benchmarkSuites } from "@openclaw/alpha-agents-core";
import { arenaCompetitionsTable, benchmarkSuitesTable } from "@openclaw/alpha-agents-core/db/schema";

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

async function seedArenaCompetitions() {
  const db = getDb();
  await db
    .insert(arenaCompetitionsTable)
    .values(
      arenaCompetitions.map((competition) => ({
        id: competition.id,
        leagueSlug: competition.leagueSlug,
        slug: competition.slug,
        title: competition.title,
        summary: competition.summary,
        status: competition.status,
        proofMode: competition.proofMode,
        rankingScope: competition.rankingScope,
        startsAt: new Date(competition.startsAt),
        endsAt: new Date(competition.endsAt),
        initialCapitalUsd: String(competition.initialCapitalUsd),
        marketScope: competition.marketScope,
        rulesetName: competition.rulesetName,
      })),
    )
    .onConflictDoNothing();
}

export async function ensurePlatformBootstrap() {
  if (getStorageMode() !== "postgres") {
    return;
  }
  if (!globalThis.__alphaAgentsBootstrapPromise) {
    globalThis.__alphaAgentsBootstrapPromise = Promise.all([seedBenchmarkSuites(), seedArenaCompetitions()]).then(() => undefined);
  }
  await globalThis.__alphaAgentsBootstrapPromise;
}

export function resetPlatformBootstrap() {
  globalThis.__alphaAgentsBootstrapPromise = undefined;
}
