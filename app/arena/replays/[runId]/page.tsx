import { notFound } from "next/navigation";

import { resolveText } from "@openclaw/alpha-agents-core";

import { getCurrentLocale } from "../../../../lib/locale";
import { getReplayPageData } from "../../../../lib/server/repository";

export default async function ArenaReplayPage({ params }: { params: Promise<{ runId: string }> }) {
  const locale = await getCurrentLocale();
  const { runId } = await params;
  const payload = await getReplayPageData(runId);

  if (!payload) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-14 md:px-8">
      <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-8">
        <div className="text-xs uppercase tracking-[0.18em] text-copper-700">
          {payload.run.proofMode} · {payload.run.providerKind} · {payload.run.liveStatus}
        </div>
        <h1 className="mt-3 font-display text-5xl text-ink-950">{resolveText(payload.replay.title, locale)}</h1>
        <p className="mt-5 text-lg leading-8 text-ink-700">{resolveText(payload.replay.summary, locale)}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-parchment-deep p-5 text-sm text-ink-700">
            {locale === "en" ? "Instrument" : "标的"}: {payload.run.instrument}
          </div>
          <div className="rounded-2xl bg-parchment-deep p-5 text-sm text-ink-700">
            {locale === "en" ? "Score" : "得分"}: {payload.run.totalScore}
          </div>
        </div>
        <div className="mt-8 grid gap-4">
          {payload.replay.keyMoments.map((moment) => (
            <article key={moment.en} className="rounded-[1.5rem] bg-parchment-deep p-5 text-base leading-8 text-ink-800">
              {resolveText(moment, locale)}
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
