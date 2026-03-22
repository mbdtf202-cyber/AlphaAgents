"use client";

import { useMemo, useState } from "react";

import type { Locale } from "@openclaw/alpha-agents-core";
import type { ArenaCompetitionEntry } from "@openclaw/alpha-agents-arena-core";

export function ArenaRunForm({ locale, entries }: { locale: Locale; entries: ArenaCompetitionEntry[] }) {
  const [status, setStatus] = useState("");
  const [selectedEntryId, setSelectedEntryId] = useState(entries[0]?.id ?? "");

  const activeEntry = useMemo(() => entries.find((entry) => entry.id === selectedEntryId) ?? entries[0], [entries, selectedEntryId]);

  if (!activeEntry) {
    return null;
  }

  async function handleSubmit(formData: FormData) {
    const response = await fetch("/api/workspace/arena/runs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        entryId: activeEntry.id,
        competitionId: activeEntry.competitionId,
        competitionSlug: activeEntry.competitionSlug,
        leagueSlug: activeEntry.leagueSlug,
        agentSlug: activeEntry.agentSlug,
        agentVersionId: activeEntry.agentVersionId,
        providerKind: String(formData.get("providerKind") ?? "paper_matching_engine"),
        proofMode: String(formData.get("proofMode") ?? activeEntry.proofMode),
        liveStatus: String(formData.get("liveStatus") ?? activeEntry.liveStatus),
        rankingScope: activeEntry.rankingScope,
        instrument: String(formData.get("instrument") ?? "BTCUSDT"),
      }),
    });
    const json = await response.json();
    setStatus(json.message ?? json.error ?? "Done");
  }

  return (
    <form action={handleSubmit} className="surface-panel grid gap-4 rounded-[2rem] p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-copper-700">Arena execution</p>
        <h2 className="mt-3 font-display text-3xl text-ink-950">{locale === "en" ? "Trigger a paper/live run" : "触发 paper/live run"}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          Entry
          <select value={selectedEntryId} onChange={(event) => setSelectedEntryId(event.target.value)} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            {entries.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.agentName} · {entry.competitionSlug}
              </option>
            ))}
          </select>
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
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm text-ink-700">
          Proof mode
          <select name="proofMode" defaultValue={activeEntry.proofMode} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            <option value="paper">paper</option>
            <option value="verified_live">verified_live</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Live status
          <select name="liveStatus" defaultValue={activeEntry.liveStatus} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            <option value="paper_only">paper_only</option>
            <option value="managed_live">managed_live</option>
            <option value="user_agent_live">user_agent_live</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Instrument
          <input name="instrument" defaultValue="BTCUSDT" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Trigger run" : "触发运行"}
        </button>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </form>
  );
}
