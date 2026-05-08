import { AppShell } from "../../components/alphaagents/shell";
import { Chip, DataTable, SectionCard } from "../../components/alphaagents/blocks";
import { RuntimeCommandConsole } from "../../components/alphaagents/runtime-command-console";
import { getOrderWorkspaceModel } from "../../lib/alphaagents/view-models";

export default function OrderWorkspacePage() {
  const model = getOrderWorkspaceModel();
  return (
    <AppShell shell={model.shell} currentPath="/order-workspace">
      <div className="aa-grid aa-grid-2">
        <SectionCard title="Execution, QA, acceptance, and dispute" subtitle="Order workspace reflects the same machine-readable path as CLI and API.">
          <ul className="aa-list">
            {model.timeline.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Sandbox order paths" tone="warning" subtitle="Accepted, revision, and dispute paths remain visible together.">
          <DataTable
            columns={[
              { key: "packageId", label: "Package" },
              { key: "id", label: "Order" },
              { key: "ledgerStatus", label: "Ledger" },
              { key: "acceptanceStatus", label: "Acceptance" },
              { key: "totalScore", label: "Score" }
            ]}
            rows={model.packages.map((entry) => ({
              packageId: entry.packageId,
              id: entry.snapshot.ui.orderDto.id,
              ledgerStatus: entry.ledger.ledgerStatus,
              acceptanceStatus: entry.snapshot.ui.orderDto.acceptanceStatus,
              totalScore: entry.review.totalScore
            }))}
          />
          <Chip tone="danger">Dispute freezes funds</Chip>
        </SectionCard>
        <SectionCard title="Runtime order state" subtitle="Live mutable order chain from the shared runtime engine.">
          {model.runtimeOrders.length === 0 ? (
            <p className="aa-meta">No runtime orders yet. Create one through the shared command control plane.</p>
          ) : (
            <DataTable
              columns={[
                { key: "id", label: "Order" },
                { key: "orderStatus", label: "Order status" },
                { key: "ledgerStatus", label: "Ledger" },
                { key: "acceptanceStatus", label: "Acceptance" },
                { key: "version", label: "Version" }
              ]}
              rows={model.runtimeOrders}
            />
          )}
        </SectionCard>
        <RuntimeCommandConsole mode="order-workspace" />
      </div>
    </AppShell>
  );
}
