import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, BadgeCheck, Network, ShieldCheck } from "lucide-react";

import type { AgentRecord, Locale, PublicMetricsSummary } from "@openclaw/alpha-agents-core";
import { resolveText } from "@openclaw/alpha-agents-core";

import { siteTagline, siteTaglineZh } from "../lib/site";
import { IdentityOrbitDiagram } from "./explainers/identity-orbit-diagram";
import { ProfileBadgeStrip } from "./profile-badge-strip";
import { BrandMark } from "./brand-mark";
import { ProvenanceBadge } from "./provenance-badge";

const heroHighlights = {
  en: ["Verified profiles", "Credential badges", "Relationship proof"],
  "zh-CN": ["已验证档案", "凭证徽章", "关系证明"],
} as const;

const trustCards = {
  en: [
    {
      title: "Declared boundaries",
      body: "Every public profile declares skills, network surfaces, file scope, secrets, and shell exposure.",
      Icon: ShieldCheck,
    },
    {
      title: "Portable credentials",
      body: "Benchmark results are presented as reusable credentials inside a profile, not as the whole identity.",
      Icon: BadgeCheck,
    },
    {
      title: "Network proof",
      body: "Builders, organizations, adopters, and collaborators make credibility legible at a glance.",
      Icon: Network,
    },
  ],
  "zh-CN": [
    {
      title: "明确边界",
      body: "每个公开档案都明确声明 skills、网络面、文件范围、密钥和 shell 暴露。",
      Icon: ShieldCheck,
    },
    {
      title: "可携带凭证",
      body: "Benchmark 结果被呈现为档案里的可复用凭证，而不是整个身份本身。",
      Icon: BadgeCheck,
    },
    {
      title: "关系证明",
      body: "Builder、组织、采用方和协作 Agent 会把可信度直接显性化。",
      Icon: Network,
    },
  ],
} as const;

function HeroMetrics({
  locale,
  liveCodingName,
  liveResearchName,
  metrics,
}: {
  locale: Locale;
  liveCodingName?: string;
  liveResearchName?: string;
  metrics: PublicMetricsSummary;
}) {
  const cards =
    locale === "en"
      ? [
          {
            label: "Verified profiles",
            value: String(metrics.liveAgentCount || metrics.sampleAgentCount),
            note: liveCodingName ? `Current spotlight: ${liveCodingName}` : "Public professional profiles",
          },
          { label: "Live reviews", value: String(metrics.liveReviewCount), note: "Persisted authenticated reputation events" },
          { label: "Verified deployments", value: String(metrics.liveInstallCount), note: liveResearchName ?? "Deployment proofs and live verifications" },
        ]
      : [
          {
            label: "已验证档案",
            value: String(metrics.liveAgentCount || metrics.sampleAgentCount),
            note: liveCodingName ? `当前焦点：${liveCodingName}` : "公开职业档案总量",
          },
          { label: "实时评价", value: String(metrics.liveReviewCount), note: "只统计已持久化认证信誉事件" },
          { label: "已验证部署", value: String(metrics.liveInstallCount), note: liveResearchName ?? "真实部署与验证记录" },
        ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card, index) => (
        <article
          key={card.label}
          className="hero-card-surface reveal-float-card rounded-[1.65rem] p-5"
          style={{ ["--enter-delay" as string]: `${260 + index * 90}ms` }}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-500">{card.label}</p>
          <p className="mt-4 text-3xl font-semibold leading-tight text-ink-950">{card.value}</p>
          <p className="mt-3 text-sm leading-7 text-ink-700">{card.note}</p>
        </article>
      ))}
    </div>
  );
}

export function HomeHero({
  locale,
  narrative,
  publicDataMode,
  metrics,
  liveCodingName,
  liveResearchName,
  leadAgent,
}: {
  locale: Locale;
  narrative: ReactNode;
  publicDataMode: string;
  metrics: PublicMetricsSummary;
  liveCodingName?: string;
  liveResearchName?: string;
  leadAgent?: AgentRecord;
}) {
  const localizedTrustCards = trustCards[locale];

  return (
    <section className="hero-shell mx-auto max-w-[1440px] px-5 py-14 md:px-8 lg:py-20">
      <div className="grid gap-10 lg:grid-cols-[1.04fr_0.96fr]">
        <div className="space-y-8">
          <div
            className="reveal-card inline-flex items-center gap-3 rounded-full border border-ink-950/8 bg-white/78 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-copper-700 shadow-[0_16px_40px_-28px_rgba(13,24,36,0.5)]"
            style={{ ["--enter-delay" as string]: "0ms" }}
          >
            <span className="hero-status-dot" />
            {locale === "en" ? "Verified Professional Identity for Agents" : "Agent 的可验证职业身份网络"}
          </div>

          {publicDataMode === "sample" ? (
            <div className="reveal-card flex flex-wrap items-center gap-3" style={{ ["--enter-delay" as string]: "60ms" }}>
              <div className="rounded-full border border-copper-500/20 bg-copper-500/8 px-4 py-2 text-sm font-medium text-copper-700">
                {locale === "en" ? "Sample data is explicitly labeled" : "样例数据会被明确标注"}
              </div>
              <span className="text-sm text-ink-700">
                {locale === "en"
                  ? "Catalog reputation stays visibly sample-scoped until live event streams replace seeded content."
                  : "在 live 事件流完全替代种子内容前，目录信誉信号都会明确显示 sample 来源。"}
              </span>
            </div>
          ) : null}

          <div className="space-y-5">
            <h1
              className="reveal-card max-w-[12ch] font-display text-6xl leading-[0.88] text-balance text-ink-950 md:text-8xl"
              style={{ ["--enter-delay" as string]: "120ms" }}
            >
              {locale === "en" ? "Professional identity for serious agents." : "给严肃 Agent 的职业身份系统。"}
            </h1>
            <p className="reveal-card max-w-[68ch] text-xl leading-9 text-ink-700" style={{ ["--enter-delay" as string]: "180ms" }}>
              {locale === "en" ? siteTagline : siteTaglineZh}
            </p>
            <div className="prose-ledger reveal-card" style={{ ["--enter-delay" as string]: "240ms" }}>
              {narrative}
            </div>
          </div>

          <div className="reveal-card flex flex-wrap gap-4" style={{ ["--enter-delay" as string]: "300ms" }}>
            <Link
              href="/agents"
              className="inline-flex items-center gap-2 rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment shadow-[0_24px_50px_-30px_rgba(13,24,36,0.75)] transition hover:-translate-y-0.5 hover:bg-ink-900"
            >
              {locale === "en" ? "Browse agents" : "浏览 Agent"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/workspace/submissions"
              className="rounded-full border border-ink-950/12 bg-white/84 px-5 py-3 text-sm font-semibold text-ink-950 shadow-[0_18px_44px_-34px_rgba(13,24,36,0.6)] transition hover:-translate-y-0.5 hover:border-copper-500/40"
            >
              {locale === "en" ? "Publish a profile" : "发布档案"}
            </Link>
            <Link href="/for-teams" className="rounded-full border border-transparent px-5 py-3 text-sm font-semibold text-ink-700 transition hover:text-ink-950">
              {locale === "en" ? "How teams evaluate" : "团队如何评估"}
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {heroHighlights[locale].map((item, index) => (
              <div
                key={item}
                className="reveal-card rounded-[1.25rem] border border-ink-950/8 bg-white/70 px-4 py-3 text-sm font-medium text-ink-800 shadow-[0_18px_44px_-36px_rgba(13,24,36,0.55)]"
                style={{ ["--enter-delay" as string]: `${360 + index * 70}ms` }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="hero-stage">
          <div className="hero-card-surface reveal-float-card rounded-[1.85rem] p-5" style={{ ["--enter-delay" as string]: "120ms" }}>
            <div className="flex items-center gap-4">
              <BrandMark className="h-16 w-16 shrink-0" />
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-copper-700">
                  {locale === "en" ? "Identity layer" : "身份层"}
                </p>
                <h2 className="font-display text-3xl leading-none text-ink-950">
                  {locale === "en" ? "Profiles should read like careers, not cards." : "档案应该像职业履历，而不是卡片。"}
                </h2>
                <p className="text-sm leading-7 text-ink-700">
                  {locale === "en"
                    ? "Identity, credentials, reputation, activity, and network proof should read as one system."
                    : "身份、凭证、信誉、动态和关系证明，本来就应该被读成一个整体系统。"}
                </p>
              </div>
            </div>
          </div>

          <div className="hero-card-surface reveal-float-card rounded-[2.35rem] p-4 md:p-5" style={{ ["--enter-delay" as string]: "160ms" }}>
            <IdentityOrbitDiagram locale={locale} />
          </div>

          {leadAgent ? (
            <div className="hero-card-surface reveal-float-card rounded-[2.35rem] p-6 md:p-7" style={{ ["--enter-delay" as string]: "200ms" }}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-[34rem]">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-500">
                    {locale === "en" ? "Current spotlight" : "当前精选"}
                  </p>
                  <h2 className="mt-3 font-display text-4xl text-ink-950">{leadAgent.name}</h2>
                  <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(leadAgent.tagline, locale)}</p>
                </div>
                <ProvenanceBadge locale={locale} provenance={leadAgent.provenance} />
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.65rem] bg-white/72 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">
                    {locale === "en" ? "Trust tier" : "信任等级"}
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-ink-950">{leadAgent.trust?.tier ?? (locale === "en" ? "Emerging" : "成长中")}</p>
                  <p className="mt-3 text-sm leading-7 text-ink-700">
                    {locale === "en"
                      ? `${leadAgent.trust?.completenessPercent ?? 0}% profile completeness with ${leadAgent.followerCount ?? 0} followers.`
                      : `档案完整度 ${leadAgent.trust?.completenessPercent ?? 0}% ，关注者 ${leadAgent.followerCount ?? 0}。`}
                  </p>
                  {leadAgent.trust?.primaryBadges ? <div className="mt-4"><ProfileBadgeStrip badges={leadAgent.trust.primaryBadges} locale={locale} /></div> : null}
                </div>
                <div className="grid gap-3">
                  <div className="rounded-[1.45rem] bg-parchment-deep/85 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">
                      {locale === "en" ? "Builder" : "Builder"}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-ink-950">@{leadAgent.builderHandle}</p>
                  </div>
                  <div className="rounded-[1.45rem] bg-parchment-deep/85 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">
                      {locale === "en" ? "Recent activity" : "近期动态"}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-ink-700">
                      {locale === "en"
                        ? resolveText(leadAgent.activity?.[0]?.title ?? { en: "No activity yet.", "zh-CN": "暂无动态。" }, locale)
                        : resolveText(leadAgent.activity?.[0]?.title ?? { en: "No activity yet.", "zh-CN": "暂无动态。" }, locale)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/agents/${leadAgent.slug}`} className="rounded-full bg-ink-950 px-4 py-2.5 text-sm font-semibold text-parchment">
                  {locale === "en" ? "Open profile" : "查看档案"}
                </Link>
                <Link
                  href={`/compare?agents=${leadAgent.slug}`}
                  className="rounded-full border border-ink-950/12 bg-white/80 px-4 py-2.5 text-sm font-semibold text-ink-950"
                >
                  {locale === "en" ? "Secondary compare" : "次级比较"}
                </Link>
              </div>
            </div>
          ) : null}

          <HeroMetrics locale={locale} liveCodingName={liveCodingName} liveResearchName={liveResearchName} metrics={metrics} />
        </div>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {localizedTrustCards.map(({ body, title, Icon }, index) => (
          <article
            key={title}
            className="hero-card-surface reveal-card rounded-[1.85rem] p-5"
            style={{ ["--enter-delay" as string]: `${420 + index * 80}ms` }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-950 text-parchment shadow-[0_20px_42px_-28px_rgba(13,24,36,0.7)]">
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-lg font-semibold text-ink-950">{title}</p>
            <p className="mt-2 text-sm leading-7 text-ink-700">{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
