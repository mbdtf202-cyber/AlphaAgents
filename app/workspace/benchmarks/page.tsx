import { ExplainerShell } from "../../../components/explainers/explainer-shell";
import { ProcessFlowDiagram } from "../../../components/explainers/process-flow-diagram";
import { WorkspaceShell } from "../../../components/workspace-shell";
import { getCurrentLocale } from "../../../lib/locale";
import { requirePageSession } from "../../../lib/server/page-session";
import { getWorkspaceData } from "../../../lib/server/repository";

export default async function WorkspaceBenchmarksPage() {
  const locale = await getCurrentLocale();
  const actor = await requirePageSession(["buyer", "builder", "admin"]);
  const workspace = await getWorkspaceData(actor, locale);

  return (
    <main>
      <WorkspaceShell locale={locale} pathname="/workspace/benchmarks" actor={actor}>
        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
            <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Credential operations" : "凭证操作"}</h1>
            <p className="mt-4 text-lg leading-8 text-ink-700">
              {locale === "en"
                ? "Requests are persisted queue entries. This surface shows the real credential request history for the current actor."
                : "请求现在是持久化队列记录。这个界面展示当前 actor 的真实凭证请求历史。"}
            </p>
          </div>
          <ExplainerShell
            locale={locale}
            eyebrow={locale === "en" ? "Queue model" : "队列模型"}
            title={locale === "en" ? "A benchmark request is a staged credential operation." : "一次 benchmark 请求本质上是分阶段的凭证操作。"}
            compact
          >
            <ProcessFlowDiagram
              locale={locale}
              compact
              steps={
                locale === "en"
                  ? [
                      { label: "Request", body: "An actor queues a concrete suite and version." },
                      { label: "Worker", body: "The benchmark worker claims and runs the job." },
                      { label: "Artifacts", body: "Rubrics, traces, and bundles are written back." },
                      { label: "Credential", body: "The result becomes visible on the public profile." },
                    ]
                  : [
                      { label: "请求", body: "actor 会把明确套件和版本送入队列。" },
                      { label: "Worker", body: "benchmark worker 认领并执行任务。" },
                      { label: "工件", body: "rubric、trace 和 bundle 会回写。" },
                      { label: "凭证", body: "结果最终会在公开档案中可见。" },
                    ]
              }
            />
          </ExplainerShell>
          <div className="grid gap-4">
            {workspace.benchmarkRequests.map((request) => (
              <article key={request.id} className="surface-panel rounded-[1.75rem] p-5">
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-copper-700">
                  <span>{request.status}</span>
                  <span>{request.suiteSlug}</span>
                  <span>{request.versionId}</span>
                </div>
                <p className="mt-3 text-base leading-8 text-ink-700">{request.objective || (locale === "en" ? "No objective provided." : "未填写目标。")}</p>
              </article>
            ))}
          </div>
        </div>
      </WorkspaceShell>
    </main>
  );
}
