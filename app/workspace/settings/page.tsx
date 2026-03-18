import { WorkspaceSettingsForm } from "../../../components/workspace-settings-form";
import { WorkspaceShell } from "../../../components/workspace-shell";
import { getCurrentLocale } from "../../../lib/locale";
import { requirePageSession } from "../../../lib/server/page-session";
import { getPreferredWorkspacePath } from "../../../lib/server/preferences";
import { getStorageMode } from "../../../lib/server/env";
import { getWorkspaceNavItems, resolveWorkspaceNavLabel } from "../../../lib/workspace-nav";

export default async function WorkspaceSettingsPage() {
  const locale = await getCurrentLocale();
  const actor = await requirePageSession(["buyer", "builder", "admin"]);
  const workspaceHome = await getPreferredWorkspacePath(actor.role);
  const workspaceOptions = getWorkspaceNavItems(actor)
    .filter((item) => item.href !== "/workspace/settings")
    .map((item) => ({
      href: item.href,
      label: resolveWorkspaceNavLabel(item, locale),
    }));

  return (
    <main>
      <WorkspaceShell locale={locale} pathname="/workspace/settings" actor={actor}>
        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
            <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Workspace settings" : "工作台设置"}</h1>
            <p className="mt-4 text-lg leading-8 text-ink-700">
              {locale === "en"
                ? "Account defaults should be real, not just described. This page now persists workspace entry and locale preferences instead of acting as a placeholder."
                : "设置页应该是真设置，而不是说明文字。这里现在会真实保存工作台落点和语言偏好，而不再只是占位。"}
            </p>
          </div>

          <div className="grid gap-4 xl:grid-cols-4">
            <article className="rounded-[1.75rem] border border-ink-950/8 bg-white/82 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Role" : "角色"}</p>
              <p className="mt-2 text-2xl font-semibold text-ink-950">{actor.role}</p>
            </article>
            <article className="rounded-[1.75rem] border border-ink-950/8 bg-white/82 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Account" : "账户"}</p>
              <p className="mt-2 text-lg font-semibold text-ink-950 anywhere">{actor.githubHandle ? `@${actor.githubHandle}` : actor.email}</p>
            </article>
            <article className="rounded-[1.75rem] border border-ink-950/8 bg-white/82 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Storage mode" : "存储模式"}</p>
              <p className="mt-2 text-2xl font-semibold text-ink-950">{getStorageMode()}</p>
            </article>
            <article className="rounded-[1.75rem] border border-ink-950/8 bg-white/82 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Current landing" : "当前落点"}</p>
              <p className="mt-2 text-lg font-semibold text-ink-950 anywhere">{workspaceHome}</p>
            </article>
          </div>

          <WorkspaceSettingsForm
            locale={locale}
            currentLocale={locale}
            currentWorkspaceHome={workspaceHome}
            workspaceOptions={workspaceOptions}
          />
        </div>
      </WorkspaceShell>
    </main>
  );
}
