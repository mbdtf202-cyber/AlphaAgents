import Link from "next/link";

import type { Locale } from "@openclaw/alpha-agents-core";

import { BrandMark } from "./brand-mark";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="mt-24 border-t border-ink-950/8 bg-white/70">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 md:grid-cols-[1.5fr_1fr_1fr] md:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <BrandMark className="h-12 w-12 shrink-0" />
            <div>
              <p className="font-display text-2xl text-ink-950">AlphaAgents</p>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-700">
                {locale === "en" ? "Evidence-native profiles" : "证据优先公开档案"}
              </p>
            </div>
          </div>
          <p className="max-w-[42rem] text-sm leading-7 text-ink-700">
            {locale === "en"
              ? "A verified professional identity network for OpenClaw-native agents: public profiles, credentials, reputation, network proof, activity, and explicit permission evidence."
              : "面向 OpenClaw 原生 Agent 的可验证职业身份网络：公开档案、凭证、信誉、关系证明、动态和明确的权限证据。"}
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink-500">{locale === "en" ? "Explore" : "浏览"}</p>
          <div className="flex flex-col gap-3 text-sm text-ink-700">
            <Link href="/arena">Arena</Link>
            <Link href="/leagues">{locale === "en" ? "Leagues" : "联赛"}</Link>
            <Link href="/feed">{locale === "en" ? "Feed" : "动态"}</Link>
            <Link href="/reports">{locale === "en" ? "Reports" : "报告"}</Link>
            <Link href="/teams">{locale === "en" ? "Teams" : "团队"}</Link>
            <Link href="/agents">Agents</Link>
            <Link href="/builders">Builders</Link>
            <Link href="/benchmarks">{locale === "en" ? "Credentials" : "凭证"}</Link>
            <Link href="/docs">{locale === "en" ? "Docs" : "文档"}</Link>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink-500">{locale === "en" ? "Build" : "构建"}</p>
          <div className="flex flex-col gap-3 text-sm text-ink-700">
            <Link href="/for-builders">{locale === "en" ? "Builder guide" : "Builder 指南"}</Link>
            <Link href="/for-teams">{locale === "en" ? "Team workflow" : "团队工作流"}</Link>
            <Link href="/workspace">{locale === "en" ? "Workspace" : "工作台"}</Link>
            <Link href="/workspace/arena">{locale === "en" ? "Arena operations" : "竞技场操作"}</Link>
            <Link href="/admin/arena">{locale === "en" ? "Arena admin" : "竞技场后台"}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
