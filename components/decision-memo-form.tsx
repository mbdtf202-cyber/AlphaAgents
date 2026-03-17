"use client";

import { useState } from "react";

import type { Locale, ShortlistRecord } from "@openclaw/agent-ledger-core";

export function DecisionMemoForm({ locale, shortlists }: { locale: Locale; shortlists: ShortlistRecord[] }) {
  const [status, setStatus] = useState<string>("");

  async function handleSubmit(formData: FormData) {
    const payload = {
      shortlistId: String(formData.get("shortlistId") ?? ""),
      title: {
        en: String(formData.get("titleEn") ?? ""),
        "zh-CN": String(formData.get("titleZh") ?? ""),
      },
      summary: {
        en: String(formData.get("summaryEn") ?? ""),
        "zh-CN": String(formData.get("summaryZh") ?? ""),
      },
      recommendationState: String(formData.get("recommendationState") ?? "pilot"),
      rolloutRecommendation: {
        en: String(formData.get("rolloutEn") ?? ""),
        "zh-CN": String(formData.get("rolloutZh") ?? ""),
      },
      tradeoffs: [
        {
          en: String(formData.get("tradeoffEn") ?? ""),
          "zh-CN": String(formData.get("tradeoffZh") ?? ""),
        },
      ],
    };

    const response = await fetch("/api/workspace/decision-memos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    setStatus(json.message ?? json.error ?? "Done");
  }

  return (
    <form action={handleSubmit} className="surface-panel grid gap-4 rounded-[2rem] p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-copper-700">{locale === "en" ? "Decision memo" : "决策备忘录"}</p>
        <h2 className="mt-3 font-display text-3xl text-ink-950">{locale === "en" ? "Write a buyer recommendation" : "撰写买方建议"}</h2>
      </div>
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Shortlist" : "短名单"}
        <select name="shortlistId" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
          {shortlists.map((shortlist) => (
            <option key={shortlist.id} value={shortlist.id}>
              {locale === "en" ? shortlist.name.en : shortlist.name["zh-CN"]}
            </option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Title (EN)" : "标题（英文）"}
          <input name="titleEn" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Title (ZH)" : "标题（中文）"}
          <input name="titleZh" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Summary (EN)" : "摘要（英文）"}
          <textarea name="summaryEn" rows={4} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Summary (ZH)" : "摘要（中文）"}
          <textarea name="summaryZh" rows={4} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Recommendation state" : "建议状态"}
        <select name="recommendationState" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
          <option value="hold">hold</option>
          <option value="pilot">pilot</option>
          <option value="rollout">rollout</option>
          <option value="reject">reject</option>
        </select>
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Rollout recommendation (EN)" : "上线建议（英文）"}
          <textarea name="rolloutEn" rows={3} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Rollout recommendation (ZH)" : "上线建议（中文）"}
          <textarea name="rolloutZh" rows={3} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Tradeoff (EN)" : "权衡（英文）"}
          <textarea name="tradeoffEn" rows={3} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Tradeoff (ZH)" : "权衡（中文）"}
          <textarea name="tradeoffZh" rows={3} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Persist memo" : "保存备忘录"}
        </button>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </form>
  );
}
