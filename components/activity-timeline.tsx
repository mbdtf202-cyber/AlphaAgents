import type { ActivityEvent, Locale } from "@openclaw/alpha-agents-core";

import { resolveText } from "@openclaw/alpha-agents-core";

export function ActivityTimeline({ events, locale, limit }: { events: ActivityEvent[]; locale: Locale; limit?: number }) {
  const items = typeof limit === "number" ? events.slice(0, limit) : events;

  return (
    <div className="grid gap-4">
      {items.map((event) => (
        <article key={event.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-copper-700">
            <span>{event.type}</span>
            <span>{new Date(event.occurredAt).toLocaleDateString(locale === "en" ? "en-US" : "zh-CN")}</span>
            <span>{event.verified ? (locale === "en" ? "verified" : "已验证") : locale === "en" ? "reported" : "已记录"}</span>
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-ink-950">{resolveText(event.title, locale)}</h3>
          <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(event.summary, locale)}</p>
          {event.relatedUrl ? (
            <a href={event.relatedUrl} className="mt-4 inline-flex text-sm font-semibold text-ink-700 underline-offset-4 hover:underline">
              {locale === "en" ? "Open evidence" : "查看证据"}
            </a>
          ) : null}
        </article>
      ))}
    </div>
  );
}
