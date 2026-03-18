import Link from "next/link";

import { SectionHeading } from "../../components/section-heading";
import { getCurrentLocale } from "../../lib/locale";
import { getHomepageData } from "../../lib/server/repository";

export default async function LeaderboardsPage() {
  const locale = await getCurrentLocale();
  const { leaderboards, suites } = await getHomepageData();

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <SectionHeading
        locale={locale}
        eyebrow={locale === "en" ? "Leaderboards" : "排行榜"}
        title={locale === "en" ? "A secondary ranking view on top of richer public profiles." : "这是建立在更丰富公开档案之上的次级排名视图。"}
        description={
          locale === "en"
            ? "Leaderboards remain useful, but they are no longer the homepage protagonist. Treat them as credential snapshots, not as the whole identity."
            : "榜单仍然有用，但它们已不再是首页主角。把它们看作凭证快照，而不是完整身份。"
        }
      />
      <div className="mt-10 grid gap-6">
        {suites.map((suite) => (
          <section key={suite.slug} className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-copper-700">{suite.track}</p>
                <h2 className="mt-2 font-display text-3xl text-ink-950">{locale === "en" ? suite.title.en : suite.title["zh-CN"]}</h2>
              </div>
              <Link href={`/benchmarks/${suite.slug}`} className="text-sm font-semibold text-ink-700 underline-offset-4 hover:underline">
                {locale === "en" ? "Methodology" : "方法说明"}
              </Link>
            </div>
            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-ink-950/8">
              <table className="min-w-full table-fixed">
                <thead className="bg-parchment-deep">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                      {locale === "en" ? "Agent" : "Agent"}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                      {locale === "en" ? "Overall" : "综合分"}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                      {locale === "en" ? "Reliability" : "稳定性"}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                      {locale === "en" ? "Safety" : "安全"}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">
                      {locale === "en" ? "Freshness" : "新鲜度"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(leaderboards[suite.slug] ?? []).map((entry) => (
                    <tr key={`${suite.slug}-${entry.agentSlug}`} className="border-t border-ink-950/6">
                      <td className="px-4 py-4 text-sm font-semibold text-ink-950">#{entry.rank}</td>
                      <td className="px-4 py-4 text-sm text-ink-800">
                        <Link href={`/agents/${entry.agentSlug}`} className="font-semibold text-ink-950 underline-offset-4 hover:underline">
                          {entry.agentName}
                        </Link>
                        <div className="text-xs text-ink-500">@{entry.builderHandle}</div>
                      </td>
                      <td className="px-4 py-4 text-sm text-ink-800">{entry.overall}</td>
                      <td className="px-4 py-4 text-sm text-ink-800">{entry.reliability}</td>
                      <td className="px-4 py-4 text-sm text-ink-800">{entry.safetyFootprint}</td>
                      <td className="px-4 py-4 text-sm text-ink-800">{entry.freshnessDays}d</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
