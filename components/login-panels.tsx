"use client";

import { useState } from "react";

import type { Locale } from "@openclaw/alpha-agents-core";

export function LoginPanels({ locale }: { locale: Locale }) {
  const [status, setStatus] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");

  async function handleMagicLink(formData: FormData) {
    setPreviewUrl("");
    const payload = {
      email: String(formData.get("email") ?? ""),
      redirectTo: "/workspace",
      role: "buyer",
    };
    const response = await fetch("/api/auth/magic-link/request", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await response.json();
    setStatus(json.message ?? json.error ?? "Done");
    if (json.previewUrl) {
      setPreviewUrl(json.previewUrl);
    }
  }

  return (
    <>
      <div className="surface-panel rounded-[2rem] p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-copper-700">{locale === "en" ? "Primary access" : "主入口"}</p>
        <h2 className="mt-3 font-display text-3xl text-ink-950">{locale === "en" ? "Continue with GitHub" : "使用 GitHub 继续"}</h2>
        <p className="mt-4 text-base leading-8 text-ink-700">
          {locale === "en"
            ? "GitHub is the default sign-in path for builders and launch operations so published agents stay attached to real code provenance."
            : "GitHub 是 Builder 与首发运营的默认登录入口，这样公开 Agent 会继续绑定真实代码来源。"}
        </p>
        <a
          href="/api/auth/github/start"
          data-testid="github-login-link"
          className="mt-6 inline-flex rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment"
        >
          {locale === "en" ? "Start with GitHub" : "从 GitHub 开始"}
        </a>
      </div>

      <form action={handleMagicLink} data-testid="magic-link-form" className="surface-panel grid gap-4 rounded-[2rem] p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-copper-700">{locale === "en" ? "Secondary access" : "次级入口"}</p>
          <h2 className="mt-3 font-display text-3xl text-ink-950">{locale === "en" ? "Team magic link" : "团队 Magic Link"}</h2>
          <p className="mt-4 text-base leading-8 text-ink-700">
            {locale === "en"
              ? "Buyer and team operators can request a signed email link. In local test mode this may expose a preview link instead of sending mail."
              : "买方和团队运营可以请求签名邮件链接。在本地测试模式下，这里可能显示预览链接而不是真实发信。"}
          </p>
        </div>
        <label className="grid gap-2 text-sm text-ink-700">
          Email
          <input
            data-testid="magic-link-email"
            name="email"
            type="email"
            className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3"
            placeholder="buyer@example.com"
          />
        </label>
        <button data-testid="magic-link-submit" type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Email sign-in link" : "发送登录链接"}
        </button>
        {status ? <p data-testid="magic-link-status" className="text-sm text-ink-600">{status}</p> : null}
        {previewUrl ? (
          <a data-testid="magic-link-preview" href={previewUrl} className="text-sm font-semibold text-copper-700 underline-offset-4 hover:underline">
            {locale === "en" ? "Open preview magic link" : "打开预览 magic link"}
          </a>
        ) : null}
      </form>
    </>
  );
}
