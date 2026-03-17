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
