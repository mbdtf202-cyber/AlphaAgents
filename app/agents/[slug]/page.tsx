import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { resolveText } from "@openclaw/alpha-agents-core";

import { ActivityTimeline } from "../../../components/activity-timeline";
import { CapabilityBoundaryDiagram } from "../../../components/explainers/capability-boundary-diagram";
import { ExplainerShell } from "../../../components/explainers/explainer-shell";
import { ProcessFlowDiagram } from "../../../components/explainers/process-flow-diagram";
import { ProfileBadgeStrip } from "../../../components/profile-badge-strip";
import { ProfileFollowButton } from "../../../components/profile-follow-button";
import { ProvenanceBadge } from "../../../components/provenance-badge";
import { getCurrentLocale } from "../../../lib/locale";
import { getServerSession } from "../../../lib/server/auth";
import { getAgentPageData } from "../../../lib/server/repository";
import { getReadCatalog } from "../../../lib/server/repositories";

export async function generateStaticParams() {
  return (await getReadCatalog()).agents.map((agent) => ({ slug: agent.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const agent = (await getReadCatalog()).agents.find((entry) => entry.slug === slug);
  if (!agent) {
    return {};
  }

  return {
    title: agent.name,
    description: agent.summary.en,
  };
}

export default async function AgentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const locale = await getCurrentLocale();
  const session = await getServerSession();
  const { slug } = await params;
  const agent = await getAgentPageData(slug, undefined, session);

  if (!agent) {
    notFound();
  }

  const version = agent.versions[0];
  const verifiedRuns = version.benchmarkRuns.filter((run) => !run.verification || run.verification.status === "verified");

  return (
    <main className="mx-auto grid max-w-[1440px] gap-8 px-5 py-14 md:px-8 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-10">
        <section className="rounded-[2.5rem] border border-ink-950/8 bg-white/84 p-7">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-ink-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-parchment">
              {agent.trust?.tier ?? agent.verificationStatus}
            </span>
            <ProvenanceBadge locale={locale} provenance={agent.provenance} />
            <span className="rounded-full border border-ink-950/10 px-3 py-1 text-xs font-medium text-ink-600 anywhere">{agent.slug}</span>
            <span className="rounded-full border border-copper-500/20 bg-copper-500/8 px-3 py-1 text-xs font-medium text-copper-800">
              v{version.version}
            </span>
          </div>
          <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-[52rem]">
              <h1 className="font-display text-6xl leading-[0.92] text-balance text-ink-950 md:text-7xl">{agent.name}</h1>
              <p className="mt-6 text-xl leading-9 text-ink-700">{resolveText(agent.tagline, locale)}</p>
              <p className="mt-5 text-base leading-8 text-ink-700">{resolveText(agent.summary, locale)}</p>
              {agent.trust?.primaryBadges?.length ? <div className="mt-6"><ProfileBadgeStrip badges={agent.trust.primaryBadges} locale={locale} /></div> : null}
              <div className="mt-6 flex flex-wrap gap-3 text-sm text-ink-600">
                <span>{locale === "en" ? `Builder: @${agent.builderHandle}` : `Builder：@${agent.builderHandle}`}</span>
                <span>{locale === "en" ? `Completeness: ${agent.trust?.completenessPercent ?? 0}%` : `完整度：${agent.trust?.completenessPercent ?? 0}%`}</span>
                <span>{locale === "en" ? `Followers: ${agent.followerCount ?? 0}` : `关注者：${agent.followerCount ?? 0}`}</span>
              </div>
              {agent.affiliatedOrganizations?.length ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {agent.affiliatedOrganizations.map((organization) => (
                    <span key={organization.id} className="rounded-full border border-ink-950/10 bg-parchment px-3 py-1.5 text-sm text-ink-700">
                      {organization.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="grid gap-3 md:w-[320px]">
              <div className="rounded-[1.5rem] bg-parchment-deep p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Primary credential" : "主凭证"}</div>
                <div className="mt-2 text-xl font-semibold text-ink-950">
                  {agent.credentials?.[0] ? resolveText(agent.credentials[0].title, locale) : "--"}
                </div>
              </div>
              <div className="rounded-[1.5rem] bg-parchment-deep p-4">
                <div className="text-xs uppercase tracking-[0.22em] text-ink-500">{locale === "en" ? "Recent activity" : "近期动态"}</div>
                <div className="mt-2 text-base font-semibold text-ink-950">
                  {agent.activity?.[0] ? resolveText(agent.activity[0].title, locale) : locale === "en" ? "No public activity yet." : "暂无公开动态。"}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={agent.source.url} className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
              {locale === "en" ? "View install source" : "查看安装来源"}
            </Link>
            <ProfileFollowButton
              locale={locale}
              subjectType="agent"
              subjectId={agent.id}
              initialFollowing={agent.following ?? false}
              initialFollowerCount={agent.followerCount ?? 0}
              disabled={!session}
            />
            {!session ? (
              <Link href="/login" className="rounded-full border border-ink-950/12 bg-white px-5 py-3 text-sm font-semibold text-ink-950">
                {locale === "en" ? "Sign in to follow" : "登录后关注"}
              </Link>
            ) : null}
            <Link href={`/compare?agents=${agent.slug}`} className="rounded-full border border-ink-950/12 bg-white px-5 py-3 text-sm font-semibold text-ink-950">
              {locale === "en" ? "Secondary compare" : "次级比较"}
            </Link>
          </div>
        </section>

        <ExplainerShell
          locale={locale}
          eyebrow={locale === "en" ? "Operating fit" : "运行匹配"}
          title={locale === "en" ? "Use the profile to understand fit before you test the agent." : "在实际测试之前，先用档案判断是否匹配。"}
          description={
            locale === "en"
              ? "This diagram turns narrative text into a faster judgment: what the agent is best used for, where its declared boundary sits, and what not to rely on."
              : "这个图把叙事文本转成更快的判断：最适合什么、声明边界在哪里、哪些事情不要依赖。"
          }
        >
          <CapabilityBoundaryDiagram locale={locale} useCases={agent.useCases} notFor={agent.notFor} manifest={agent.permissionManifest} />
        </ExplainerShell>

        <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Profile" : "档案"}</h2>
          <div className="mt-5 space-y-5">
            {agent.overview.map((paragraph) => (
              <p key={paragraph.en} className="text-lg leading-9 text-ink-700">
                {resolveText(paragraph, locale)}
              </p>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {agent.capabilities.map((capability) => (
              <div key={capability.en} className="rounded-[1.5rem] bg-parchment-deep p-5 text-base leading-8 text-ink-800">
                {resolveText(capability, locale)}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Activity" : "动态"}</h2>
          <p className="mt-3 max-w-[64ch] text-lg leading-8 text-ink-700">
            {locale === "en"
              ? "This timeline is the public work history: releases, credentials, deployments, reviews, badges, and endorsements."
              : "这条时间线就是公开工作经历：发布、凭证、部署、评价、徽章和背书。"}
          </p>
          <div className="mt-6">
            <ActivityTimeline events={agent.activity ?? []} locale={locale} />
          </div>
        </section>

        <ExplainerShell
          locale={locale}
          eyebrow={locale === "en" ? "Reputation logic" : "信誉逻辑"}
          title={locale === "en" ? "Reputation is earned through a visible sequence, not a single rating." : "信誉来自一条可见序列，而不是单个评分。"}
          compact
        >
          <ProcessFlowDiagram
            locale={locale}
            compact
            steps={
              locale === "en"
                ? [
                    { label: "Install", body: "A real deployment creates proof of usage." },
                    { label: "Review", body: "Only owned installs can publish structured feedback." },
                    { label: "Credential", body: "Benchmarks add version-bound evidence slices." },
                    { label: "Trust", body: "The public profile aggregates signals into readable confidence." },
                  ]
                : [
                    { label: "安装", body: "真实部署先形成使用证明。" },
                    { label: "评价", body: "只有拥有的安装才能发布结构化反馈。" },
                    { label: "凭证", body: "Benchmark 为版本补充证据切片。" },
                    { label: "信任", body: "公开档案把这些信号汇总成可读的信心。" },
                  ]
            }
          />
        </ExplainerShell>

        <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Reputation & credentials" : "信誉与凭证"}</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {(agent.credentials ?? []).map((credential) => (
              <article key={credential.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-copper-700">
                  <span>{credential.type}</span>
                  <span>{credential.verified ? (locale === "en" ? "verified" : "已验证") : locale === "en" ? "reported" : "已记录"}</span>
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-ink-950">{resolveText(credential.title, locale)}</h3>
                <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(credential.summary, locale)}</p>
                {credential.score ? (
                  <p className="mt-3 text-sm text-ink-500">
                    {locale === "en"
                      ? `Score ${credential.score}${credential.rank ? ` · Rank #${credential.rank}` : ""}`
                      : `得分 ${credential.score}${credential.rank ? ` · 排名 #${credential.rank}` : ""}`}
                  </p>
                ) : null}
                {credential.relatedUrl ? (
                  <a href={credential.relatedUrl} className="mt-4 inline-flex text-sm font-semibold text-ink-700 underline-offset-4 hover:underline">
                    {locale === "en" ? "Open evidence" : "查看证据"}
                  </a>
                ) : null}
              </article>
            ))}
          </div>
          <div className="mt-8 grid gap-4">
            {agent.reviews.map((review) => (
              <article key={review.id} className="rounded-[1.5rem] bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-3 text-sm text-ink-500">
                  <span>{review.company}</span>
                  <span>•</span>
                  <span>{review.role}</span>
                  <span>•</span>
                  <span>{review.rating}/5</span>
                </div>
                <h3 className="mt-4 text-2xl font-semibold text-ink-950">{resolveText(review.headline, locale)}</h3>
                <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(review.body, locale)}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Trading arena" : "交易竞技场"}</h2>
          <p className="mt-3 max-w-[64ch] text-lg leading-8 text-ink-700">
            {locale === "en"
              ? "Arena data sits beside benchmark credentials: normalized runtime configs, active competition entries, proof-mode-separated runs, and report artifacts."
              : "竞技场数据与 benchmark 凭证并列展示：归一化运行时配置、活跃报名、按 proof mode 分层的 runs，以及报告工件。"}
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {(agent.arena?.leaderboard ?? []).map((entry) => (
              <article key={entry.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-copper-700">
                  #{entry.rank} · {entry.proofMode} · {entry.liveStatus}
                </div>
                <div className="mt-3 text-2xl font-semibold text-ink-950">{entry.totalScore}</div>
                <p className="mt-2 text-sm text-ink-700">
                  {locale === "en" ? "Return" : "收益"} {entry.netReturnPct}% · {locale === "en" ? "Drawdown" : "回撤"} {entry.maxDrawdownPct}%
                </p>
              </article>
            ))}
            {(agent.arena?.reports ?? []).map((report) => (
              <article key={report.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-copper-700">{report.kind}</div>
                <h3 className="mt-3 text-2xl font-semibold text-ink-950">{resolveText(report.title, locale)}</h3>
                <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(report.summary, locale)}</p>
                <a href={`/reports/${report.id}`} className="mt-4 inline-flex text-sm font-semibold text-ink-700 underline-offset-4 hover:underline">
                  {locale === "en" ? "Open report" : "查看报告"}
                </a>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Verified benchmark evidence" : "已验证 benchmark 证据"}</h2>
          <p className="mt-3 max-w-[64ch] text-lg leading-8 text-ink-700">
            {locale === "en"
              ? "These runs are not just scores. They carry execution identity, bundle hash, and verification state so buyers can understand why a credential should be trusted."
              : "这些 run 不只是分数，还带有执行器身份、bundle hash 和验签状态，方便买方判断凭证为什么值得信任。"}
          </p>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {verifiedRuns.length > 0 ? (
              verifiedRuns.map((run) => (
                <article key={run.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-copper-700">
                    <span>{run.suiteSlug}</span>
                    <span>{run.verification?.status ?? "verified"}</span>
                    <span>{run.execution?.executorId ?? "seeded"}</span>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm leading-7 text-ink-700">
                    <div>{locale === "en" ? "Overall" : "综合分"}: {run.scorecard.overall}</div>
                    <div>{locale === "en" ? "Bundle hash" : "Bundle Hash"}: <span className="anywhere">{run.bundleHash}</span></div>
                    <div>{locale === "en" ? "Execution ref" : "执行引用"}: <span className="anywhere">{run.execution?.executionRef ?? run.id}</span></div>
                    <div>{locale === "en" ? "Replay ref" : "重放引用"}: <span className="anywhere">{run.execution?.replayRef ?? "--"}</span></div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <a href={run.transcriptUrl} className="text-sm font-semibold text-ink-700 underline-offset-4 hover:underline">
                      {locale === "en" ? "Transcript" : "Transcript"}
                    </a>
                    <a href={run.toolTraceUrl} className="text-sm font-semibold text-ink-700 underline-offset-4 hover:underline">
                      {locale === "en" ? "Tool trace" : "Tool Trace"}
                    </a>
                    {run.htmlArtifactUrl ? (
                      <a href={run.htmlArtifactUrl} className="text-sm font-semibold text-ink-700 underline-offset-4 hover:underline">
                        {locale === "en" ? "HTML artifact" : "HTML 工件"}
                      </a>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.5rem] bg-parchment-deep p-5 text-base leading-8 text-ink-700">
                {locale === "en" ? "No verified benchmark evidence yet." : "还没有已验证 benchmark 证据。"}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Featured work" : "代表作品"}</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {(agent.featuredWork ?? []).map((work) => (
              <article key={work.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <h3 className="text-2xl font-semibold text-ink-950">{resolveText(work.title, locale)}</h3>
                <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(work.summary, locale)}</p>
                {work.artifactUrl ? (
                  <a href={work.artifactUrl} className="mt-4 inline-flex text-sm font-semibold text-ink-700 underline-offset-4 hover:underline">
                    {locale === "en" ? "Open artifact" : "查看工件"}
                  </a>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Network" : "关系网络"}</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {(agent.network?.edges ?? []).map((edge) => (
              <article key={edge.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                <div className="text-xs uppercase tracking-[0.18em] text-copper-700">{edge.type}</div>
                <p className="mt-3 text-base leading-8 text-ink-700">
                  {locale === "en"
                    ? `${edge.fromType}:${edge.fromId} → ${edge.toType}:${edge.toId}`
                    : `${edge.fromType}:${edge.fromId} → ${edge.toType}:${edge.toId}`}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Permission boundary" : "权限边界"}</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[1.5rem] bg-parchment-deep p-5">
              <h3 className="text-xl font-semibold text-ink-950">{locale === "en" ? "Declared scope" : "声明范围"}</h3>
              <p className="mt-3 text-base leading-8 text-ink-700">{resolveText(agent.permissionManifest.summary, locale)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {agent.permissionManifest.skills.map((skill) => (
                  <span key={skill} className="rounded-full border border-ink-950/10 bg-white px-3 py-1 text-sm text-ink-700 anywhere">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-[1.5rem] bg-parchment-deep p-5">
              <h3 className="text-xl font-semibold text-ink-950">{locale === "en" ? "Access model" : "访问模型"}</h3>
              <ul className="mt-3 space-y-2 text-base leading-8 text-ink-700">
                <li>{locale === "en" ? `Risk: ${agent.permissionManifest.riskLevel}` : `风险：${agent.permissionManifest.riskLevel}`}</li>
                <li>{locale === "en" ? `Network: ${agent.permissionManifest.networkAccess.join(", ")}` : `网络：${agent.permissionManifest.networkAccess.join(", ")}`}</li>
                <li>{locale === "en" ? `Files: ${agent.permissionManifest.fileAccess.join(", ")}` : `文件：${agent.permissionManifest.fileAccess.join(", ")}`}</li>
                <li>{locale === "en" ? `Secrets: ${agent.permissionManifest.secrets.join(", ")}` : `密钥：${agent.permissionManifest.secrets.join(", ")}`}</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7">
          <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Known limits" : "已知限制"}</h2>
          <ul className="mt-6 grid gap-4 lg:grid-cols-2">
            {agent.knownLimits.map((limit) => (
              <li key={limit.en} className="rounded-[1.5rem] bg-parchment-deep p-5 text-base leading-8 text-ink-700">
                {resolveText(limit, locale)}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <aside className="xl:sticky xl:top-28 xl:self-start">
        <div className="rounded-[2rem] border border-ink-950/8 bg-white/88 p-6">
          <h2 className="font-display text-3xl text-ink-950">{locale === "en" ? "Trust summary" : "信任摘要"}</h2>
          <div className="mt-6 space-y-5 text-sm leading-7 text-ink-700">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Trust tier" : "信任等级"}</p>
              <p className="mt-2 text-xl font-semibold text-ink-950">{agent.trust?.tier}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Completeness checks" : "完整度检查"}</p>
              <ul className="mt-2 space-y-2">
                {(agent.trust?.checks ?? []).map((check) => (
                  <li key={check.id}>
                    {check.complete ? "●" : "○"} {resolveText(check.label, locale)}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink-500">{locale === "en" ? "Install" : "安装"}</p>
              <p className="mt-2 anywhere rounded-2xl bg-parchment-deep px-4 py-3">{agent.source.installCommand}</p>
            </div>
          </div>
        </div>
      </aside>
    </main>
  );
}
