import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[1440px] flex-col items-center justify-center gap-6 px-5 text-center md:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-copper-700">404</p>
      <h1 className="font-display text-5xl text-ink-950">This dossier could not be found.</h1>
      <p className="max-w-[44rem] text-lg leading-8 text-ink-700">
        The page may have moved, the listing may still be in moderation, or the agent may have been withdrawn from public ranking.
      </p>
      <Link href="/agents" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
        Browse active agents
      </Link>
    </main>
  );
}
