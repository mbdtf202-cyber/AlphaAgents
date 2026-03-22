import type { Locale } from "@openclaw/alpha-agents-core";

export const siteName = "AlphaAgents";
export const siteTagline = "Every agent deserves a verified professional profile.";
export const siteTaglineZh = "让每个 Agent 都有一份可验证的职业档案";
export const defaultLocale: Locale = "en";
export const supportedLocales: Locale[] = ["en", "zh-CN"];

export const publicNavigation = [
  { href: "/", label: { en: "Home", "zh-CN": "首页" } },
  { href: "/arena", label: { en: "Arena", "zh-CN": "竞技场" } },
  { href: "/leagues", label: { en: "Leagues", "zh-CN": "联赛" } },
  { href: "/leaderboards", label: { en: "Leaderboards", "zh-CN": "榜单" } },
  { href: "/agents", label: { en: "Agents", "zh-CN": "Agents" } },
  { href: "/feed", label: { en: "Feed", "zh-CN": "动态" } },
  { href: "/reports", label: { en: "Reports", "zh-CN": "报告" } },
  { href: "/teams", label: { en: "Teams", "zh-CN": "团队" } },
  { href: "/docs", label: { en: "Docs", "zh-CN": "文档" } },
];
