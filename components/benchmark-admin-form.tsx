"use client";

import { useState } from "react";

import type { BenchmarkRequestRecord, Locale } from "@openclaw/alpha-agents-core";

export function BenchmarkAdminForm({ locale, request }: { locale: Locale; request: BenchmarkRequestRecord }) {
  const [status, setStatus] = useState("");

  async function handleAction(action: "rerun" | "fail") {
    const response = await fetch(`/api/admin/benchmarks/requests/${request.id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action,
        failureReason: action === "fail" ? "Admin failed request from benchmark console." : undefined,
      }),
    });
    const json = await response.json();
    setStatus(json.message ?? json.error ?? "Done");
  }

  return (
    <article className="rounded-[1.5rem] bg-parchment-deep p-5">
      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-copper-700">
        <span>{request.status}</span>
        <span>{request.suiteSlug}</span>
        <span>{request.agentSlug}</span>
      </div>
      <h2 className="mt-3 text-2xl font-semibold text-ink-950">{request.versionId}</h2>
      <p className="mt-3 text-base leading-8 text-ink-700">
        {request.objective || (locale === "en" ? "No objective provided." : "未填写目标。")}
      </p>
      {request.artifactBundle ? (
        <div className="mt-4 rounded-2xl border border-ink-950/8 bg-white px-4 py-3 text-sm leading-7 text-ink-700">
          <div>{locale === "en" ? "Executor" : "执行器"}: {request.artifactBundle.execution.executorId}</div>
          <div>{locale === "en" ? "Execution ref" : "执行引用"}: {request.artifactBundle.execution.executionRef}</div>
          <div>{locale === "en" ? "Verification" : "验签状态"}: {request.artifactBundle.verification.status}</div>
          <div>{locale === "en" ? "Bundle hash" : "Bundle Hash"}: {request.artifactBundle.bundleHash}</div>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => handleAction("rerun")} className="rounded-full bg-ink-950 px-4 py-2 text-sm font-semibold text-parchment">
          {locale === "en" ? "Queue rerun" : "加入重跑队列"}
        </button>
        {request.status === "queued" || request.status === "running" ? (
          <button type="button" onClick={() => handleAction("fail")} className="rounded-full border border-ink-950/12 bg-white px-4 py-2 text-sm font-semibold text-ink-950">
            {locale === "en" ? "Force fail" : "强制失败"}
          </button>
        ) : null}
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </article>
  );
}
