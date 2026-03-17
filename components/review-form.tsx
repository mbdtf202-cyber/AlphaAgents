"use client";

import { useState } from "react";

import type { Locale } from "@openclaw/alpha-agents-core";

export function ReviewForm({ locale }: { locale: Locale }) {
  const [status, setStatus] = useState<string>("");

  async function handleSubmit(formData: FormData) {
    const payload = {
      installId: String(formData.get("installId") ?? ""),
      agentSlug: String(formData.get("agentSlug") ?? ""),
      versionId: String(formData.get("versionId") ?? ""),
      company: String(formData.get("company") ?? ""),
      role: String(formData.get("role") ?? ""),
      headline: {
        en: String(formData.get("headlineEn") ?? ""),
        "zh-CN": String(formData.get("headlineZh") ?? ""),
      },
      body: {
        en: String(formData.get("bodyEn") ?? ""),
        "zh-CN": String(formData.get("bodyZh") ?? ""),
      },
      rating: Number(formData.get("rating") ?? 5),
      dimensions: {
        taskSuccess: Number(formData.get("taskSuccess") ?? 0),
        reliability: Number(formData.get("reliability") ?? 0),
        costEfficiency: Number(formData.get("costEfficiency") ?? 0),
        latency: Number(formData.get("latency") ?? 0),
        safetyFootprint: Number(formData.get("safetyFootprint") ?? 0),
        setupFriction: Number(formData.get("setupFriction") ?? 0),
        operatorBurden: Number(formData.get("operatorBurden") ?? 0),
        domainFit: Number(formData.get("domainFit") ?? 0),
      },
    };

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    setStatus(json.message ?? json.error ?? "Done");
  }

  return (
    <form action={handleSubmit} className="grid gap-4 rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm text-ink-700">
          Install ID
          <input name="installId" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3 anywhere" placeholder="install_xxx" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Agent slug
          <input name="agentSlug" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="swe-copilot-forge" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Version ID
          <input name="versionId" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3 anywhere" placeholder="ver_xxx" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Company" : "公司"}
          <input name="company" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="Helix Cloud" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Role" : "角色"}
          <input name="role" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="Engineering Manager" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Headline (EN)" : "标题（英文）"}
          <input name="headlineEn" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Headline (ZH)" : "标题（中文）"}
          <input name="headlineZh" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Body (EN)" : "正文（英文）"}
          <textarea name="bodyEn" rows={5} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Body (ZH)" : "正文（中文）"}
          <textarea name="bodyZh" rows={5} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Rating" : "评分"}
          <input name="rating" type="number" min="1" max="5" defaultValue="5" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["taskSuccess", "Task success"],
          ["reliability", "Reliability"],
          ["costEfficiency", "Cost efficiency"],
          ["latency", "Latency"],
          ["safetyFootprint", "Safety footprint"],
          ["setupFriction", "Setup friction"],
          ["operatorBurden", "Operator burden"],
          ["domainFit", "Domain fit"],
        ].map(([key, label]) => (
          <label key={key} className="grid gap-2 text-sm text-ink-700">
            {label}
            <input name={key} type="number" min="0" max="100" defaultValue="85" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
          </label>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Publish verified review" : "发布已验证评价"}
        </button>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </form>
  );
}
