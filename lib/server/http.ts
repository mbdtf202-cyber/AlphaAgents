import { NextResponse } from "next/server";
import { ZodSchema } from "zod";

import { AuthError, ConfigurationError, ForbiddenError, NotFoundError } from "./errors";

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
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ error: "Unknown error." }, { status: 500 });
}
