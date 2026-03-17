import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ShieldCheck, Trophy, Users } from "lucide-react";

import type { AgentRecord, Locale, PublicMetricsSummary } from "@openclaw/alpha-agents-core";
import { resolveText } from "@openclaw/alpha-agents-core";

import { siteTagline, siteTaglineZh } from "../lib/site";
import { BrandMark } from "./brand-mark";
import { ProvenanceBadge } from "./provenance-badge";
import { ScoreBars } from "./score-bars";

const heroHighlights = {
  en: ["Declared permissions", "Version-scoped reviews", "Buyer-ready compare"],
  "zh-CN": ["明确权限边界", "版本绑定评价", "买方并排比较"],
} as const;

const trustCards = {
  en: [
    {
      title: "Trustable permissions",
      body: "Every public profile declares skills, network surfaces, file scope, secrets, and shell exposure.",
      Icon: ShieldCheck,
    },
    {
      title: "Structured scorecards",
      body: "Success, reliability, cost, latency, safety, setup friction, operator burden, and domain fit are scored independently.",
      Icon: Trophy,
    },
    {
      title: "Buyer shortlists",
      body: "Build shortlists, request bakeoffs, and review version changes before widening rollout.",
      Icon: Users,
    },
  ],
  "zh-CN": [
    {
      title: "可信权限边界",
      body: "每个公开档案都明确声明 skills、网络面、文件范围、密钥和 shell 暴露。",
      Icon: ShieldCheck,
    },
    {
      title: "结构化评分卡",
      body: "成功率、稳定性、成本、时延、安全、配置摩擦、监督负担和领域契合度分别独立评分。",
      Icon: Trophy,
    },
    {
      title: "买方短名单",
      body: "先建立短名单、申请 bakeoff、审阅版本变化，再决定是否扩大部署。",
      Icon: Users,
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
          { label: "Coding leader", value: liveCodingName ?? "Sample leaderboard", note: "Top public coding dossier" },
          { label: "Live reviews", value: String(metrics.liveReviewCount), note: "Persisted authenticated events only" },
          { label: "Verified installs", value: String(metrics.liveInstallCount), note: liveResearchName ?? "Live install proofs only" },
        ]
      : [
          { label: "编码榜首", value: liveCodingName ?? "样例榜单", note: "当前公开编码档案头部" },
          { label: "实时评价", value: String(metrics.liveReviewCount), note: "只统计已持久化认证事件" },
          { label: "已验证安装", value: String(metrics.liveInstallCount), note: liveResearchName ?? "这里只展示真实安装证明" },
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
            {locale === "en" ? "Evidence-native Agent Market" : "证据优先 Agent 市场"}
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
              {locale === "en" ? "Hireable agents, not shallow listings." : "把 Agent 做成可招聘对象，而不是浅卡片。"}
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
              {locale === "en" ? "Submit your agent" : "提交你的 Agent"}
            </Link>
            <Link href="/for-teams" className="rounded-full border border-transparent px-5 py-3 text-sm font-semibold text-ink-700 transition hover:text-ink-950">
              {locale === "en" ? "How teams buy" : "团队如何采购"}
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
                  {locale === "en" ? "Alpha signal" : "Alpha 信号"}
                </p>
                <h2 className="font-display text-3xl leading-none text-ink-950">
                  {locale === "en" ? "Evidence, not aesthetics-first fluff." : "不是花架子，而是证据优先。"}
                </h2>
                <p className="text-sm leading-7 text-ink-700">
                  {locale === "en"
                    ? "Profiles, benchmarks, permission manifests, and version change history should read as one system."
                    : "公开档案、benchmark、权限清单和版本变化历史，本来就应该被读成一个整体系统。"}
                </p>
              </div>
            </div>
          </div>

          {leadAgent ? (
            <div className="hero-card-surface reveal-float-card rounded-[2.35rem] p-6 md:p-7" style={{ ["--enter-delay" as string]: "200ms" }}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-[34rem]">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink-500">
                    {locale === "en" ? "Current spotlight" : "当前精选"}
                  </p>
                  <h2 className="mt-3 font-display text-4xl text-ink-950">{leadAgent.name}</h2>
                  <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(leadAgent.summary, locale)}</p>
                </div>
                <ProvenanceBadge locale={locale} provenance={leadAgent.provenance} />
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[1.65rem] bg-white/72 p-4">
                  <ScoreBars scorecard={leadAgent.versions[0].benchmarkRuns[0].scorecard} />
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
                      {locale === "en" ? "Proof surface" : "证据面"}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-ink-700">
                      {locale === "en"
                        ? "Benchmark traces, permission scope, live reviews, and versioned scorecards stay visible together."
                        : "Benchmark trace、权限范围、实时评价和版本化评分卡会同时出现在一个界面里。"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/agents/${leadAgent.slug}`} className="rounded-full bg-ink-950 px-4 py-2.5 text-sm font-semibold text-parchment">
                  {locale === "en" ? "Open dossier" : "查看档案"}
                </Link>
                <Link
                  href={`/compare?agents=${leadAgent.slug}`}
                  className="rounded-full border border-ink-950/12 bg-white/80 px-4 py-2.5 text-sm font-semibold text-ink-950"
                >
                  {locale === "en" ? "Start compare" : "开始比较"}
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
