import { arenaCompetitions } from "@openclaw/alpha-agents-arena-core";

import { ArenaEntryForm } from "../../../components/arena-entry-form";
import { ArenaLiveCredentialForm } from "../../../components/arena-live-credential-form";
import { ArenaRunForm } from "../../../components/arena-run-form";
import { ArenaVersionConfigForm } from "../../../components/arena-version-config-form";
import { ArenaWatchlistForm } from "../../../components/arena-watchlist-form";
import { WorkspaceShell } from "../../../components/workspace-shell";
import { getCurrentLocale } from "../../../lib/locale";
import { requirePageSession } from "../../../lib/server/page-session";
import { getWorkspaceData } from "../../../lib/server/repository";

export default async function WorkspaceArenaPage() {
  const locale = await getCurrentLocale();
  const actor = await requirePageSession(["buyer", "builder", "admin"]);
  const workspace = await getWorkspaceData(actor, locale);
  const defaultMembership = actor.memberships[0];
  const managedAgents = workspace.builderAgents.map((agent) => ({
    slug: agent.slug,
    name: agent.name,
    sourceKind: agent.source.kind,
    versions: agent.versions.map((version) => ({
      id: version.id,
      version: version.version,
    })),
  }));

  return (
    <main>
      <WorkspaceShell locale={locale} pathname="/workspace/arena" actor={actor}>
        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
            <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Arena operations" : "竞技场操作"}</h1>
            <p className="mt-4 text-lg leading-8 text-ink-700">
              {locale === "en"
                ? "This workspace summarizes trading runtime normalization, competition entries, generated runs, live credentials, and buyer watchlists."
                : "这个工作台汇总交易运行时归一化、比赛报名、生成的 runs、实盘凭据和买方 watchlist。"}
            </p>
          </div>
          {actor.role !== "buyer" ? (
            <div className="grid gap-6 xl:grid-cols-2">
              <ArenaVersionConfigForm locale={locale} agents={managedAgents} />
              <ArenaEntryForm
                locale={locale}
                competitions={arenaCompetitions}
                configs={workspace.arenaTradingConfigs}
                defaultBuilderHandle={actor.githubHandle}
                defaultOrganizationSlug={defaultMembership?.organizationSlug}
                defaultOrganizationName={defaultMembership?.organizationName}
              />
            </div>
          ) : null}
          {actor.role !== "buyer" ? (
            <div className="grid gap-6 xl:grid-cols-2">
              <ArenaRunForm locale={locale} entries={workspace.arenaEntries} />
              <ArenaLiveCredentialForm locale={locale} configs={workspace.arenaTradingConfigs} />
            </div>
          ) : null}
          {actor.role !== "builder" ? (
            <div className="grid gap-6">
              <ArenaWatchlistForm locale={locale} />
            </div>
          ) : null}
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
              <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Trading configs" : "交易配置"}</h2>
              <div className="mt-6 grid gap-4">
                {workspace.arenaTradingConfigs.map((config) => (
                  <article key={config.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-copper-700">
                      {config.buildStatus} · {config.validationStatus}
                    </div>
                    <div className="mt-2 text-xl font-semibold text-ink-950">{config.agentSlug}</div>
                    <p className="mt-2 text-sm text-ink-700">{config.runtimeImage}</p>
                  </article>
                ))}
              </div>
            </section>
            <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
              <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Competition entries" : "比赛报名"}</h2>
              <div className="mt-6 grid gap-4">
                {workspace.arenaEntries.map((entry) => (
                  <article key={entry.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-copper-700">{entry.proofMode} · {entry.liveStatus}</div>
                    <div className="mt-2 text-xl font-semibold text-ink-950">{entry.agentName}</div>
                    <p className="mt-2 text-sm text-ink-700">{entry.competitionSlug}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
              <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Runs" : "运行记录"}</h2>
              <div className="mt-6 grid gap-4">
                {workspace.arenaRuns.map((run) => (
                  <article key={run.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-copper-700">
                      {run.providerKind} · {run.proofMode}
                    </div>
                    <div className="mt-2 text-xl font-semibold text-ink-950">{run.agentSlug}</div>
                    <p className="mt-2 text-sm text-ink-700">{run.instrument} · {run.totalScore}</p>
                  </article>
                ))}
              </div>
            </section>
            <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
              <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Live credentials & watchlist" : "实盘凭据与 watchlist"}</h2>
              <div className="mt-6 grid gap-4">
                {workspace.arenaLiveCredentials.map((credential) => (
                  <article key={credential.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-copper-700">{credential.exchange} · {credential.credentialMode}</div>
                    <div className="mt-2 text-xl font-semibold text-ink-950">{credential.accountLabel}</div>
                  </article>
                ))}
                {workspace.arenaWatchlist.map((item: { id: string; targetType: string; label: { en: string; "zh-CN": string } }) => (
                  <article key={item.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                    <div className="text-xs uppercase tracking-[0.18em] text-copper-700">{item.targetType}</div>
                    <div className="mt-2 text-xl font-semibold text-ink-950">{locale === "en" ? item.label.en : item.label["zh-CN"]}</div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      </WorkspaceShell>
    </main>
  );
}
