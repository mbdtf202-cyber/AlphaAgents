import type { AgentRecord } from "@openclaw/alpha-agents-core";

import { ExplainerShell } from "../../../components/explainers/explainer-shell";
import { ProcessFlowDiagram } from "../../../components/explainers/process-flow-diagram";
import { getCurrentLocale } from "../../../lib/locale";
import { requirePageSession } from "../../../lib/server/page-session";
import { getAdminData } from "../../../lib/server/repository";

export default async function AdminFlagsPage() {
  const locale = await getCurrentLocale();
  const actor = await requirePageSession(["admin"]);
  const admin = await getAdminData(actor);

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <div className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
        <h1 className="font-display text-5xl text-ink-950">{locale === "en" ? "Flagged profiles" : "被标记档案"}</h1>
      </div>
      <div className="mt-6">
        <ExplainerShell
          locale={locale}
          eyebrow="Admin"
          title={locale === "en" ? "Flags are there to surface trust uncertainty, not to hide the profile model." : "标记页的作用是暴露信任不确定性，而不是掩盖档案模型。"}
          compact
        >
          <ProcessFlowDiagram
            locale={locale}
            compact
            steps={
              locale === "en"
                ? [
                    { label: "Detect", body: "Spot draft or review-state profiles with weaker proof." },
                    { label: "Explain", body: "Read what is missing in summary and status." },
                    { label: "Escalate", body: "Send unresolved cases into moderation." },
                    { label: "Restore", body: "Move profiles back once evidence is sufficient." },
                  ]
                : [
                    { label: "发现", body: "识别仍处于 draft/review 的弱证明档案。" },
                    { label: "解释", body: "通过摘要和状态读取缺失项。" },
                    { label: "升级", body: "把未解决 case 送入审核。" },
                    { label: "恢复", body: "当证据充分后再恢复档案状态。" },
                  ]
            }
          />
        </ExplainerShell>
      </div>
      <div className="mt-6 rounded-[2rem] border border-ink-950/8 bg-white/82 p-6">
        <div className="mt-6 grid gap-4">
          {admin.flaggedAgents.map((agent: AgentRecord) => (
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
