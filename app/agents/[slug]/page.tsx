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
      </div>
    </AppShell>
  );
}
