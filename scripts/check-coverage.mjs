import fs from "node:fs";
import path from "node:path";

const summaryPath = path.join(process.cwd(), "coverage", "coverage-summary.json");
const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));

function findEntry(key) {
  return (
    summary[key] ||
    summary[path.relative(process.cwd(), key).replace(/\\/g, "/")] ||
    summary[`./${path.relative(process.cwd(), key).replace(/\\/g, "/")}`]
  );
}

const thresholds = [
  { key: "total", metric: "statements", min: 45 },
  { key: "total", metric: "lines", min: 45 },
  { key: "/Users/raki/Desktop/AlphaAgents/lib/server/repositories.ts", metric: "statements", min: 20 },
  { key: "/Users/raki/Desktop/AlphaAgents/lib/server/db.ts", metric: "statements", min: 80 },
  { key: "/Users/raki/Desktop/AlphaAgents/lib/server/env.ts", metric: "statements", min: 70 },
];

const failures = thresholds.flatMap((threshold) => {
  const entry = findEntry(threshold.key);
  if (!entry) {
    return [`Missing coverage entry for ${threshold.key}`];
  }
  const actual = Number(entry[threshold.metric]?.pct ?? 0);
  return actual >= threshold.min ? [] : [`${threshold.key} ${threshold.metric} ${actual}% is below ${threshold.min}%`];
});

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}
