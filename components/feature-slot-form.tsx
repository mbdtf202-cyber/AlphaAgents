"use client";

import { useState } from "react";

import type { AgentRecord, FeatureSlot, Locale } from "@openclaw/alpha-agents-core";

export function FeatureSlotForm({
  locale,
  slot,
  agents,
}: {
  locale: Locale;
  slot: FeatureSlot;
  agents: AgentRecord[];
}) {
  const [status, setStatus] = useState("");

  async function handleSubmit(formData: FormData) {
    const payload = {
      slotKey: slot.slotKey,
      agentSlug: String(formData.get("agentSlug") ?? slot.agentSlug),
      title: {
        en: String(formData.get("titleEn") ?? ""),
        "zh-CN": String(formData.get("titleZh") ?? ""),
      },
      description: {
        en: String(formData.get("descriptionEn") ?? ""),
        "zh-CN": String(formData.get("descriptionZh") ?? ""),
      },
    };

    const response = await fetch("/api/admin/featured", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    setStatus(json.message ?? json.error ?? "Done");
  }

  return (
    <form action={handleSubmit} className="rounded-[1.5rem] bg-parchment-deep p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-copper-700">{slot.slotKey}</p>
      <div className="mt-4 grid gap-3">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Agent" : "Agent"}
          <select name="agentSlug" defaultValue={slot.agentSlug} className="rounded-2xl border border-ink-950/10 bg-white px-4 py-3">
            {agents.map((agent) => (
              <option key={agent.slug} value={agent.slug}>
                {agent.name} · {agent.slug}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Title (EN)
          <input name="titleEn" defaultValue={slot.title.en} className="rounded-2xl border border-ink-950/10 bg-white px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          标题（中文）
          <input name="titleZh" defaultValue={slot.title["zh-CN"]} className="rounded-2xl border border-ink-950/10 bg-white px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Description (EN)
          <textarea name="descriptionEn" rows={3} defaultValue={slot.description.en} className="rounded-2xl border border-ink-950/10 bg-white px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          描述（中文）
          <textarea name="descriptionZh" rows={3} defaultValue={slot.description["zh-CN"]} className="rounded-2xl border border-ink-950/10 bg-white px-4 py-3" />
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Save slot" : "保存精选位"}
        </button>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </form>
  );
}
