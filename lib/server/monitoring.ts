import * as Sentry from "@sentry/node";

import { getSentryConfig } from "./env";

declare global {
  var __alphaAgentsSentryInitialized: boolean | undefined;
}

export function initializeMonitoring(serviceName: string) {
  if (globalThis.__alphaAgentsSentryInitialized) {
    return;
  }

  const sentry = getSentryConfig();
  if (!sentry.dsn) {
    globalThis.__alphaAgentsSentryInitialized = true;
    return;
  }

  Sentry.init({
    dsn: sentry.dsn,
    environment: sentry.environment,
    release: sentry.release,
    tracesSampleRate: 0,
    initialScope: {
      tags: {
        service: serviceName,
      },
    },
  });

  globalThis.__alphaAgentsSentryInitialized = true;
}

export function captureException(error: unknown, extra?: Record<string, unknown>) {
  initializeMonitoring("alpha-agents");
  Sentry.captureException(error, {
    extra,
  });
}
