import Link from "next/link";

import { DecisionMemoForm } from "../../../components/decision-memo-form";
import { WorkspaceShell } from "../../../components/workspace-shell";
import { getCurrentLocale } from "../../../lib/locale";
import { requirePageSession } from "../../../lib/server/page-session";
import { getWorkspaceData } from "../../../lib/server/repository";

export default async function WorkspaceDecisionsPage() {
  const locale = await getCurrentLocale();
  const actor = await requirePageSession(["buyer", "admin"]);
  const workspace = await getWorkspaceData(actor, locale);

  return (
    <main>
      <WorkspaceShell locale={locale} pathname="/workspace/decisions" actor={actor}>
        <div className="grid gap-6">
          <div className="surface-panel rounded-[2rem] p-6">
            <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Evaluation briefs" : "Evaluation Brief"}</h1>
            <p className="mt-4 text-lg leading-8 text-ink-700">
              {locale === "en"
                ? "Evaluation briefs turn profile lists into reviewable recommendations with explicit tradeoffs and rollout states."
                : "Evaluation Brief 会把 Profile List 转化成可评审建议，包含明确权衡和上线状态。"}
            </p>
          </div>
          <DecisionMemoForm locale={locale} shortlists={workspace.shortlists} />
          <div className="grid gap-4">
            {workspace.decisionMemos.map((memo) => (
              <article key={memo.id} className="surface-panel rounded-[1.75rem] p-5">
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-copper-700">
                  <span>{memo.recommendationState}</span>
                  <span>{memo.shortlistId}</span>
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-ink-950">{locale === "en" ? memo.title.en : memo.title["zh-CN"]}</h2>
                <p className="mt-3 text-base leading-8 text-ink-700">{locale === "en" ? memo.summary.en : memo.summary["zh-CN"]}</p>
                <Link href={`/workspace/decisions/${memo.id}`} className="mt-4 inline-flex text-sm font-semibold text-ink-700 underline-offset-4 hover:underline">
                  {locale === "en" ? "Open deliverable" : "打开交付物"}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </WorkspaceShell>
    </main>
  );
}
