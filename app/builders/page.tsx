import { BuilderCard } from "../../components/builder-card";
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
      <div className="mt-10 grid gap-6 xl:grid-cols-2">
        {builders.map((builder) => (
          <BuilderCard key={builder.id} builder={builder} locale={locale} />
        ))}
      </div>
    </main>
  );
}
