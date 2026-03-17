import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import { getDatabaseUrl } from "./env";

let postgresClient: ReturnType<typeof postgres> | undefined;
let drizzleDb: ReturnType<typeof drizzle> | undefined;

export function getDb() {
  if (!postgresClient) {
    postgresClient = postgres(getDatabaseUrl(), { prepare: false });
    drizzleDb = drizzle(postgresClient);
  }
  if (!drizzleDb) {
    throw new Error("Database client failed to initialize.");
  }
  return drizzleDb;
}

export async function closeDb() {
  if (postgresClient) {
    await postgresClient.end();
    postgresClient = undefined;
    drizzleDb = undefined;
  }
}
