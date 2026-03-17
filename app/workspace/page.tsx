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
            <h1 className="mt-3 font-display text-5xl text-ink-950">{locale === "en" ? "Trust workspace" : "信任工作台"}</h1>
            <p className="mt-4 max-w-[68ch] text-lg leading-8 text-ink-700">
              {locale === "en"
                ? "This workspace is now actor-aware: buyer actions, builder actions, and admin actions all require a real session and operate on persisted resources."
                : "这个工作台现在按角色感知：买方、Builder 和管理员动作都要求真实 session，并作用于持久化资源。"}
            </p>
          </div>
          <div className="grid gap-6 xl:grid-cols-4">
            <article className="surface-panel rounded-[1.75rem] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Shortlists" : "短名单"}</p>
              <p className="mt-2 text-4xl font-semibold text-ink-950">{workspace.shortlists.length}</p>
            </article>
            <article className="surface-panel rounded-[1.75rem] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Decision memos" : "决策备忘录"}</p>
              <p className="mt-2 text-4xl font-semibold text-ink-950">{workspace.decisionMemos.length}</p>
            </article>
            <article className="surface-panel rounded-[1.75rem] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Verified installs" : "已验证安装"}</p>
              <p className="mt-2 text-4xl font-semibold text-ink-950">{workspace.verifiedInstalls.length}</p>
            </article>
            <article className="surface-panel rounded-[1.75rem] p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Benchmark requests" : "Benchmark 请求"}</p>
              <p className="mt-2 text-4xl font-semibold text-ink-950">{workspace.benchmarkRequests.length}</p>
            </article>
          </div>
          <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
            <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Latest persisted actions" : "最新持久化动作"}</h2>
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
