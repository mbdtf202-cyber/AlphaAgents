import Link from "next/link";

import { CompareSelectorForm } from "../../components/compare-selector-form";
import { CompareTable } from "../../components/compare-table";
import { SectionHeading } from "../../components/section-heading";
import { ShortlistForm } from "../../components/shortlist-form";
import { getCurrentLocale } from "../../lib/locale";
import { getServerSession } from "../../lib/server/auth";
import { getCompareCandidates, getComparePageData } from "../../lib/server/repository";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ agents?: string | string[] }>;
}) {
  const locale = await getCurrentLocale();
  const params = await searchParams;
  const queryValue = Array.isArray(params.agents) ? params.agents.join(",") : params.agents ?? "";
  const slugs = queryValue ? queryValue.split(",").filter(Boolean) : ["swe-copilot-forge", "research-brief-operator"];
  const session = await getServerSession();
  const compared = await getComparePageData(slugs);
  const allAgents = await getCompareCandidates();
  const canSaveProfileLists = session?.role === "buyer" || session?.role === "admin";

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <SectionHeading
        locale={locale}
        eyebrow={locale === "en" ? "Secondary compare" : "次级比较"}
        title={locale === "en" ? "Compare profiles only after identity, trust, and scope already fit." : "只有在身份、信任和范围已基本匹配后，再做档案比较。"}
        description={
          locale === "en"
            ? "This surface remains public, but it is secondary. Use it to compare evidence, define operating constraints, and save profile lists when a deeper evaluation is needed."
            : "这个页面仍然公开，但已经降为次级能力。只有在需要更深评估时，再来比较证据、定义运行约束，并保存 Profile List。"
        }
      />
      <div className="mt-10">
        <CompareSelectorForm locale={locale} agents={allAgents} selectedSlugs={slugs} />
      </div>
      <div className="mt-10">
        <CompareTable agents={compared} locale={locale} />
      </div>
      {canSaveProfileLists ? (
        <div className="mt-10">
          <ShortlistForm locale={locale} agents={allAgents} />
        </div>
      ) : (
        <section className="mt-10 rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-copper-700">{locale === "en" ? "Saved evaluation artifact" : "保存的评估工件"}</p>
          <h2 className="mt-3 font-display text-4xl text-ink-950">
            {locale === "en" ? "Sign in as a buyer to save a profile list." : "以买方身份登录后才能保存 Profile List。"}
          </h2>
          <p className="mt-4 max-w-[60ch] text-base leading-8 text-ink-700">
            {locale === "en"
              ? "Public compare stays readable without an account, but persistence now belongs to authenticated buyer workspaces."
              : "公开 compare 可以匿名查看，但保存评估结果现在属于已认证的买方工作台能力。"}
          </p>
          <Link href="/login" className="mt-6 inline-flex rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
            {locale === "en" ? "Sign in to save" : "登录后保存"}
          </Link>
        </section>
      )}
    </main>
  );
}
