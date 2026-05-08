import { notFound } from "next/navigation";

import { AppShell } from "../../../components/alphaagents/shell";
import { Chip, CommandPreview, DataTable, SectionCard } from "../../../components/alphaagents/blocks";
import { getAgentAppDetailModel } from "../../../lib/alphaagents/view-models";

export default async function AgentAppDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = getAgentAppDetailModel(slug);
  if (!model) notFound();

  return (
    <AppShell shell={model.shell} currentPath="/provider-proof">
      <div className="aa-grid aa-grid-2">
        <SectionCard title={model.app.name} subtitle={`${model.app.legalEntity} / Agent App detail`}>
          <div>
            <Chip>agent_app</Chip>
            <Chip tone="trust">AaaS delivery unit</Chip>
            <Chip tone="warning">No bypass of payment, evidence, or acceptance</Chip>
          </div>
          <p className="aa-meta">{model.app.installBoundary}</p>
          <ul className="aa-list">
            {model.app.exitMechanisms.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Runtime and acceptance proof" subtitle="Agent App still emits the same run, delivery, and reputation chain.">
          <DataTable
            columns={[
              { key: "label", label: "Field" },
              { key: "value", label: "Value" }
            ]}
            rows={[
              { label: "Owner agent", value: model.ownerAgent?.name ?? model.app.ownerAgentId },
              { label: "Pricing modes", value: model.app.pricingModes.join(", ") },
              { label: "Runtime callbacks", value: Object.values(model.app.runtimeCallbacks).join(", ") },
              { label: "Acceptance proof", value: model.app.acceptanceProof.join(", ") },
              { label: "Responsibility chain", value: model.app.responsibilityChain.join(", ") }
            ]}
          />
          <CommandPreview command={"alphaagents run start --json\nalphaagents delivery submit --json\nalphaagents rating submit --json"} />
        </SectionCard>
        <SectionCard title="Related listings" subtitle="Agent App uses the same listing and transaction surfaces as any other supply type.">
          {model.relatedListings.length === 0 ? (
            <p className="aa-meta">No dedicated listing yet. The app still inherits the shared AaaS contract.</p>
          ) : (
            <DataTable
              columns={[
                { key: "listingId", label: "Listing" },
                { key: "billingMode", label: "Billing" },
                { key: "listingStatus", label: "Status" }
              ]}
              rows={model.relatedListings}
            />
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
