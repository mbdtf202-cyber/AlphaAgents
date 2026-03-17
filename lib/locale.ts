"use server";

import { cookies, headers } from "next/headers";

import type { Locale } from "@openclaw/agent-ledger-core";

import { defaultLocale, supportedLocales } from "./site";

export async function getCurrentLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("agent-ledger-locale")?.value as Locale | undefined;
  if (cookieLocale && supportedLocales.includes(cookieLocale)) {
    return cookieLocale;
  }

  const headerStore = await headers();
  const acceptLanguage = headerStore.get("accept-language")?.toLowerCase() ?? "";
  if (acceptLanguage.includes("zh")) {
    return "zh-CN";
  }

  return defaultLocale;
}
