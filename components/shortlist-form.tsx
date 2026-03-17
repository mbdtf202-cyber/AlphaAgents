"use client";

import { useState } from "react";

import type { AgentRecord, Locale } from "@openclaw/agent-ledger-core";

export function ShortlistForm({ locale, agents }: { locale: Locale; agents: AgentRecord[] }) {
  const [status, setStatus] = useState<string>("");

  async function handleSubmit(formData: FormData) {
    const selected = formData.getAll("agentSlugs").map(String);
    const payload = {
      name: {
        en: String(formData.get("nameEn") ?? ""),
        "zh-CN": String(formData.get("nameZh") ?? ""),
      },
      buyerType: String(formData.get("buyerType") ?? "team"),
      agentSlugs: selected,
    };

    const response = await fetch("/api/workspace/shortlists", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    setStatus(json.message ?? json.error ?? "Done");
  }

  return (
    <form action={handleSubmit} className="grid gap-4 rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Shortlist name (EN)" : "短名单名称（英文）"}
          <input name="nameEn" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="Buyer evaluation shortlist" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Shortlist name (ZH)" : "短名单名称（中文）"}
          <input name="nameZh" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="买方评估短名单" />
        </label>
      </div>
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Buyer type" : "买方类型"}
        <select name="buyerType" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
          <option value="individual">{locale === "en" ? "Individual" : "个人"}</option>
          <option value="team">{locale === "en" ? "Team" : "团队"}</option>
          <option value="enterprise">{locale === "en" ? "Enterprise" : "企业"}</option>
        </select>
      </label>
      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium text-ink-700">{locale === "en" ? "Pick up to four agents" : "最多选择四个 Agent"}</legend>
        <div className="grid gap-3 md:grid-cols-2">
          {agents.slice(0, 6).map((agent) => (
            <label key={agent.slug} className="flex items-center gap-3 rounded-2xl border border-ink-950/8 bg-parchment px-4 py-3 text-sm text-ink-800">
              <input type="checkbox" name="agentSlugs" value={agent.slug} />
              <span className="anywhere">{agent.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Create shortlist" : "创建短名单"}
        </button>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </form>
  );
}
