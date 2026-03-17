import Link from "next/link";

import { resolveText } from "@openclaw/agent-ledger-core";

import { WorkspaceShell } from "../../../components/workspace-shell";
import { getCurrentLocale } from "../../../lib/locale";
import { getBenchmarksPageData } from "../../../lib/server/repository";

export default async function WorkspaceBenchmarksPage() {
  const locale = await getCurrentLocale();
  const suites = await getBenchmarksPageData();

  return (
    <main>
      <WorkspaceShell locale={locale} pathname="/workspace/benchmarks">
        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
            <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Benchmark operations" : "Benchmark 操作"}</h1>
            <p className="mt-4 text-lg leading-8 text-ink-700">
              {locale === "en"
                ? "Request reruns when permissions change, publish new artifacts after a version release, and track how freshness affects public ranking."
                : "当权限变化时请求重跑，在新版本发布后公开新工件，并跟踪新鲜度如何影响公开排名。"}
            </p>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            {suites.map((suite) => (
              <article key={suite.slug} className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-copper-700">{suite.track}</p>
                <h2 className="mt-3 text-3xl font-semibold text-ink-950">{resolveText(suite.title, locale)}</h2>
                <p className="mt-4 text-base leading-8 text-ink-700">{resolveText(suite.summary, locale)}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href={`/benchmarks/${suite.slug}`} className="rounded-full bg-ink-950 px-4 py-2 text-sm font-semibold text-parchment">
                    {locale === "en" ? "Open suite" : "查看套件"}
                  </Link>
                  <button className="rounded-full border border-ink-950/12 px-4 py-2 text-sm font-semibold text-ink-950">
                    {locale === "en" ? "Request rerun" : "申请重跑"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </WorkspaceShell>
    </main>
  );
}
