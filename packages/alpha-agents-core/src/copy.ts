import type { Locale, LocalizedText } from "./types";

export function resolveText(value: LocalizedText, locale: Locale): string {
  return value[locale] || value.en;
}

export function listText(values: LocalizedText[], locale: Locale): string[] {
  return values.map((value) => resolveText(value, locale));
}
