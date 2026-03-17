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
      <div className="mt-8 grid gap-4">
        {admin.moderationCases.map((item) => (
          <ModerationDecisionForm key={item.id} locale={locale} item={item} />
        ))}
      </div>
    </main>
  );
}
