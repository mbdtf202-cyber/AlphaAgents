import { ConfigurationError } from "./errors";

export type StorageMode = "sample" | "memory" | "postgres";

export function getStorageMode(): StorageMode {
  const configured = process.env.AGENT_LEDGER_STORAGE?.trim() as StorageMode | undefined;
  if (configured === "sample" || configured === "memory" || configured === "postgres") {
    return configured;
  }
  if (process.env.DATABASE_URL?.trim()) {
    return "postgres";
  }
  if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") {
    return "memory";
  }
  return "sample";
}

export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new ConfigurationError("DATABASE_URL is required for persistent Agent Ledger storage.");
  }
  return url;
}

export function getAppUrl(): string {
  return process.env.AGENT_LEDGER_APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";
}

export function getAuthSecret(): string {
  const secret = process.env.AGENT_LEDGER_AUTH_SECRET?.trim();
  if (secret) {
    return secret;
  }
  if (process.env.NODE_ENV !== "production") {
    return "agent-ledger-dev-secret";
  }
  throw new ConfigurationError("AGENT_LEDGER_AUTH_SECRET is required in production.");
}

export function getGitHubConfig() {
  return {
    clientId: process.env.GITHUB_CLIENT_ID?.trim(),
    clientSecret: process.env.GITHUB_CLIENT_SECRET?.trim(),
  };
}
