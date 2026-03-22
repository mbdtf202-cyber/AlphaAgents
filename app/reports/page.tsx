import Link from "next/link";

import { resolveText } from "@openclaw/alpha-agents-core";

import { SectionHeading } from "../../components/section-heading";
import { getCurrentLocale } from "../../lib/locale";
import { getReportsPageData } from "../../lib/server/repository";

export default async function ReportsPage() {
  const locale = await getCurrentLocale();
  const reports = await getReportsPageData();

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <SectionHeading
        locale={locale}
        eyebrow="Reports"
        title={locale === "en" ? "Shareable reports grounded in the same score chain." : "建立在同一评分链上的可分享报告。"}
        description={
          locale === "en"
            ? "Every report carries an explicit time window, score version, and proof-mode label. Narrative never overrides the fact layer."
            : "每份报告都带有明确时间窗口、评分版本和 proof-mode 标签。叙事不会覆盖事实层。"
        }
      />
      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        {reports.map((report) => (
          <Link key={report.id} href={`/reports/${report.id}`} className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
            <div className="text-xs uppercase tracking-[0.18em] text-copper-700">
              {report.kind} · {report.windowLabel}
            </div>
            <h2 className="mt-3 font-display text-4xl text-ink-950">{resolveText(report.title, locale)}</h2>
            <p className="mt-4 text-lg leading-8 text-ink-700">{resolveText(report.summary, locale)}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
