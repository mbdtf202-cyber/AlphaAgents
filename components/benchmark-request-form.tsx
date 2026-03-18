"use client";

import { useState } from "react";

import type { Locale } from "@openclaw/alpha-agents-core";

interface BenchmarkAgentOption {
  slug: string;
  name: string;
  versions: Array<{
    id: string;
    version: string;
    status: string;
    releasedAt: string;
  }>;
}

export function BenchmarkRequestForm({ locale, agents }: { locale: Locale; agents: BenchmarkAgentOption[] }) {
  const [status, setStatus] = useState<string>("");
  const [selectedAgentSlug, setSelectedAgentSlug] = useState(agents[0]?.slug ?? "");

  const activeAgent = agents.find((agent) => agent.slug === selectedAgentSlug) ?? agents[0];
  const versionOptions = activeAgent?.versions ?? [];

  if (agents.length === 0) {
    return (
      <section className="surface-panel grid gap-4 rounded-[2rem] p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-copper-700">Benchmark</p>
        <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "No benchmark candidates yet" : "还没有可申请 benchmark 的候选项"}</h2>
        <p className="text-base leading-8 text-ink-700">
          {locale === "en"
            ? "Benchmark reruns only make sense after at least one managed agent version exists."
            : "只有在存在至少一个可管理版本后，benchmark 重跑申请才有意义。"}
        </p>
      </section>
    );
  }

  async function handleSubmit(formData: FormData) {
    const agentSlug = String(formData.get("agentSlug") ?? activeAgent?.slug ?? "");
    const versionId = String(formData.get("versionId") ?? versionOptions[0]?.id ?? "");
    const payload = {
      suiteSlug: String(formData.get("suiteSlug") ?? "coding-command"),
      versionId,
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
    <form action={handleSubmit} data-testid="benchmark-request-form" className="surface-panel grid gap-4 rounded-[2rem] p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-copper-700">Benchmark</p>
        <h2 className="mt-3 font-display text-3xl text-ink-950">{locale === "en" ? "Request a rerun on a specific version" : "为指定版本申请重跑"}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
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
          Suite
          <select name="suiteSlug" defaultValue="coding-command" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            <option value="coding-command">coding-command</option>
            <option value="research-evidence">research-evidence</option>
            <option value="support-ops-rally">support-ops-rally</option>
            <option value="workflow-maze">workflow-maze</option>
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
      {versionOptions[0] ? (
        <p className="text-sm leading-7 text-ink-600">
          {locale === "en"
            ? `The selected rerun will attach to ${activeAgent?.name ?? "this agent"} and the chosen version record.`
            : `本次重跑会绑定到 ${activeAgent?.name ?? "当前 Agent"} 的当前所选版本记录。`}
        </p>
      ) : null}
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
        <button
          data-testid="benchmark-request-submit"
          type="submit"
          disabled={versionOptions.length === 0}
          className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment disabled:cursor-not-allowed disabled:opacity-60"
        >
          {locale === "en" ? "Queue benchmark" : "加入 benchmark 队列"}
        </button>
        {status ? <p data-testid="benchmark-request-status" className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </form>
  );
}
