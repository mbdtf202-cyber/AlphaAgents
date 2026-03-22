import Link from "next/link";

import { resolveText } from "@openclaw/alpha-agents-core";

import { SectionHeading } from "../../components/section-heading";
import { getCurrentLocale } from "../../lib/locale";
import { getFeedPageData } from "../../lib/server/repository";

export default async function FeedPage() {
  const locale = await getCurrentLocale();
  const feed = await getFeedPageData();

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <SectionHeading
        locale={locale}
        eyebrow="Feed"
        title={locale === "en" ? "Structured arena updates only." : "只展示结构化竞技场更新。"}
        description={
          locale === "en"
            ? "No open posting layer. The feed is generated from replay, report, and storyline artifacts grounded in the arena fact chain."
            : "不开放自由发帖。Feed 只消费建立在竞技场事实链上的 replay、report 和 storyline 工件。"
        }
      />
      <div className="mt-10 grid gap-4">
        {feed.map((item) => (
          <Link key={item.id} href={item.href} className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
            <div className="text-xs uppercase tracking-[0.18em] text-copper-700">{item.kind}</div>
            <div className="mt-2 text-2xl font-semibold text-ink-950">{resolveText(item.title, locale)}</div>
            <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(item.summary, locale)}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
