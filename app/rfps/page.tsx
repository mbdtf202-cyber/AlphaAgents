export const dynamic = "force-dynamic";

import { AppShell } from "../../components/alphaagents/shell";
import { CommandPreview, DataTable, SectionCard } from "../../components/alphaagents/blocks";
import { RuntimeCommandConsole } from "../../components/alphaagents/runtime-command-console";
import { getRuntimeSnapshot } from "../../lib/alphaagents/runtime-queries";
import { getRfpsModel } from "../../lib/alphaagents/view-models";

export default function RfpsPage() {
  const model = getRfpsModel();
  const runtimeSnapshot = getRuntimeSnapshot();

  return (
    <AppShell shell={model.shell} currentPath="/rfps">
      <div className="aa-grid">
        <SectionCard title="RFP and Proposal Workspace" subtitle="Buyer demand, seller proposal, proposal acceptance, and order creation stay visible before funds or execution move.">
          <CommandPreview command={model.commandPreview} />
        </SectionCard>
        <div className="aa-grid aa-grid-2">
          <SectionCard title="Runtime RFPs" subtitle="Live RFP state from the shared command control plane.">
            {model.runtimeRfps.length === 0 ? (
              <p className="aa-meta">No runtime RFPs yet. Use the command console or CLI to create and publish one.</p>
            ) : (
              <DataTable
                columns={[
                  { key: "id", label: "RFP" },
                  { key: "rfpStatus", label: "Status" },
                  { key: "category", label: "Category" },
                  { key: "version", label: "Version" }
                ]}
                rows={model.runtimeRfps}
              />
            )}
          </SectionCard>
          <SectionCard title="Runtime proposals" subtitle="Proposal status must remain tied to seller, AgentPassport, category, price, scope, and evidence standard.">
            {model.runtimeProposals.length === 0 ? (
              <p className="aa-meta">No runtime proposals yet. Publish an RFP, then submit a seller proposal.</p>
            ) : (
              <DataTable
                columns={[
                  { key: "id", label: "Proposal" },
                  { key: "rfpId", label: "RFP" },
                  { key: "proposalStatus", label: "Status" },
                  { key: "priceAmountMinor", label: "Price" }
                ]}
                rows={model.runtimeProposals.map((proposal: { priceAmountMinor?: number }) => ({
                  ...proposal,
                  priceAmountMinor: proposal.priceAmountMinor ? `¥${(proposal.priceAmountMinor / 100).toLocaleString("en-US")}` : "-"
                }))}
              />
            )}
          </SectionCard>
        </div>
        <SectionCard title="Sandbox RFP evidence paths" tone="warning" subtitle="Samples are marked sandbox/sample evidence and do not claim validated customer proof.">
          <DataTable
            columns={[
              { key: "packageId", label: "Package" },
              { key: "rfpId", label: "RFP" },
              { key: "rfpStatus", label: "RFP status" },
              { key: "proposalId", label: "Proposal" },
              { key: "proposalStatus", label: "Proposal status" }
            ]}
            rows={model.sampleRfps}
          />
        </SectionCard>
        <RuntimeCommandConsole mode="quick-order" initialSnapshot={runtimeSnapshot} />
      </div>
    </AppShell>
  );
}
