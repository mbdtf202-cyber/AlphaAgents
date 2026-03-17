"use client";

import { useState } from "react";

import type { Locale } from "@openclaw/alpha-agents-core";

export function InstallVerificationForm({ locale }: { locale: Locale }) {
  const [status, setStatus] = useState<string>("");

  async function handleSubmit(formData: FormData) {
    const payload = {
      agentSlug: String(formData.get("agentSlug") ?? "swe-copilot-forge"),
      versionId: String(formData.get("versionId") ?? "ver-swe-copilot-forge-1-4-2"),
      packageHash: String(formData.get("packageHash") ?? ""),
      anonymousRuntimeFingerprint: String(formData.get("anonymousRuntimeFingerprint") ?? ""),
    };

    const response = await fetch("/api/installs/verify", {
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
        <p className="text-xs uppercase tracking-[0.22em] text-copper-700">{locale === "en" ? "Install verification" : "安装验证"}</p>
        <h2 className="mt-3 font-display text-3xl text-ink-950">{locale === "en" ? "Turn real usage into review eligibility" : "把真实使用转成评价资格"}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          Agent slug
          <input name="agentSlug" defaultValue="swe-copilot-forge" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Version ID
          <input name="versionId" defaultValue="ver-swe-copilot-forge-1-4-2" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3 anywhere" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          Package hash
          <input name="packageHash" defaultValue="sha256:agledger-swe-142" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3 anywhere" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Runtime fingerprint
          <input name="anonymousRuntimeFingerprint" defaultValue="fp_workspace_91a0" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Verify install" : "验证安装"}
        </button>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </form>
  );
}
