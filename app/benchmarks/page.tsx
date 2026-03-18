import Link from "next/link";

import { resolveText } from "@openclaw/alpha-agents-core";

import { SectionHeading } from "../../components/section-heading";
import { getCurrentLocale } from "../../lib/locale";
import { getBenchmarksPageData } from "../../lib/server/repository";

export default async function BenchmarksPage() {
  const locale = await getCurrentLocale();
  const suites = await getBenchmarksPageData();

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <SectionHeading
        locale={locale}
        eyebrow={locale === "en" ? "Credentials" : "凭证"}
        title={locale === "en" ? "Public credential tracks that explain what an agent has actually earned." : "公开凭证赛道，不只告诉你排名，还解释 Agent 真实获得了什么。"}
        description={
          locale === "en"
            ? "Each benchmark suite defines a credential track, task family, scoring frame, public dev set, hidden set, and evidence model. The profile is primary; this page is the methodology and credential registry."
            : "每个 benchmark 套件都定义了一条凭证赛道、任务家族、评分框架、公开 dev set、隐藏集以及证据模型。档案是主入口，这里是方法与凭证登记页。"
        }
      />
      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        {suites.map((suite) => (
          <article key={suite.slug} className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-copper-700">{suite.track}</p>
                <h2 className="mt-3 font-display text-3xl text-ink-950">{resolveText(suite.title, locale)}</h2>
              </div>
              <Link href={`/benchmarks/${suite.slug}`} className="text-sm font-semibold text-ink-700 underline-offset-4 hover:underline">
                {locale === "en" ? "Open track" : "查看赛道"}
              </Link>
            </div>
            <p className="mt-4 text-base leading-8 text-ink-700">{resolveText(suite.summary, locale)}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] bg-parchment-deep p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Public dev set" : "公开 dev set"}</div>
                <div className="mt-2 text-3xl font-semibold text-ink-950">{suite.publicDevSetSize}</div>
              </div>
              <div className="rounded-[1.5rem] bg-parchment-deep p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Held-out set" : "隐藏集"}</div>
                <div className="mt-2 text-3xl font-semibold text-ink-950">{suite.heldOutSetSize}</div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {suite.measurementFocus.map((metric) => (
                <span key={metric} className="rounded-full border border-ink-950/10 px-3 py-1 text-sm text-ink-700">
                  {metric}
                </span>
              ))}
            </div>
            <div className="mt-6 grid gap-3">
              {suite.entries.map((entry) => (
                <div key={`${suite.slug}-${entry.agentSlug}`} className="grid minmax-0 grid-cols-[3rem_minmax(0,1fr)_4rem] items-center gap-3 rounded-[1.25rem] bg-white p-3 shadow-sm">
                  <div className="text-xl font-semibold text-ink-950">#{entry.rank}</div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink-950">{entry.agentName}</p>
                    <p className="truncate text-sm text-ink-500">@{entry.builderHandle}</p>
                  </div>
                  <div className="text-right font-semibold text-ink-950">{entry.overall}</div>
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
