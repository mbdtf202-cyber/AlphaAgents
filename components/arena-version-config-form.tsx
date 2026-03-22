"use client";

import { useState } from "react";

import type { Locale } from "@openclaw/alpha-agents-core";

interface ArenaManagedAgentOption {
  slug: string;
  name: string;
  sourceKind: "clawhub" | "github" | "agent-pack";
  versions: Array<{
    id: string;
    version: string;
  }>;
}

export function ArenaVersionConfigForm({ locale, agents }: { locale: Locale; agents: ArenaManagedAgentOption[] }) {
  const [status, setStatus] = useState("");
  const [selectedAgentSlug, setSelectedAgentSlug] = useState(agents[0]?.slug ?? "");

  const activeAgent = agents.find((agent) => agent.slug === selectedAgentSlug) ?? agents[0];
  const versionOptions = activeAgent?.versions ?? [];

  if (!activeAgent) {
    return null;
  }

  async function handleSubmit(formData: FormData) {
    const response = await fetch("/api/workspace/arena/trading-configs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        agentSlug: activeAgent.slug,
        agentVersionId: String(formData.get("agentVersionId") ?? versionOptions[0]?.id ?? ""),
        sourceKind: activeAgent.sourceKind,
        runtimeImage: String(formData.get("runtimeImage") ?? ""),
        manifest: {
          executionMode: String(formData.get("executionMode") ?? "paper"),
          marketScope: String(formData.get("marketScope") ?? "BTCUSDT perpetual,ETHUSDT perpetual")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          supportedProviders: [String(formData.get("providerKind") ?? "paper_matching_engine")],
          promptMode: String(formData.get("promptMode") ?? "abstracted"),
          strategySummary: {
            en: String(formData.get("summaryEn") ?? ""),
            "zh-CN": String(formData.get("summaryZh") ?? ""),
          },
          modelMetadata: {
            family: String(formData.get("modelFamily") ?? "gpt-5"),
          },
          riskProfile: {
            maxLeverage: Number(formData.get("maxLeverage") ?? 2),
            maxOrderNotionalUsd: Number(formData.get("maxOrderNotionalUsd") ?? 10000),
            maxDailyLossPct: Number(formData.get("maxDailyLossPct") ?? 4),
            maxDrawdownPct: Number(formData.get("maxDrawdownPct") ?? 12),
          },
        },
      }),
    });
    const json = await response.json();
    setStatus(json.message ?? json.error ?? "Done");
  }

  return (
    <form action={handleSubmit} className="surface-panel grid gap-4 rounded-[2rem] p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-copper-700">Arena registry</p>
        <h2 className="mt-3 font-display text-3xl text-ink-950">{locale === "en" ? "Normalize a trading runtime" : "归一化交易运行时"}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          Agent
          <select
            value={selectedAgentSlug}
            onChange={(event) => setSelectedAgentSlug(event.target.value)}
            className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3"
          >
            {agents.map((agent) => (
              <option key={agent.slug} value={agent.slug}>
                {agent.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Version
          <select name="agentVersionId" defaultValue={versionOptions[0]?.id ?? ""} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            {versionOptions.map((version) => (
              <option key={version.id} value={version.id}>
                v{version.version}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          Runtime image
          <input
            name="runtimeImage"
            defaultValue="builtin://trend-scout-15m"
            className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3"
          />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Provider
          <select name="providerKind" defaultValue="paper_matching_engine" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            <option value="paper_matching_engine">paper_matching_engine</option>
            <option value="managed_secret_broker">managed_secret_broker</option>
            <option value="user_execution_agent">user_execution_agent</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          Summary (EN)
          <textarea name="summaryEn" rows={3} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" defaultValue="Systematic momentum strategy with explicit leverage boundaries." />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Summary (ZH)
          <textarea name="summaryZh" rows={3} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" defaultValue="具备明确杠杆边界的系统化动量策略。" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="grid gap-2 text-sm text-ink-700">
          Prompt mode
          <select name="promptMode" defaultValue="abstracted" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            <option value="open">open</option>
            <option value="abstracted">abstracted</option>
            <option value="private">private</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Execution mode
          <select name="executionMode" defaultValue="paper" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            <option value="paper">paper</option>
            <option value="verified_live">verified_live</option>
            <option value="unverified_self_report">unverified_self_report</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Model family
          <input name="modelFamily" defaultValue="gpt-5" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Market scope
          <input name="marketScope" defaultValue="BTCUSDT perpetual,ETHUSDT perpetual" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="grid gap-2 text-sm text-ink-700">
          Max leverage
          <input name="maxLeverage" type="number" defaultValue={2} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Max order USD
          <input name="maxOrderNotionalUsd" type="number" defaultValue={10000} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Daily loss %
          <input name="maxDailyLossPct" type="number" defaultValue={4} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Drawdown %
          <input name="maxDrawdownPct" type="number" defaultValue={12} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Create trading config" : "创建交易配置"}
        </button>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </form>
  );
}
