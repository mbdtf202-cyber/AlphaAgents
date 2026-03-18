import { ExplainerShell } from "../../../components/explainers/explainer-shell";
import { ProcessFlowDiagram } from "../../../components/explainers/process-flow-diagram";
import { SubmissionForm } from "../../../components/submission-form";
import { WorkspaceShell } from "../../../components/workspace-shell";
import { getCurrentLocale } from "../../../lib/locale";
import { requirePageSession } from "../../../lib/server/page-session";

export default async function WorkspaceSubmissionsPage() {
  const locale = await getCurrentLocale();
  const actor = await requirePageSession(["builder", "admin"]);

  return (
    <main>
      <WorkspaceShell locale={locale} pathname="/workspace/submissions" actor={actor}>
        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
            <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Create a public profile draft" : "创建公开档案草稿"}</h1>
            <p className="mt-4 text-lg leading-8 text-ink-700">
              {locale === "en"
                ? "Start from an importable source, let the platform draft metadata and permission posture, then review it before submission. Publication continues into moderation, credentials, and version evidence."
                : "先从可导入 source 开始，让平台生成 metadata 与权限姿态初稿，再人工复核提交。后续发布会继续进入审核、凭证和版本证据阶段。"}
            </p>
          </div>
          <ExplainerShell
            locale={locale}
            eyebrow={locale === "en" ? "Import path" : "导入路径"}
            title={locale === "en" ? "A draft profile should be assembled before it is judged." : "在进入审核之前，档案草稿应该先被完整组装。"}
            compact
          >
            <ProcessFlowDiagram
              locale={locale}
              compact
              steps={
                locale === "en"
                  ? [
                      { label: "Source", body: "Start from GitHub, ClawHub, or an agent pack." },
                      { label: "Draft", body: "Let the system suggest metadata and permission posture." },
                      { label: "Review", body: "A builder tightens scope, dependencies, and limits." },
                      { label: "Submit", body: "The draft enters moderation before public listing." },
                    ]
                  : [
                      { label: "来源", body: "从 GitHub、ClawHub 或 agent pack 开始。" },
                      { label: "草稿", body: "让系统先建议 metadata 与权限姿态。" },
                      { label: "复核", body: "由 Builder 收紧范围、依赖和限制。" },
                      { label: "提交", body: "草稿在公开前先进入审核。" },
                    ]
              }
            />
          </ExplainerShell>
          <SubmissionForm locale={locale} />
        </div>
      </WorkspaceShell>
    </main>
  );
}
