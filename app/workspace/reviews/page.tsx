import { InstallVerificationForm } from "../../../components/install-verification-form";
import { ExplainerShell } from "../../../components/explainers/explainer-shell";
import { ProcessFlowDiagram } from "../../../components/explainers/process-flow-diagram";
import { ReviewForm } from "../../../components/review-form";
import { WorkspaceShell } from "../../../components/workspace-shell";
import { getCurrentLocale } from "../../../lib/locale";
import { requirePageSession } from "../../../lib/server/page-session";
import { getCompareCandidates, getWorkspaceData } from "../../../lib/server/repository";

export default async function WorkspaceReviewsPage() {
  const locale = await getCurrentLocale();
  const actor = await requirePageSession(["buyer", "builder", "admin"]);
  const workspace = await getWorkspaceData(actor, locale);
  const publicAgents = await getCompareCandidates();
  const publicAgentLookup = new Map(publicAgents.map((agent) => [agent.slug, agent]));
  const installAgents = publicAgents.map((agent) => ({
    slug: agent.slug,
    name: agent.name,
    versions: agent.versions.map((version) => ({
      id: version.id,
      version: version.version,
      status: version.status,
    })),
  }));
  const reviewInstallOptions = workspace.verifiedInstalls.map((install) => ({
    id: install.id,
    agentSlug: install.agentSlug,
    versionId: install.versionId,
    label: `${
      publicAgentLookup.get(install.agentSlug)?.name ?? install.agentSlug
    } · ${
      publicAgentLookup.get(install.agentSlug)?.versions.find((version) => version.id === install.versionId)?.version ??
      install.versionId
    } · ${new Date(install.verifiedAt).toLocaleDateString(locale === "en" ? "en-US" : "zh-CN")}`,
  }));

  return (
    <main>
      <WorkspaceShell locale={locale} pathname="/workspace/reviews" actor={actor}>
        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
            <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Reputation" : "信誉"}</h1>
            <p className="mt-4 text-lg leading-8 text-ink-700">
              {locale === "en"
                ? "Only verified deployments can become public reputation entries. The form below preserves structured dimensions, not just a star rating."
                : "只有已验证部署才能进入公开信誉记录。下面的表单会保留结构化维度，而不是只保留星级。"}
            </p>
          </div>
          <ExplainerShell
            locale={locale}
            eyebrow={locale === "en" ? "Reputation pipeline" : "信誉流水线"}
            title={locale === "en" ? "Reputation only becomes public after a verified usage path exists." : "只有当已验证使用路径存在后，信誉才会进入公开层。"}
            compact
          >
            <ProcessFlowDiagram
              locale={locale}
              compact
              steps={
                locale === "en"
                  ? [
                      { label: "Verify install", body: "Attach proof to a real agent and version." },
                      { label: "Select proof", body: "Choose an owned install record, not a free-text id." },
                      { label: "Review", body: "Submit structured operational feedback." },
                      { label: "Publish", body: "The profile receives version-scoped reputation." },
                    ]
                  : [
                      { label: "验证安装", body: "把证明绑定到真实 Agent 与版本。" },
                      { label: "选择证明", body: "从已拥有的安装记录里选择，而不是手填 id。" },
                      { label: "评价", body: "提交结构化运营反馈。" },
                      { label: "公开", body: "档案最终获得绑定版本的信誉。"},
                    ]
              }
            />
          </ExplainerShell>
          <InstallVerificationForm locale={locale} agents={installAgents} />
          <ReviewForm locale={locale} installs={reviewInstallOptions} />
          <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
            <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Recent review highlights" : "近期评价摘要"}</h2>
            <div className="mt-6 grid gap-4">
              {workspace.reviewHighlights.map((review) => (
                <article key={review.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                  <p className="text-sm text-ink-500">{review.company}</p>
                  <p className="mt-3 text-xl font-semibold text-ink-950">{review.headlineText}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </WorkspaceShell>
    </main>
  );
}
