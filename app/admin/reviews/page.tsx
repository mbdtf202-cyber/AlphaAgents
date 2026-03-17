import { resolveText } from "@openclaw/alpha-agents-core";

import { getCurrentLocale } from "../../../lib/locale";
import { requirePageSession } from "../../../lib/server/page-session";
import { getWorkspaceData } from "../../../lib/server/repository";

export default async function AdminReviewsPage() {
  const locale = await getCurrentLocale();
  const actor = await requirePageSession(["admin"]);
  const workspace = await getWorkspaceData(actor, locale);

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
        <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Review moderation" : "评价审核"}</h1>
        <div className="mt-6 grid gap-4">
          {workspace.reviewHighlights.map((review) => (
            <article key={review.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
              <p className="text-sm text-ink-500">{review.company}</p>
              <h2 className="mt-3 text-2xl font-semibold text-ink-950">{resolveText(review.headline, locale)}</h2>
              <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(review.body, locale)}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
