"use client";

import { useMemo, useState } from "react";

import type { Locale } from "@openclaw/alpha-agents-core";
import type { TradingVersionConfig } from "@openclaw/alpha-agents-arena-core";

export function ArenaLiveCredentialForm({ locale, configs }: { locale: Locale; configs: TradingVersionConfig[] }) {
  const [status, setStatus] = useState("");
  const [selectedConfigId, setSelectedConfigId] = useState(configs[0]?.id ?? "");
  const activeConfig = useMemo(() => configs.find((config) => config.id === selectedConfigId) ?? configs[0], [configs, selectedConfigId]);

  if (!activeConfig) {
    return null;
  }

  async function handleSubmit(formData: FormData) {
    const response = await fetch("/api/workspace/arena/live-credentials", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        agentSlug: activeConfig.agentSlug,
        agentVersionId: activeConfig.agentVersionId,
        accountLabel: String(formData.get("accountLabel") ?? ""),
        exchange: String(formData.get("exchange") ?? "Binance"),
        credentialMode: String(formData.get("credentialMode") ?? "managed_secret_broker"),
        providerKind: String(formData.get("providerKind") ?? "managed_secret_broker"),
      }),
    });
    const json = await response.json();
    setStatus(json.message ?? json.error ?? "Done");
  }

  return (
    <form action={handleSubmit} className="surface-panel grid gap-4 rounded-[2rem] p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-copper-700">Arena live</p>
        <h2 className="mt-3 font-display text-3xl text-ink-950">{locale === "en" ? "Register a live provider" : "登记实盘提供方"}</h2>
        <p className="mt-3 text-sm leading-7 text-ink-700">
          {locale === "en"
            ? "Managed and user-agent live routes are stored as verifiable provider registrations. External credential verification remains pending until a real provider handshake succeeds."
            : "托管和用户代理实盘路径会被记录为可验证的 provider registration。只有真实提供方握手成功后，外部凭据校验才会完成。"}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          Trading config
          <select value={selectedConfigId} onChange={(event) => setSelectedConfigId(event.target.value)} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            {configs.map((config) => (
              <option key={config.id} value={config.id}>
                {config.agentSlug} · {config.executionMode}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Account label
          <input name="accountLabel" defaultValue="Binance Managed Sandbox" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm text-ink-700">
          Exchange
          <input name="exchange" defaultValue="Binance" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Credential mode
          <select name="credentialMode" defaultValue="managed_secret_broker" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            <option value="managed_secret_broker">managed_secret_broker</option>
            <option value="user_execution_agent">user_execution_agent</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          Provider
          <select name="providerKind" defaultValue="managed_secret_broker" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            <option value="managed_secret_broker">managed_secret_broker</option>
            <option value="user_execution_agent">user_execution_agent</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Register live provider" : "登记实盘提供方"}
        </button>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </form>
  );
}
