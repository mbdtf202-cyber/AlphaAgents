import Link from "next/link";

import type { Locale, SessionActor } from "@openclaw/alpha-agents-core";

import { resolveText } from "@openclaw/alpha-agents-core";

import { LanguageToggle } from "./language-toggle";
import { BrandMark } from "./brand-mark";
import { publicNavigation, siteName, siteTagline, siteTaglineZh } from "../lib/site";

export function SiteHeader({
  locale,
  session,
  workspaceHref = "/workspace",
}: {
  locale: Locale;
  session: SessionActor | null;
  workspaceHref?: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-950/8 bg-parchment/88 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-4 px-5 py-4 md:px-8">
        <Link href="/" className="min-w-0 flex-1">
          <div className="flex items-center gap-3.5">
            <BrandMark className="h-12 w-12 shrink-0" />
            <div className="min-w-0">
              <div className="font-display text-[1.35rem] leading-none text-ink-950">{siteName}</div>
              <div className="flex items-center gap-2 truncate text-sm text-ink-700">
                <span className="hero-status-dot h-2 w-2 shrink-0" />
                <span>{locale === "en" ? siteTagline : siteTaglineZh}</span>
              </div>
            </div>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {publicNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-sm font-medium text-ink-700 transition hover:text-ink-950 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-copper-500 after:transition-transform hover:after:scale-x-100"
            >
              {resolveText(item.label, locale)}
            </Link>
          ))}
          {session ? (
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-ink-950/10 bg-white px-4 py-2 text-sm font-semibold text-ink-950">
                {session.githubHandle ? `@${session.githubHandle}` : session.email}
              </div>
              <Link
                href={workspaceHref}
                className="rounded-full border border-ink-950/10 bg-white px-4 py-2 text-sm font-semibold text-ink-950 shadow-sm transition hover:-translate-y-0.5 hover:border-copper-500"
              >
                {locale === "en" ? "Open workspace" : "进入工作台"}
              </Link>
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="rounded-full px-4 py-2 text-sm font-semibold text-ink-700">
                  {locale === "en" ? "Sign out" : "退出"}
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-ink-950/10 bg-white px-4 py-2 text-sm font-semibold text-ink-950 shadow-sm transition hover:-translate-y-0.5 hover:border-copper-500"
            >
              {locale === "en" ? "Sign in" : "登录"}
            </Link>
          )}
        </nav>
        <details className="lg:hidden">
          <summary className="list-none rounded-full border border-ink-950/10 bg-white/80 px-4 py-2 text-sm font-semibold text-ink-950">
            {locale === "en" ? "Menu" : "菜单"}
          </summary>
          <div className="absolute right-5 top-[72px] z-40 grid min-w-[240px] gap-2 rounded-[1.5rem] border border-ink-950/8 bg-white/95 p-4 shadow-[0_24px_60px_-32px_rgba(13,24,36,0.45)] md:right-8">
            {publicNavigation.map((item) => (
              <Link key={item.href} href={item.href} className="rounded-2xl px-3 py-2 text-sm font-medium text-ink-800 hover:bg-parchment-deep">
                {resolveText(item.label, locale)}
              </Link>
            ))}
            {session ? (
              <>
                <Link href={workspaceHref} className="rounded-2xl px-3 py-2 text-sm font-semibold text-ink-950 hover:bg-parchment-deep">
                  {locale === "en" ? "Open workspace" : "进入工作台"}
                </Link>
                <form action="/api/auth/logout" method="post">
                  <button type="submit" className="w-full rounded-2xl px-3 py-2 text-left text-sm font-semibold text-ink-700 hover:bg-parchment-deep">
                    {locale === "en" ? "Sign out" : "退出"}
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="rounded-2xl px-3 py-2 text-sm font-semibold text-ink-950 hover:bg-parchment-deep">
                {locale === "en" ? "Sign in" : "登录"}
              </Link>
            )}
          </div>
        </details>
        <LanguageToggle locale={locale} />
      </div>
    </header>
  );
}
