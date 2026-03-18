import type { Locale, ProfileBadge } from "@openclaw/alpha-agents-core";

import { resolveText } from "@openclaw/alpha-agents-core";

export function ProfileBadgeStrip({ badges, locale }: { badges: ProfileBadge[]; locale: Locale }) {
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge) => (
        <span
          key={badge.id}
          className="rounded-full border border-copper-500/20 bg-copper-500/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-copper-800"
          title={resolveText(badge.description, locale)}
        >
          {resolveText(badge.label, locale)}
        </span>
      ))}
    </div>
  );
}
