import Link from "next/link";

import { DecisionMemoForm } from "../../../components/decision-memo-form";
import { ExplainerShell } from "../../../components/explainers/explainer-shell";
import { ProcessFlowDiagram } from "../../../components/explainers/process-flow-diagram";
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
          <ExplainerShell
            locale={locale}
            eyebrow={locale === "en" ? "Decision flow" : "决策流程"}
            title={locale === "en" ? "A brief should explain why the shortlist deserves rollout, hold, or rejection." : "一个 brief 应该解释 shortlist 为什么值得上线、搁置或拒绝。"}
            compact
          >
            <ProcessFlowDiagram
              locale={locale}
              compact
              steps={
                locale === "en"
                  ? [
                      { label: "Shortlist", body: "Start from a saved evaluation set." },
                      { label: "Evidence", body: "Summarize what is strong enough to trust." },
                      { label: "Risk", body: "State what still blocks broad rollout." },
                      { label: "Recommendation", body: "Publish an explicit decision state." },
                    ]
                  : [
                      { label: "Shortlist", body: "从已保存的评估集合出发。" },
                      { label: "证据", body: "总结哪些信号已经足够可信。" },
                      { label: "风险", body: "明确哪些问题仍阻碍大规模上线。" },
                      { label: "建议", body: "输出明确的决策状态。" },
                    ]
              }
            />
          </ExplainerShell>
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
