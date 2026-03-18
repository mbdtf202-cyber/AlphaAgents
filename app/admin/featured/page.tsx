import { ExplainerShell } from "../../../components/explainers/explainer-shell";
import { FeatureSlotForm } from "../../../components/feature-slot-form";
import { ProcessFlowDiagram } from "../../../components/explainers/process-flow-diagram";
import { getCurrentLocale } from "../../../lib/locale";
import { requirePageSession } from "../../../lib/server/page-session";
import { getCompareCandidates, getHomepageData } from "../../../lib/server/repository";

export default async function AdminFeaturedPage() {
  const locale = await getCurrentLocale();
  await requirePageSession(["admin"]);
  const { featureSlots } = await getHomepageData();
  const agents = await getCompareCandidates();

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
        <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Featured slots" : "精选位"}</h1>
      </div>
      <div className="mt-6">
        <ExplainerShell
          locale={locale}
          eyebrow="Admin"
          title={locale === "en" ? "Featured placement should explain what the market should inspect first." : "精选位的作用是告诉市场先看什么。"}
          compact
        >
          <ProcessFlowDiagram
            locale={locale}
            compact
            steps={
              locale === "en"
                ? [
                    { label: "Choose", body: "Pick the profile or theme with the strongest current signal." },
                    { label: "Frame", body: "State why this slot matters right now." },
                    { label: "Route", body: "Push traffic toward the right dossier or credential view." },
                    { label: "Refresh", body: "Rotate placement as live evidence changes." },
                  ]
                : [
                    { label: "选择", body: "挑出当前信号最强的档案或主题。" },
                    { label: "框定", body: "说明为什么这个精选位此刻重要。" },
                    { label: "引导", body: "把流量导向正确的档案或凭证视图。" },
                    { label: "刷新", body: "随着 live 证据变化调整展示。" },
                  ]
            }
          />
        </ExplainerShell>
      </div>
      <div className="mt-6 rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {featureSlots.map((slot) => (
            <FeatureSlotForm key={slot.id} locale={locale} slot={slot} agents={agents} />
          ))}
        </div>
      </div>
    </main>
  );
}
