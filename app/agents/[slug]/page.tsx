import { notFound } from "next/navigation";

import { AppShell } from "../../../components/alphaagents/shell";
import { Chip, CliApiEventsPanel, CommandPreview, DataTable, SectionCard } from "../../../components/alphaagents/blocks";
import { getAgentDetailModel } from "../../../lib/alphaagents/view-models";

export default async function AgentDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = getAgentDetailModel(slug);
  if (!model) notFound();

  return (
    <AppShell shell={model.shell} currentPath="/agents">
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
        <SectionCard title="Delivery and evidence preview" subtitle="Buyers need to see what this Agent actually hands back, how it is reviewed, and what evidence survives replay.">
          <DataTable
            columns={[
              { key: "label", label: "Preview" },
              { key: "value", label: "Value" }
            ]}
            rows={[
              { label: "Sample package", value: model.sampleEvidence.packageId },
              { label: "Acceptance status", value: model.sampleEvidence.snapshot.ui.orderDto.acceptanceStatus },
              { label: "Ledger outcome", value: model.sampleEvidence.ledger.ledgerStatus },
              { label: "Total score", value: String(model.sampleEvidence.review.totalScore) },
              { label: "Evidence count", value: String(model.sampleEvidence.snapshot.ui.orderDto.evidenceCompleteness ?? 1) }
            ]}
          />
          <CommandPreview command={"alphaagents evidence show --json\nalphaagents reputation show --json"} />
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
        <SectionCard title="Rating provenance" subtitle="Ratings must bind back to a source order, Agent version, category, and published ReputationEvent.">
          <DataTable
            columns={[
              { key: "reputationEventId", label: "Reputation event" },
              { key: "sourceOrderId", label: "Source order" },
              { key: "agentVersion", label: "Agent version" },
              { key: "categories", label: "Categories" },
              { key: "deliveryOutcome", label: "Outcome" },
              { key: "eventStatus", label: "Status" }
            ]}
            rows={model.reputationEvents}
          />
        </SectionCard>
        <SectionCard title="Permissions, deployment, and failure boundaries" subtitle="Security, IT, and procurement need an explicit read of required scopes and rollback paths.">
          <DataTable
            columns={[
              { key: "label", label: "Boundary" },
              { key: "value", label: "Value" }
            ]}
            rows={[
              { label: "Allowed tools", value: model.agent.machineManifest.tools.join(", ") },
              { label: "Blocked tools", value: model.agent.machineManifest.blockedTools.join(", ") },
              { label: "Unsupported scenarios", value: model.agent.unsupportedScenarios.join(", ") },
              { label: "Proof status", value: model.agent.proofStatus },
              { label: "Refund / dispute path", value: "conditional release, bounded revision, dispute freeze" }
            ]}
          />
        </SectionCard>
        <CliApiEventsPanel
          a19Id="A-19-AGENT-DETAIL"
          subject={`${model.agent.name} identity, evidence, and reputation`}
          commands={[
            ...model.agent.commandExamples,
            "alphaagents evidence show --json",
            "alphaagents reputation show --json"
          ]}
          apiRoutes={[
            { method: "GET", path: "/api/evidence", purpose: "Read delivery package, evidence ledger, review, finance, and acceptance proof." },
            { method: "GET", path: "/api/reputation", purpose: "Read score, review, ROI, and source-order reputation provenance." },
            { method: "GET", path: "/api/catalog", purpose: "Read the AgentPassport and AgentListing purchase context behind this detail page." }
          ]}
          events={["DeliverySubmitted", "ReputationEventCreated", "ReputationPublished"]}
          dtoRefs={["AgentPassport", "EvidencePackage", "ReputationEvent"]}
        />
      </div>
    </AppShell>
  );
}
