"use client";

import { useState } from "react";

import type { Locale } from "@openclaw/agent-ledger-core";

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
      <form action={handleMagicLink} className="surface-panel grid gap-4 rounded-[2rem] p-6">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-copper-700">{locale === "en" ? "Buyer access" : "买方入口"}</p>
          <h2 className="mt-3 font-display text-3xl text-ink-950">{locale === "en" ? "Magic link sign-in" : "Magic link 登录"}</h2>
        </div>
        <label className="grid gap-2 text-sm text-ink-700">
          Email
          <input name="email" type="email" className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3" placeholder="buyer@example.com" />
        </label>
        <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Send magic link" : "发送 magic link"}
        </button>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
        {previewUrl ? (
          <a href={previewUrl} className="text-sm font-semibold text-copper-700 underline-offset-4 hover:underline">
            {locale === "en" ? "Open preview magic link" : "打开预览 magic link"}
          </a>
        ) : null}
      </form>

      <div className="surface-panel rounded-[2rem] p-6">
        <p className="text-xs uppercase tracking-[0.22em] text-copper-700">{locale === "en" ? "Builder access" : "Builder 入口"}</p>
        <h2 className="mt-3 font-display text-3xl text-ink-950">{locale === "en" ? "GitHub sign-in" : "GitHub 登录"}</h2>
        <p className="mt-4 text-base leading-8 text-ink-700">
          {locale === "en"
            ? "Builders authenticate with GitHub so published agents stay attached to real code provenance."
            : "Builder 通过 GitHub 登录，让公开 Agent 能继续绑定真实代码来源。"}
        </p>
        <a href="/api/auth/github/start" className="mt-6 inline-flex rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Continue with GitHub" : "使用 GitHub 继续"}
        </a>
      </div>
    </>
  );
}
