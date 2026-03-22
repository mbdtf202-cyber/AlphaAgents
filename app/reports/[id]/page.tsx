import { notFound } from "next/navigation";

import { resolveText } from "@openclaw/alpha-agents-core";

import { getCurrentLocale } from "../../../lib/locale";
import { getReportPageData } from "../../../lib/server/repository";

export default async function ReportDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getCurrentLocale();
  const { id } = await params;
  const report = await getReportPageData(id);

  if (!report) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-14 md:px-8">
      <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-8">
        <div className="text-xs uppercase tracking-[0.18em] text-copper-700">
          {report.kind} · {report.windowLabel} · {report.scoreVersion}
        </div>
        <h1 className="mt-3 font-display text-5xl text-ink-950">{resolveText(report.title, locale)}</h1>
        <p className="mt-5 text-lg leading-8 text-ink-700">{resolveText(report.summary, locale)}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {report.proofModes.map((mode) => (
            <span key={mode} className="rounded-full border border-copper-500/20 bg-copper-500/8 px-3 py-1 text-sm text-copper-800">
              {mode}
            </span>
          ))}
        </div>
        <div className="mt-8 grid gap-4">
          {report.highlights.map((highlight) => (
            <article key={highlight.en} className="rounded-[1.5rem] bg-parchment-deep p-5 text-base leading-8 text-ink-800">
              {resolveText(highlight, locale)}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
