"use client";

import { useState } from "react";

import type { Locale } from "@openclaw/alpha-agents-core";

import { LOCALE_COOKIE_NAME, PREFERENCE_COOKIE_MAX_AGE_SECONDS, WORKSPACE_HOME_COOKIE_NAME } from "../lib/preferences";

export interface WorkspaceSettingsOption {
  href: string;
  label: string;
}

export function WorkspaceSettingsForm({
  locale,
  currentLocale,
  currentWorkspaceHome,
  workspaceOptions,
}: {
  locale: Locale;
  currentLocale: Locale;
  currentWorkspaceHome: string;
  workspaceOptions: WorkspaceSettingsOption[];
}) {
  const [nextLocale, setNextLocale] = useState<Locale>(currentLocale);
  const [nextWorkspaceHome, setNextWorkspaceHome] = useState(currentWorkspaceHome);
  const [status, setStatus] = useState("");

  function persistPreference(name: string, value: string) {
    document.cookie = `${name}=${value}; path=/; max-age=${PREFERENCE_COOKIE_MAX_AGE_SECONDS}; samesite=lax`;
  }

  function handleSave() {
    persistPreference(LOCALE_COOKIE_NAME, nextLocale);
    persistPreference(WORKSPACE_HOME_COOKIE_NAME, nextWorkspaceHome);
    setStatus(
      locale === "en"
        ? "Preferences saved. Header links and the next auth redirect will use them."
        : "偏好已保存。Header 链接和下一次登录回跳都会使用这些设置。",
    );
    window.setTimeout(() => {
      window.location.reload();
    }, 120);
  }

  return (
    <div className="grid gap-6">
      <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-copper-700">{locale === "en" ? "Workspace preferences" : "工作台偏好"}</p>
        <h2 className="mt-3 font-display text-4xl text-ink-950">{locale === "en" ? "Persist the settings that change daily navigation." : "保存会影响日常导航的设置。"}</h2>
        <p className="mt-4 max-w-[64ch] text-base leading-8 text-ink-700">
          {locale === "en"
            ? "These preferences are stored in cookies, so the public shell, the workspace entry link, and the next sign-in redirect can all honor the same defaults."
            : "这些偏好会写入 cookie，因此公开导航、进入工作台的入口和下一次登录回跳都会读取同一组默认值。"}
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
          <label className="grid gap-2 text-sm text-ink-700">
            {locale === "en" ? "Preferred language" : "偏好语言"}
            <select
              value={nextLocale}
              onChange={(event) => setNextLocale(event.target.value as Locale)}
              className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3"
            >
              <option value="en">English</option>
              <option value="zh-CN">简体中文</option>
            </select>
          </label>
          <p className="mt-3 text-sm leading-7 text-ink-600">
            {locale === "en"
              ? "This controls the default locale after refresh and the language shown in the workspace shell."
              : "这会控制刷新后的默认语言，以及工作台导航显示的语言。"}
          </p>
        </div>

        <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
          <label className="grid gap-2 text-sm text-ink-700">
            {locale === "en" ? "Default workspace landing page" : "默认工作台落点"}
            <select
              value={nextWorkspaceHome}
              onChange={(event) => setNextWorkspaceHome(event.target.value)}
              className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3"
            >
              {workspaceOptions.map((option) => (
                <option key={option.href} value={option.href}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <p className="mt-3 text-sm leading-7 text-ink-600">
            {locale === "en"
              ? "The main header link and the next successful sign-in will send you here when the redirect target is the generic workspace root."
              : "当回跳目标是通用 `/workspace` 时，主导航入口和下一次成功登录都会优先进入这里。"}
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={handleSave} className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
          {locale === "en" ? "Save preferences" : "保存偏好"}
        </button>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </div>
  );
}
