import { ConfigurationError } from "./errors";

export type StorageMode = "sample" | "memory" | "postgres";
export type RuntimeTarget = "web" | "worker";

function trimEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

function isProductionBuildPhase(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.__NEXT_PRIVATE_BUILD_WORKER === "true" ||
    process.env.npm_lifecycle_event === "build"
  );
}

export function getStorageMode(): StorageMode {
  const configured = trimEnv("ALPHA_AGENTS_STORAGE") as StorageMode | undefined;
  if (configured === "sample" || configured === "memory" || configured === "postgres") {
    return configured;
  }
  if (isProductionRuntime()) {
    if (isProductionBuildPhase()) {
      return "sample";
    }
    throw new ConfigurationError("ALPHA_AGENTS_STORAGE is required in production.");
  }
  if (trimEnv("DATABASE_URL")) {
    return "postgres";
  }
  if (process.env.NODE_ENV === "test" || process.env.NODE_ENV === "development") {
    return "memory";
  }
  return "sample";
}

export function getDatabaseUrl(): string {
  const url = trimEnv("DATABASE_URL");
  if (!url) {
    throw new ConfigurationError("DATABASE_URL is required for persistent AlphaAgents storage.");
  }
  return url;
}

export function getAppUrl(): string {
  const appUrl = trimEnv("ALPHA_AGENTS_APP_URL") || trimEnv("NEXT_PUBLIC_APP_URL");
  if (appUrl) {
    return appUrl;
  }
  if (isProductionRuntime()) {
    throw new ConfigurationError("ALPHA_AGENTS_APP_URL is required in production.");
  }
  return "http://localhost:3100";
}

export function getCanonicalAppOrigin(): string {
  return new URL(getAppUrl()).origin;
}

export function getCanonicalRequestRedirect(request: Request): URL | null {
  const requestUrl = new URL(request.url);
  const canonicalOrigin = getCanonicalAppOrigin();
  if (requestUrl.origin === canonicalOrigin) {
    return null;
  }
  return new URL(`${requestUrl.pathname}${requestUrl.search}`, canonicalOrigin);
}

export function getAuthSecret(): string {
  const secret = trimEnv("ALPHA_AGENTS_AUTH_SECRET");
  if (secret) {
    return secret;
  }
  if (!isProductionRuntime()) {
    return "alpha-agents-dev-secret";
  }
  throw new ConfigurationError("ALPHA_AGENTS_AUTH_SECRET is required in production.");
}

export function getGitHubConfig() {
  return {
    clientId: trimEnv("GITHUB_CLIENT_ID"),
    clientSecret: trimEnv("GITHUB_CLIENT_SECRET"),
  };
}

export function getPostmarkConfig() {
  return {
    serverToken: trimEnv("POSTMARK_SERVER_TOKEN"),
    fromEmail: trimEnv("POSTMARK_FROM_EMAIL"),
    messageStream: trimEnv("POSTMARK_MESSAGE_STREAM"),
  };
}

export function getSentryConfig() {
  return {
    dsn: trimEnv("SENTRY_DSN"),
    environment: trimEnv("SENTRY_ENVIRONMENT"),
    release: trimEnv("SENTRY_RELEASE"),
  };
}

export function isTestMailerEnabled(): boolean {
  return !isProductionRuntime() && trimEnv("ALPHA_AGENTS_ENABLE_TEST_MAILER") === "true";
}

export function isRateLimitDisabled(): boolean {
  return trimEnv("ALPHA_AGENTS_DISABLE_RATE_LIMITS") === "true";
}

export function isSampleOverlayEnabled(): boolean {
  const configured = trimEnv("ALPHA_AGENTS_ENABLE_SAMPLE_OVERLAY");
  if (configured === "true") {
    return true;
  }
  if (configured === "false") {
    return false;
  }
  return !isProductionRuntime();
}

export function validateRuntimeConfig(target: RuntimeTarget) {
  const storageMode = getStorageMode();
  const errors: string[] = [];
  const github = getGitHubConfig();
  const postmark = getPostmarkConfig();
  const sentry = getSentryConfig();

  if (storageMode === "postgres") {
    try {
      getDatabaseUrl();
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "DATABASE_URL is invalid.");
    }
  }

  if (target === "worker" && storageMode !== "postgres") {
    errors.push("Benchmark worker requires ALPHA_AGENTS_STORAGE=postgres.");
  }

  if (isProductionRuntime()) {
    if (!sentry.dsn) {
      errors.push("SENTRY_DSN is required in production.");
    }
    if (!sentry.environment) {
      errors.push("SENTRY_ENVIRONMENT is required in production.");
    }
    if (!sentry.release) {
      errors.push("SENTRY_RELEASE is required in production.");
    }

    if (storageMode !== "sample") {
      const appUrl = trimEnv("ALPHA_AGENTS_APP_URL");
      const publicAppUrl = trimEnv("NEXT_PUBLIC_APP_URL");
      if (appUrl && publicAppUrl) {
        try {
          if (new URL(appUrl).origin !== new URL(publicAppUrl).origin) {
            errors.push("ALPHA_AGENTS_APP_URL and NEXT_PUBLIC_APP_URL must share the same origin.");
          }
        } catch {
          errors.push("ALPHA_AGENTS_APP_URL and NEXT_PUBLIC_APP_URL must be valid URLs.");
        }
      }
      if (!trimEnv("ALPHA_AGENTS_AUTH_SECRET")) {
        errors.push("ALPHA_AGENTS_AUTH_SECRET is required in production.");
      }
      if (!trimEnv("ALPHA_AGENTS_APP_URL") && !trimEnv("NEXT_PUBLIC_APP_URL")) {
        errors.push("ALPHA_AGENTS_APP_URL is required in production.");
      }
      if (!github.clientId) {
        errors.push("GITHUB_CLIENT_ID is required in production.");
      }
      if (!github.clientSecret) {
        errors.push("GITHUB_CLIENT_SECRET is required in production.");
      }
      if (!postmark.serverToken) {
        errors.push("POSTMARK_SERVER_TOKEN is required in production.");
      }
      if (!postmark.fromEmail) {
        errors.push("POSTMARK_FROM_EMAIL is required in production.");
      }
      if (!postmark.messageStream) {
        errors.push("POSTMARK_MESSAGE_STREAM is required in production.");
      }
      if (!trimEnv("ALPHA_AGENTS_EXECUTOR_ID")) {
        errors.push("ALPHA_AGENTS_EXECUTOR_ID is required in production.");
      }
      if (!trimEnv("ALPHA_AGENTS_EXECUTOR_KEY_ID")) {
        errors.push("ALPHA_AGENTS_EXECUTOR_KEY_ID is required in production.");
      }
      if (!trimEnv("ALPHA_AGENTS_EXECUTOR_ATTESTATION_SECRET")) {
        errors.push("ALPHA_AGENTS_EXECUTOR_ATTESTATION_SECRET is required in production.");
      }
      if (!trimEnv("ALPHA_AGENTS_BENCHMARK_VERIFIER_ID")) {
        errors.push("ALPHA_AGENTS_BENCHMARK_VERIFIER_ID is required in production.");
      }
    }
  }

  if (errors.length > 0) {
    throw new ConfigurationError(errors.join(" "));
  }

  return {
    target,
    storageMode,
    production: isProductionRuntime(),
  };
}
