import { getCurrentLocale } from "../../../lib/locale";
import { getAdminData } from "../../../lib/server/repository";

export default async function AdminFlagsPage() {
  const locale = await getCurrentLocale();
  const admin = await getAdminData();

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
        <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Flagged profiles" : "被标记档案"}</h1>
        <div className="mt-6 grid gap-4">
          {admin.flaggedAgents.map((agent) => (
            <article key={agent.slug} className="rounded-[1.5rem] bg-parchment-deep p-5">
              <h2 className="text-2xl font-semibold text-ink-950">{agent.name}</h2>
              <p className="mt-3 text-base leading-8 text-ink-700">{locale === "en" ? agent.summary.en : agent.summary["zh-CN"]}</p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
