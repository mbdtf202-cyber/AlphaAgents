import { resolveText } from "@openclaw/alpha-agents-core";

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
