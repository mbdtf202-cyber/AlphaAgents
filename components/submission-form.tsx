"use client";

import { useState } from "react";

import type { Locale } from "@openclaw/agent-ledger-core";

export function SubmissionForm({ locale }: { locale: Locale }) {
  const [status, setStatus] = useState<string>("");

  async function handleSubmit(formData: FormData) {
    const payload = {
      agentName: String(formData.get("agentName") ?? ""),
      agentSlug: String(formData.get("agentSlug") ?? ""),
      builderHandle: String(formData.get("builderHandle") ?? ""),
      sourceKind: String(formData.get("sourceKind") ?? "github"),
      sourceUrl: String(formData.get("sourceUrl") ?? ""),
      installCommand: String(formData.get("installCommand") ?? ""),
      summary: {
        en: String(formData.get("summaryEn") ?? ""),
        "zh-CN": String(formData.get("summaryZh") ?? ""),
      },
      skills: String(formData.get("skills") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
    };

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    setStatus(json.message ?? json.error ?? "Done");
  }

  return (
    <form
      className="grid gap-4 rounded-[2rem] border border-ink-950/8 bg-white/82 p-6"
      action={handleSubmit}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Agent name" : "Agent 名称"}
          <input name="agentName" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="SWE Copilot Forge" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Slug" : "Slug"}
          <input name="agentSlug" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="swe-copilot-forge" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Builder handle" : "Builder 标识"}
          <input name="builderHandle" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="northframe" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Source kind" : "来源类型"}
          <select name="sourceKind" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            <option value="clawhub">ClawHub</option>
            <option value="github">GitHub</option>
            <option value="agent-pack">Agent pack</option>
          </select>
        </label>
      </div>
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Source URL" : "来源 URL"}
        <input name="sourceUrl" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="https://github.com/..." />
      </label>
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Install command" : "安装命令"}
        <input name="installCommand" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="clawhub install your-agent" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Summary (EN)" : "摘要（英文）"}
          <textarea name="summaryEn" rows={5} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Summary (ZH)" : "摘要（中文）"}
          <textarea name="summaryZh" rows={5} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Skills (comma separated)" : "Skills（逗号分隔）"}
        <input name="skills" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="software-architecture, playwright" />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Submit draft" : "提交草稿"}
        </button>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </form>
  );
}
