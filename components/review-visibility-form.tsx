"use client";

import { useState } from "react";

import type { Locale, VerifiedReview } from "@openclaw/alpha-agents-core";
import { resolveText } from "@openclaw/alpha-agents-core";

export function ReviewVisibilityForm({ locale, review }: { locale: Locale; review: VerifiedReview }) {
  const [status, setStatus] = useState("");

  async function updateVisibility(visibilityStatus: "visible" | "hidden") {
    const response = await fetch(`/api/admin/reviews/${review.id}/visibility`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        visibilityStatus,
        note:
          visibilityStatus === "hidden"
            ? "Admin hid this review pending moderation."
            : "Admin restored this review after moderation review.",
      }),
    });
    const json = await response.json();
    setStatus(json.message ?? json.error ?? "Done");
  }

  return (
    <article className="rounded-[1.5rem] bg-parchment-deep p-5">
      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-copper-700">
        <span>{review.visibilityStatus ?? "visible"}</span>
        <span>{review.agentSlug}</span>
        <span>{review.versionId}</span>
      </div>
      <h2 className="mt-3 text-2xl font-semibold text-ink-950">{resolveText(review.headline, locale)}</h2>
      <p className="mt-3 text-sm text-ink-500">
        {review.company} · {review.role}
      </p>
      <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(review.body, locale)}</p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => updateVisibility("hidden")} className="rounded-full border border-ink-950/12 bg-white px-4 py-2 text-sm font-semibold text-ink-950">
          {locale === "en" ? "Hide review" : "隐藏评价"}
        </button>
        <button type="button" onClick={() => updateVisibility("visible")} className="rounded-full bg-ink-950 px-4 py-2 text-sm font-semibold text-parchment">
          {locale === "en" ? "Restore review" : "恢复评价"}
        </button>
        {status ? <p className="text-sm text-ink-600">{status}</p> : null}
      </div>
    </article>
  );
}
