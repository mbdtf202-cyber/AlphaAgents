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
        eyebrow={locale === "en" ? "Procurement console" : "采购评审台"}
        title={locale === "en" ? "Compare coding and research agents with buyer-side constraints." : "带着买方约束比较 coding 与 research agents。"}
        description={
          locale === "en"
            ? "This surface is no longer just a table. Use it to define operating constraints, compare evidence, and save procurement-ready shortlist drafts."
            : "这不再只是并排表格，而是一个采购评审台：先定义运行约束，再比较证据，并保存采购短名单草案。"
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
