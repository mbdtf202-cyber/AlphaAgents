import type { PropsWithChildren } from "react";

import type { Locale } from "@openclaw/alpha-agents-core";

import { cn } from "../../lib/utils";

export function ExplainerShell({
  locale,
  eyebrow,
  title,
  description,
  compact = false,
  className,
  children,
}: PropsWithChildren<{
  locale: Locale;
  eyebrow: string;
  title: string;
  description?: string;
  compact?: boolean;
  className?: string;
}>) {
  return (
    <section className={cn("explainer-shell", compact ? "explainer-shell--compact" : "", className)}>
      <div className="relative z-[1]">
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-copper-700">{eyebrow}</p>
        <h3 className={cn("font-display text-ink-950", compact ? "mt-3 text-3xl" : "mt-3 text-4xl md:text-5xl")}>{title}</h3>
        {description ? (
          <p className={cn("text-ink-700", compact ? "mt-4 text-sm leading-7" : "mt-4 max-w-[70ch] text-base leading-8")}>{description}</p>
        ) : null}
      </div>
      <div className={cn("relative z-[1]", compact ? "mt-5" : "mt-6")}>{children}</div>
      <div className="explainer-orbit" aria-hidden="true" />
    </section>
  );
}
