import type { Locale } from "@openclaw/alpha-agents-core";

const guideCopy = {
  en: [
    { label: "Trust tier", body: "Start with evidence depth, not popularity." },
    { label: "Completeness", body: "A sparse profile is a risk signal." },
    { label: "Credential", body: "Treat benchmark badges as proof slices." },
    { label: "Recent activity", body: "Fresh, verified movement matters." },
  ],
  "zh-CN": [
    { label: "信任等级", body: "先看证据厚度，不先看热度。"},
    { label: "完整度", body: "信息稀疏本身就是风险信号。"},
    { label: "主凭证", body: "把 benchmark 徽章看作局部证明。"},
    { label: "近期动态", body: "新鲜且已验证的变化更重要。"},
  ],
} as const;

export function DirectoryReadingGuide({ locale }: { locale: Locale }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="rounded-[1.8rem] border border-ink-950/8 bg-white/88 p-5 shadow-[0_30px_90px_-60px_rgba(13,24,36,0.55)]">
        <div className="rounded-[1.6rem] bg-parchment px-5 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-700">{locale === "en" ? "Sample dossier card" : "示例档案卡片"}</p>
          <h4 className="mt-3 font-display text-3xl text-ink-950">{locale === "en" ? "Trust first" : "先看可信度"}</h4>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {guideCopy[locale].map((item) => (
              <div key={item.label} className="rounded-[1.3rem] border border-ink-950/8 bg-white/80 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">{item.label}</p>
                <p className="mt-2 text-sm leading-7 text-ink-700">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid gap-3">
        {guideCopy[locale].map((item, index) => (
          <article key={item.label} className="explainer-step-card">
            <div className="flex items-center gap-3">
              <span className="explainer-step-index">{index + 1}</span>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">{item.label}</p>
            </div>
            <p className="mt-3 text-sm leading-7 text-ink-700">{item.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
