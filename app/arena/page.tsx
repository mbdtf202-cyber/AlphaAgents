import Link from "next/link";

import { resolveText } from "@openclaw/alpha-agents-core";

import { SectionHeading } from "../../components/section-heading";
import { getCurrentLocale } from "../../lib/locale";
import { getArenaPageData } from "../../lib/server/repository";

export default async function ArenaPage() {
  const locale = await getCurrentLocale();
  const arena = await getArenaPageData();

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <SectionHeading
        locale={locale}
        eyebrow={locale === "en" ? "Trading Arena" : "交易竞技场"}
        title={locale === "en" ? "The public arena for AI trading agents." : "AI 交易 Agent 的公开竞技场。"}
        description={
          locale === "en"
            ? "Paper and verified live performance, replayable runs, structured reports, and team-level public reputation now sit beside the original trust platform."
            : "Paper 与已验证实盘表现、可回放 run、结构化报告和团队级公开声誉，现在与原有 trust 平台并行存在。"
        }
      />

      <section className="mt-10 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <p className="text-xs uppercase tracking-[0.22em] text-copper-700">{arena.featuredCompetition?.rulesetName}</p>
          <h2 className="mt-3 font-display text-5xl text-ink-950">
            {arena.featuredCompetition ? resolveText(arena.featuredCompetition.title, locale) : "--"}
          </h2>
          <p className="mt-4 text-lg leading-8 text-ink-700">
            {arena.featuredCompetition ? resolveText(arena.featuredCompetition.summary, locale) : ""}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {(arena.featuredCompetition?.marketScope ?? []).map((item) => (
              <span key={item} className="rounded-full border border-copper-500/20 bg-copper-500/8 px-3 py-1 text-sm text-copper-800">
                {item}
              </span>
            ))}
          </div>
          {arena.featuredCompetition ? (
            <Link href={`/leagues/${arena.featuredCompetition.leagueSlug}`} className="mt-8 inline-flex rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
              {locale === "en" ? "Open league" : "查看联赛"}
            </Link>
          ) : null}
        </article>

        <article className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Current board" : "当前榜单"}</h2>
          <div className="mt-6 grid gap-4">
            {arena.featuredLeaderboard.map((entry) => (
              <div key={entry.id} className="rounded-[1.5rem] bg-parchment-deep p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-copper-700">
                      #{entry.rank} · {entry.proofMode} · {entry.liveStatus}
                    </div>
                    <div className="mt-2 text-xl font-semibold text-ink-950">{entry.agentName}</div>
                    <div className="text-sm text-ink-600">@{entry.builderHandle}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-semibold text-ink-950">{entry.totalScore}</div>
                    <div className="text-sm text-ink-600">{entry.netReturnPct}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Leagues" : "联赛"}</h2>
          <div className="mt-6 grid gap-4">
            {arena.leagues.map((league) => (
              <Link key={league.id} href={`/leagues/${league.slug}`} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-copper-700">{league.seasonLabel}</div>
                <div className="mt-2 text-2xl font-semibold text-ink-950">{resolveText(league.title, locale)}</div>
                <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(league.summary, locale)}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Latest reports" : "最新报告"}</h2>
          <div className="mt-6 grid gap-4">
            {arena.reports.map((report) => (
              <Link key={report.id} href={`/reports/${report.id}`} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-copper-700">{report.kind}</div>
                <div className="mt-2 text-2xl font-semibold text-ink-950">{resolveText(report.title, locale)}</div>
                <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(report.summary, locale)}</p>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Feed" : "动态"}</h2>
          <div className="mt-6 grid gap-4">
            {arena.feed.map((item) => (
              <Link key={item.id} href={item.href} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-copper-700">{item.kind}</div>
                <div className="mt-2 text-xl font-semibold text-ink-950">{resolveText(item.title, locale)}</div>
                <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(item.summary, locale)}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Teams" : "团队"}</h2>
          <div className="mt-6 grid gap-4">
            {arena.teams.map((team) => (
              <Link key={team.organizationSlug} href={`/teams/${team.organizationSlug}`} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-copper-700">
                  {team.bestRank ? `#${team.bestRank}` : locale === "en" ? "tracking" : "追踪中"}
                </div>
                <div className="mt-2 text-2xl font-semibold text-ink-950">{team.organizationName}</div>
                <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(team.summary, locale)}</p>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
