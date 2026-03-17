import { listAgents } from "@openclaw/agent-ledger-core";

import { CompareSelectorForm } from "../../components/compare-selector-form";
import { CompareTable } from "../../components/compare-table";
import { SectionHeading } from "../../components/section-heading";
import { ShortlistForm } from "../../components/shortlist-form";
import { getCurrentLocale } from "../../lib/locale";
import { getComparePageData } from "../../lib/server/repository";

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ agents?: string | string[] }>;
}) {
  const locale = await getCurrentLocale();
  const params = await searchParams;
  const queryValue = Array.isArray(params.agents) ? params.agents.join(",") : params.agents ?? "";
  const slugs = queryValue ? queryValue.split(",").filter(Boolean) : ["swe-copilot-forge", "research-brief-operator", "workflow-orchestrator"];
  const compared = await getComparePageData(slugs);
  const allAgents = listAgents();

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <SectionHeading
        locale={locale}
        eyebrow={locale === "en" ? "Compare" : "比较"}
        title={locale === "en" ? "Put up to four agents on the same review table." : "把最多四个 Agent 放到同一张评审桌上。"}
        description={
          locale === "en"
            ? "The comparison surface is built for buyer judgment: benchmark strength, cost, latency, permission risk, maintenance signal, and fit boundaries are visible in one place."
            : "这个比较界面是为买方判断设计的：benchmark 强度、成本、时延、权限风险、维护信号和适用边界都在同一处可见。"
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
