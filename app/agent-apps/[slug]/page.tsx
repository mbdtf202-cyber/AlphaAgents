export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";

import { AppShell } from "../../../components/alphaagents/shell";
import { Chip, CommandPreview, DataTable, SectionCard } from "../../../components/alphaagents/blocks";
import { RuntimeCommandConsole } from "../../../components/alphaagents/runtime-command-console";
import { getAgentAppDetailModel } from "../../../lib/alphaagents/view-models";
import { getRuntimeSnapshot } from "../../../lib/alphaagents/runtime-queries";

export default async function AgentAppDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const model = getAgentAppDetailModel(slug);
  if (!model) notFound();
  const runtimeSnapshot = getRuntimeSnapshot();

  return (
    <AppShell shell={model.shell} currentPath="/agent-apps">
      <div className="aa-grid aa-grid-2">
        <SectionCard title={model.app.name} subtitle={`${model.app.legalEntity} / Agent App detail`}>
          <div>
            <Chip>agent_app</Chip>
            <Chip tone="trust">AaaS delivery unit</Chip>
            <Chip tone="warning">No bypass of payment, evidence, or acceptance</Chip>
          </div>
          <p className="aa-meta">{model.app.installBoundary}</p>
          <div style={{ marginTop: 12 }}>
            <Chip tone="trust">Owner: {model.ownerAgent?.name ?? model.app.ownerAgentId}</Chip>
            <Chip tone="trust">Pricing: {model.app.pricingModes.join(", ")}</Chip>
            <Chip tone="warning">Exit paths: {model.app.exitMechanisms.length}</Chip>
          </div>
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
        <SectionCard title="Performance and purchase context" subtitle="Agent App detail keeps order history, rating source, and buying modes above the fold.">
          <DataTable
            columns={[
              { key: "label", label: "Field" },
              { key: "value", label: "Value" }
            ]}
            rows={[
              { label: "Average rating", value: model.scoreSummary ? String(model.scoreSummary.averageRating) : "n/a" },
              { label: "QA pass rate", value: model.scoreSummary ? `${Math.round(model.scoreSummary.qaPassRate * 100)}%` : "n/a" },
              { label: "Dispute rate", value: model.scoreSummary ? `${Math.round(model.scoreSummary.disputeRate * 100)}%` : "n/a" },
              { label: "Completed orders", value: model.orderHistory ? String(model.orderHistory.completed) : "n/a" },
              { label: "Supported buying modes", value: model.app.pricingModes.join(", ") }
            ]}
          />
        </SectionCard>
        <SectionCard title="Delivery, usage, and acceptance preview" subtitle="Agent App detail must show what a buyer receives, what runtime proof is emitted, and how acceptance is judged.">
          <DataTable
            columns={[
              { key: "label", label: "Preview" },
              { key: "value", label: "Value" }
            ]}
            rows={[
              { label: "Sample package", value: model.sampleEvidence.packageId },
              { label: "Acceptance proof types", value: model.app.acceptanceProof.join(", ") },
              { label: "Runtime evidence outcome", value: model.sampleEvidence.ledger.ledgerStatus },
              { label: "Acceptance result", value: model.sampleEvidence.snapshot.ui.orderDto.acceptanceStatus },
              { label: "Procurement safety", value: "sample_only + sandbox_verified" }
            ]}
          />
          <CommandPreview command={"alphaagents evidence show --json\nalphaagents rating submit --json"} />
        </SectionCard>
        <SectionCard title="Install, usage, and exit proof" subtitle="Agent App subscription still emits live install, usage evidence, and exit records.">
          <DataTable
            columns={[
              { key: "metric", label: "Metric" },
              { key: "value", label: "Value" }
            ]}
            rows={[
              { metric: "Active installs", value: String(model.activeInstallCount) },
              { metric: "Latest install status", value: model.latestInstall?.installStatus ?? "none" },
              { metric: "Usage proof runs", value: String(model.runtimeUsageRuns.length) },
              { metric: "Exit mechanism count", value: String(model.app.exitMechanisms.length) }
            ]}
          />
          {model.runtimeInstalls.length === 0 ? (
            <p className="aa-meta">No live app installs yet. Use the runtime control plane to create install, usage, and exit proof.</p>
          ) : (
            <DataTable
              columns={[
                { key: "id", label: "Install" },
                { key: "usageMode", label: "Usage mode" },
                { key: "installStatus", label: "Status" },
                { key: "version", label: "Version" }
              ]}
              rows={model.runtimeInstalls}
            />
          )}
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
        <SectionCard title="Permissions, deployment, and rollback boundaries" subtitle="App purchase review must include runtime callbacks, exit paths, and blocked authority boundaries.">
          <DataTable
            columns={[
              { key: "label", label: "Boundary" },
              { key: "value", label: "Value" }
            ]}
            rows={[
              { label: "Runtime callbacks", value: Object.values(model.app.runtimeCallbacks).join(", ") },
              { label: "Exit mechanisms", value: model.app.exitMechanisms.join(", ") },
              { label: "Responsibility chain", value: model.app.responsibilityChain.join(", ") },
              { label: "Blocked by platform rules", value: "payment bypass, acceptance bypass, evidence bypass" },
              { label: "Deployment path", value: "platform-governed App run with exportable evidence" }
            ]}
          />
        </SectionCard>
        <RuntimeCommandConsole mode="agent-app" initialSnapshot={runtimeSnapshot} />
      </div>
    </AppShell>
  );
}
