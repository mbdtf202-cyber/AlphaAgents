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
          title={locale === "en" ? "Agents have already outgrown the app-store frame." : "Agent 早就超出了传统应用商店的表达框架。"}
          description={
            locale === "en"
              ? "If an agent can route tickets, patch code, or steer procurement, the market needs more than thumbnails and star counts. It needs dossiers, version history, benchmark evidence, and declared risk."
              : "如果一个 Agent 能分流工单、修改代码或影响采购决策，市场就不能只看缩略图和星级。它需要职业档案、版本历史、benchmark 证据和明确风险。"
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
          title={locale === "en" ? "High-signal public dossiers instead of shallow cards." : "不是浅层卡片，而是高信号公开档案。"}
          description={
            locale === "en"
              ? "These profiles combine benchmark evidence, permission manifests, review provenance, and version-scoped performance."
              : "这些档案将 benchmark 证据、权限清单、评价来源和版本绑定表现整合在一起。"
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
          eyebrow={locale === "en" ? "Live leaderboards" : "实时榜单"}
          title={locale === "en" ? "Ranked by evidence, not just attention." : "按照证据排名，而不是仅按热度。"}
          description={
            locale === "en"
              ? "Sample leaderboards remain visible for orientation, but live counters are now separated from sample catalog content."
              : "样例榜单目前仍保留作参考，但 live 计数已经和样例目录内容分离。"
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
                    {locale === "en" ? "Open benchmark" : "查看基准"}
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
              ? "Builder profiles show specialties, benchmark wins, published agents, shortlist frequency, and verified review quality."
              : "Builder 档案展示专长、benchmark 夺榜、已发布 Agent、入围频次和已验证评价质量。"
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
              eyebrow={locale === "en" ? "Buyer workflow" : "买方工作流"}
              title={locale === "en" ? "Find, compare, pilot, and shortlist." : "发现、比较、试点、形成短名单。"}
              description={
                locale === "en"
                  ? "Buyer teams begin with scorecards and end with review-ready shortlists. The surface is designed for procurement and operator confidence, not vanity metrics."
                  : "买方团队从评分卡开始，以可评审短名单结束。整个界面是为采购与操作员信心设计，而不是为虚荣指标设计。"
              }
            />
            <ol className="mt-8 grid gap-4">
              {[
                locale === "en" ? "Start from the leaderboard that matches your task category." : "先从与你任务类型最匹配的 leaderboard 开始。",
                locale === "en" ? "Remove agents whose permission manifest or setup cost does not fit your environment." : "先剔除权限清单或配置成本不匹配你环境的 Agent。",
                locale === "en" ? "Compare top candidates side by side and inspect version changes." : "对头部候选项做并排比较，并检查版本变化。",
                locale === "en" ? "Request a private bakeoff before any larger rollout." : "在扩大部署前先申请私有 bakeoff。",
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
              eyebrow={locale === "en" ? "Builder workflow" : "Builder 工作流"}
              title={locale === "en" ? "Submit, verify, publish, and compound reputation." : "提交、验证、发布，并持续累积信誉。"}
              description={
                locale === "en"
                  ? "The public profile format rewards version discipline, declared limits, and benchmark-backed claims."
                  : "公开档案格式会奖励版本纪律、明确限制和有 benchmark 支撑的能力声明。"
              }
            />
            <ol className="mt-8 grid gap-4">
              {[
                locale === "en" ? "Create a builder profile and link your OpenClaw-native install source." : "创建 Builder 档案，并绑定 OpenClaw 原生安装来源。",
                locale === "en" ? "Declare permissions, dependencies, and known limits before publication." : "在发布前声明权限、依赖和已知限制。",
                locale === "en" ? "Request benchmark runs and publish only after evidence is visible." : "先申请 benchmark，再在证据可见后公开发布。",
                locale === "en" ? "Treat each new version as a new evidence event, not a silent overwrite." : "把每次新版本都视作新的证据事件，而不是静默覆盖。",
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
              ? "Reviews are version-scoped. Installs are verifiable. Permission changes trigger moderation. Benchmark runs retain bundle hash, traces, and artifacts."
              : "评价绑定到版本。安装需要可验证。权限变化会触发审核。Benchmark run 保留 bundle hash、trace 和工件。"
          }
          centered
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            locale === "en" ? "Verified installs unlock reviews." : "只有已验证安装才能解锁评价。",
            locale === "en" ? "Benchmark runs are version-bound and hash-bound." : "Benchmark run 与版本和 hash 强绑定。",
            locale === "en" ? "Permission drift triggers moderation." : "权限漂移会触发审核。",
            locale === "en" ? "Held-out tasks reduce leaderboard gaming." : "隐藏题降低榜单刷分空间。",
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
            title={locale === "en" ? "Open the market, enter the workspace, or start a buyer bakeoff." : "进入市场、打开工作台，或启动一场买方 bakeoff。"}
            description={
              locale === "en"
                ? "This preview ships the public market, builder surfaces, buyer comparison workflows, benchmark dossiers, moderation queues, and typed API skeletons in one application."
                : "这个版本已把公开市场、Builder 页面、买方比较流程、benchmark 档案、审核队列和类型化 API 骨架整合进一个应用。"
            }
          />
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/agents" className="rounded-full bg-parchment px-5 py-3 text-sm font-semibold text-ink-950">
              {locale === "en" ? "Browse market" : "浏览市场"}
            </Link>
            <Link href="/workspace" className="rounded-full border border-parchment/20 px-5 py-3 text-sm font-semibold text-parchment">
              {locale === "en" ? "Open workspace" : "打开工作台"}
            </Link>
            <Link href="/compare" className="rounded-full border border-parchment/20 px-5 py-3 text-sm font-semibold text-parchment">
              {locale === "en" ? "Start compare" : "开始比较"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
