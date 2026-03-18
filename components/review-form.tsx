"use client";

import { useState } from "react";

import type { Locale } from "@openclaw/alpha-agents-core";

interface ReviewInstallOption {
  id: string;
  agentSlug: string;
  versionId: string;
  label: string;
}

export function ReviewForm({ locale, installs }: { locale: Locale; installs: ReviewInstallOption[] }) {
  const [status, setStatus] = useState<string>("");

  if (installs.length === 0) {
    return (
      <section className="grid gap-4 rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
        <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "No verified installs yet" : "还没有已验证安装"}</h2>
        <p className="text-base leading-8 text-ink-700">
          {locale === "en"
            ? "A review must be attached to a verified install that you own. Verify an install first, then come back here to publish structured feedback."
            : "评价必须绑定到你拥有的已验证安装。先完成安装验证，再回来发布结构化反馈。"}
        </p>
      </section>
    );
  }

  async function handleSubmit(formData: FormData) {
    const installId = String(formData.get("installId") ?? installs[0]?.id ?? "");
    const install = installs.find((entry) => entry.id === installId);
    const payload = {
      installId,
      agentSlug: install?.agentSlug ?? "",
      versionId: install?.versionId ?? "",
      company: String(formData.get("company") ?? ""),
      role: String(formData.get("role") ?? ""),
      headline: {
        en: String(formData.get("headlineEn") ?? ""),
        "zh-CN": String(formData.get("headlineZh") ?? ""),
      },
      body: {
        en: String(formData.get("bodyEn") ?? ""),
        "zh-CN": String(formData.get("bodyZh") ?? ""),
      },
      rating: Number(formData.get("rating") ?? 5),
      dimensions: {
        taskSuccess: Number(formData.get("taskSuccess") ?? 0),
        reliability: Number(formData.get("reliability") ?? 0),
        costEfficiency: Number(formData.get("costEfficiency") ?? 0),
        latency: Number(formData.get("latency") ?? 0),
        safetyFootprint: Number(formData.get("safetyFootprint") ?? 0),
        setupFriction: Number(formData.get("setupFriction") ?? 0),
        operatorBurden: Number(formData.get("operatorBurden") ?? 0),
        domainFit: Number(formData.get("domainFit") ?? 0),
      },
      context: {
        teamSize: String(formData.get("teamSize") ?? ""),
        taskFrequency: String(formData.get("taskFrequency") ?? ""),
        deploymentEnvironment: String(formData.get("deploymentEnvironment") ?? ""),
        supervisionLevel: String(formData.get("supervisionLevel") ?? "medium"),
        failureModes: String(formData.get("failureModes") ?? "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        alternativeTools: String(formData.get("alternativeTools") ?? "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      },
    };

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    setStatus(json.message ?? json.error ?? "Done");
  }

  return (
    <form action={handleSubmit} className="grid gap-4 rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
      <div className="grid gap-4 md:grid-cols-1">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Verified install" : "已验证安装"}
          <select name="installId" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            {installs.map((install) => (
              <option key={install.id} value={install.id}>
                {install.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="text-sm leading-7 text-ink-600">
        {locale === "en"
          ? "The selected install determines the agent and version automatically, so reviews cannot drift away from owned deployment proof."
          : "所选安装会自动锁定 Agent 与版本，避免评价与已拥有的部署证明脱节。"}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Company" : "公司"}
          <input name="company" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="Helix Cloud" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Role" : "角色"}
          <input name="role" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="Engineering Manager" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Headline (EN)" : "标题（英文）"}
          <input name="headlineEn" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Headline (ZH)" : "标题（中文）"}
          <input name="headlineZh" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Body (EN)" : "正文（英文）"}
          <textarea name="bodyEn" rows={5} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Body (ZH)" : "正文（中文）"}
          <textarea name="bodyZh" rows={5} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Rating" : "评分"}
          <input name="rating" type="number" min="1" max="5" defaultValue="5" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Team size" : "团队规模"}
          <input name="teamSize" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="10 engineers" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Task frequency" : "任务频率"}
          <input name="taskFrequency" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="Daily triage" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Deployment environment" : "部署环境"}
          <input name="deploymentEnvironment" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="GitHub + macOS dev machines" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Supervision level" : "监督强度"}
          <select name="supervisionLevel" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            <option value="light">light</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Failure modes" : "失败模式"}
          <input name="failureModes" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="hallucinated diff, long runtime" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Alternative tools" : "替代工具"}
          <input name="alternativeTools" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="Cursor, Claude Code" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["taskSuccess", "Task success"],
          ["reliability", "Reliability"],
          ["costEfficiency", "Cost efficiency"],
          ["latency", "Latency"],
          ["safetyFootprint", "Safety footprint"],
          ["setupFriction", "Setup friction"],
          ["operatorBurden", "Operator burden"],
          ["domainFit", "Domain fit"],
        ].map(([key, label]) => (
          <label key={key} className="grid gap-2 text-sm text-ink-700">
            {label}
            <input name={key} type="number" min="0" max="100" defaultValue="85" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
          </label>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Publish verified review" : "发布已验证评价"}
        </button>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </form>
  );
}
