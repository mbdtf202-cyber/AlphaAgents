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
            <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Buyer shortlists" : "买方短名单"}</h1>
            <p className="mt-4 text-lg leading-8 text-ink-700">
              {locale === "en"
                ? "Shortlists are now persisted resources. They belong to the current actor or organization and can later feed a decision memo."
                : "短名单现在是持久化资源，归属于当前 actor 或组织，并可以继续流入决策备忘录。"}
            </p>
          </div>
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
