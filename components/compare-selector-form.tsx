"use client";

import { useMemo, useState } from "react";

import type { AgentRecord, Locale } from "@openclaw/agent-ledger-core";

export function CompareSelectorForm({
  locale,
  agents,
  selectedSlugs,
}: {
  locale: Locale;
  agents: AgentRecord[];
  selectedSlugs: string[];
}) {
  const [selected, setSelected] = useState<string[]>(selectedSlugs);
  const reachedLimit = selected.length >= 4;
  const visibleAgents = useMemo(() => agents.slice(0, 6), [agents]);

  return (
    <form className="surface-panel rounded-[2rem] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-copper-700">{locale === "en" ? "Selection" : "选择器"}</p>
          <h2 className="mt-3 font-display text-4xl text-ink-950">{locale === "en" ? "Pick up to four agents" : "最多选四个 Agent"}</h2>
        </div>
        <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Refresh compare" : "刷新比较"}
        </button>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visibleAgents.map((agent) => (
          <label key={agent.slug} className="flex items-start gap-3 rounded-[1.5rem] border border-ink-950/8 bg-parchment px-4 py-4 text-sm leading-7 text-ink-800">
            <input
              type="checkbox"
              name="agents"
              value={agent.slug}
              checked={selected.includes(agent.slug)}
              disabled={reachedLimit && !selected.includes(agent.slug)}
              onChange={(event) => {
                setSelected((current) =>
                  event.currentTarget.checked
                    ? [...current, agent.slug]
                    : current.filter((slug) => slug !== agent.slug),
                );
              }}
            />
            <span className="anywhere">
              <span className="block font-semibold text-ink-950">{agent.name}</span>
              <span className="block text-ink-600">{agent.slug}</span>
            </span>
          </label>
        ))}
      </div>
      <p className="mt-4 text-sm text-ink-600">
        {locale === "en" ? `${selected.length}/4 selected.` : `已选择 ${selected.length}/4。`}
      </p>
    </form>
  );
}
