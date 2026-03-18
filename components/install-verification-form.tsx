"use client";

import { useState } from "react";

import type { Locale } from "@openclaw/alpha-agents-core";

interface InstallAgentOption {
  slug: string;
  name: string;
  versions: Array<{
    id: string;
    version: string;
    status: string;
  }>;
}

export function InstallVerificationForm({ locale, agents }: { locale: Locale; agents: InstallAgentOption[] }) {
  const [status, setStatus] = useState<string>("");
  const [selectedAgentSlug, setSelectedAgentSlug] = useState(agents[0]?.slug ?? "");

  const activeAgent = agents.find((agent) => agent.slug === selectedAgentSlug) ?? agents[0];
  const versionOptions = activeAgent?.versions ?? [];

  if (agents.length === 0) {
    return (
      <section className="surface-panel grid gap-4 rounded-[2rem] p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-copper-700">{locale === "en" ? "Install verification" : "安装验证"}</p>
        <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "No public profiles available" : "当前没有可验证的公开档案"}</h2>
        <p className="text-base leading-8 text-ink-700">
          {locale === "en"
            ? "Install verification requires at least one public agent profile with a version record."
            : "安装验证至少需要一个带版本记录的公开 Agent 档案。"}
        </p>
      </section>
    );
  }

  async function handleSubmit(formData: FormData) {
    const payload = {
      agentSlug: String(formData.get("agentSlug") ?? activeAgent?.slug ?? ""),
      versionId: String(formData.get("versionId") ?? versionOptions[0]?.id ?? ""),
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
    <form action={handleSubmit} data-testid="install-verification-form" className="surface-panel grid gap-4 rounded-[2rem] p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-copper-700">{locale === "en" ? "Install verification" : "安装验证"}</p>
        <h2 className="mt-3 font-display text-3xl text-ink-950">{locale === "en" ? "Turn real usage into review eligibility" : "把真实使用转成评价资格"}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          Agent slug
          <select
            name="agentSlug"
            value={selectedAgentSlug}
            onChange={(event) => setSelectedAgentSlug(event.target.value)}
            className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3"
          >
            {agents.map((agent) => (
              <option key={agent.slug} value={agent.slug}>
                {agent.name} · {agent.slug}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Version" : "版本"}
          <select
            key={selectedAgentSlug}
            name="versionId"
            defaultValue={versionOptions[0]?.id ?? ""}
            className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3"
          >
            {versionOptions.map((version) => (
              <option key={version.id} value={version.id}>
                v{version.version} · {version.status}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="text-sm leading-7 text-ink-600">
        {locale === "en"
          ? `Install proof unlocks later review submission for ${activeAgent?.name ?? "the selected profile"}.`
          : `安装证明会为 ${activeAgent?.name ?? "当前档案"} 解锁后续评价提交。`}
      </p>
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
        <button
          data-testid="verify-install-submit"
          type="submit"
          disabled={versionOptions.length === 0}
          className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment disabled:cursor-not-allowed disabled:opacity-60"
        >
          {locale === "en" ? "Verify install" : "验证安装"}
        </button>
        {status ? <p data-testid="install-verification-status" className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </form>
  );
}
