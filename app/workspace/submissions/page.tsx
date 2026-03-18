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
          <SubmissionForm locale={locale} />
        </div>
      </WorkspaceShell>
    </main>
  );
}
