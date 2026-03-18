import Link from "next/link";
import type { PropsWithChildren } from "react";

import type { Locale, SessionActor } from "@openclaw/alpha-agents-core";

import { cn } from "../lib/utils";

function getItems(actor: SessionActor) {
  const common = [
    { href: "/workspace", label: { en: "Overview", "zh-CN": "概览" } },
    { href: "/workspace/benchmarks", label: { en: "Credentials", "zh-CN": "凭证" } },
    { href: "/workspace/reviews", label: { en: "Reputation", "zh-CN": "信誉" } },
    { href: "/workspace/settings", label: { en: "Settings", "zh-CN": "设置" } },
  ];
  if (actor.role === "buyer") {
    return [
      ...common,
      { href: "/workspace/shortlists", label: { en: "Profile lists", "zh-CN": "Profile List" } },
      { href: "/workspace/decisions", label: { en: "Evaluation briefs", "zh-CN": "Evaluation Brief" } },
    ];
  }
  return [
    ...common,
    { href: "/workspace/agents", label: { en: "Agents", "zh-CN": "Agent" } },
    { href: "/workspace/submissions", label: { en: "Profile drafts", "zh-CN": "档案草稿" } },
  ];
}

export function WorkspaceShell({
  locale,
  pathname,
  actor,
  children,
}: PropsWithChildren<{ locale: Locale; pathname: string; actor: SessionActor }>) {
  const items = getItems(actor);

  return (
    <div className="mx-auto grid w-full max-w-[1440px] gap-6 px-5 py-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8">
      <aside className="rounded-[2rem] border border-ink-950/8 bg-white/75 p-4">
        <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-ink-500">
          {locale === "en" ? `${actor.role} workspace` : `${actor.role} 工作台`}
        </p>
        <nav className="mt-2 grid gap-1">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-2xl px-3 py-3 text-sm font-medium transition",
                  active ? "bg-ink-950 text-parchment" : "text-ink-700 hover:bg-parchment-deep",
                )}
              >
                {locale === "en" ? item.label.en : item.label["zh-CN"]}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
