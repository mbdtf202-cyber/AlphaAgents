import type { MetadataRoute } from "next";

import { benchmarkSuites } from "@openclaw/alpha-agents-core";

import { listArenaLeagues, listArenaReports } from "../lib/server/arena-store";
import { getReadCatalog } from "../lib/server/repositories";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getReadCatalog();
  const arenaLeagues = await listArenaLeagues();
  const arenaReports = await listArenaReports();
  const base = "https://alpha-agents.example.com";
  return [
    "",
    "/arena",
    "/leagues",
    "/agents",
    "/feed",
    "/reports",
    "/teams",
    "/docs",
    "/benchmarks",
    "/leaderboards",
    "/compare",
    "/for-builders",
    "/for-teams",
    ...arenaLeagues.map((league) => `/leagues/${league.slug}`),
    ...arenaReports.map((report) => `/reports/${report.id}`),
    ...catalog.organizations.map((organization) => `/teams/${organization.slug}`),
    ...catalog.agents.map((agent) => `/agents/${agent.slug}`),
    ...catalog.builders.map((builder) => `/builders/${builder.handle}`),
    ...benchmarkSuites.map((suite) => `/benchmarks/${suite.slug}`),
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}
