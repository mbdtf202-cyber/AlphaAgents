import type { Locale, ProvenanceInfo } from "@openclaw/agent-ledger-core";

import { resolveText } from "@openclaw/agent-ledger-core";

export function ProvenanceBadge({ locale, provenance }: { locale: Locale; provenance?: ProvenanceInfo }) {
  if (!provenance) {
    return null;
  }

  const classes =
    provenance.dataMode === "live"
      ? "border border-emerald-600/20 bg-emerald-50 text-emerald-800"
      : "border border-copper-500/20 bg-copper-500/8 text-copper-800";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${classes}`}>
      {resolveText(provenance.label, locale)}
    </span>
  );
}
