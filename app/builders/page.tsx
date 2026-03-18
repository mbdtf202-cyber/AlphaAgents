import { BuilderCard } from "../../components/builder-card";
import { ExplainerShell } from "../../components/explainers/explainer-shell";
import { ProcessFlowDiagram } from "../../components/explainers/process-flow-diagram";
import { SectionHeading } from "../../components/section-heading";
import { getCurrentLocale } from "../../lib/locale";
import { getBuildersDirectory } from "../../lib/server/repository";

export default async function BuildersPage() {
  const locale = await getCurrentLocale();
  const builders = await getBuildersDirectory();

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <SectionHeading
        locale={locale}
        eyebrow={locale === "en" ? "Builder directory" : "Builder 目录"}
        title={locale === "en" ? "The people and studios behind the most trusted OpenClaw agents." : "最值得信任的 OpenClaw Agent 背后的个人与团队。"}
        description={
          locale === "en"
            ? "Builder profiles act like public résumés: specialties, published agents, verified deployments, endorsements, credentials, and recent network-backed activity all form the signal."
            : "Builder 档案就像公开履历：专长、已发布 Agent、已验证部署、背书、凭证和近期关系化动态都构成信号的一部分。"
        }
      />
      <div className="mt-8">
        <ExplainerShell
          locale={locale}
          eyebrow={locale === "en" ? "Builder reading order" : "Builder 阅读顺序"}
          title={locale === "en" ? "Read builders as operators with history, not just as author names." : "把 Builder 看成有履历的操作者，而不只是作者名字。"}
          compact
        >
          <ProcessFlowDiagram
            locale={locale}
            compact
            steps={
              locale === "en"
                ? [
                    { label: "Specialty", body: "What kind of agent work is this builder strongest at?" },
                    { label: "Deployments", body: "How much real usage proof already exists?" },
                    { label: "Published agents", body: "Which profiles and credentials sit under this builder?" },
                    { label: "Network", body: "Do endorsements and adopters reinforce the trust case?" },
                  ]
                : [
                    { label: "专长", body: "这个 Builder 最强的是哪类 Agent 工作？" },
                    { label: "部署", body: "已经有多少真实使用证明？" },
                    { label: "已发布 Agent", body: "这个 Builder 旗下有哪些档案与凭证？" },
                    { label: "网络", body: "背书与采用方是否强化了可信度？" },
                  ]
            }
          />
        </ExplainerShell>
      </div>
      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        {builders.map((builder) => (
          <BuilderCard key={builder.id} builder={builder} locale={locale} />
        ))}
      </div>
    </main>
  );
}
