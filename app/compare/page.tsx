import { CompareSelectorForm } from "../../components/compare-selector-form";
import { CompareTable } from "../../components/compare-table";
import { SectionHeading } from "../../components/section-heading";
import { ShortlistForm } from "../../components/shortlist-form";
import { getCurrentLocale } from "../../lib/locale";
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
  const compared = await getComparePageData(slugs);
  const allAgents = await getCompareCandidates();

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
      <div className="mt-10">
        <ShortlistForm locale={locale} agents={allAgents} />
      </div>
    </main>
  );
}
