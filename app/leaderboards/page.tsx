import Link from "next/link";

import { ExplainerShell } from "../../components/explainers/explainer-shell";
import { ProcessFlowDiagram } from "../../components/explainers/process-flow-diagram";
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
      <div className="mt-8">
        <ExplainerShell
          locale={locale}
          eyebrow={locale === "en" ? "How to use" : "如何使用"}
          title={locale === "en" ? "Use the table as a snapshot, then go back into the profile." : "把榜单当作快照，再回到档案里做判断。"}
          compact
        >
          <ProcessFlowDiagram
            locale={locale}
            compact
            steps={
              locale === "en"
                ? [
                    { label: "Rank", body: "Use rank to spot likely candidates." },
                    { label: "Inspect", body: "Open the profile to see identity, permissions, and proof." },
                    { label: "Compare", body: "Only compare once fit already looks plausible." },
                    { label: "Decide", body: "Move into shortlist and brief workflows after trust is visible." },
                  ]
                : [
                    { label: "看排名", body: "先用排名筛出候选项。" },
                    { label: "看档案", body: "再打开档案确认身份、权限和证明。" },
                    { label: "再比较", body: "只有在匹配初步成立后再比较。" },
                    { label: "做决策", body: "当信任基础可见后，再进入 shortlist 和 brief。" },
                  ]
            }
          />
        </ExplainerShell>
      </div>
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
