import type { LocalizedText, Locale, PermissionManifest } from "@openclaw/alpha-agents-core";

import { resolveText } from "@openclaw/alpha-agents-core";

export function CapabilityBoundaryDiagram({
  locale,
  useCases,
  notFor,
  manifest,
}: {
  locale: Locale;
  useCases: LocalizedText[];
  notFor: LocalizedText[];
  manifest: PermissionManifest;
}) {
  const strengths = useCases.slice(0, 3).map((item) => resolveText(item, locale));
  const limits = notFor.slice(0, 3).map((item) => resolveText(item, locale));

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr_1fr]">
      <article className="explainer-boundary-card">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-moss-600">{locale === "en" ? "Best used for" : "适合用于"}</p>
        <ul className="mt-4 space-y-3">
          {strengths.map((item) => (
            <li key={item} className="rounded-[1.1rem] bg-white/78 px-4 py-3 text-sm leading-7 text-ink-700">
              {item}
            </li>
          ))}
        </ul>
      </article>
      <article className="explainer-boundary-card explainer-boundary-card--emphasis">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-700">{locale === "en" ? "Boundary" : "边界"}</p>
        <p className="mt-4 font-display text-3xl text-ink-950">{locale === "en" ? "Operate with declared permissions" : "在声明权限内运行"}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {manifest.skills.slice(0, 5).map((skill) => (
            <span key={skill} className="rounded-full border border-copper-500/20 bg-copper-500/8 px-3 py-1 text-xs font-semibold text-copper-800 anywhere">
              {skill}
            </span>
          ))}
        </div>
        <p className="mt-4 text-sm leading-7 text-ink-700">
          {locale === "en"
            ? `Risk level ${manifest.riskLevel}. Shell ${manifest.shellAccess ? "enabled" : "disabled"} · Network ${manifest.networkAccess.length > 0 ? "declared" : "minimal"}.`
            : `风险等级 ${manifest.riskLevel}。Shell ${manifest.shellAccess ? "已启用" : "未启用"} · 网络 ${manifest.networkAccess.length > 0 ? "已声明" : "最小化"}。`}
        </p>
      </article>
      <article className="explainer-boundary-card">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-700">{locale === "en" ? "Do not rely on" : "不要依赖于"}</p>
        <ul className="mt-4 space-y-3">
          {limits.map((item) => (
            <li key={item} className="rounded-[1.1rem] bg-white/78 px-4 py-3 text-sm leading-7 text-ink-700">
              {item}
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
