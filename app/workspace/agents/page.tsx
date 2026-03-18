import { AgentCard } from "../../../components/agent-card";
import { BenchmarkRequestForm } from "../../../components/benchmark-request-form";
import { ExplainerShell } from "../../../components/explainers/explainer-shell";
import { ProcessFlowDiagram } from "../../../components/explainers/process-flow-diagram";
import { PublishVersionForm } from "../../../components/publish-version-form";
import { WorkspaceShell } from "../../../components/workspace-shell";
import { getCurrentLocale } from "../../../lib/locale";
import { requirePageSession } from "../../../lib/server/page-session";
import { getWorkspaceData } from "../../../lib/server/repository";

export default async function WorkspaceAgentsPage() {
  const locale = await getCurrentLocale();
  const actor = await requirePageSession(["builder", "admin"]);
  const workspace = await getWorkspaceData(actor, locale);
  const managedAgents = workspace.builderAgents.map((agent) => ({
    slug: agent.slug,
    name: agent.name,
    versions: agent.versions.map((version) => ({
      id: version.id,
      version: version.version,
      status: version.status,
      releasedAt: version.releasedAt,
    })),
  }));

  return (
    <main>
      <WorkspaceShell locale={locale} pathname="/workspace/agents" actor={actor}>
        <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
          <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Managed profiles" : "管理中的档案"}</h1>
          <p className="mt-4 text-lg leading-8 text-ink-700">
            {locale === "en"
              ? "Review active public profiles, credential freshness, install commands, and permission posture before publishing a new version."
              : "在发布新版本前，检查公开档案、凭证新鲜度、安装命令和权限姿态。"}
          </p>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {workspace.builderAgents.map((agent) => (
            <AgentCard key={agent.slug} agent={agent} locale={locale} />
          ))}
        </div>
        <div className="mt-6">
          <ExplainerShell
            locale={locale}
            eyebrow={locale === "en" ? "Builder workflow" : "Builder 工作流"}
            title={locale === "en" ? "Profile operations move in a strict evidence order." : "档案操作必须按严格的证据顺序推进。"}
            compact
          >
            <ProcessFlowDiagram
              locale={locale}
              compact
              steps={
                locale === "en"
                  ? [
                      { label: "Publish", body: "Push the version into moderation instead of changing public state directly." },
                      { label: "Benchmark", body: "Queue reruns on concrete version records." },
                      { label: "Install proof", body: "Let real deployments generate review eligibility." },
                      { label: "Reputation", body: "Public trust updates after evidence arrives." },
                    ]
                  : [
                      { label: "发布", body: "先把版本推入审核，而不是直接改动公开状态。" },
                      { label: "Benchmark", body: "针对明确版本记录排队重跑。" },
                      { label: "安装证明", body: "让真实部署生成评价资格。" },
                      { label: "信誉", body: "等证据到位后，再更新公开信任。" },
                    ]
              }
            />
          </ExplainerShell>
        </div>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <PublishVersionForm locale={locale} agents={managedAgents} />
          <BenchmarkRequestForm locale={locale} agents={managedAgents} />
        </div>
      </WorkspaceShell>
    </main>
  );
}
