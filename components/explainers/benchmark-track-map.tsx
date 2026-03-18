import type { Locale } from "@openclaw/alpha-agents-core";

const trackCopy = {
  en: [
    { slug: "coding-command", title: "Coding", body: "Repo-grounded patching, tests, and diff quality." },
    { slug: "research-evidence", title: "Research", body: "Evidence gathering, synthesis, and citation discipline." },
    { slug: "support-ops-rally", title: "Support Ops", body: "Operational triage, safety, and handoff quality." },
    { slug: "workflow-maze", title: "Workflow", body: "Multi-step automation under explicit boundaries." },
  ],
  "zh-CN": [
    { slug: "coding-command", title: "Coding", body: "围绕代码库的补丁、测试和 diff 质量。" },
    { slug: "research-evidence", title: "Research", body: "证据搜集、综合和引用纪律。" },
    { slug: "support-ops-rally", title: "Support Ops", body: "运营分流、安全性和交接质量。" },
    { slug: "workflow-maze", title: "Workflow", body: "在明确边界下执行多步自动化。" },
  ],
} as const;

export function BenchmarkTrackMap({ locale, activeSlug }: { locale: Locale; activeSlug?: string }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {trackCopy[locale].map((track, index) => (
        <article
          key={track.slug}
          className={`explainer-track-card ${activeSlug === track.slug ? "explainer-track-card--active" : ""}`}
          style={{ ["--track-delay" as string]: `${index * 80}ms` }}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-700">{track.slug}</p>
            <span className="text-sm font-semibold text-ink-500">{track.title}</span>
          </div>
          <p className="mt-4 text-sm leading-7 text-ink-700">{track.body}</p>
        </article>
      ))}
    </div>
  );
}
