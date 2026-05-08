export const dynamic = "force-dynamic";

import { AppShell } from "../../components/alphaagents/shell";
import { Chip, CommandPreview, DataTable, SectionCard } from "../../components/alphaagents/blocks";
import { RuntimeCommandConsole } from "../../components/alphaagents/runtime-command-console";
import { getRiskFinanceModel } from "../../lib/alphaagents/view-models";
import { getRuntimeSnapshot } from "../../lib/alphaagents/runtime-queries";

export default function RiskFinancePage() {
  const model = getRiskFinanceModel();
  const runtimeSnapshot = getRuntimeSnapshot();
  return (
    <AppShell shell={model.shell} currentPath="/risk-finance">
      <div className="aa-grid">
        <div className="aa-grid aa-grid-2">
          <SectionCard title="Risk and permission policy" subtitle="High-risk tools remain denied in the default lane.">
            {model.security.runtimeToolPolicy.denied.map((tool) => (
              <Chip key={tool} tone="danger">
                {tool}
              </Chip>
            ))}
            <CommandPreview command="alphaagents dispute resolve --json" />
          </SectionCard>
          <SectionCard title="Finance sample states" tone="trust" subtitle="Buyer-facing wording stays conditional release, not licensed clearing.">
            <DataTable
              columns={[
                { key: "packageId", label: "Package" },
                { key: "orderId", label: "Order" },
                { key: "paymentLanguage", label: "Buyer language" },
                { key: "ledgerStatus", label: "Ledger" }
              ]}
              rows={model.sampleOrders}
            />
          </SectionCard>
        </div>
        <div className="aa-grid aa-grid-2">
          <SectionCard title="Live runtime orders" subtitle="Shared runtime ledger and acceptance state for current orders.">
            {model.runtimeOrders.length === 0 ? (
              <p className="aa-meta">No live runtime orders yet. Advance a Quick Order first, then return here for finance actions.</p>
            ) : (
              <DataTable
                columns={[
                  { key: "id", label: "Order" },
                  { key: "orderStatus", label: "Order status" },
                  { key: "ledgerStatus", label: "Ledger" },
                  { key: "acceptanceStatus", label: "Acceptance" }
                ]}
                rows={model.runtimeOrders}
              />
            )}
          </SectionCard>
          <SectionCard title="Live grants and finance events" subtitle="Permission and ledger transitions stay readable before any release or refund.">
            <DataTable
              columns={[
                { key: "id", label: "Grant" },
                { key: "grantStatus", label: "Grant status" },
                { key: "version", label: "Version" }
              ]}
              rows={model.runtimeGrants}
            />
            <div style={{ marginTop: 12 }}>
              {model.runtimeEvents.length === 0 ? (
                <p className="aa-meta">No live finance events yet.</p>
              ) : (
                <DataTable
                  columns={[
                    { key: "eventName", label: "Event" },
                    { key: "recordedAt", label: "Recorded at" }
                  ]}
                  rows={model.runtimeEvents}
                />
              )}
            </div>
          </SectionCard>
        </div>
        <RuntimeCommandConsole mode="risk-finance" initialSnapshot={runtimeSnapshot} />
      </div>
    </AppShell>
  );
}
