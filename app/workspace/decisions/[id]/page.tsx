import Link from "next/link";
import { notFound } from "next/navigation";

import { resolveText } from "@openclaw/alpha-agents-core";

import { PrintButton } from "../../../../components/print-button";
import { WorkspaceShell } from "../../../../components/workspace-shell";
import { getCurrentLocale } from "../../../../lib/locale";
import { requirePageSession } from "../../../../lib/server/page-session";
import { getWorkspaceData } from "../../../../lib/server/repository";

export default async function DecisionMemoDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const locale = await getCurrentLocale();
  const actor = await requirePageSession(["buyer", "admin"]);
  const { id } = await params;
  const workspace = await getWorkspaceData(actor, locale);
  const memo = workspace.decisionMemos.find((entry) => entry.id === id);
  const shortlist = memo ? workspace.shortlists.find((entry) => entry.id === memo.shortlistId) : undefined;

  if (!memo) {
    notFound();
  }

  return (
    <main>
      <WorkspaceShell locale={locale} pathname="/workspace/decisions" actor={actor}>
        <article className="grid gap-6 rounded-[2rem] border border-ink-950/8 bg-white/88 p-6 print:border-0 print:shadow-none">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-copper-700">{locale === "en" ? "Buyer deliverable" : "买方交付物"}</p>
              <h1 className="mt-3 font-display text-5xl text-ink-950">{resolveText(memo.title, locale)}</h1>
            </div>
            <div className="flex flex-wrap gap-3">
              <PrintButton label={locale === "en" ? "Print / Export PDF" : "打印 / 导出 PDF"} />
              <Link href="/workspace/decisions" className="rounded-full border border-ink-950/12 px-4 py-2 text-sm font-semibold text-ink-950">
                {locale === "en" ? "Back" : "返回"}
              </Link>
            </div>
          </div>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.5rem] bg-parchment-deep p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Recommendation state" : "建议状态"}</p>
              <p className="mt-2 text-2xl font-semibold text-ink-950">{memo.recommendationState}</p>
            </div>
            <div className="rounded-[1.5rem] bg-parchment-deep p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Shortlist" : "短名单"}</p>
              <p className="mt-2 text-2xl font-semibold text-ink-950">{shortlist ? resolveText(shortlist.name, locale) : memo.shortlistId}</p>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-ink-950/8 bg-white p-5">
            <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Executive summary" : "执行摘要"}</h2>
            <p className="mt-4 text-lg leading-8 text-ink-700">{resolveText(memo.summary, locale)}</p>
          </section>

          {memo.evidenceSummary ? (
            <section className="rounded-[1.5rem] border border-ink-950/8 bg-white p-5">
              <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Evidence summary" : "证据摘要"}</h2>
              <p className="mt-4 text-lg leading-8 text-ink-700">{resolveText(memo.evidenceSummary, locale)}</p>
            </section>
          ) : null}

          {memo.riskSummary ? (
            <section className="rounded-[1.5rem] border border-ink-950/8 bg-white p-5">
              <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Risk summary" : "风险摘要"}</h2>
              <p className="mt-4 text-lg leading-8 text-ink-700">{resolveText(memo.riskSummary, locale)}</p>
            </section>
          ) : null}

          <section className="rounded-[1.5rem] border border-ink-950/8 bg-white p-5">
            <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Rollout recommendation" : "上线建议"}</h2>
            <p className="mt-4 text-lg leading-8 text-ink-700">{resolveText(memo.rolloutRecommendation, locale)}</p>
          </section>

          <section className="rounded-[1.5rem] border border-ink-950/8 bg-white p-5">
            <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Tradeoffs" : "权衡"}</h2>
            <ul className="mt-4 grid gap-3 text-base leading-8 text-ink-700">
              {memo.tradeoffs.map((item) => (
                <li key={item.en} className="rounded-2xl bg-parchment-deep px-4 py-3">
                  {resolveText(item, locale)}
                </li>
              ))}
            </ul>
          </section>

          {memo.scoreWeights ? (
            <section className="rounded-[1.5rem] border border-ink-950/8 bg-white p-5">
              <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Weight profile" : "权重配置"}</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-4 text-sm text-ink-700">
                {Object.entries(memo.scoreWeights).map(([key, value]) => (
                  <div key={key} className="rounded-2xl bg-parchment-deep px-4 py-3">
                    <div className="uppercase tracking-[0.16em] text-ink-500">{key}</div>
                    <div className="mt-2 text-xl font-semibold text-ink-950">{value}</div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </WorkspaceShell>
    </main>
  );
}
