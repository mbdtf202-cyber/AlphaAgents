import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { resolveText } from "@openclaw/alpha-agents-core";

import { ActivityTimeline } from "../../../components/activity-timeline";
import { AgentCard } from "../../../components/agent-card";
import { BuilderNetworkDiagram } from "../../../components/explainers/builder-network-diagram";
import { ExplainerShell } from "../../../components/explainers/explainer-shell";
import { ProfileBadgeStrip } from "../../../components/profile-badge-strip";
import { ProfileFollowButton } from "../../../components/profile-follow-button";
import { getCurrentLocale } from "../../../lib/locale";
import { getServerSession } from "../../../lib/server/auth";
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
  const session = await getServerSession();
  const { handle } = await params;
  const payload = await getBuilderPageData(handle, session);

  if (!payload) {
    notFound();
  }

  const { builder, publishedAgents, reviews } = payload;

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <section className="rounded-[2.5rem] border border-ink-950/8 bg-white/84 p-7">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-[70ch] space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-18 w-18 items-center justify-center rounded-[1.5rem] bg-ink-950 text-2xl font-semibold text-parchment">
                {builder.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-copper-700">@{builder.handle}</p>
                <h1 className="mt-2 font-display text-5xl text-ink-950 md:text-6xl">{builder.name}</h1>
              </div>
            </div>
            <p className="text-xl leading-9 text-ink-700">{resolveText(builder.headline, locale)}</p>
            <p className="text-lg leading-8 text-ink-700">{resolveText(builder.bio, locale)}</p>
            {builder.trust?.primaryBadges?.length ? <ProfileBadgeStrip badges={builder.trust.primaryBadges} locale={locale} /> : null}
            <div className="flex flex-wrap gap-2">
              {builder.specialties.map((specialty) => (
                <span key={specialty} className="rounded-full border border-ink-950/10 bg-parchment px-3 py-1.5 text-sm text-ink-700">
                  {specialty}
                </span>
              ))}
            </div>
            {builder.affiliatedOrganizations?.length ? (
              <div className="flex flex-wrap gap-2">
                {builder.affiliatedOrganizations.map((organization) => (
                  <span key={organization.id} className="rounded-full border border-copper-500/20 bg-copper-500/8 px-3 py-1.5 text-sm text-copper-800">
                    {organization.name}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="grid gap-3 md:w-[320px]">
            <div className="rounded-[1.5rem] bg-parchment-deep p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Trust tier" : "信任等级"}</div>
              <div className="mt-2 text-4xl font-semibold text-ink-950">{builder.trust?.tier}</div>
            </div>
            <div className="rounded-[1.5rem] bg-parchment-deep p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Deployments" : "部署"}</div>
              <div className="mt-2 text-4xl font-semibold text-ink-950">{builder.verifiedDeploymentCount ?? 0}</div>
            </div>
            <div className="rounded-[1.5rem] bg-parchment-deep p-4">
              <div className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Followers" : "关注者"}</div>
              <div className="mt-2 text-4xl font-semibold text-ink-950">{builder.followerCount ?? 0}</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <ProfileFollowButton
                locale={locale}
                subjectType="builder"
                subjectId={builder.id}
                initialFollowing={builder.following ?? false}
                initialFollowerCount={builder.followerCount ?? 0}
                disabled={!session}
              />
              {builder.githubUrl ? (
                <Link href={builder.githubUrl} className="rounded-full bg-ink-950 px-5 py-3 text-center text-sm font-semibold text-parchment">
                  {locale === "en" ? "View GitHub" : "查看 GitHub"}
                </Link>
              ) : null}
            </div>
            {!session ? (
              <Link href="/login" className="text-sm font-semibold text-ink-700 underline-offset-4 hover:underline">
                {locale === "en" ? "Sign in to follow" : "登录后关注"}
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-10">
        <ExplainerShell
          locale={locale}
          eyebrow={locale === "en" ? "Builder graph" : "Builder 图谱"}
          title={locale === "en" ? "A serious builder is read through a network, not a bio paragraph." : "认真 Builder 的价值要通过网络来读，而不只是通过一段简介。"}
          description={
            locale === "en"
              ? "Published agents, deployments, reviews, and downstream adopters explain why a builder deserves trust."
              : "已发布 Agent、部署、评价和下游采用方共同解释了这个 Builder 为什么值得信任。"
          }
        >
          <BuilderNetworkDiagram
            locale={locale}
            builderName={builder.name}
            agentNames={publishedAgents.map((agent) => agent.name)}
            verifiedDeploymentCount={builder.verifiedDeploymentCount ?? 0}
            reviewCount={reviews.length}
          />
        </ExplainerShell>
      </section>

      <section className="mt-10 rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
        <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Activity" : "动态"}</h2>
        <p className="mt-3 text-lg leading-8 text-ink-700">
          {locale === "en"
            ? "Builder activity shows releases, deployments, credentials, endorsements, and published work across all linked agents."
            : "Builder 动态会把关联 Agent 的发布、部署、凭证、背书和作品汇总到一个时间线上。"}
        </p>
        <div className="mt-6">
          <ActivityTimeline events={builder.activity ?? []} locale={locale} limit={8} />
        </div>
      </section>

      <section className="mt-10 rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
        <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Built agents" : "已发布 Agent"}</h2>
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {publishedAgents.map((agent) => (
            <AgentCard key={agent.slug} agent={agent} locale={locale} />
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-6 xl:grid-cols-2">
        <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Endorsements" : "背书"}</h2>
          <div className="mt-6 grid gap-4">
            {(builder.endorsements ?? []).map((endorsement) => (
              <article key={endorsement.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <div className="text-sm text-ink-500">{endorsement.authorName}</div>
                <h3 className="mt-3 text-xl font-semibold text-ink-950">{resolveText(endorsement.authorHeadline, locale)}</h3>
                <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(endorsement.body, locale)}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Featured work" : "代表作品"}</h2>
          <div className="mt-6 grid gap-4">
            {(builder.featuredWork ?? []).map((work) => (
              <article key={work.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <h3 className="text-2xl font-semibold text-ink-950">{resolveText(work.title, locale)}</h3>
                <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(work.summary, locale)}</p>
                {work.artifactUrl ? (
                  <a href={work.artifactUrl} className="mt-4 inline-flex text-sm font-semibold text-ink-700 underline-offset-4 hover:underline">
                    {locale === "en" ? "Open evidence" : "查看证据"}
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </div>
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
