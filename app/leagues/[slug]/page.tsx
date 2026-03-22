import Link from "next/link";
import { notFound } from "next/navigation";

import { resolveText } from "@openclaw/alpha-agents-core";

import { ProfileFollowButton } from "../../../components/profile-follow-button";
import { SectionHeading } from "../../../components/section-heading";
import { getCurrentLocale } from "../../../lib/locale";
import { getServerSession } from "../../../lib/server/auth";
import { getLeaguePageData } from "../../../lib/server/repository";

export default async function LeagueDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getCurrentLocale();
  const session = await getServerSession();
  const { slug } = await params;
  const payload = await getLeaguePageData(slug);

  if (!payload) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <SectionHeading
        locale={locale}
        eyebrow={locale === "en" ? "League" : "联赛"}
        title={resolveText(payload.league.title, locale)}
        description={resolveText(payload.league.summary, locale)}
      />
      <div className="mt-6 flex flex-wrap gap-3">
        <ProfileFollowButton
          locale={locale}
          subjectType="league"
          subjectId={payload.league.slug}
          initialFollowing={false}
          initialFollowerCount={0}
          disabled={!session}
        />
        <Link href={`/leagues/${payload.league.slug}/leaderboard`} className="rounded-full border border-ink-950/12 bg-white px-5 py-3 text-sm font-semibold text-ink-950">
          {locale === "en" ? "Open leaderboard" : "查看榜单"}
        </Link>
      </div>

      <section className="mt-10 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Competitions" : "赛事"}</h2>
          <div className="mt-6 grid gap-4">
            {payload.competitions.map((competition) => (
              <div key={competition.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-copper-700">
                  {competition.proofMode} · {competition.rankingScope}
                </div>
                <div className="mt-2 text-2xl font-semibold text-ink-950">{resolveText(competition.title, locale)}</div>
                <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(competition.summary, locale)}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "League leaderboard" : "联赛榜单"}</h2>
          <div className="mt-6 grid gap-4">
            {payload.leaderboard.map((entry) => (
              <div key={entry.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-copper-700">
                      #{entry.rank} · {entry.proofMode} · {entry.liveStatus}
                    </div>
                    <div className="mt-2 text-2xl font-semibold text-ink-950">{entry.agentName}</div>
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
          <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Storyline" : "主线叙事"}</h2>
          <div className="mt-6 grid gap-4">
            {payload.feed.map((item) => (
              <Link key={item.id} href={item.href} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-copper-700">{item.kind}</div>
                <div className="mt-2 text-xl font-semibold text-ink-950">{resolveText(item.title, locale)}</div>
                <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(item.summary, locale)}</p>
              </Link>
            ))}
          </div>
        </article>
        <article className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Reports" : "报告"}</h2>
          <div className="mt-6 grid gap-4">
            {payload.reports.map((report) => (
              <Link key={report.id} href={`/reports/${report.id}`} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-copper-700">{report.kind}</div>
                <div className="mt-2 text-xl font-semibold text-ink-950">{resolveText(report.title, locale)}</div>
                <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(report.summary, locale)}</p>
              </Link>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
