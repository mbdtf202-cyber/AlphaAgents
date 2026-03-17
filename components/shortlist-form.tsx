"use client";

import { useState } from "react";

import type { AgentRecord, Locale } from "@openclaw/alpha-agents-core";

export function ShortlistForm({ locale, agents }: { locale: Locale; agents: AgentRecord[] }) {
  const [status, setStatus] = useState<string>("");
  const [selected, setSelected] = useState<string[]>([]);
  const reachedLimit = selected.length >= 4;

  async function handleSubmit(formData: FormData) {
    const selected = formData.getAll("agentSlugs").map(String);
    if (selected.length > 4) {
      setStatus(locale === "en" ? "Pick at most four agents." : "最多只能选择四个 Agent。");
      return;
    }
    const payload = {
      name: {
        en: String(formData.get("nameEn") ?? ""),
        "zh-CN": String(formData.get("nameZh") ?? ""),
      },
      buyerType: String(formData.get("buyerType") ?? "team"),
      agentSlugs: selected,
      constraints: {
        repoSize: String(formData.get("repoSize") ?? "medium"),
        dataSensitivity: String(formData.get("dataSensitivity") ?? "medium"),
        approvalModel: String(formData.get("approvalModel") ?? "team-review"),
        allowShell: formData.get("allowShell") === "on",
        allowNetwork: formData.get("allowNetwork") === "on",
        allowAutoCommit: formData.get("allowAutoCommit") === "on",
      },
      scoreWeights: {
        taskSuccess: Number(formData.get("weightTaskSuccess") ?? 20),
        reliability: Number(formData.get("weightReliability") ?? 20),
        costEfficiency: Number(formData.get("weightCostEfficiency") ?? 10),
        latency: Number(formData.get("weightLatency") ?? 10),
        safetyFootprint: Number(formData.get("weightSafetyFootprint") ?? 15),
        setupFriction: Number(formData.get("weightSetupFriction") ?? 5),
        operatorBurden: Number(formData.get("weightOperatorBurden") ?? 10),
        domainFit: Number(formData.get("weightDomainFit") ?? 10),
      },
      internalNotes: String(formData.get("internalNotes") ?? ""),
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
      <div className="grid gap-4 rounded-[1.5rem] bg-parchment-deep p-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Repo size" : "仓库规模"}
          <select name="repoSize" className="rounded-2xl border border-ink-950/10 bg-white px-4 py-3">
            <option value="small">{locale === "en" ? "Small" : "小"}</option>
            <option value="medium">{locale === "en" ? "Medium" : "中"}</option>
            <option value="large">{locale === "en" ? "Large" : "大"}</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Data sensitivity" : "数据敏感度"}
          <select name="dataSensitivity" className="rounded-2xl border border-ink-950/10 bg-white px-4 py-3">
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
            <option value="restricted">restricted</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Approval model" : "审批模式"}
          <select name="approvalModel" className="rounded-2xl border border-ink-950/10 bg-white px-4 py-3">
            <option value="single-owner">{locale === "en" ? "Single owner" : "单负责人"}</option>
            <option value="team-review">{locale === "en" ? "Team review" : "团队评审"}</option>
            <option value="change-advisory-board">{locale === "en" ? "CAB" : "变更委员会"}</option>
          </select>
        </label>
        <label className="flex items-center gap-3 text-sm text-ink-700">
          <input name="allowShell" type="checkbox" />
          {locale === "en" ? "Shell allowed" : "允许 shell"}
        </label>
        <label className="flex items-center gap-3 text-sm text-ink-700">
          <input name="allowNetwork" type="checkbox" defaultChecked />
          {locale === "en" ? "Network allowed" : "允许联网"}
        </label>
        <label className="flex items-center gap-3 text-sm text-ink-700">
          <input name="allowAutoCommit" type="checkbox" />
          {locale === "en" ? "Auto-commit allowed" : "允许自动提交"}
        </label>
      </div>
      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium text-ink-700">{locale === "en" ? "Scoring weights" : "评分权重"}</legend>
        <div className="grid gap-3 md:grid-cols-4">
          {[
            ["weightTaskSuccess", "Task success", 20],
            ["weightReliability", "Reliability", 20],
            ["weightCostEfficiency", "Cost", 10],
            ["weightLatency", "Latency", 10],
            ["weightSafetyFootprint", "Safety", 15],
            ["weightSetupFriction", "Setup friction", 5],
            ["weightOperatorBurden", "Operator burden", 10],
            ["weightDomainFit", "Domain fit", 10],
          ].map(([name, label, value]) => (
            <label key={String(name)} className="grid gap-2 text-sm text-ink-700">
              {label}
              <input
                name={String(name)}
                type="number"
                min="0"
                max="100"
                defaultValue={Number(value)}
                className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3"
              />
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset className="grid gap-3">
        <legend className="text-sm font-medium text-ink-700">{locale === "en" ? "Pick up to four agents" : "最多选择四个 Agent"}</legend>
        <div className="grid gap-3 md:grid-cols-2">
          {agents.map((agent) => (
            <label key={agent.slug} className="flex items-center gap-3 rounded-2xl border border-ink-950/8 bg-parchment px-4 py-3 text-sm text-ink-800">
              <input
                type="checkbox"
                name="agentSlugs"
                value={agent.slug}
                checked={selected.includes(agent.slug)}
                disabled={reachedLimit && !selected.includes(agent.slug)}
                onChange={(event) => {
                  setSelected((current) =>
                    event.currentTarget.checked
                      ? [...current, agent.slug]
                      : current.filter((slug) => slug !== agent.slug),
                  );
                }}
              />
              <span className="anywhere">{agent.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Internal notes" : "内部备注"}
        <textarea
          name="internalNotes"
          rows={4}
          className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3"
          placeholder={locale === "en" ? "Why these candidates, which risks remain, and what evidence still needs a bakeoff." : "记录保留理由、剩余风险、以及还需要 bakeoff 验证的点。"}
        />
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Save procurement draft" : "保存采购草案"}
        </button>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </form>
  );
}
