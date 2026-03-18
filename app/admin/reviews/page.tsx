import { ExplainerShell } from "../../../components/explainers/explainer-shell";
import { ProcessFlowDiagram } from "../../../components/explainers/process-flow-diagram";
import { ReviewVisibilityForm } from "../../../components/review-visibility-form";
import { getCurrentLocale } from "../../../lib/locale";
import { requirePageSession } from "../../../lib/server/page-session";
import { getWorkspaceData } from "../../../lib/server/repository";

export default async function AdminReviewsPage() {
  const locale = await getCurrentLocale();
  const actor = await requirePageSession(["admin"]);
  const workspace = await getWorkspaceData(actor, locale);

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
        <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Review moderation" : "评价审核"}</h1>
      </div>
      <div className="mt-6">
        <ExplainerShell
          locale={locale}
          eyebrow="Admin"
          title={locale === "en" ? "Reviews should only survive if install proof and context both hold up." : "只有当安装证明和上下文都成立时，评价才应该保留下来。"}
          compact
        >
          <ProcessFlowDiagram
            locale={locale}
            compact
            steps={
              locale === "en"
                ? [
                    { label: "Install", body: "Confirm the review is attached to owned install proof." },
                    { label: "Context", body: "Check company, role, and structured dimensions." },
                    { label: "Signal", body: "Distinguish real operational feedback from noise." },
                    { label: "Moderate", body: "Preserve only trust-bearing reputation." },
                  ]
                : [
                    { label: "安装", body: "确认评价绑定到了已拥有的安装证明。" },
                    { label: "上下文", body: "检查公司、角色和结构化维度。" },
                    { label: "信号", body: "区分真实运营反馈与噪音。" },
                    { label: "审核", body: "只保留真正承载信任的信誉信号。" },
                  ]
            }
          />
        </ExplainerShell>
      </div>
      <div className="mt-6 rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
        <div className="mt-6 grid gap-4">
          {workspace.reviews.map((review) => (
            <ReviewVisibilityForm key={review.id} locale={locale} review={review} />
          ))}
        </div>
      </div>
    </main>
  );
}
