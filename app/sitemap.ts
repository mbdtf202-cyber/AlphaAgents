import type { MetadataRoute } from "next";

import { benchmarkSuites } from "@openclaw/alpha-agents-core";

import { getReadCatalog } from "../lib/server/repositories";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getReadCatalog();
  const base = "https://alpha-agents.example.com";
  return [
    "",
    "/agents",
    "/benchmarks",
    "/leaderboards",
    "/compare",
    "/for-builders",
    "/for-teams",
    ...catalog.agents.map((agent) => `/agents/${agent.slug}`),
    ...catalog.builders.map((builder) => `/builders/${builder.handle}`),
    ...benchmarkSuites.map((suite) => `/benchmarks/${suite.slug}`),
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}
