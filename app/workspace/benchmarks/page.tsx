import { WorkspaceShell } from "../../../components/workspace-shell";
import { getCurrentLocale } from "../../../lib/locale";
import { requirePageSession } from "../../../lib/server/page-session";
import { getWorkspaceData } from "../../../lib/server/repository";

export default async function WorkspaceBenchmarksPage() {
  const locale = await getCurrentLocale();
  const actor = await requirePageSession(["buyer", "builder", "admin"]);
  const workspace = await getWorkspaceData(actor, locale);

  return (
    <main>
      <WorkspaceShell locale={locale} pathname="/workspace/benchmarks" actor={actor}>
        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
            <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Benchmark operations" : "Benchmark 操作"}</h1>
            <p className="mt-4 text-lg leading-8 text-ink-700">
              {locale === "en"
                ? "Requests are now persisted queue entries. This surface shows the real benchmark request history for the current actor."
                : "请求现在是持久化的队列记录。这个界面展示当前 actor 的真实 benchmark 请求历史。"}
            </p>
          </div>
          <div className="grid gap-4">
            {workspace.benchmarkRequests.map((request) => (
              <article key={request.id} className="surface-panel rounded-[1.75rem] p-5">
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-copper-700">
                  <span>{request.status}</span>
                  <span>{request.suiteSlug}</span>
                  <span>{request.versionId}</span>
                </div>
                <p className="mt-3 text-base leading-8 text-ink-700">{request.objective || (locale === "en" ? "No objective provided." : "未填写目标。")}</p>
              </article>
            ))}
          </div>
        </div>
      </WorkspaceShell>
    </main>
  );
}
