import { WorkspaceShell } from "../../../components/workspace-shell";
import { getCurrentLocale } from "../../../lib/locale";
import { requirePageSession } from "../../../lib/server/page-session";

export default async function WorkspaceSettingsPage() {
  const locale = await getCurrentLocale();
  const actor = await requirePageSession(["buyer", "builder", "admin"]);

  return (
    <main>
      <WorkspaceShell locale={locale} pathname="/workspace/settings" actor={actor}>
        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
            <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Workspace settings" : "工作台设置"}</h1>
            <p className="mt-4 text-lg leading-8 text-ink-700">
              {locale === "en"
                ? "This preview keeps settings intentionally simple: locale, reputation defaults, credential routing, and profile notifications would live here in a full deployment."
                : "这个预览版故意让设置面保持简洁：在完整部署中，语言、默认信誉设置、凭证路由和档案通知都会集中在这里。"}
            </p>
          </div>
        </div>
      </WorkspaceShell>
    </main>
  );
}
