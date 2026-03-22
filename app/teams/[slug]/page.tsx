import { notFound } from "next/navigation";

import { resolveText } from "@openclaw/alpha-agents-core";

import { ProfileFollowButton } from "../../../components/profile-follow-button";
import { SectionHeading } from "../../../components/section-heading";
import { getCurrentLocale } from "../../../lib/locale";
import { getServerSession } from "../../../lib/server/auth";
import { getTeamPageData } from "../../../lib/server/repository";

export default async function TeamDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getCurrentLocale();
  const session = await getServerSession();
  const { slug } = await params;
  const payload = await getTeamPageData(slug, session);

  if (!payload) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <SectionHeading
        locale={locale}
        eyebrow={locale === "en" ? "Team" : "团队"}
        title={payload.organization.name}
        description={resolveText(payload.organization.summary, locale)}
      />
      <div className="mt-6 flex flex-wrap gap-3">
        <ProfileFollowButton
          locale={locale}
          subjectType="organization"
          subjectId={payload.organization.id}
          initialFollowing={payload.following}
          initialFollowerCount={payload.summary?.followers ?? 0}
          disabled={!session}
        />
      </div>
      <section className="mt-10 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Summary" : "概览"}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-parchment-deep p-5 text-sm text-ink-700">{locale === "en" ? "Managed agents" : "管理中的 Agent"}: {payload.summary?.managedAgentCount ?? 0}</div>
            <div className="rounded-2xl bg-parchment-deep p-5 text-sm text-ink-700">{locale === "en" ? "Active entries" : "活跃报名"}: {payload.summary?.activeEntryCount ?? 0}</div>
            <div className="rounded-2xl bg-parchment-deep p-5 text-sm text-ink-700">{locale === "en" ? "Live coverage" : "实盘覆盖"}: {payload.summary?.liveCoverageCount ?? 0}</div>
            <div className="rounded-2xl bg-parchment-deep p-5 text-sm text-ink-700">{locale === "en" ? "Followers" : "关注者"}: {payload.summary?.followers ?? 0}</div>
          </div>
        </article>
        <article className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Arena results" : "竞技成绩"}</h2>
          <div className="mt-6 grid gap-4">
            {payload.leaderboard.map((entry) => (
              <div key={entry.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-copper-700">
                  #{entry.rank} · {entry.proofMode}
                </div>
                <div className="mt-2 text-xl font-semibold text-ink-950">{entry.agentName}</div>
                <p className="mt-2 text-sm text-ink-700">
                  {locale === "en" ? "Score" : "得分"} {entry.totalScore} · {locale === "en" ? "Return" : "收益"} {entry.netReturnPct}%
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>
      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Active entries" : "活跃报名"}</h2>
          <div className="mt-6 grid gap-4">
            {payload.entries.map((entry) => (
              <div key={entry.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-copper-700">{entry.proofMode} · {entry.liveStatus}</div>
                <div className="mt-2 text-xl font-semibold text-ink-950">{entry.agentName}</div>
                <p className="mt-2 text-sm text-ink-700">@{entry.builderHandle}</p>
              </div>
            ))}
          </div>
        </article>
        <article className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Reports" : "报告"}</h2>
          <div className="mt-6 grid gap-4">
            {payload.reports.map((report) => (
              <div key={report.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-copper-700">{report.kind}</div>
                <div className="mt-2 text-xl font-semibold text-ink-950">{resolveText(report.title, locale)}</div>
                <p className="mt-2 text-sm text-ink-700">{resolveText(report.summary, locale)}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
