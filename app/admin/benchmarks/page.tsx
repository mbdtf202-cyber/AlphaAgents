import { BenchmarkTrackMap } from "../../../components/explainers/benchmark-track-map";
import { ExplainerShell } from "../../../components/explainers/explainer-shell";
import { getCurrentLocale } from "../../../lib/locale";
import { requirePageSession } from "../../../lib/server/page-session";
import { getBenchmarksPageData } from "../../../lib/server/repository";

export default async function AdminBenchmarksPage() {
  const locale = await getCurrentLocale();
  await requirePageSession(["admin"]);
  const suites = await getBenchmarksPageData();

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
        <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Benchmark admin" : "Benchmark 后台"}</h1>
      </div>
      <div className="mt-6">
        <ExplainerShell
          locale={locale}
          eyebrow="Admin"
          title={locale === "en" ? "Benchmark operations manage tracks as credential infrastructure." : "benchmark 后台管理的是凭证基础设施，而不只是跑分。"}
          compact
        >
          <BenchmarkTrackMap locale={locale} />
        </ExplainerShell>
      </div>
      <div className="mt-6 rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {suites.map((suite) => (
            <article key={suite.slug} className="rounded-[1.5rem] bg-parchment-deep p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-copper-700">{suite.track}</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink-950">{locale === "en" ? suite.title.en : suite.title["zh-CN"]}</h2>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
