import type { MetadataRoute } from "next";

import { agents, benchmarkSuites, builders } from "@openclaw/agent-ledger-core";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://agent-ledger.example.com";
  return [
    "",
    "/agents",
    "/benchmarks",
    "/leaderboards",
    "/compare",
    "/for-builders",
    "/for-teams",
    ...agents.map((agent) => `/agents/${agent.slug}`),
    ...builders.map((builder) => `/builders/${builder.handle}`),
    ...benchmarkSuites.map((suite) => `/benchmarks/${suite.slug}`),
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}
