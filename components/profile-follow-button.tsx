"use client";

import { useState } from "react";

import type { Locale } from "@openclaw/alpha-agents-core";

export function ProfileFollowButton({
  locale,
  subjectType,
  subjectId,
  initialFollowing,
  initialFollowerCount,
  disabled,
}: {
  locale: Locale;
  subjectType: "agent" | "builder";
  subjectId: string;
  initialFollowing: boolean;
  initialFollowerCount: number;
  disabled?: boolean;
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [pending, setPending] = useState(false);

  async function toggleFollow() {
    if (disabled || pending) {
      return;
    }
    setPending(true);
    const nextFollowing = !following;
    const response = await fetch("/api/follows", {
      method: nextFollowing ? "POST" : "DELETE",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ subjectType, subjectId }),
    });
    if (response.ok) {
      setFollowing(nextFollowing);
      setFollowerCount((current) => Math.max(0, current + (nextFollowing ? 1 : -1)));
    }
    setPending(false);
  }

  return (
    <button
      data-testid="profile-follow-button"
      type="button"
      onClick={toggleFollow}
      disabled={disabled || pending}
      className="rounded-full border border-ink-950/12 bg-white px-4 py-2.5 text-sm font-semibold text-ink-950 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {following ? (locale === "en" ? "Following" : "已关注") : locale === "en" ? "Follow profile" : "关注档案"} · {followerCount}
    </button>
  );
}
