import type { AgentRecord, Locale } from "@openclaw/agent-ledger-core";

import { resolveText } from "@openclaw/agent-ledger-core";

const fields = [
  { key: "overall", label: { en: "Overall", "zh-CN": "综合分" } },
  { key: "reliability", label: { en: "Reliability", "zh-CN": "稳定性" } },
  { key: "cost", label: { en: "Cost / success", "zh-CN": "成功成本" } },
  { key: "latency", label: { en: "Median latency", "zh-CN": "中位时延" } },
  { key: "risk", label: { en: "Risk level", "zh-CN": "权限风险" } },
  { key: "fit", label: { en: "Best fit", "zh-CN": "适用场景" } },
  { key: "limits", label: { en: "Not ideal for", "zh-CN": "不适用场景" } },
] as const;

export function CompareTable({ agents, locale }: { agents: AgentRecord[]; locale: Locale }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-ink-950/8 bg-white">
      <div className="hidden overflow-x-auto lg:block">
        <table className="min-w-full table-fixed">
          <thead className="border-b border-ink-950/8 bg-parchment-deep">
            <tr>
              <th className="w-52 px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">
                {locale === "en" ? "Field" : "字段"}
              </th>
              {agents.map((agent) => (
                <th key={agent.slug} className="px-6 py-4 text-left text-sm font-semibold text-ink-950">
                  {agent.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => (
              <tr key={field.key} className="border-b border-ink-950/6 align-top">
                <td className="px-6 py-4 text-sm font-medium text-ink-500">{resolveText(field.label, locale)}</td>
                {agents.map((agent) => {
                  const run = agent.versions[0]?.benchmarkRuns[0];
                  const value =
                    field.key === "overall"
                      ? run?.scorecard.overall
                      : field.key === "reliability"
                        ? run?.scorecard.reliability
                        : field.key === "cost"
                          ? `$${run?.costPerSuccessfulRun.toFixed(2)}`
                          : field.key === "latency"
                            ? `${run?.medianLatencySeconds}s`
                            : field.key === "risk"
                              ? agent.permissionManifest.riskLevel
                              : field.key === "fit"
                                ? resolveText(agent.useCases[0], locale)
                                : resolveText(agent.notFor[0], locale);

                  return (
                    <td key={`${agent.slug}-${field.key}`} className="min-w-0 px-6 py-4 text-sm leading-7 text-ink-800 anywhere">
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 p-5 lg:hidden">
        {agents.map((agent) => {
          const run = agent.versions[0]?.benchmarkRuns[0];
          return (
            <article key={agent.slug} className="rounded-[1.5rem] border border-ink-950/8 bg-parchment/70 p-5">
              <h3 className="font-display text-2xl text-ink-950">{agent.name}</h3>
              <div className="mt-4 grid gap-3 text-sm">
                <div className="flex items-start justify-between gap-3"><span>{resolveText(fields[0].label, locale)}</span><span>{run?.scorecard.overall}</span></div>
                <div className="flex items-start justify-between gap-3"><span>{resolveText(fields[1].label, locale)}</span><span>{run?.scorecard.reliability}</span></div>
                <div className="flex items-start justify-between gap-3"><span>{resolveText(fields[2].label, locale)}</span><span>${run?.costPerSuccessfulRun.toFixed(2)}</span></div>
                <div className="flex items-start justify-between gap-3"><span>{resolveText(fields[3].label, locale)}</span><span>{run?.medianLatencySeconds}s</span></div>
                <div className="flex items-start justify-between gap-3"><span>{resolveText(fields[4].label, locale)}</span><span>{agent.permissionManifest.riskLevel}</span></div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
