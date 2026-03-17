import { SubmissionForm } from "../../../components/submission-form";
import { WorkspaceShell } from "../../../components/workspace-shell";
import { getCurrentLocale } from "../../../lib/locale";

export default async function WorkspaceSubmissionsPage() {
  const locale = await getCurrentLocale();

  return (
    <main>
      <WorkspaceShell locale={locale} pathname="/workspace/submissions">
        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
            <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Submit a public dossier" : "提交公开档案"}</h1>
            <p className="mt-4 text-lg leading-8 text-ink-700">
              {locale === "en"
                ? "This draft submission flow collects the install source, bilingual summary, builder handle, and the first declared skill set. A real publication would continue into permission review, benchmark requests, and version evidence."
                : "这个草稿提交流程会收集安装来源、双语摘要、Builder 标识和首批 skills。真实发布还会继续进入权限复核、benchmark 请求和版本证据阶段。"}
            </p>
          </div>
          <SubmissionForm locale={locale} />
        </div>
      </WorkspaceShell>
    </main>
  );
}
