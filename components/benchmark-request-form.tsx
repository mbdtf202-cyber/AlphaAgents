"use client";

import { useState } from "react";

import type { Locale } from "@openclaw/alpha-agents-core";

export function BenchmarkRequestForm({ locale }: { locale: Locale }) {
  const [status, setStatus] = useState<string>("");

  async function handleSubmit(formData: FormData) {
    const agentSlug = String(formData.get("agentSlug") ?? "swe-copilot-forge");
    const payload = {
      suiteSlug: String(formData.get("suiteSlug") ?? "coding-command"),
      versionId: String(formData.get("versionId") ?? "ver-swe-copilot-forge-1-4-2"),
      objective: String(formData.get("objective") ?? ""),
    };

    const response = await fetch(`/api/agent-records/${agentSlug}/request-benchmark`, {
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
        <p className="text-xs uppercase tracking-[0.22em] text-copper-700">Benchmark</p>
        <h2 className="mt-3 font-display text-3xl text-ink-950">{locale === "en" ? "Request a rerun on a specific version" : "为指定版本申请重跑"}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm text-ink-700">
          Agent slug
          <input name="agentSlug" defaultValue="swe-copilot-forge" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Suite
          <select name="suiteSlug" defaultValue="coding-command" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            <option value="coding-command">coding-command</option>
            <option value="research-evidence">research-evidence</option>
            <option value="support-ops-rally">support-ops-rally</option>
            <option value="workflow-maze">workflow-maze</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Version ID
          <input name="versionId" defaultValue="ver-swe-copilot-forge-1-4-2" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3 anywhere" />
        </label>
      </div>
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Objective" : "目标"}
        <textarea
          name="objective"
          rows={4}
          className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3"
          defaultValue={locale === "en" ? "Verify the latest version before moving the profile back to featured placement." : "在恢复精选展示前，验证最新版本表现。"}
        />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Queue benchmark" : "加入 benchmark 队列"}
        </button>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </form>
  );
}
