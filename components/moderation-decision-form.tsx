"use client";

import { useState } from "react";

import type { Locale, ModerationCase } from "@openclaw/alpha-agents-core";

import { resolveText } from "@openclaw/alpha-agents-core";

export function ModerationDecisionForm({ locale, item }: { locale: Locale; item: ModerationCase }) {
  const [status, setStatus] = useState<string>("");

  async function handleSubmit(formData: FormData) {
    const payload = {
      status: String(formData.get("status") ?? item.status),
      note: String(formData.get("note") ?? ""),
    };

    const response = await fetch(`/api/admin/moderation/${item.id}/decision`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    setStatus(json.message ?? json.error ?? "Done");
  }

  return (
    <article className="surface-panel rounded-[1.75rem] p-5">
      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-copper-700">
        <span>{item.status}</span>
        <span>{item.entityType}</span>
      </div>
      <h2 className="mt-3 text-2xl font-semibold text-ink-950">{item.title}</h2>
      <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(item.reason, locale)}</p>
      <form action={handleSubmit} className="mt-5 grid gap-4 md:grid-cols-[180px_minmax(0,1fr)_auto] md:items-end">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Decision" : "决策"}
          <select name="status" defaultValue={item.status} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            <option value="pending">pending</option>
            <option value="changes-requested">changes-requested</option>
            <option value="approved">approved</option>
            <option value="rejected">rejected</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Moderator note" : "审核备注"}
          <textarea
            name="note"
            rows={3}
            className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3"
            defaultValue={locale === "en" ? "Decision recorded from admin console preview." : "在后台预览里记录决策。"}
          />
        </label>
        <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Record decision" : "记录决策"}
        </button>
      </form>
      {status ? <p className="mt-3 text-sm text-ink-600">{status}</p> : null}
    </article>
  );
}
