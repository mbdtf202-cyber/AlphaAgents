"use client";

import { Languages } from "lucide-react";

import type { Locale } from "@openclaw/alpha-agents-core";

export function LanguageToggle({ locale }: { locale: Locale }) {
  const nextLocale: Locale = locale === "en" ? "zh-CN" : "en";

  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full border border-ink-950/10 bg-white/80 px-3 py-2 text-sm font-medium text-ink-700 shadow-sm transition hover:border-copper-500 hover:text-ink-950"
      onClick={() => {
        document.cookie = `alpha-agents-locale=${nextLocale}; path=/; max-age=31536000`;
        window.location.reload();
      }}
    >
      <Languages className="h-4 w-4" />
      {locale === "en" ? "中文" : "EN"}
    </button>
  );
}
