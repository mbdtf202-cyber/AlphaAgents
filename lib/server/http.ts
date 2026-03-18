import { NextResponse } from "next/server";
import { ZodSchema } from "zod";

import { AuthError, ConfigurationError, ForbiddenError, NotFoundError, RateLimitError } from "./errors";
import { incrementErrorCount } from "./metrics";
import { captureException } from "./monitoring";
import { logError, logEvent } from "./log";

export async function parseRequestWithSchema<T>(request: Request, schema: ZodSchema<T>): Promise<T> {
  const contentType = request.headers.get("content-type") ?? "";
  let payload: unknown;

  if (contentType.includes("application/json")) {
    payload = await request.json();
  } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    payload = Object.fromEntries(formData.entries());
  } else {
    payload = await request.json().catch(() => ({}));
  }

  return schema.parse(payload);
}

export function errorResponse(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
  if (error instanceof ForbiddenError) {
    return NextResponse.json({ error: error.message }, { status: 403 });
  }
  if (error instanceof NotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
  if (error instanceof ConfigurationError) {
    logError("configuration_error", error);
    captureException(error, { category: "configuration" });
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
  if (error instanceof RateLimitError) {
    logEvent("warn", "rate_limit_exceeded", { retryAfterSeconds: error.retryAfterSeconds });
    return NextResponse.json(
      { error: error.message },
      { status: 429, headers: { "Retry-After": String(error.retryAfterSeconds) } },
    );
  }
  if (error instanceof Error) {
    incrementErrorCount(error.name);
    logError("request_failed", error);
    captureException(error, { category: "request" });
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  incrementErrorCount("UnknownError");
  logEvent("error", "request_failed_unknown", { error });
  return NextResponse.json({ error: "Unknown error." }, { status: 500 });
}
