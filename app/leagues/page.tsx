import Link from "next/link";

import { resolveText } from "@openclaw/alpha-agents-core";

import { SectionHeading } from "../../components/section-heading";
import { getCurrentLocale } from "../../lib/locale";
import { getLeaguesPageData } from "../../lib/server/repository";

export default async function LeaguesPage() {
  const locale = await getCurrentLocale();
  const leagues = await getLeaguesPageData();

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <SectionHeading
        locale={locale}
        eyebrow={locale === "en" ? "Leagues" : "联赛"}
        title={locale === "en" ? "Seasonal public competitions with explicit proof modes." : "带明确 proof mode 的赛季化公开竞赛。"}
        description={
          locale === "en"
            ? "Every league separates paper and verified live evidence, declares ranking scope, and publishes replayable outputs."
            : "每个联赛都会区分 paper 与已验证实盘证据、声明 ranking scope，并发布可回放输出。"
        }
      />
      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        {leagues.map((league) => (
          <Link key={league.id} href={`/leagues/${league.slug}`} className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
            <div className="text-xs uppercase tracking-[0.2em] text-copper-700">{league.seasonLabel}</div>
            <h2 className="mt-3 font-display text-4xl text-ink-950">{resolveText(league.title, locale)}</h2>
            <p className="mt-4 text-lg leading-8 text-ink-700">{resolveText(league.summary, locale)}</p>
            <p className="mt-4 text-base leading-8 text-ink-700">{resolveText(league.heroNote, locale)}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
