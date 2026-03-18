import { ExplainerShell } from "../../../components/explainers/explainer-shell";
import { ProcessFlowDiagram } from "../../../components/explainers/process-flow-diagram";
import { ShortlistForm } from "../../../components/shortlist-form";
import { WorkspaceShell } from "../../../components/workspace-shell";
import { getCurrentLocale } from "../../../lib/locale";
import { requirePageSession } from "../../../lib/server/page-session";
import { getCompareCandidates, getWorkspaceData } from "../../../lib/server/repository";

export default async function WorkspaceShortlistsPage() {
  const locale = await getCurrentLocale();
  const actor = await requirePageSession(["buyer", "admin"]);
  const workspace = await getWorkspaceData(actor, locale);
  const allAgents = await getCompareCandidates();

  return (
    <main>
      <WorkspaceShell locale={locale} pathname="/workspace/shortlists" actor={actor}>
        <div className="grid gap-6">
          <div className="surface-panel rounded-[2rem] p-6">
            <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Profile lists" : "Profile List"}</h1>
            <p className="mt-4 text-lg leading-8 text-ink-700">
              {locale === "en"
                ? "Profile lists are persisted evaluation resources. They belong to the current actor or organization and can later feed an evaluation brief."
                : "Profile List 现在是持久化评估资源，归属于当前 actor 或组织，并可继续流入 Evaluation Brief。"}
            </p>
          </div>
          <ExplainerShell
            locale={locale}
            eyebrow={locale === "en" ? "Selection flow" : "筛选流程"}
            title={locale === "en" ? "A profile list is where public evidence becomes an internal shortlist." : "Profile List 是把公开证据变成内部短名单的地方。"}
            compact
          >
            <ProcessFlowDiagram
              locale={locale}
              compact
              steps={
                locale === "en"
                  ? [
                      { label: "Read", body: "Start from public dossiers and declared boundaries." },
                      { label: "Constrain", body: "Encode repo size, sensitivity, and approvals." },
                      { label: "Weight", body: "Make tradeoffs explicit through score weights." },
                      { label: "Save", body: "Persist the list for later briefing." },
                    ]
                  : [
                      { label: "阅读", body: "先从公开档案和声明边界开始。" },
                      { label: "约束", body: "把仓库规模、敏感度和审批模式编码进去。" },
                      { label: "权重", body: "通过权重把权衡显性化。" },
                      { label: "保存", body: "把列表持久化，供后续 brief 使用。" },
                    ]
              }
            />
          </ExplainerShell>
          <ShortlistForm locale={locale} agents={allAgents} />
          <div className="grid gap-4">
            {workspace.shortlists.map((shortlist) => (
              <article key={shortlist.id} className="surface-panel rounded-[1.75rem] p-5">
                <h2 className="text-2xl font-semibold text-ink-950">{locale === "en" ? shortlist.name.en : shortlist.name["zh-CN"]}</h2>
                <p className="mt-3 text-base leading-8 text-ink-700">{shortlist.agentSlugs.join(", ")}</p>
                {shortlist.constraints ? (
                  <p className="mt-3 text-sm text-ink-500">
                    {locale === "en"
                      ? `Constraints: ${shortlist.constraints.repoSize} repo, ${shortlist.constraints.dataSensitivity} sensitivity, ${shortlist.constraints.approvalModel}.`
                      : `约束：${shortlist.constraints.repoSize} 仓库、${shortlist.constraints.dataSensitivity} 敏感度、${shortlist.constraints.approvalModel} 审批模式。`}
                  </p>
                ) : null}
                {shortlist.internalNotes ? <p className="mt-3 text-sm text-ink-600">{shortlist.internalNotes}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </WorkspaceShell>
    </main>
  );
}
