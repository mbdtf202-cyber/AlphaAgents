import { notFound } from "next/navigation";

import { benchmarkSuites, resolveText } from "@openclaw/agent-ledger-core";

import { ScoreBars } from "../../../components/score-bars";
import { getCurrentLocale } from "../../../lib/locale";
import { getBenchmarkDetailPageData } from "../../../lib/server/repository";

export async function generateStaticParams() {
  return benchmarkSuites.map((suite) => ({ slug: suite.slug }));
}

export default async function BenchmarkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getCurrentLocale();
  const { slug } = await params;
  const payload = await getBenchmarkDetailPageData(slug);

  if (!payload) {
    notFound();
  }

  const { suite, runs } = payload;

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <section className="rounded-[2.5rem] border border-ink-950/8 bg-white/84 p-7">
        <p className="text-xs uppercase tracking-[0.25em] text-copper-700">{suite.track}</p>
        <h1 className="mt-3 max-w-[14ch] font-display text-6xl leading-[0.92] text-balance text-ink-950 md:text-7xl">{resolveText(suite.title, locale)}</h1>
        <p className="mt-6 max-w-[72ch] text-xl leading-9 text-ink-700">{resolveText(suite.summary, locale)}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[1.5rem] bg-parchment-deep p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Public dev set" : "公开 dev set"}</div>
            <div className="mt-2 text-4xl font-semibold text-ink-950">{suite.publicDevSetSize}</div>
          </div>
          <div className="rounded-[1.5rem] bg-parchment-deep p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Held-out set" : "隐藏集"}</div>
            <div className="mt-2 text-4xl font-semibold text-ink-950">{suite.heldOutSetSize}</div>
          </div>
          <div className="rounded-[1.5rem] bg-parchment-deep p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Measurement focus" : "重点维度"}</div>
            <div className="mt-2 text-sm leading-7 text-ink-800">{suite.measurementFocus.join(" · ")}</div>
          </div>
          <div className="rounded-[1.5rem] bg-parchment-deep p-4">
            <div className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Private ranking protected" : "私有排序保护"}</div>
            <div className="mt-2 text-sm leading-7 text-ink-800">
              {locale === "en" ? "Public pages explain the method without leaking the hidden test surface." : "公开页面只解释方法，不泄露隐藏测试面。"}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Methodology" : "方法"}</h2>
          <div className="mt-6 space-y-5">
            {suite.methodology.map((paragraph) => (
              <p key={paragraph.en} className="text-lg leading-9 text-ink-700">
                {resolveText(paragraph, locale)}
              </p>
            ))}
          </div>
          <h3 className="mt-10 text-2xl font-semibold text-ink-950">{locale === "en" ? "Sample tasks" : "样题"}</h3>
          <div className="mt-5 grid gap-4">
            {suite.sampleTasks.map((task) => (
              <div key={task.en} className="rounded-[1.5rem] bg-parchment-deep p-5 text-base leading-8 text-ink-800">
                {resolveText(task, locale)}
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Current leaders" : "当前榜首"}</h2>
          <div className="mt-6 grid gap-5">
            {runs.map(({ agent, run }) => (
              <article key={run.id} className="rounded-[1.5rem] border border-ink-950/8 bg-parchment p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-copper-700">#{run.publicRank}</p>
                    <h3 className="mt-2 text-2xl font-semibold text-ink-950">{agent.name}</h3>
                    <p className="text-sm text-ink-500">@{agent.builderHandle}</p>
                  </div>
                  <div className="text-right text-4xl font-semibold text-ink-950">{run.scorecard.overall}</div>
                </div>
                <p className="mt-4 text-base leading-8 text-ink-700">{resolveText(run.notes, locale)}</p>
                <div className="mt-5">
                  <ScoreBars scorecard={run.scorecard} />
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
