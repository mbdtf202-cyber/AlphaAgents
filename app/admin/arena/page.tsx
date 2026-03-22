import { getCurrentLocale } from "../../../lib/locale";
import { requirePageSession } from "../../../lib/server/page-session";
import { getWorkspaceData } from "../../../lib/server/repository";

export default async function ArenaAdminPage() {
  const locale = await getCurrentLocale();
  const actor = await requirePageSession(["admin"]);
  const workspace = await getWorkspaceData(actor, locale);

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
        <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Arena admin" : "竞技场后台"}</h1>
        <p className="mt-4 text-lg leading-8 text-ink-700">
          {locale === "en"
            ? "Monitor active competitions, live credentials, risk-facing runs, and arena-side operational state."
            : "监控活跃赛事、实盘凭据、风控敏感 runs 和竞技场侧运行状态。"}
        </p>
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
          <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Runs" : "运行记录"}</h2>
          <div className="mt-6 grid gap-4">
            {workspace.arenaRuns.map((run) => (
              <article key={run.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-copper-700">
                  {run.providerKind} · {run.liveStatus}
                </div>
                <div className="mt-2 text-xl font-semibold text-ink-950">{run.agentSlug}</div>
                <p className="mt-2 text-sm text-ink-700">{run.instrument} · {run.totalScore}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
          <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Live credentials" : "实盘凭据"}</h2>
          <div className="mt-6 grid gap-4">
            {workspace.arenaLiveCredentials.map((credential) => (
              <article key={credential.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-copper-700">
                  {credential.exchange} · {credential.status}
                </div>
                <div className="mt-2 text-xl font-semibold text-ink-950">{credential.accountLabel}</div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
