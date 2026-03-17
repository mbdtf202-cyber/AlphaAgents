import { resolveText } from "@openclaw/agent-ledger-core";

import { getCurrentLocale } from "../../../lib/locale";
import { getHomepageData } from "../../../lib/server/repository";

export default async function AdminFeaturedPage() {
  const locale = await getCurrentLocale();
  const { featureSlots } = await getHomepageData();

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
        <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Featured slots" : "精选位"}</h1>
        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {featureSlots.map((slot) => (
            <article key={slot.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-copper-700">{resolveText(slot.title, locale)}</p>
              <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(slot.description, locale)}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
