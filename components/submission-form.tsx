"use client";

import { useRef, useState } from "react";

import type { Locale } from "@openclaw/alpha-agents-core";

export function SubmissionForm({ locale }: { locale: Locale }) {
  const [status, setStatus] = useState<string>("");
  const [importStatus, setImportStatus] = useState<string>("");
  const [recommendedBenchmarks, setRecommendedBenchmarks] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleImport(formData: FormData) {
    setImportStatus("");
    setRecommendedBenchmarks([]);

    const response = await fetch("/api/submissions/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        sourceKind: String(formData.get("sourceKind") ?? "github"),
        sourceUrl: String(formData.get("sourceUrl") ?? ""),
        builderHandle: String(formData.get("builderHandle") ?? ""),
      }),
    });

    const json = await response.json();
    if (!response.ok) {
      setImportStatus(json.error ?? "Import failed.");
      return;
    }

    const form = formRef.current;
    if (!form) {
      return;
    }

    const imported = json.imported as {
      agentName: string;
      agentSlug: string;
      builderHandle: string;
      sourceKind: string;
      sourceUrl: string;
      installCommand: string;
      summary: { en: string; "zh-CN": string };
      permissionManifest: {
        summary: { en: string; "zh-CN": string };
        skills: string[];
        secrets: string[];
        networkAccess: string[];
        fileAccess: string[];
        shellAccess: boolean;
        automationHooks: boolean;
        riskLevel: string;
      };
      dependencies: string[];
      knownLimits: Array<{ en: string; "zh-CN": string }>;
      supportedEnvironments: string[];
      initialVersion: string;
      initialBundleHash: string;
      recommendedBenchmarks: string[];
    };

    const assign = (name: string, value: string) => {
      const element = form.elements.namedItem(name);
      if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
        element.value = value;
      }
    };

    assign("agentName", imported.agentName);
    assign("agentSlug", imported.agentSlug);
    assign("builderHandle", imported.builderHandle);
    assign("sourceKind", imported.sourceKind);
    assign("sourceUrl", imported.sourceUrl);
    assign("installCommand", imported.installCommand);
    assign("summaryEn", imported.summary.en);
    assign("summaryZh", imported.summary["zh-CN"]);
    assign("skills", imported.permissionManifest.skills.join(", "));
    assign("permissionSummaryEn", imported.permissionManifest.summary.en);
    assign("permissionSummaryZh", imported.permissionManifest.summary["zh-CN"]);
    assign("secrets", imported.permissionManifest.secrets.join(", "));
    assign("riskLevel", imported.permissionManifest.riskLevel);
    assign("networkAccess", imported.permissionManifest.networkAccess.join(", "));
    assign("fileAccess", imported.permissionManifest.fileAccess.join(", "));
    assign("dependencies", imported.dependencies.join(", "));
    assign("supportedEnvironments", imported.supportedEnvironments.join(", "));
    assign("knownLimits", imported.knownLimits.map((item) => item.en).join("\n"));
    assign("initialVersion", imported.initialVersion);
    assign("initialBundleHash", imported.initialBundleHash);

    const shellAccess = form.elements.namedItem("shellAccess");
    if (shellAccess instanceof HTMLInputElement) {
      shellAccess.checked = imported.permissionManifest.shellAccess;
    }
    const automationHooks = form.elements.namedItem("automationHooks");
    if (automationHooks instanceof HTMLInputElement) {
      automationHooks.checked = imported.permissionManifest.automationHooks;
    }

    setRecommendedBenchmarks(imported.recommendedBenchmarks);
    setImportStatus(json.message ?? "Import complete.");
  }

  async function handleSubmit(formData: FormData) {
    const payload = {
      agentName: String(formData.get("agentName") ?? ""),
      agentSlug: String(formData.get("agentSlug") ?? ""),
      builderHandle: String(formData.get("builderHandle") ?? ""),
      sourceKind: String(formData.get("sourceKind") ?? "github"),
      sourceUrl: String(formData.get("sourceUrl") ?? ""),
      installCommand: String(formData.get("installCommand") ?? ""),
      summary: {
        en: String(formData.get("summaryEn") ?? ""),
        "zh-CN": String(formData.get("summaryZh") ?? ""),
      },
      permissionManifest: {
        summary: {
          en: String(formData.get("permissionSummaryEn") ?? ""),
          "zh-CN": String(formData.get("permissionSummaryZh") ?? ""),
        },
        skills: String(formData.get("skills") ?? "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        secrets: String(formData.get("secrets") ?? "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        networkAccess: String(formData.get("networkAccess") ?? "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        fileAccess: String(formData.get("fileAccess") ?? "")
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        shellAccess: formData.get("shellAccess") === "on",
        automationHooks: formData.get("automationHooks") === "on",
        riskLevel: String(formData.get("riskLevel") ?? "low"),
      },
      dependencies: String(formData.get("dependencies") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      knownLimits: String(formData.get("knownLimits") ?? "")
        .split("\n")
        .map((value) => value.trim())
        .filter(Boolean)
        .map((value) => ({ en: value, "zh-CN": value })),
      supportedEnvironments: String(formData.get("supportedEnvironments") ?? "")
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      initialVersion: String(formData.get("initialVersion") ?? ""),
      initialBundleHash: String(formData.get("initialBundleHash") ?? ""),
    };

    const response = await fetch("/api/submissions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    setStatus(json.message ?? json.error ?? "Done");
  }

  return (
    <div className="grid gap-6">
      <form action={handleImport} className="surface-panel grid gap-4 rounded-[2rem] p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-copper-700">{locale === "en" ? "Import source" : "导入来源"}</p>
          <h2 className="mt-3 font-display text-3xl text-ink-950">{locale === "en" ? "Bootstrap a builder draft from source metadata" : "从 source metadata 生成 Builder 草稿"}</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm text-ink-700">
            {locale === "en" ? "Source kind" : "来源类型"}
            <select name="sourceKind" defaultValue="github" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
              <option value="github">GitHub</option>
              <option value="clawhub">ClawHub</option>
              <option value="agent-pack">Agent pack</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm text-ink-700 md:col-span-2">
            {locale === "en" ? "Source URL" : "来源 URL"}
            <input name="sourceUrl" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="https://github.com/org/repo" />
          </label>
          <label className="grid gap-2 text-sm text-ink-700">
            {locale === "en" ? "Builder handle override" : "Builder 标识覆盖"}
            <input name="builderHandle" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="northframe" />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
            {locale === "en" ? "Import draft" : "导入草稿"}
          </button>
          {importStatus ? <p className="text-sm text-ink-600">{importStatus}</p> : null}
        </div>
        {recommendedBenchmarks.length > 0 ? (
          <p className="text-sm text-ink-700">
            {locale === "en" ? "Recommended benchmark tracks:" : "推荐 benchmark 轨道："} {recommendedBenchmarks.join(", ")}
          </p>
        ) : null}
      </form>

      <form
        ref={formRef}
        className="grid gap-4 rounded-[2rem] border border-ink-950/8 bg-white/82 p-6"
        action={handleSubmit}
      >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Initial version" : "初始版本"}
          <input name="initialVersion" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="0.1.0" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Initial bundle hash" : "初始 bundle hash"}
          <input name="initialBundleHash" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="sha256:..." />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Agent name" : "Agent 名称"}
          <input name="agentName" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="SWE Copilot Forge" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Slug" : "Slug"}
          <input name="agentSlug" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="swe-copilot-forge" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Builder handle" : "Builder 标识"}
          <input name="builderHandle" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="northframe" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Source kind" : "来源类型"}
          <select name="sourceKind" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            <option value="clawhub">ClawHub</option>
            <option value="github">GitHub</option>
            <option value="agent-pack">Agent pack</option>
          </select>
        </label>
      </div>
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Source URL" : "来源 URL"}
        <input name="sourceUrl" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="https://github.com/..." />
      </label>
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Install command" : "安装命令"}
        <input name="installCommand" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="clawhub install your-agent" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Summary (EN)" : "摘要（英文）"}
          <textarea name="summaryEn" rows={5} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Summary (ZH)" : "摘要（中文）"}
          <textarea name="summaryZh" rows={5} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Skills (comma separated)" : "Skills（逗号分隔）"}
        <input name="skills" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="software-architecture, playwright" />
      </label>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Permission summary (EN)" : "权限摘要（英文）"}
          <textarea name="permissionSummaryEn" rows={4} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Permission summary (ZH)" : "权限摘要（中文）"}
          <textarea name="permissionSummaryZh" rows={4} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Secrets (comma separated)" : "Secrets（逗号分隔）"}
          <input name="secrets" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="OPENAI_API_KEY, HELPDESK_API_TOKEN" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Risk level" : "风险等级"}
          <select name="riskLevel" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Network access" : "网络访问"}
          <input name="networkAccess" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="docs.openclaw.ai, api.openai.com" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "File access" : "文件范围"}
          <input name="fileAccess" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="workspace read/write, logs read" />
        </label>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Dependencies" : "依赖"}
          <input name="dependencies" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="OpenClaw, ClawHub, GitHub repository access" />
        </label>
        <label className="grid gap-2 text-sm text-ink-700">
          {locale === "en" ? "Supported environments" : "支持环境"}
          <input name="supportedEnvironments" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="macOS, Linux, CI runner" />
        </label>
      </div>
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Known limits (one per line)" : "已知限制（每行一条）"}
        <textarea name="knownLimits" rows={4} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" />
      </label>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-3 text-sm text-ink-700">
          <input name="shellAccess" type="checkbox" />
          {locale === "en" ? "Shell access required" : "需要 shell 权限"}
        </label>
        <label className="flex items-center gap-3 text-sm text-ink-700">
          <input name="automationHooks" type="checkbox" />
          {locale === "en" ? "Uses automation hooks" : "使用 automation hooks"}
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Submit draft" : "提交草稿"}
        </button>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      </div>
      </form>
    </div>
  );
}
