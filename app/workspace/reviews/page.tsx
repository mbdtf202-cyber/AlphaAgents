import { InstallVerificationForm } from "../../../components/install-verification-form";
import { ReviewForm } from "../../../components/review-form";
import { WorkspaceShell } from "../../../components/workspace-shell";
import { getCurrentLocale } from "../../../lib/locale";
import { requirePageSession } from "../../../lib/server/page-session";
import { getCompareCandidates, getWorkspaceData } from "../../../lib/server/repository";

export default async function WorkspaceReviewsPage() {
  const locale = await getCurrentLocale();
  const actor = await requirePageSession(["buyer", "builder", "admin"]);
  const workspace = await getWorkspaceData(actor, locale);
  const publicAgents = await getCompareCandidates();
  const publicAgentLookup = new Map(publicAgents.map((agent) => [agent.slug, agent]));
  const installAgents = publicAgents.map((agent) => ({
    slug: agent.slug,
    name: agent.name,
    versions: agent.versions.map((version) => ({
      id: version.id,
      version: version.version,
      status: version.status,
    })),
  }));
  const reviewInstallOptions = workspace.verifiedInstalls.map((install) => ({
    id: install.id,
    agentSlug: install.agentSlug,
    versionId: install.versionId,
    label: `${
      publicAgentLookup.get(install.agentSlug)?.name ?? install.agentSlug
    } · ${
      publicAgentLookup.get(install.agentSlug)?.versions.find((version) => version.id === install.versionId)?.version ??
      install.versionId
    } · ${new Date(install.verifiedAt).toLocaleDateString(locale === "en" ? "en-US" : "zh-CN")}`,
  }));

  return (
    <main>
      <WorkspaceShell locale={locale} pathname="/workspace/reviews" actor={actor}>
        <div className="grid gap-6">
          <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
            <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Reputation" : "信誉"}</h1>
            <p className="mt-4 text-lg leading-8 text-ink-700">
              {locale === "en"
                ? "Only verified deployments can become public reputation entries. The form below preserves structured dimensions, not just a star rating."
                : "只有已验证部署才能进入公开信誉记录。下面的表单会保留结构化维度，而不是只保留星级。"}
            </p>
          </div>
          <InstallVerificationForm locale={locale} agents={installAgents} />
          <ReviewForm locale={locale} installs={reviewInstallOptions} />
          <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
            <h2 className="font-display text-4xl text-ink-950">{locale === "en" ? "Recent review highlights" : "近期评价摘要"}</h2>
            <div className="mt-6 grid gap-4">
              {workspace.reviewHighlights.map((review) => (
                <article key={review.id} className="rounded-[1.5rem] bg-parchment-deep p-5">
                  <p className="text-sm text-ink-500">{review.company}</p>
                  <p className="mt-3 text-xl font-semibold text-ink-950">{review.headlineText}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </WorkspaceShell>
    </main>
  );
}
