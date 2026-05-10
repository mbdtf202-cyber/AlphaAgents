import { spawnSync } from "node:child_process";

const scripts = [
  "scripts/verify-contract.mjs",
  "scripts/verify-evidence-package.mjs",
  "scripts/verify-visual-system.mjs",
  "scripts/verify-frontend-implementation.mjs",
  "scripts/verify-live-routes.mjs",
  "scripts/verify-business-readiness.mjs",
  "scripts/verify-acceptance-coverage.mjs",
  "scripts/verify-a19-frontend-coverage.mjs",
  "scripts/verify-goal-completion.mjs"
];

for (const script of scripts) {
  const result = spawnSync(process.execPath, [script], { stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log("all AlphaAgents readiness gates passed");
