import { runMigrations } from "../lib/server/db";
import { logEvent } from "../lib/server/log";
import { validateRuntimeConfig } from "../lib/server/env";

async function main() {
  validateRuntimeConfig("web");
  await runMigrations();
  logEvent("info", "database_migrations_applied");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
