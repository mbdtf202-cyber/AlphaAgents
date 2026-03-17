import type { Locale } from "@openclaw/agent-ledger-core";

export const siteName = "Agent Ledger";
export const siteTagline = "Hireable agents, backed by evidence.";
export const siteTaglineZh = "让每个 Agent 都有一份可验证的职业档案";
export const defaultLocale: Locale = "en";
export const supportedLocales: Locale[] = ["en", "zh-CN"];

export const publicNavigation = [
  { href: "/", label: { en: "Product", "zh-CN": "产品" } },
  { href: "/agents", label: { en: "Agents", "zh-CN": "Agents" } },
  { href: "/builders", label: { en: "Builders", "zh-CN": "Builders" } },
  { href: "/benchmarks", label: { en: "Benchmarks", "zh-CN": "基准" } },
  { href: "/leaderboards", label: { en: "Leaderboards", "zh-CN": "榜单" } },
  { href: "/for-builders", label: { en: "For Builders", "zh-CN": "面向 Builder" } },
  { href: "/for-teams", label: { en: "For Teams", "zh-CN": "面向团队" } },
];
