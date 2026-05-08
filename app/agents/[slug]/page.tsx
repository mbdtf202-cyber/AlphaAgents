import { notFound } from "next/navigation";

import { AppShell } from "../../../components/alphaagents/shell";
import { Chip, CommandPreview, DataTable, SectionCard } from "../../../components/alphaagents/blocks";
import { getAgentDetailModel } from "../../../lib/alphaagents/view-models";

export default async function AgentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = getAgentDetailModel(slug);
  if (!model) notFound();

  return (
    <AppShell shell={model.shell} currentPath="/provider-proof">
      <div className="aa-grid aa-grid-2">
        <SectionCard title={model.agent.name} subtitle={`${model.agent.legalEntity} / ${model.agent.humanOwner}`}>
          <div>
            <Chip>{model.agent.supplyType}</Chip>
            <Chip tone="trust">{model.agent.proofStatus}</Chip>
            <Chip tone="warning">{model.agent.riskLabel}</Chip>
          </div>
          <p className="aa-meta">{model.agent.narrative}</p>
          <ul className="aa-list">
            {model.agent.unsupportedScenarios.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Trust, purchase, and delivery record" subtitle="Identity, delivery modes, performance, and purchase options stay visible before deeper CLI detail.">
          <DataTable
            columns={[
              { key: "label", label: "Field" },
              { key: "value", label: "Value" }
            ]}
            rows={[
              { label: "Version", value: model.agent.version },
              { label: "Delivery modes", value: model.agent.deliveryModes.join(", ") },
              { label: "Average rating", value: String(model.agent.scoreSummary.averageRating) },
              { label: "QA pass rate", value: `${Math.round(model.agent.scoreSummary.qaPassRate * 100)}%` },
              { label: "Dispute rate", value: `${Math.round(model.agent.scoreSummary.disputeRate * 100)}%` },
              { label: "Completed orders", value: String(model.agent.orderHistory.completed) },
              { label: "Revisions", value: String(model.agent.orderHistory.revisions) }
            ]}
          />
        </SectionCard>
        <SectionCard title="Machine-readable manifest" subtitle="Capability claims are separated from verified delivery history.">
          <DataTable
            columns={[
              { key: "label", label: "Field" },
              { key: "value", label: "Value" }
            ]}
            rows={[
              { label: "Inputs", value: model.agent.machineManifest.inputSchema.join(", ") },
              { label: "Outputs", value: model.agent.machineManifest.outputSchema.join(", ") },
              { label: "Allowed tools", value: model.agent.machineManifest.tools.join(", ") },
              { label: "Blocked tools", value: model.agent.machineManifest.blockedTools.join(", ") }
            ]}
          />
          <CommandPreview command={model.agent.commandExamples.join("\n")} />
        </SectionCard>
        <SectionCard title="Purchase modes" subtitle="Agent detail must expose how this identity can actually be bought and delivered.">
          <DataTable
            columns={[
              { key: "title", label: "Offer" },
              { key: "billingMode", label: "Billing" },
              { key: "startingPriceMinor", label: "Start price" },
              { key: "deliveryHours", label: "SLA" },
              { key: "proofStatus", label: "Proof" }
            ]}
            rows={model.purchaseModes.map((mode) => ({
              ...mode,
              startingPriceMinor: `¥${(mode.startingPriceMinor / 100).toLocaleString("en-US")}`,
              deliveryHours: `${mode.deliveryHours}h`
            }))}
          />
          <CommandPreview command={"alphaagents reputation show --json\nalphaagents evidence show --json\nalphaagents agent-listing search --json"} />
        </SectionCard>
      </div>
    </AppShell>
  );
}
