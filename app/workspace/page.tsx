import { resolveText } from "@openclaw/alpha-agents-core";

import { ExplainerShell } from "../../components/explainers/explainer-shell";
import { ProcessFlowDiagram } from "../../components/explainers/process-flow-diagram";
import { WorkspaceShell } from "../../components/workspace-shell";
import { getCurrentLocale } from "../../lib/locale";
import { requirePageSession } from "../../lib/server/page-session";
import { getWorkspaceData } from "../../lib/server/repository";

export default async function WorkspacePage() {
  const locale = await getCurrentLocale();
  const actor = await requirePageSession(["buyer", "builder", "admin"]);
  const workspace = await getWorkspaceData(actor, locale);

  return (
    <main>
      <WorkspaceShell locale={locale} pathname="/workspace" actor={actor}>
        <section className="grid gap-6">
          <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-copper-700">{locale === "en" ? "Overview" : "概览"}</p>
            <h1 className="mt-3 font-display text-5xl text-ink-950">{locale === "en" ? "Identity workspace" : "身份工作台"}</h1>
            <p className="mt-4 max-w-[68ch] text-lg leading-8 text-ink-700">
              {locale === "en"
                ? "This workspace now centers profile quality, credentials, reputation, and saved evaluation artifacts for the current actor."
                : "这个工作台现在以当前 actor 的档案质量、凭证、信誉和已保存评估工件为中心。"}
            </p>
          </div>
          <div className="grid gap-6 xl:grid-cols-4">
            <article className="surface-panel rounded-[1.75rem] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Profile lists" : "Profile List"}</p>
              <p className="mt-2 text-4xl font-semibold text-ink-950">{workspace.shortlists.length}</p>
            </article>
            <article className="surface-panel rounded-[1.75rem] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Evaluation briefs" : "Evaluation Brief"}</p>
              <p className="mt-2 text-4xl font-semibold text-ink-950">{workspace.decisionMemos.length}</p>
            </article>
            <article className="surface-panel rounded-[1.75rem] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Verified deployments" : "已验证部署"}</p>
              <p className="mt-2 text-4xl font-semibold text-ink-950">{workspace.verifiedInstalls.length}</p>
            </article>
            <article className="surface-panel rounded-[1.75rem] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Following" : "关注中"}</p>
              <p className="mt-2 text-4xl font-semibold text-ink-950">{workspace.followingCount}</p>
            </article>
          </div>
          <ExplainerShell
            locale={locale}
            eyebrow={locale === "en" ? "Workspace flow" : "工作台流程"}
            title={locale === "en" ? "The workspace is where public trust signals turn into team decisions." : "工作台是把公开信任信号转成团队决策的地方。"}
            compact
          >
            <ProcessFlowDiagram
              locale={locale}
              compact
              steps={
                locale === "en"
                  ? [
                      { label: "Observe", body: "Track public dossiers, credentials, and reputation movement." },
                      { label: "Collect", body: "Save profile lists and deployment proof as internal artifacts." },
                      { label: "Decide", body: "Write briefs with explicit rollout states and tradeoffs." },
                      { label: "Operate", body: "Keep confidence current through benchmark and review updates." },
                    ]
                  : [
                      { label: "观察", body: "持续跟踪公开档案、凭证和信誉变化。" },
                      { label: "收集", body: "把 Profile List 和部署证明沉淀成内部工件。" },
                      { label: "决策", body: "用明确的 rollout 状态和权衡来写 brief。" },
                      { label: "运行", body: "通过 benchmark 和 review 更新维持信心。" },
                    ]
              }
            />
          </ExplainerShell>
          <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
            <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Latest saved evaluation artifacts" : "最新保存的评估工件"}</h2>
            <div className="mt-6 grid gap-4">
              {[...workspace.shortlists, ...workspace.decisionMemos].slice(0, 4).map((item) => (
                <article key={item.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                  <h3 className="mt-1 text-xl font-semibold text-ink-950">
                    {"recommendationState" in item ? resolveText(item.title, locale) : resolveText(item.name, locale)}
                  </h3>
                  <p className="mt-3 text-base leading-8 text-ink-700">
                    {"recommendationState" in item ? resolveText(item.summary, locale) : item.agentSlugs.join(", ")}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </WorkspaceShell>
    </main>
  );
}
