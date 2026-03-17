import Link from "next/link";

import type { BuilderProfile, Locale } from "@openclaw/agent-ledger-core";

import { resolveText } from "@openclaw/agent-ledger-core";

export function BuilderCard({ builder, locale }: { builder: BuilderProfile; locale: Locale }) {
  return (
    <article className="surface-panel rounded-[2rem] p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-950 text-lg font-semibold text-parchment">
          {builder.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-xl font-semibold text-ink-950">{builder.name}</h3>
          <p className="text-sm text-ink-500">@{builder.handle}</p>
        </div>
      </div>
      <p className="mt-5 text-base leading-8 text-ink-700">{resolveText(builder.headline, locale)}</p>
      <div className="mt-6 grid minmax-0 grid-cols-3 gap-3">
        <div className="surface-muted rounded-2xl p-3">
          <div className="text-xs uppercase tracking-[0.18em] text-ink-500">{locale === "en" ? "Wins" : "夺榜"}</div>
          <div className="mt-1 text-2xl font-semibold text-ink-950">{builder.benchmarkWins}</div>
        </div>
        <div className="surface-muted rounded-2xl p-3">
          <div className="text-xs uppercase tracking-[0.18em] text-ink-500">{locale === "en" ? "Shortlists" : "入围"}</div>
          <div className="mt-1 text-2xl font-semibold text-ink-950">{builder.shortlistCount}</div>
        </div>
        <div className="surface-muted rounded-2xl p-3">
          <div className="text-xs uppercase tracking-[0.18em] text-ink-500">{locale === "en" ? "Reviews" : "评价"}</div>
          <div className="mt-1 text-2xl font-semibold text-ink-950">{builder.verifiedReviewCount}</div>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {builder.specialties.map((specialty) => (
          <span key={specialty} className="rounded-full border border-ink-950/10 px-3 py-1 text-sm text-ink-700">
            {specialty}
          </span>
        ))}
      </div>
      <Link href={`/builders/${builder.handle}`} className="mt-6 inline-flex text-sm font-semibold text-ink-700 underline-offset-4 hover:underline">
        {locale === "en" ? "Open builder profile" : "打开 Builder 档案"}
      </Link>
    </article>
  );
}
