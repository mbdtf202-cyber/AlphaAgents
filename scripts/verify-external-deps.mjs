import assert from "node:assert/strict";
import fs from "node:fs";
import net from "node:net";

loadEnvFile(".env.local");

const strict = process.env.ALPHAAGENTS_VERIFY_EXTERNAL_DEPS_STRICT === "true";
const requiredKeys = [
  "DATABASE_URL",
  "REDIS_URL",
  "OBJECT_STORAGE_ENDPOINT",
  "OBJECT_STORAGE_BUCKET",
  "OBJECT_STORAGE_ACCESS_KEY_ID",
  "OBJECT_STORAGE_SECRET_ACCESS_KEY",
  "POSTMARK_SERVER_TOKEN",
  "SENTRY_DSN",
  "ALPHAAGENTS_AUTH_SECRET"
];

for (const key of requiredKeys) {
  const value = process.env[key];
  assert(value && value.trim(), `[external-deps] ${key} is required`);
  assert(!isPlaceholder(value), `[external-deps] ${key} still contains a placeholder value`);
}

await probeTcp("DATABASE_URL", process.env.DATABASE_URL);
await probeTcp("REDIS_URL", process.env.REDIS_URL);
await probeTcp("OBJECT_STORAGE_ENDPOINT", process.env.OBJECT_STORAGE_ENDPOINT);

assert(
  /^https:\/\/[^@\s]+@[^/\s]+\.ingest\.sentry\.io\/\d+/.test(process.env.SENTRY_DSN),
  "[external-deps] SENTRY_DSN must be a valid Sentry ingest DSN"
);

if (strict) {
  assert(process.env.ALPHAAGENTS_INTERNAL_API_TOKEN, "[external-deps] strict mode requires ALPHAAGENTS_INTERNAL_API_TOKEN");
  assert(process.env.ALPHAAGENTS_INTERNAL_API_SCOPES, "[external-deps] strict mode requires ALPHAAGENTS_INTERNAL_API_SCOPES");
  assert(process.env.ALPHAAGENTS_INTERNAL_API_ACTOR_ROLES, "[external-deps] strict mode requires ALPHAAGENTS_INTERNAL_API_ACTOR_ROLES");
  assert(
    process.env.POSTMARK_SERVER_TOKEN?.startsWith("server-"),
    "[external-deps] strict mode requires a Postmark server token that starts with server-"
  );
  assert(!process.env.POSTMARK_SERVER_TOKEN.includes("local-dev"), "[external-deps] strict mode cannot use a local-dev Postmark token");
  assert(!process.env.SENTRY_DSN.includes("example"), "[external-deps] strict mode cannot use the sample Sentry DSN");
  for (const [label, value] of [
    ["DATABASE_URL", process.env.DATABASE_URL],
    ["REDIS_URL", process.env.REDIS_URL],
    ["OBJECT_STORAGE_ENDPOINT", process.env.OBJECT_STORAGE_ENDPOINT]
  ]) {
    const url = new URL(value);
    assert(!isLocalHost(url.hostname), `[external-deps] strict mode cannot use local ${label} host ${url.hostname}`);
  }
}

console.log(`[external-deps] dependency contract passed (${strict ? "strict" : "local-safe"} mode)`);

async function probeTcp(label, value) {
  const url = new URL(value);
  const host = url.hostname;
  const port = Number(url.port || defaultPort(url.protocol));
  assert(host && port, `[external-deps] ${label} must include host and port`);

  await new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port });
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error(`[external-deps] ${label} timed out at ${host}:${port}`));
    }, 2500);

    socket.once("connect", () => {
      clearTimeout(timeout);
      socket.end();
      resolve();
    });
    socket.once("error", (error) => {
      clearTimeout(timeout);
      reject(new Error(`[external-deps] ${label} unavailable at ${host}:${port}: ${error.message}`));
    });
  });
}

function defaultPort(protocol) {
  return {
    "postgresql:": 5432,
    "postgres:": 5432,
    "redis:": 6379,
    "http:": 80,
    "https:": 443
  }[protocol];
}

function isPlaceholder(value) {
  return /replace-with|__SET_|example\.com|localhost:5432|127\.0\.0\.1:5432/.test(value);
}

function isLocalHost(hostname) {
  return ["localhost", "127.0.0.1", "::1", "0.0.0.0"].includes(hostname);
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const source = fs.readFileSync(filePath, "utf8");
  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
