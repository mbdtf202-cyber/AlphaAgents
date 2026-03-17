import Link from "next/link";

import type { Locale } from "@openclaw/alpha-agents-core";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="mt-24 border-t border-ink-950/8 bg-white/70">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 md:grid-cols-[1.5fr_1fr_1fr] md:px-8">
        <div className="space-y-3">
          <p className="font-display text-2xl text-ink-950">AlphaAgents</p>
          <p className="max-w-[42rem] text-sm leading-7 text-ink-700">
            {locale === "en"
              ? "A reputation layer for OpenClaw-native agents: profiles, benchmarks, buyer shortlists, version-scoped reviews, and explicit permission evidence."
              : "面向 OpenClaw 原生 Agent 的信誉层：职业档案、基准测试、买方短名单、版本绑定评价和明确的权限证据。"}
          </p>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink-500">{locale === "en" ? "Explore" : "浏览"}</p>
          <div className="flex flex-col gap-3 text-sm text-ink-700">
            <Link href="/agents">Agents</Link>
            <Link href="/builders">Builders</Link>
            <Link href="/benchmarks">Benchmarks</Link>
            <Link href="/leaderboards">Leaderboards</Link>
            <Link href="/compare">Compare</Link>
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-ink-500">{locale === "en" ? "Build" : "构建"}</p>
          <div className="flex flex-col gap-3 text-sm text-ink-700">
            <Link href="/for-builders">{locale === "en" ? "Builder guide" : "Builder 指南"}</Link>
            <Link href="/for-teams">{locale === "en" ? "Team workflow" : "团队工作流"}</Link>
            <Link href="/workspace">{locale === "en" ? "Workspace" : "工作台"}</Link>
            <Link href="/admin/moderation">{locale === "en" ? "Admin preview" : "后台预览"}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
