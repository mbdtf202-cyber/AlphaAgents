"use client";

import { useMemo, useState } from "react";

import type { Locale } from "@openclaw/alpha-agents-core";
import type { ArenaCompetition, TradingVersionConfig } from "@openclaw/alpha-agents-arena-core";

export function ArenaEntryForm({
  locale,
  competitions,
  configs,
  defaultBuilderHandle,
  defaultOrganizationSlug,
  defaultOrganizationName,
}: {
  locale: Locale;
  competitions: ArenaCompetition[];
  configs: TradingVersionConfig[];
  defaultBuilderHandle?: string;
  defaultOrganizationSlug?: string;
  defaultOrganizationName?: string;
}) {
  const [status, setStatus] = useState("");
  const [selectedConfigId, setSelectedConfigId] = useState(configs[0]?.id ?? "");

  const activeConfig = useMemo(() => configs.find((config) => config.id === selectedConfigId) ?? configs[0], [configs, selectedConfigId]);

  if (!activeConfig || competitions.length === 0) {
    return null;
  }

  async function handleSubmit(formData: FormData) {
    const competition = competitions.find((item) => item.id === String(formData.get("competitionId"))) ?? competitions[0];
    const response = await fetch("/api/workspace/arena/entries", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        competitionId: competition.id,
        competitionSlug: competition.slug,
        leagueSlug: competition.leagueSlug,
        agentSlug: activeConfig.agentSlug,
        agentName: activeConfig.agentSlug,
        builderHandle: String(formData.get("builderHandle") ?? ""),
        organizationSlug: String(formData.get("organizationSlug") ?? ""),
        organizationName: String(formData.get("organizationName") ?? ""),
        agentVersionId: activeConfig.agentVersionId,
        tradingVersionConfigId: activeConfig.id,
        proofMode: String(formData.get("proofMode") ?? "paper"),
        verificationLevel: "verified",
        liveStatus: String(formData.get("liveStatus") ?? "paper_only"),
        promptMode: activeConfig.promptMode,
        rankingScope: String(formData.get("rankingScope") ?? "overall"),
      }),
    });
    const json = await response.json();
    setStatus(json.message ?? json.error ?? "Done");
  }

  return (
    <form action={handleSubmit} className="surface-panel grid gap-4 rounded-[2rem] p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-copper-700">Arena competition</p>
        <h2 className="mt-3 font-display text-3xl text-ink-950">{locale === "en" ? "Enter a competition" : "报名比赛"}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          Trading config
          <select value={selectedConfigId} onChange={(event) => setSelectedConfigId(event.target.value)} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            {configs.map((config) => (
              <option key={config.id} value={config.id}>
                {config.agentSlug} · {config.promptMode}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Competition
          <select name="competitionId" defaultValue={competitions[0]?.id ?? ""} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            {competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.slug}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <label className="grid gap-2 text-sm text-ink-700">
          Builder handle
          <input name="builderHandle" defaultValue={defaultBuilderHandle ?? "northframe"} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Team slug
          <input name="organizationSlug" defaultValue={defaultOrganizationSlug ?? "helix-cloud"} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Team name
          <input name="organizationName" defaultValue={defaultOrganizationName ?? "Helix Cloud"} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Ranking scope
          <select name="rankingScope" defaultValue="overall" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            <option value="overall">overall</option>
            <option value="open_prompt">open_prompt</option>
            <option value="risk">risk</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          Proof mode
          <select name="proofMode" defaultValue="paper" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            <option value="paper">paper</option>
            <option value="verified_live">verified_live</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Live status
          <select name="liveStatus" defaultValue="paper_only" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            <option value="paper_only">paper_only</option>
            <option value="managed_live">managed_live</option>
            <option value="user_agent_live">user_agent_live</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Enter competition" : "提交报名"}
        </button>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </form>
  );
}
