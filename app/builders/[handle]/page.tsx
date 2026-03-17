import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { resolveText } from "@openclaw/alpha-agents-core";

import { AgentCard } from "../../../components/agent-card";
import { getCurrentLocale } from "../../../lib/locale";
import { getBuilderPageData } from "../../../lib/server/repository";
import { getReadCatalog } from "../../../lib/server/repositories";

export async function generateStaticParams() {
  return (await getReadCatalog()).builders.map((builder) => ({ handle: builder.handle }));
}

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params;
  const builder = (await getReadCatalog()).builders.find((entry) => entry.handle === handle);
  return builder ? { title: builder.name, description: builder.bio.en } : {};
}

export default async function BuilderDetailPage({ params }: { params: Promise<{ handle: string }> }) {
  const locale = await getCurrentLocale();
  const { handle } = await params;
  const payload = await getBuilderPageData(handle);

  if (!payload) {
    notFound();
  }

  const { builder, publishedAgents, reviews } = payload;

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <section className="rounded-[2.5rem] border border-ink-950/8 bg-white/84 p-7">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-18 w-18 items-center justify-center rounded-[1.5rem] bg-ink-950 text-2xl font-semibold text-parchment">
                {builder.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-copper-700">@{builder.handle}</p>
                <h1 className="mt-2 font-display text-5xl text-ink-950 md:text-6xl">{builder.name}</h1>
              </div>
            </div>
            <p className="max-w-[68ch] text-xl leading-9 text-ink-700">{resolveText(builder.headline, locale)}</p>
            <p className="max-w-[68ch] text-lg leading-8 text-ink-700">{resolveText(builder.bio, locale)}</p>
            <div className="flex flex-wrap gap-2">
              {builder.specialties.map((specialty) => (
                <span key={specialty} className="rounded-full border border-ink-950/10 bg-parchment px-3 py-1.5 text-sm text-ink-700">
                  {specialty}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-3 md:w-[320px]">
            <div className="rounded-[1.5rem] bg-parchment-deep p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Benchmark wins" : "夺榜次数"}</div>
              <div className="mt-2 text-4xl font-semibold text-ink-950">{builder.benchmarkWins}</div>
            </div>
            <div className="rounded-[1.5rem] bg-parchment-deep p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Shortlists" : "短名单入围"}</div>
              <div className="mt-2 text-4xl font-semibold text-ink-950">{builder.shortlistCount}</div>
            </div>
            {builder.githubUrl ? (
              <Link href={builder.githubUrl} className="rounded-full bg-ink-950 px-5 py-3 text-center text-sm font-semibold text-parchment">
                {locale === "en" ? "View GitHub" : "查看 GitHub"}
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 xl:grid-cols-2">
        {publishedAgents.map((agent) => (
          <AgentCard key={agent.slug} agent={agent} locale={locale} />
        ))}
      </section>

      <section className="mt-10 rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
        <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Recent verified feedback" : "近期已验证反馈"}</h2>
        <div className="mt-6 grid gap-4">
          {reviews.map((review) => (
            <article key={review.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
              <div className="flex flex-wrap items-center gap-3 text-sm text-ink-500">
                <span>{review.company}</span>
                <span>•</span>
                <span>{review.role}</span>
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-ink-950">{resolveText(review.headline, locale)}</h3>
              <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(review.body, locale)}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
