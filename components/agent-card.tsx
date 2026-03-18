import Link from "next/link";

import type { AgentRecord, Locale } from "@openclaw/alpha-agents-core";

import { resolveText } from "@openclaw/alpha-agents-core";

import { ProfileBadgeStrip } from "./profile-badge-strip";
import { ProvenanceBadge } from "./provenance-badge";

export function AgentCard({ agent, locale }: { agent: AgentRecord; locale: Locale }) {
  const version = agent.versions[0];
  const primaryCredential = agent.credentials?.[0];

  return (
    <article className="surface-panel grid minmax-0 gap-6 rounded-[2rem] p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-ink-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-parchment">
          {agent.trust?.tier ?? agent.verificationStatus}
        </span>
        <ProvenanceBadge locale={locale} provenance={agent.provenance} />
        <span className="rounded-full border border-ink-950/10 px-3 py-1 text-xs font-medium text-ink-600 anywhere">{agent.slug}</span>
      </div>
      <div className="space-y-3">
        <h3 className="font-display text-[2.1rem] leading-[0.95] text-balance text-ink-950">{agent.name}</h3>
        <p className="text-base leading-8 text-ink-700">{resolveText(agent.tagline, locale)}</p>
      </div>
      {agent.trust?.primaryBadges?.length ? <ProfileBadgeStrip badges={agent.trust.primaryBadges} locale={locale} /> : null}
      <div className="grid minmax-0 gap-4 md:grid-cols-3">
        <div className="surface-muted rounded-2xl p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Completeness" : "完整度"}</div>
          <div className="mt-2 text-3xl font-semibold text-ink-950">{agent.trust?.completenessPercent ?? "--"}%</div>
        </div>
        <div className="surface-muted rounded-2xl p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Followers" : "关注者"}</div>
          <div className="mt-2 text-3xl font-semibold text-ink-950">{agent.followerCount ?? 0}</div>
        </div>
        <div className="surface-muted rounded-2xl p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Primary credential" : "主凭证"}</div>
          <div className="mt-2 text-lg font-semibold text-ink-950">{primaryCredential ? resolveText(primaryCredential.title, locale) : "--"}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {agent.categories.map((category) => (
          <span key={category} className="rounded-full border border-copper-500/20 bg-copper-500/8 px-3 py-1 text-sm font-medium text-copper-800">
            {category}
          </span>
        ))}
      </div>
      {agent.activity?.[0] ? (
        <div className="rounded-[1.5rem] bg-parchment-deep p-4">
          <div className="text-xs uppercase tracking-[0.18em] text-ink-500">{locale === "en" ? "Recent activity" : "近期动态"}</div>
          <p className="mt-2 text-base font-semibold text-ink-950">{resolveText(agent.activity[0].title, locale)}</p>
          <p className="mt-2 text-sm leading-7 text-ink-700">{resolveText(agent.activity[0].summary, locale)}</p>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/agents/${agent.slug}`} className="rounded-full bg-ink-950 px-4 py-2 text-sm font-semibold text-parchment">
          {locale === "en" ? "Open profile" : "打开档案"}
        </Link>
        <Link href={`/compare?agents=${agent.slug}`} className="text-sm font-semibold text-ink-700 underline-offset-4 hover:underline">
          {locale === "en" ? "Secondary compare" : "次级比较"}
        </Link>
      </div>
    </article>
  );
}
