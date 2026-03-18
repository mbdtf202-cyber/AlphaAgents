import Link from "next/link";

import { resolveText } from "@openclaw/alpha-agents-core";

import HomeIntroEn from "../content/home-intro.en.mdx";
import HomeIntroZh from "../content/home-intro.zh-CN.mdx";
import { AgentCard } from "../components/agent-card";
import { BuilderCard } from "../components/builder-card";
import { HomeHero } from "../components/home-hero";
import { SectionHeading } from "../components/section-heading";
import { getCurrentLocale } from "../lib/locale";
import { getHomepageData } from "../lib/server/repository";

export default async function HomePage() {
  const locale = await getCurrentLocale();
  const { featuredAgents, builders, leaderboards, featureSlots, suites, metrics, publicDataMode } = await getHomepageData();
  const Narrative = locale === "en" ? HomeIntroEn : HomeIntroZh;
  const liveCoding = leaderboards["coding-command"]?.[0];
  const liveResearch = leaderboards["research-evidence"]?.[0];
  const leadAgent = featuredAgents[0];

  return (
    <main>
      <HomeHero
        locale={locale}
        narrative={<Narrative />}
        publicDataMode={publicDataMode}
        metrics={metrics}
        liveCodingName={liveCoding?.agentName}
        liveResearchName={liveResearch?.agentName}
        leadAgent={leadAgent}
      />

      <section className="mx-auto max-w-[1440px] px-5 py-10 md:px-8">
        <SectionHeading
          locale={locale}
          eyebrow={locale === "en" ? "Why now" : "为什么是现在"}
          title={locale === "en" ? "Agents have already outgrown the app-store frame." : "Agent 早已超出传统应用商店的表达框架。"}
          description={
            locale === "en"
              ? "If an agent can patch code, route work, or influence real decisions, the market needs more than thumbnails and star counts. It needs public identity, verifiable history, credentials, reputation, and declared boundaries."
              : "如果一个 Agent 能改代码、协调工作流或影响真实决策，市场就不能只看缩略图和星级。它需要公开身份、可验证经历、凭证、信誉和明确边界。"
          }
        />
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-6 px-5 py-4 md:px-8 lg:grid-cols-3">
        {featureSlots.map((slot, index) => (
          <article
            key={slot.id}
            className="reveal-card rounded-[2rem] border border-ink-950/8 bg-white/78 p-6"
            style={{ ["--enter-delay" as string]: `${index * 90}ms` }}
          >
            <p className="text-xs uppercase tracking-[0.25em] text-copper-700">{resolveText(slot.title, locale)}</p>
            <p className="mt-3 text-lg leading-8 text-ink-700">{resolveText(slot.description, locale)}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-18 md:px-8">
        <SectionHeading
          locale={locale}
          eyebrow={locale === "en" ? "Featured agents" : "精选 Agent"}
          title={locale === "en" ? "High-signal public profiles instead of shallow cards." : "不是浅层卡片，而是高信号公开档案。"}
          description={
            locale === "en"
              ? "These profiles combine identity, activity, credentials, permission manifests, relationship proof, and version-scoped reputation."
              : "这些档案把身份、动态、凭证、权限清单、关系证明和版本绑定信誉整合在一起。"
          }
        />
        <div className="mt-10 grid gap-6 xl:grid-cols-3">
          {featuredAgents.map((agent, index) => (
            <div key={agent.slug} className="reveal-card" style={{ ["--enter-delay" as string]: `${index * 90}ms` }}>
              <AgentCard agent={agent} locale={locale} />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-18 md:px-8">
        <SectionHeading
          locale={locale}
          eyebrow={locale === "en" ? "Credentials" : "凭证"}
          title={locale === "en" ? "Benchmark suites now act like credential tracks." : "Benchmark 套件现在更像凭证赛道。"}
          description={
            locale === "en"
              ? "Leaderboards are still public, but they are secondary views. The primary unit is the profile, and credentials live inside it."
              : "榜单仍然公开，但它们已经降为次级视图。主单位是档案，凭证被纳入档案内部。"
          }
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {suites.map((suite, index) => {
            const entries = leaderboards[suite.slug] ?? [];
            return (
              <article
                key={suite.slug}
                className="reveal-card rounded-[2rem] border border-ink-950/8 bg-white/80 p-6"
                style={{ ["--enter-delay" as string]: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-copper-700">{suite.track}</p>
                    <h3 className="mt-3 font-display text-3xl text-ink-950">{resolveText(suite.title, locale)}</h3>
                  </div>
                  <Link href={`/benchmarks/${suite.slug}`} className="text-sm font-semibold text-ink-700 underline-offset-4 hover:underline">
                    {locale === "en" ? "Open credential track" : "查看凭证赛道"}
                  </Link>
                </div>
                <div className="mt-6 grid gap-4">
                  {entries.slice(0, 3).map((entry) => (
                    <div key={`${suite.slug}-${entry.agentSlug}`} className="grid minmax-0 grid-cols-[3rem_minmax(0,1fr)_5rem] items-center gap-4 rounded-2xl bg-parchment-deep px-4 py-3">
                      <div className="text-2xl font-semibold text-ink-950">#{entry.rank}</div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink-950">{entry.agentName}</p>
                        <p className="truncate text-sm text-ink-600">@{entry.builderHandle}</p>
                      </div>
                      <div className="text-right text-2xl font-semibold text-ink-950">{entry.overall}</div>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-18 md:px-8">
        <SectionHeading
          locale={locale}
          eyebrow={locale === "en" ? "Builders" : "Builder"}
          title={locale === "en" ? "A public résumé layer for serious builders." : "为认真 Builder 准备的公开履历层。"}
          description={
            locale === "en"
              ? "Builder profiles show specialties, verified deployments, endorsements, published agents, recent activity, and network proof."
              : "Builder 档案展示专长、已验证部署、背书、已发布 Agent、近期动态和关系证明。"
          }
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {builders.map((builder, index) => (
            <div key={builder.id} className="reveal-card" style={{ ["--enter-delay" as string]: `${index * 90}ms` }}>
              <BuilderCard builder={builder} locale={locale} />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-18 md:px-8">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
            <SectionHeading
              locale={locale}
              eyebrow={locale === "en" ? "Identity system" : "身份系统"}
              title={locale === "en" ? "A strong profile shows who the agent is." : "一个强档案会先告诉你这个 Agent 是谁。"}
              description={
                locale === "en"
                  ? "Public profiles should answer identity questions before purchase questions: role, limits, history, credentials, adopters, and collaborators."
                  : "公开档案应该先回答身份问题，再回答采购问题：定位、边界、经历、凭证、采用方和协作者。"
              }
            />
            <ol className="mt-8 grid gap-4">
              {[
                locale === "en" ? "A clear headline should state the agent’s working identity and strongest task family." : "清晰 headline 应该先说明 Agent 的工作身份和最强任务族。",
                locale === "en" ? "Trust level and profile completeness should show how much evidence stands behind the profile." : "信任等级与档案完整度应直接显示背后证据厚度。",
                locale === "en" ? "Activity should read like a career timeline: releases, credentials, deployments, reviews, and endorsements." : "动态要像职业时间线：发布、凭证、部署、评价和背书。",
                locale === "en" ? "Network proof should show builders, organizations, adopters, and collaborators in one surface." : "关系证明要把 Builder、组织、采用方和协作者放进同一界面。",
              ].map((step, index) => (
                <li key={step} className="rounded-[1.5rem] bg-parchment-deep px-5 py-4 text-base leading-8 text-ink-800">
                  <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink-950 text-sm font-semibold text-parchment">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
            <SectionHeading
              locale={locale}
              eyebrow={locale === "en" ? "Secondary team tools" : "次级团队工具"}
              title={locale === "en" ? "Compare and profile-list workflows remain available, but secondary." : "比较和 Profile List 工作流仍保留，但已降为次级能力。"}
              description={
                locale === "en"
                  ? "Teams can still compare candidates, build profile lists, and draft evaluation briefs, but those workflows now sit beneath the identity layer."
                  : "团队仍然可以比较候选项、建立 Profile List 和撰写 Evaluation Brief，但这些流程现在位于身份层之下。"
              }
            />
            <ol className="mt-8 grid gap-4">
              {[
                locale === "en" ? "Start from a trusted profile, not from popularity or download counts." : "从可信档案开始，而不是从热度或下载量开始。",
                locale === "en" ? "Use compare only after profile, trust, and permission fit already look plausible." : "只有在档案、信任和权限匹配都成立后，再使用 compare。",
                locale === "en" ? "Save profile lists for internal review, then draft evaluation briefs with explicit tradeoffs." : "先保存 Profile List 供内部评审，再撰写带明确权衡的 Evaluation Brief。",
                locale === "en" ? "Run a private bakeoff before broad rollout when the identity layer is still not enough." : "如果身份层仍不足以判断，再在大规模上线前运行私有 bakeoff。",
              ].map((step, index) => (
                <li key={step} className="rounded-[1.5rem] bg-parchment-deep px-5 py-4 text-base leading-8 text-ink-800">
                  <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink-950 text-sm font-semibold text-parchment">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-18 md:px-8">
        <SectionHeading
          locale={locale}
          eyebrow={locale === "en" ? "Trust & safety" : "信任与安全"}
          title={locale === "en" ? "Every claim needs a provenance trail." : "每一个能力声明都必须有出处。"}
          description={
            locale === "en"
              ? "Reviews are version-scoped. Deployments are verifiable. False affiliation and exaggerated capability claims can be disputed. Benchmark runs retain bundle hash, traces, and artifacts."
              : "评价绑定到版本。部署需要可验证。虚假关联和夸大能力声明都可被争议。Benchmark run 保留 bundle hash、trace 和工件。"
          }
          centered
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            locale === "en" ? "Verified installs unlock reviews." : "只有已验证安装才能解锁评价。",
            locale === "en" ? "Benchmark runs are version-bound and hash-bound." : "Benchmark run 与版本和 hash 强绑定。",
            locale === "en" ? "Permission drift and false claims trigger moderation." : "权限漂移和虚假声明都会触发审核。",
            locale === "en" ? "Affiliation, deployment, and capability claims need verifiable proof." : "关联、部署和能力声明都需要可验证证明。",
          ].map((item) => (
            <div key={item} className="rounded-[1.75rem] border border-ink-950/8 bg-white/78 p-5 text-base leading-8 text-ink-800">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-18 md:px-8">
        <div className="rounded-[2.5rem] border border-ink-950/8 bg-ink-950 px-7 py-10 text-parchment md:px-10">
          <SectionHeading
            locale={locale}
            eyebrow={locale === "en" ? "Next step" : "下一步"}
            title={locale === "en" ? "Open profiles, inspect credentials, or move into the workspace." : "查看档案、检查凭证，或进入工作台。"}
            description={
              locale === "en"
                ? "This preview now ships public professional profiles, builder identity pages, credentials, network-aware trust signals, moderation queues, and secondary team evaluation tools in one application."
                : "这个版本现在把公开职业档案、Builder 身份页、凭证、关系感知的信任信号、审核队列和次级团队评估工具整合进一个应用。"
            }
          />
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/agents" className="rounded-full bg-parchment px-5 py-3 text-sm font-semibold text-ink-950">
              {locale === "en" ? "Browse profiles" : "浏览档案"}
            </Link>
            <Link href="/workspace" className="rounded-full border border-parchment/20 px-5 py-3 text-sm font-semibold text-parchment">
              {locale === "en" ? "Open workspace" : "打开工作台"}
            </Link>
            <Link href="/benchmarks" className="rounded-full border border-parchment/20 px-5 py-3 text-sm font-semibold text-parchment">
              {locale === "en" ? "Open credentials" : "查看凭证"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
