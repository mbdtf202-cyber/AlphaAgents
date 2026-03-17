import Link from "next/link";

import type { Locale } from "@openclaw/agent-ledger-core";

import { resolveText } from "@openclaw/agent-ledger-core";

import { LanguageToggle } from "./language-toggle";
import { publicNavigation, siteName, siteTagline, siteTaglineZh } from "../lib/site";

export function SiteHeader({ locale }: { locale: Locale }) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-950/8 bg-parchment/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-4 px-5 py-4 md:px-8">
        <Link href="/" className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-950 text-sm font-semibold text-parchment shadow-lg shadow-ink-950/20">
              AL
            </div>
            <div className="min-w-0">
              <div className="font-display text-[1.35rem] leading-none text-ink-950">{siteName}</div>
              <div className="truncate text-sm text-ink-600">{locale === "en" ? siteTagline : siteTaglineZh}</div>
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {publicNavigation.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium text-ink-700 transition hover:text-ink-950">
              {resolveText(item.label, locale)}
            </Link>
          ))}
          <Link
            href="/workspace"
            className="rounded-full border border-ink-950/10 bg-white px-4 py-2 text-sm font-semibold text-ink-950 shadow-sm transition hover:border-copper-500"
          >
            {locale === "en" ? "Open workspace" : "进入工作台"}
          </Link>
        </nav>
        <LanguageToggle locale={locale} />
      </div>
    </header>
  );
}
