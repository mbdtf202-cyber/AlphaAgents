import type { ActorRole, Locale, SessionActor } from "@openclaw/alpha-agents-core";

export interface WorkspaceNavItem {
  href: string;
  label: {
    en: string;
    "zh-CN": string;
  };
}

const commonItems: WorkspaceNavItem[] = [
  { href: "/workspace", label: { en: "Overview", "zh-CN": "概览" } },
  { href: "/workspace/arena", label: { en: "Arena", "zh-CN": "竞技场" } },
  { href: "/workspace/benchmarks", label: { en: "Credentials", "zh-CN": "凭证" } },
  { href: "/workspace/reviews", label: { en: "Reputation", "zh-CN": "信誉" } },
  { href: "/workspace/settings", label: { en: "Settings", "zh-CN": "设置" } },
];

const buyerItems: WorkspaceNavItem[] = [
  { href: "/workspace/shortlists", label: { en: "Profile lists", "zh-CN": "Profile List" } },
  { href: "/workspace/decisions", label: { en: "Evaluation briefs", "zh-CN": "Evaluation Brief" } },
];

const builderItems: WorkspaceNavItem[] = [
  { href: "/workspace/agents", label: { en: "Agents", "zh-CN": "Agent" } },
  { href: "/workspace/submissions", label: { en: "Profile drafts", "zh-CN": "档案草稿" } },
];

function resolveRole(input: ActorRole | SessionActor): ActorRole {
  return typeof input === "string" ? input : input.role;
}

export function getWorkspaceNavItems(input: ActorRole | SessionActor): WorkspaceNavItem[] {
  const role = resolveRole(input);
  if (role === "buyer") {
    return [...commonItems, ...buyerItems];
  }
  return [...commonItems, ...builderItems];
}

export function isWorkspaceNavPathAllowed(input: ActorRole | SessionActor, pathname: string) {
  return getWorkspaceNavItems(input).some((item) => item.href === pathname);
}

export function resolveWorkspaceNavLabel(item: WorkspaceNavItem, locale: Locale) {
  return locale === "en" ? item.label.en : item.label["zh-CN"];
}
