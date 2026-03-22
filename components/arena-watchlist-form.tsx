"use client";

import { useState } from "react";

import type { Locale } from "@openclaw/alpha-agents-core";

export function ArenaWatchlistForm({ locale }: { locale: Locale }) {
  const [status, setStatus] = useState("");

  async function handleSubmit(formData: FormData) {
    const targetType = String(formData.get("targetType") ?? "league");
    const targetId = String(formData.get("targetId") ?? "crypto-perps-main-arena");
    const response = await fetch("/api/workspace/arena/watchlist", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        targetType,
        targetId,
        label: {
          en: String(formData.get("labelEn") ?? targetId),
          "zh-CN": String(formData.get("labelZh") ?? targetId),
        },
      }),
    });
    const json = await response.json();
    setStatus(json.message ?? json.error ?? "Done");
  }

  return (
    <form action={handleSubmit} className="surface-panel grid gap-4 rounded-[2rem] p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-copper-700">Arena watchlist</p>
        <h2 className="mt-3 font-display text-3xl text-ink-950">{locale === "en" ? "Track a league, team, or agent" : "追踪联赛、团队或 Agent"}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          Target type
          <select name="targetType" defaultValue="league" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            <option value="league">league</option>
            <option value="organization">organization</option>
            <option value="agent">agent</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Target id
          <input name="targetId" defaultValue="crypto-perps-main-arena" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          Label (EN)
          <input name="labelEn" defaultValue="Crypto Perps Main Arena" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Label (ZH)
          <input name="labelZh" defaultValue="加密永续主竞技场" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Add to watchlist" : "加入 watchlist"}
        </button>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </form>
  );
}
