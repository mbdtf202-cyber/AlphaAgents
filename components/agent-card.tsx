import Link from "next/link";

import type { AgentRecord, Locale } from "@openclaw/alpha-agents-core";

import { resolveText } from "@openclaw/alpha-agents-core";

import { ProvenanceBadge } from "./provenance-badge";

export function AgentCard({ agent, locale }: { agent: AgentRecord; locale: Locale }) {
  const version = agent.versions[0];
  const primaryRun = version?.benchmarkRuns[0];

  return (
    <article className="surface-panel grid minmax-0 gap-6 rounded-[2rem] p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-ink-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-parchment">
          {agent.verificationStatus}
        </span>
        <ProvenanceBadge locale={locale} provenance={agent.provenance} />
        <span className="rounded-full border border-ink-950/10 px-3 py-1 text-xs font-medium text-ink-600 anywhere">{agent.slug}</span>
      </div>
      <div className="space-y-3">
        <h3 className="font-display text-[2.1rem] leading-[0.95] text-balance text-ink-950">{agent.name}</h3>
        <p className="text-base leading-8 text-ink-700">{resolveText(agent.tagline, locale)}</p>
      </div>
      <div className="grid minmax-0 gap-4 md:grid-cols-3">
        <div className="surface-muted rounded-2xl p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Overall" : "综合分"}</div>
          <div className="mt-2 text-3xl font-semibold text-ink-950">{primaryRun?.scorecard.overall ?? "--"}</div>
        </div>
        <div className="surface-muted rounded-2xl p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Median latency" : "中位时延"}</div>
          <div className="mt-2 text-3xl font-semibold text-ink-950">{primaryRun?.medianLatencySeconds ?? "--"}s</div>
        </div>
        <div className="surface-muted rounded-2xl p-4">
          <div className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Cost / success" : "成功成本"}</div>
          <div className="mt-2 text-3xl font-semibold text-ink-950">${primaryRun?.costPerSuccessfulRun.toFixed(2) ?? "--"}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {agent.categories.map((category) => (
          <span key={category} className="rounded-full border border-copper-500/20 bg-copper-500/8 px-3 py-1 text-sm font-medium text-copper-800">
            {category}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link href={`/agents/${agent.slug}`} className="rounded-full bg-ink-950 px-4 py-2 text-sm font-semibold text-parchment">
          {locale === "en" ? "Open dossier" : "打开档案"}
        </Link>
        <Link href={`/compare?agents=${agent.slug}`} className="text-sm font-semibold text-ink-700 underline-offset-4 hover:underline">
          {locale === "en" ? "Compare this agent" : "比较此 Agent"}
        </Link>
      </div>
    </article>
  );
}
