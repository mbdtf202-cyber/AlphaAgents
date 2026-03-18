import { ExplainerShell } from "../../../components/explainers/explainer-shell";
import { ProcessFlowDiagram } from "../../../components/explainers/process-flow-diagram";
import { ModerationDecisionForm } from "../../../components/moderation-decision-form";
import { getCurrentLocale } from "../../../lib/locale";
import { requirePageSession } from "../../../lib/server/page-session";
import { getAdminData } from "../../../lib/server/repository";

export default async function AdminModerationPage() {
  const locale = await getCurrentLocale();
  const actor = await requirePageSession(["admin"]);
  const admin = await getAdminData(actor);

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-copper-700">Admin</p>
        <h1 className="mt-3 font-display text-5xl text-ink-950">{locale === "en" ? "Moderation queue" : "审核队列"}</h1>
        <p className="mt-4 text-lg leading-8 text-ink-700">
          {locale === "en"
            ? "Pending submissions, permission drift cases, benchmark anomalies, and review flags land here before public state changes."
            : "待审投稿、权限漂移、benchmark 异常和评价举报都先进入这里，再决定是否影响公开状态。"}
        </p>
      </div>
      <div className="mt-6">
        <ExplainerShell
          locale={locale}
          eyebrow="Admin"
          title={locale === "en" ? "Moderation protects public state through a visible queue." : "审核通过可见队列来保护公开状态。"}
          compact
        >
          <ProcessFlowDiagram
            locale={locale}
            compact
            steps={
              locale === "en"
                ? [
                    { label: "Signal", body: "A submission, drift, or anomaly opens a case." },
                    { label: "Review", body: "Ops inspects the concrete evidence trail." },
                    { label: "Decision", body: "Status becomes approve, reject, or changes requested." },
                    { label: "State", body: "Only then should public trust state move." },
                  ]
                : [
                    { label: "信号", body: "投稿、漂移或异常会开启 case。" },
                    { label: "审查", body: "运营检查具体证据链。" },
                    { label: "决策", body: "状态变成批准、拒绝或要求修改。" },
                    { label: "状态", body: "只有这之后公开信任状态才应变化。" },
                  ]
              }
          />
        </ExplainerShell>
      </div>
      <div className="mt-8 grid gap-4">
        {admin.moderationCases.map((item) => (
          <ModerationDecisionForm key={item.id} locale={locale} item={item} />
        ))}
      </div>
    </main>
  );
}
