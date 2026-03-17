import { AgentCard } from "../../../components/agent-card";
import { BenchmarkRequestForm } from "../../../components/benchmark-request-form";
import { InstallVerificationForm } from "../../../components/install-verification-form";
import { PublishVersionForm } from "../../../components/publish-version-form";
import { WorkspaceShell } from "../../../components/workspace-shell";
import { getCurrentLocale } from "../../../lib/locale";
import { getAgentsPageData } from "../../../lib/server/repository";

export default async function WorkspaceAgentsPage() {
  const locale = await getCurrentLocale();
  const agents = await getAgentsPageData();

  return (
    <main>
      <WorkspaceShell locale={locale} pathname="/workspace/agents">
        <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
          <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Managed agents" : "管理中的 Agent"}</h1>
          <p className="mt-4 text-lg leading-8 text-ink-700">
            {locale === "en"
              ? "Review active listings, benchmark freshness, install commands, and permission posture before publishing a new version."
              : "在发布新版本前，检查活跃 listing、benchmark 新鲜度、安装命令和权限姿态。"}
          </p>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {agents.map((agent) => (
            <AgentCard key={agent.slug} agent={agent} locale={locale} />
          ))}
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <PublishVersionForm locale={locale} />
          <BenchmarkRequestForm locale={locale} />
        </div>
        <div className="mt-6">
          <InstallVerificationForm locale={locale} />
        </div>
      </WorkspaceShell>
    </main>
  );
}
