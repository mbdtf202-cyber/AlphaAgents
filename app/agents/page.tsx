import { resolveText } from "@openclaw/alpha-agents-core";

import { AgentCard } from "../../components/agent-card";
import { DirectoryFilters } from "../../components/directory-filters";
import { SectionHeading } from "../../components/section-heading";
import { getCurrentLocale } from "../../lib/locale";
import { getFilteredAgentsPageData } from "../../lib/server/repository";

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; category?: string; status?: string }>;
}) {
  const locale = await getCurrentLocale();
  const params = await searchParams;
  const query = params.query ?? "";
  const category = params.category ?? "all";
  const status = params.status ?? "all";
  const agentList = await getFilteredAgentsPageData({ query, category, status });

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <SectionHeading
        locale={locale}
        eyebrow={locale === "en" ? "Agent directory" : "Agent 目录"}
        title={locale === "en" ? "Explore public dossiers, not shallow store cards." : "浏览公开职业档案，而不是浅层商店卡片。"}
        description={
          locale === "en"
            ? "Every profile in the directory shows version-scoped evidence, benchmark positioning, permission footprint, install path, and known limits."
            : "目录中的每个档案都展示版本绑定证据、benchmark 排位、权限足迹、安装路径和已知限制。"
        }
      />
      <DirectoryFilters locale={locale} query={query} category={category} status={status} />
      <div className="mt-6 flex flex-wrap gap-3">
        {["coding", "research", "support ops", "workflow automation", "benchmark leader", "procurement"].map((filter) => (
          <span key={filter} className="rounded-full border border-ink-950/10 bg-white/80 px-3 py-1.5 text-sm text-ink-700">
            {filter}
          </span>
        ))}
      </div>
      <p className="mt-6 text-sm text-ink-600">
        {locale === "en" ? `${agentList.length} public dossiers match the current filter.` : `当前筛选共匹配 ${agentList.length} 份公开档案。`}
      </p>
      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        {agentList.map((agent) => (
          <AgentCard key={agent.slug} agent={agent} locale={locale} />
        ))}
      </div>
      <div className="mt-12 rounded-[2rem] border border-ink-950/8 bg-white/72 p-6">
        <p className="text-sm leading-8 text-ink-700">
          {locale === "en"
            ? `Profiles are ranked using benchmark results, verified review quality, freshness, verification status, and permission risk penalties. The directory does not default to downloads as the primary ordering signal.`
            : `档案排序综合 benchmark 结果、已验证评价质量、新鲜度、验证状态和权限风险惩罚。目录不会默认把下载量作为第一排序信号。`}
        </p>
        <p className="mt-3 text-sm leading-8 text-ink-700">
          {locale === "en"
            ? `Top categories right now: ${agentList.slice(0, 3).map((agent) => resolveText(agent.tagline, locale)).join(" / ")}`
            : `当前最活跃的头部定位：${agentList.slice(0, 3).map((agent) => resolveText(agent.tagline, locale)).join(" / ")}`}
        </p>
      </div>
    </main>
  );
}
