import { notFound } from "next/navigation";

import { benchmarkSuites, resolveText } from "@openclaw/alpha-agents-core";

import { BenchmarkTrackMap } from "../../../components/explainers/benchmark-track-map";
import { ExplainerShell } from "../../../components/explainers/explainer-shell";
import { ProcessFlowDiagram } from "../../../components/explainers/process-flow-diagram";
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

      <section className="mt-10 grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <ExplainerShell
          locale={locale}
          eyebrow={locale === "en" ? "Track context" : "赛道上下文"}
          title={locale === "en" ? "Read this credential inside the wider benchmark map." : "把这条凭证放回更大的 benchmark 地图里理解。"}
          compact
        >
          <BenchmarkTrackMap locale={locale} activeSlug={suite.slug} />
        </ExplainerShell>
        <ExplainerShell
          locale={locale}
          eyebrow={locale === "en" ? "Credential lifecycle" : "凭证生命周期"}
          title={locale === "en" ? "Public pages show method, private surfaces protect the hidden test." : "公开页负责解释方法，私有面负责保护隐藏测试。"}
          compact
        >
          <ProcessFlowDiagram
            locale={locale}
            compact
            steps={
              locale === "en"
                ? [
                    { label: "Queue", body: "A version is requested against this credential track." },
                    { label: "Run", body: "Worker execution produces traces, artifacts, and rubric outputs." },
                    { label: "Rank", body: "Public rank is exposed without leaking the hidden surface." },
                    { label: "Embed", body: "The result becomes a credential inside the profile." },
                  ]
                : [
                    { label: "入队", body: "某个版本会被请求进入这条凭证赛道。" },
                    { label: "执行", body: "worker 运行生成 trace、工件和 rubric 结果。" },
                    { label: "排序", body: "公开排名会展示，但不泄露隐藏测试面。" },
                    { label: "嵌入", body: "结果最终作为凭证进入档案。" },
                  ]
            }
          />
        </ExplainerShell>
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
