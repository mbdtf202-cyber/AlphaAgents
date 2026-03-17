import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { agents, resolveText } from "@openclaw/agent-ledger-core";

import { ProvenanceBadge } from "../../../components/provenance-badge";
import { ScoreBars } from "../../../components/score-bars";
import { getCurrentLocale } from "../../../lib/locale";
import { getAgentPageData } from "../../../lib/server/repository";

export async function generateStaticParams() {
  return agents.map((agent) => ({ slug: agent.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const agent = agents.find((entry) => entry.slug === slug);
  if (!agent) {
    return {};
  }

  return {
    title: agent.name,
    description: agent.summary.en,
  };
}

export default async function AgentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getCurrentLocale();
  const { slug } = await params;
  const agent = await getAgentPageData(slug);

  if (!agent) {
    notFound();
  }

  const version = agent.versions[0];
  const primaryRun = version.benchmarkRuns[0];

  return (
    <main className="mx-auto grid max-w-[1440px] gap-8 px-5 py-14 md:px-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-10">
        <section className="rounded-[2.5rem] border border-ink-950/8 bg-white/84 p-7">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-ink-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-parchment">
              {agent.verificationStatus}
            </span>
            <ProvenanceBadge locale={locale} provenance={agent.provenance} />
            <span className="rounded-full border border-ink-950/10 px-3 py-1 text-xs font-medium text-ink-600 anywhere">{agent.slug}</span>
            <span className="rounded-full border border-copper-500/20 bg-copper-500/8 px-3 py-1 text-xs font-medium text-copper-800">
              v{version.version}
            </span>
          </div>
          <h1 className="mt-6 max-w-[14ch] font-display text-6xl leading-[0.92] text-balance text-ink-950 md:text-7xl">{agent.name}</h1>
          <p className="mt-6 max-w-[72ch] text-xl leading-9 text-ink-700">{resolveText(agent.tagline, locale)}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={agent.source.url} className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
              {locale === "en" ? "View install source" : "查看安装来源"}
            </Link>
            <Link href={`/compare?agents=${agent.slug}`} className="rounded-full border border-ink-950/12 bg-white px-5 py-3 text-sm font-semibold text-ink-950">
              {locale === "en" ? "Compare agent" : "比较 Agent"}
            </Link>
          </div>
        </section>

        <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Overview" : "概览"}</h2>
          <div className="mt-5 space-y-5">
            {agent.overview.map((paragraph) => (
              <p key={paragraph.en} className="text-lg leading-9 text-ink-700">
                {resolveText(paragraph, locale)}
              </p>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Capabilities" : "能力"}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {agent.capabilities.map((capability) => (
              <div key={capability.en} className="rounded-[1.5rem] bg-parchment-deep p-5 text-base leading-8 text-ink-800">
                {resolveText(capability, locale)}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Benchmark results" : "Benchmark 结果"}</h2>
              <p className="mt-3 max-w-[64ch] text-lg leading-8 text-ink-700">
                {locale === "en"
                  ? "Each run is version-scoped and bundle-hash scoped. Public scorecards are only one layer; traces and artifacts still matter."
                  : "每次 run 都与版本和 bundle hash 强绑定。公开评分卡只是第一层，trace 和工件同样重要。"}
              </p>
            </div>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="grid gap-5">
              {version.benchmarkRuns.map((run) => (
                <article key={run.id} className="rounded-[1.75rem] border border-ink-950/8 bg-parchment p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-copper-700">{run.suiteSlug}</p>
                      <h3 className="mt-2 text-2xl font-semibold text-ink-950">{run.scorecard.overall}</h3>
                    </div>
                    <div className="text-sm text-ink-600">
                      #{run.publicRank} / {run.peerGroupSize}
                    </div>
                  </div>
                  <p className="mt-4 text-base leading-8 text-ink-700">{resolveText(run.notes, locale)}</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a href={run.transcriptUrl} className="rounded-full border border-ink-950/12 bg-white px-4 py-2 text-sm font-semibold text-ink-950">
                      {locale === "en" ? "Transcript" : "Transcript"}
                    </a>
                    <a href={run.toolTraceUrl} className="rounded-full border border-ink-950/12 bg-white px-4 py-2 text-sm font-semibold text-ink-950">
                      {locale === "en" ? "Tool trace" : "Tool trace"}
                    </a>
                    {run.finalArtifactUrl ? (
                      <a href={run.finalArtifactUrl} className="rounded-full border border-ink-950/12 bg-white px-4 py-2 text-sm font-semibold text-ink-950">
                        {locale === "en" ? "Final artifact" : "最终工件"}
                      </a>
                    ) : null}
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Latency" : "时延"}</div>
                      <div className="mt-2 text-xl font-semibold text-ink-950">{run.medianLatencySeconds}s</div>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Cost" : "成本"}</div>
                      <div className="mt-2 text-xl font-semibold text-ink-950">${run.costPerSuccessfulRun.toFixed(2)}</div>
                    </div>
                    <div className="rounded-2xl bg-white px-4 py-3">
                      <div className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Freshness" : "新鲜度"}</div>
                      <div className="mt-2 text-xl font-semibold text-ink-950">{run.freshnessDays}d</div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="rounded-[1.75rem] border border-ink-950/8 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-copper-700">{locale === "en" ? "Primary scorecard" : "主评分卡"}</p>
              <div className="mt-4">
                <ScoreBars scorecard={primaryRun.scorecard} />
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Demo runs" : "Demo runs"}</h2>
          <div className="mt-6 grid gap-4">
            {agent.demoRuns.map((demo) => (
              <article key={demo.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-ink-950/10 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-ink-600">
                    {demo.outcome}
                  </span>
                  <span className="rounded-full border border-ink-950/10 bg-white px-3 py-1 text-xs font-medium text-ink-600">{demo.industry}</span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-ink-950">{resolveText(demo.title, locale)}</h3>
                <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(demo.summary, locale)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Reviews" : "评价"}</h2>
          <div className="mt-6 grid gap-4">
            {agent.reviews.map((review) => (
              <article key={review.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <div className="flex flex-wrap items-center gap-3 text-sm text-ink-500">
                  <span>{review.company}</span>
                  <span>•</span>
                  <span>{review.role}</span>
                  <span>•</span>
                  <span>{review.rating}/5</span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-ink-950">{resolveText(review.headline, locale)}</h3>
                <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(review.body, locale)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Version history & limits" : "版本历史与限制"}</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[1.5rem] bg-parchment-deep p-5">
              <h3 className="text-xl font-semibold text-ink-950">{locale === "en" ? "Recent change" : "最新变更"}</h3>
              <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(version.changelog[0], locale)}</p>
              <p className="mt-4 text-sm text-ink-500 anywhere">{version.bundleHash}</p>
            </div>
            <div className="rounded-[1.5rem] bg-parchment-deep p-5">
              <h3 className="text-xl font-semibold text-ink-950">{locale === "en" ? "Known limits" : "已知限制"}</h3>
              <ul className="mt-3 space-y-3 text-base leading-8 text-ink-700">
                {agent.knownLimits.map((limit) => (
                  <li key={limit.en}>{resolveText(limit, locale)}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>

      <aside className="xl:sticky xl:top-28 xl:self-start">
        <div className="rounded-[2rem] border border-ink-950/8 bg-white/88 p-6">
          <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Summary rail" : "摘要侧栏"}</h2>
          <div className="mt-6 space-y-5 text-sm leading-7 text-ink-700">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Install" : "安装"}</p>
              <p className="mt-2 anywhere rounded-2xl bg-parchment-deep px-4 py-3">{agent.source.installCommand}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Skills" : "技能"}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {agent.permissionManifest.skills.map((skill) => (
                  <span key={skill} className="rounded-full border border-ink-950/10 px-3 py-1 anywhere">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Permission risk" : "权限风险"}</p>
              <p className="mt-2 capitalize">{agent.permissionManifest.riskLevel}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Dependencies" : "依赖"}</p>
              <ul className="mt-2 space-y-2">
                {agent.dependencies.map((dependency) => (
                  <li key={dependency} className="anywhere">
                    {dependency}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}
