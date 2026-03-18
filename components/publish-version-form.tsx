"use client";

import { useState } from "react";

import type { Locale } from "@openclaw/alpha-agents-core";

interface PublishAgentOption {
  slug: string;
  name: string;
  versions: Array<{
    id: string;
    version: string;
    status: string;
    releasedAt: string;
  }>;
}

export function PublishVersionForm({ locale, agents }: { locale: Locale; agents: PublishAgentOption[] }) {
  const [status, setStatus] = useState<string>("");
  const [selectedAgentSlug, setSelectedAgentSlug] = useState(agents[0]?.slug ?? "");

  const activeAgent = agents.find((agent) => agent.slug === selectedAgentSlug) ?? agents[0];
  const versionOptions = activeAgent?.versions ?? [];

  if (agents.length === 0) {
    return (
      <section className="surface-panel grid gap-4 rounded-[2rem] p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-copper-700">{locale === "en" ? "Publishing" : "发布"}</p>
        <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "No managed profiles yet" : "还没有可管理档案"}</h2>
        <p className="text-base leading-8 text-ink-700">
          {locale === "en"
            ? "Publish moderation only becomes available after a builder profile has at least one managed agent version."
            : "只有在 Builder 档案下至少存在一个可管理的 Agent 版本后，才能提交发布审核。"}
        </p>
      </section>
    );
  }

  async function handleSubmit(formData: FormData) {
    const agentSlug = String(formData.get("agentSlug") ?? activeAgent?.slug ?? "");
    const versionId = String(formData.get("versionId") ?? versionOptions[0]?.id ?? "");
    const payload = {
      versionId,
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
    <form action={handleSubmit} data-testid="publish-version-form" className="surface-panel grid gap-4 rounded-[2rem] p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-copper-700">{locale === "en" ? "Publishing" : "发布"}</p>
        <h2 className="mt-3 font-display text-3xl text-ink-950">{locale === "en" ? "Push a version into moderation" : "把版本推入审核流程"}</h2>
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
      {versionOptions[0] ? (
        <p className="text-sm leading-7 text-ink-600">
          {locale === "en"
            ? `Publishing requests moderation for the selected version record. Latest release date: ${new Date(versionOptions[0].releasedAt).toLocaleDateString("en-US")}.`
            : `发布动作会把当前选中版本推入审核。最近发布日期：${new Date(versionOptions[0].releasedAt).toLocaleDateString("zh-CN")}。`}
        </p>
      ) : null}
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
        <button
          data-testid="publish-version-submit"
          type="submit"
          disabled={versionOptions.length === 0}
          className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment disabled:cursor-not-allowed disabled:opacity-60"
        >
          {locale === "en" ? "Queue publish" : "加入发布队列"}
        </button>
        {status ? <p data-testid="publish-version-status" className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </form>
  );
}
