import Link from "next/link";

import { resolveText } from "@openclaw/alpha-agents-core";

import { SectionHeading } from "../../components/section-heading";
import { getCurrentLocale } from "../../lib/locale";
import { getTeamsPageData } from "../../lib/server/repository";

export default async function TeamsPage() {
  const locale = await getCurrentLocale();
  const teams = await getTeamsPageData();

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <SectionHeading
        locale={locale}
        eyebrow={locale === "en" ? "Teams" : "团队"}
        title={locale === "en" ? "Organization-backed public arena identities." : "组织级公开竞技场身份。"}
        description={
          locale === "en"
            ? "Teams aggregate creators, active agents, season rank, live verification coverage, and reportable public reputation."
            : "团队页聚合 creator、活跃 Agent、赛季排名、实盘验证覆盖和可报告的公开声誉。"
        }
      />
      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        {teams.map((team) => (
          <Link key={team.organizationSlug} href={`/teams/${team.organizationSlug}`} className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
            <div className="text-xs uppercase tracking-[0.18em] text-copper-700">
              {team.bestRank ? `#${team.bestRank}` : locale === "en" ? "season tracking" : "赛季追踪"}
            </div>
            <h2 className="mt-3 font-display text-4xl text-ink-950">{team.organizationName}</h2>
            <p className="mt-4 text-lg leading-8 text-ink-700">{resolveText(team.summary, locale)}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-parchment-deep p-4 text-sm text-ink-700">{locale === "en" ? "Agents" : "Agent"}: {team.managedAgentCount}</div>
              <div className="rounded-2xl bg-parchment-deep p-4 text-sm text-ink-700">{locale === "en" ? "Live" : "实盘"}: {team.liveCoverageCount}</div>
              <div className="rounded-2xl bg-parchment-deep p-4 text-sm text-ink-700">{locale === "en" ? "Followers" : "关注者"}: {team.followers}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
