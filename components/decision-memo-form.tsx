"use client";

import { useState } from "react";

import type { Locale, ShortlistRecord } from "@openclaw/alpha-agents-core";

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
      evidenceSummary: {
        en: String(formData.get("evidenceSummaryEn") ?? ""),
        "zh-CN": String(formData.get("evidenceSummaryZh") ?? ""),
      },
      riskSummary: {
        en: String(formData.get("riskSummaryEn") ?? ""),
        "zh-CN": String(formData.get("riskSummaryZh") ?? ""),
      },
      scoreWeights: {
        taskSuccess: Number(formData.get("weightTaskSuccess") ?? 20),
        reliability: Number(formData.get("weightReliability") ?? 20),
        costEfficiency: Number(formData.get("weightCostEfficiency") ?? 10),
        latency: Number(formData.get("weightLatency") ?? 10),
        safetyFootprint: Number(formData.get("weightSafetyFootprint") ?? 15),
        setupFriction: Number(formData.get("weightSetupFriction") ?? 5),
        operatorBurden: Number(formData.get("weightOperatorBurden") ?? 10),
        domainFit: Number(formData.get("weightDomainFit") ?? 10),
      },
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
        <p className="text-xs uppercase tracking-[0.22em] text-copper-700">{locale === "en" ? "Evaluation brief" : "Evaluation Brief"}</p>
        <h2 className="mt-3 font-display text-3xl text-ink-950">{locale === "en" ? "Write a profile-based recommendation" : "撰写基于档案的建议"}</h2>
      </div>
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Profile list" : "Profile List"}
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
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Evidence summary (EN)" : "证据摘要（英文）"}
          <textarea name="evidenceSummaryEn" rows={3} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Evidence summary (ZH)" : "证据摘要（中文）"}
          <textarea name="evidenceSummaryZh" rows={3} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Risk summary (EN)" : "风险摘要（英文）"}
          <textarea name="riskSummaryEn" rows={3} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Risk summary (ZH)" : "风险摘要（中文）"}
          <textarea name="riskSummaryZh" rows={3} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium text-ink-700">{locale === "en" ? "Weight profile" : "权重配置"}</legend>
        <div className="grid gap-3 md:grid-cols-4">
          {[
            ["weightTaskSuccess", "Task success", 20],
            ["weightReliability", "Reliability", 20],
            ["weightCostEfficiency", "Cost", 10],
            ["weightLatency", "Latency", 10],
            ["weightSafetyFootprint", "Safety", 15],
            ["weightSetupFriction", "Setup friction", 5],
            ["weightOperatorBurden", "Operator burden", 10],
            ["weightDomainFit", "Domain fit", 10],
          ].map(([name, label, value]) => (
            <label key={String(name)} className="grid gap-2 text-sm text-ink-700">
              {label}
              <input
                name={String(name)}
                type="number"
                min="0"
                max="100"
                defaultValue={Number(value)}
                className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3"
              />
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Persist evaluation brief" : "保存 Evaluation Brief"}
        </button>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </form>
  );
}
