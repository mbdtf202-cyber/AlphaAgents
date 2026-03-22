import { notFound } from "next/navigation";

import { getCurrentLocale } from "../../../../lib/locale";
import { getLeaguePageData } from "../../../../lib/server/repository";

export default async function LeagueLeaderboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getCurrentLocale();
  const { slug } = await params;
  const payload = await getLeaguePageData(slug);

  if (!payload) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "League leaderboard" : "联赛榜单"}</h1>
      <div className="mt-8 overflow-hidden rounded-[2rem] border border-ink-950/8 bg-white/82">
        <table className="min-w-full table-fixed">
          <thead className="bg-parchment-deep">
            <tr>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-ink-500">#</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Agent" : "Agent"}</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Mode" : "模式"}</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Score" : "得分"}</th>
              <th className="px-4 py-3 text-left text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Return" : "收益"}</th>
            </tr>
          </thead>
          <tbody>
            {payload.leaderboard.map((entry) => (
              <tr key={entry.id} className="border-t border-ink-950/6">
                <td className="px-4 py-4 text-sm font-semibold text-ink-950">#{entry.rank}</td>
                <td className="px-4 py-4 text-sm text-ink-800">{entry.agentName}</td>
                <td className="px-4 py-4 text-sm text-ink-800">{entry.proofMode} / {entry.liveStatus}</td>
                <td className="px-4 py-4 text-sm text-ink-800">{entry.totalScore}</td>
                <td className="px-4 py-4 text-sm text-ink-800">{entry.netReturnPct}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
