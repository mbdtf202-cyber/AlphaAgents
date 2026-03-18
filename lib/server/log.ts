export type LogLevel = "info" | "warn" | "error";

function serializeError(error: unknown) {
  if (!(error instanceof Error)) {
    return error;
  }
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
}

export function logEvent(level: LogLevel, message: string, context?: Record<string, unknown>) {
  const payload = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };
  const output = JSON.stringify(payload);
  if (level === "error") {
    console.error(output);
    return;
  }
  if (level === "warn") {
    console.warn(output);
    return;
  }
  console.log(output);
}

export function logError(message: string, error: unknown, context?: Record<string, unknown>) {
  logEvent("error", message, {
    ...context,
    error: serializeError(error),
  });
}
