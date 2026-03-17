import { resolveText } from "@openclaw/agent-ledger-core";

import { BuilderCard } from "../../components/builder-card";
import { WorkspaceShell } from "../../components/workspace-shell";
import { getCurrentLocale } from "../../lib/locale";
import { getHomepageData, getWorkspaceData } from "../../lib/server/repository";

export default async function WorkspacePage() {
  const locale = await getCurrentLocale();
  const workspace = await getWorkspaceData(locale);
  const { builders } = await getHomepageData();

  return (
    <main>
      <WorkspaceShell locale={locale} pathname="/workspace">
        <section className="grid gap-6">
          <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-copper-700">{locale === "en" ? "Overview" : "概览"}</p>
            <h1 className="mt-3 font-display text-5xl text-ink-950">{locale === "en" ? "Builder workspace" : "Builder 工作台"}</h1>
            <p className="mt-4 max-w-[68ch] text-lg leading-8 text-ink-700">
              {locale === "en"
                ? "Use the workspace to draft submissions, request benchmark runs, verify installs, publish reviews, and watch moderation queues."
                : "在工作台中草拟投稿、申请 benchmark、验证安装、发布评价，并跟踪审核队列。"}
            </p>
          </div>
          <div className="grid gap-6 xl:grid-cols-3">
            {builders.map((builder) => (
              <BuilderCard key={builder.id} builder={builder} locale={locale} />
            ))}
          </div>
          <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
            <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Moderation queue snapshot" : "审核队列快照"}</h2>
            <div className="mt-6 grid gap-4">
              {workspace.moderationCases.map((item) => (
                <article key={item.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-copper-700">
                    <span>{item.status}</span>
                    <span>{item.entityType}</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-ink-950">{item.title}</h3>
                  <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(item.reason, locale)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </WorkspaceShell>
    </main>
  );
}
