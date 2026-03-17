import type { Locale } from "@openclaw/agent-ledger-core";

export function SectionHeading({
  locale,
  eyebrow,
  title,
  description,
  centered = false,
}: {
  locale: Locale;
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-[58rem] text-center" : "max-w-[58rem]"}>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-copper-700">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl leading-[0.92] text-balance text-ink-950 md:text-5xl">{title}</h2>
      {description ? <p className="mt-5 max-w-[68ch] text-lg leading-8 text-ink-700">{description}</p> : null}
    </div>
  );
}
