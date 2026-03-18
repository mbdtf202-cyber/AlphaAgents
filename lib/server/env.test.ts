import { afterEach, describe, expect, it } from "vitest";

import {
  getAppUrl,
  getStorageMode,
  isTestMailerEnabled,
  validateRuntimeConfig,
} from "./env";

const ORIGINAL_ENV = { ...process.env };

function resetEnv() {
  process.env = { ...ORIGINAL_ENV };
}

function setNodeEnv(value: string) {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

describe("env", () => {
  afterEach(() => {
    resetEnv();
  });

  it("requires explicit storage mode in production", () => {
    setNodeEnv("production");
    delete process.env.ALPHA_AGENTS_STORAGE;

    expect(() => getStorageMode()).toThrow("ALPHA_AGENTS_STORAGE is required in production.");
  });

  it("infers postgres storage outside production when a database url exists", () => {
    setNodeEnv("test");
    delete process.env.ALPHA_AGENTS_STORAGE;
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/alpha_agents";

    expect(getStorageMode()).toBe("postgres");
  });

  it("requires launch auth, mail, and sentry settings for production postgres", () => {
    setNodeEnv("production");
    process.env.ALPHA_AGENTS_STORAGE = "postgres";
    process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/alpha_agents";
    delete process.env.ALPHA_AGENTS_AUTH_SECRET;
    delete process.env.ALPHA_AGENTS_APP_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
    delete process.env.POSTMARK_SERVER_TOKEN;
    delete process.env.POSTMARK_FROM_EMAIL;
    delete process.env.POSTMARK_MESSAGE_STREAM;
    delete process.env.SENTRY_DSN;
    delete process.env.SENTRY_ENVIRONMENT;
    delete process.env.SENTRY_RELEASE;

    expect(() => validateRuntimeConfig("web")).toThrow(/GITHUB_CLIENT_ID/);
    expect(() => validateRuntimeConfig("web")).toThrow(/POSTMARK_SERVER_TOKEN/);
    expect(() => validateRuntimeConfig("web")).toThrow(/SENTRY_DSN/);
  });

  it("allows explicit sample mode in production when observability is configured", () => {
    setNodeEnv("production");
    process.env.ALPHA_AGENTS_STORAGE = "sample";
    process.env.SENTRY_DSN = "https://public@example.ingest.sentry.io/1";
    process.env.SENTRY_ENVIRONMENT = "production";
    process.env.SENTRY_RELEASE = "v0.5.0-rc.3";

    expect(validateRuntimeConfig("web")).toEqual({
      target: "web",
      storageMode: "sample",
      production: true,
    });
  });

  it("only enables preview mailer when explicitly requested outside production", () => {
    setNodeEnv("test");
    process.env.ALPHA_AGENTS_ENABLE_TEST_MAILER = "true";

    expect(isTestMailerEnabled()).toBe(true);

    setNodeEnv("production");
    expect(isTestMailerEnabled()).toBe(false);
  });

  it("defaults the app url in non production and requires it in production", () => {
    setNodeEnv("test");
    delete process.env.ALPHA_AGENTS_APP_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;

    expect(getAppUrl()).toBe("http://localhost:3100");

    setNodeEnv("production");
    expect(() => getAppUrl()).toThrow("ALPHA_AGENTS_APP_URL is required in production.");
  });
});
