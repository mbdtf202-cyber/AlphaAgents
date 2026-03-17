"use client";

import { useState } from "react";

import type { Locale } from "@openclaw/agent-ledger-core";

export function PublishVersionForm({ locale }: { locale: Locale }) {
  const [status, setStatus] = useState<string>("");

  async function handleSubmit(formData: FormData) {
    const agentSlug = String(formData.get("agentSlug") ?? "swe-copilot-forge");
    const payload = {
      versionId: String(formData.get("versionId") ?? "ver-swe-copilot-forge-1-4-2"),
      publishNote: String(formData.get("publishNote") ?? ""),
    };

    const response = await fetch(`/api/agent-records/${agentSlug}/publish`, {
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
        <p className="text-xs uppercase tracking-[0.22em] text-copper-700">{locale === "en" ? "Publishing" : "发布"}</p>
        <h2 className="mt-3 font-display text-3xl text-ink-950">{locale === "en" ? "Push a version into moderation" : "把版本推入审核流程"}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          Agent slug
          <input name="agentSlug" defaultValue="support-triage-pilot" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Version ID
          <input name="versionId" defaultValue="ver-support-triage-pilot-0-8-4" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3 anywhere" />
        </label>
      </div>
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Publish note" : "发布说明"}
        <textarea
          name="publishNote"
          rows={4}
          className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3"
          defaultValue={locale === "en" ? "Permission delta reviewed; requesting verified badge restore after policy branch audit." : "权限变更已复查；策略分支审计完成后申请恢复 verified 标记。"}
        />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Queue publish" : "加入发布队列"}
        </button>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </form>
  );
}
