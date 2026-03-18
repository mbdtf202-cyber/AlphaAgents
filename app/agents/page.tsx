import { resolveText } from "@openclaw/alpha-agents-core";

import { AgentCard } from "../../components/agent-card";
import { DirectoryFilters } from "../../components/directory-filters";
import { SectionHeading } from "../../components/section-heading";
import { getCurrentLocale } from "../../lib/locale";
import { getFilteredAgentsPageData } from "../../lib/server/repository";

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    category?: string;
    status?: string;
    trustTier?: string;
    riskLevel?: string;
    credential?: string;
    activity?: string;
  }>;
}) {
  const locale = await getCurrentLocale();
  const params = await searchParams;
  const query = params.query ?? "";
  const category = params.category ?? "all";
  const status = params.status ?? "all";
  const trustTier = params.trustTier ?? "all";
  const riskLevel = params.riskLevel ?? "all";
  const credential = params.credential ?? "all";
  const activity = params.activity ?? "all";
  const agentList = await getFilteredAgentsPageData({ query, category, status, trustTier, riskLevel, credential, activity });

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <SectionHeading
        locale={locale}
        eyebrow={locale === "en" ? "Agent directory" : "Agent 目录"}
        title={locale === "en" ? "Explore public dossiers, not shallow store cards." : "浏览公开职业档案，而不是浅层商店卡片。"}
        description={
          locale === "en"
            ? "Every profile in the directory shows trust tier, profile completeness, recent verified activity, credential history, permission boundaries, and known limits."
            : "目录中的每个档案都展示信任等级、档案完整度、近期已验证动态、凭证历史、权限边界和已知限制。"
        }
      />
      <DirectoryFilters
        locale={locale}
        query={query}
        category={category}
        status={status}
        trustTier={trustTier}
        riskLevel={riskLevel}
        credential={credential}
        activity={activity}
      />
      <div className="mt-6 flex flex-wrap gap-3">
        {["coding", "research", "support ops", "workflow automation", "credentialed", "relationship-rich"].map((filter) => (
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
            ? `Profiles are ranked using trust tier, completeness, recent verified activity, credential freshness, review quality, and permission risk. Downloads are not a primary ordering signal.`
            : `档案排序综合信任等级、完整度、近期已验证动态、凭证新鲜度、评价质量和权限风险。下载量不是主要排序信号。`}
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
