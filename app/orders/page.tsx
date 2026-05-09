export const dynamic = "force-dynamic";

import { AppShell } from "../../components/alphaagents/shell";
import { CommandPreview, DataTable, SectionCard } from "../../components/alphaagents/blocks";
import { RuntimeCommandConsole } from "../../components/alphaagents/runtime-command-console";
import { getRuntimeSnapshot } from "../../lib/alphaagents/runtime-queries";
import { getOrdersIndexModel } from "../../lib/alphaagents/view-models";

export default function OrdersPage() {
  const model = getOrdersIndexModel();
  const runtimeSnapshot = getRuntimeSnapshot();

  return (
    <AppShell shell={model.shell} currentPath="/orders">
      <div className="aa-grid">
        <SectionCard title="Orders and Acceptance" subtitle="Escrow, permission, execution, delivery, QA, acceptance, dispute, finance, and reputation are one buyer-readable workspace.">
          <CommandPreview command={model.commandPreview} />
        </SectionCard>
        <div className="aa-grid aa-grid-2">
          <SectionCard title="Live runtime orders" subtitle="Runtime orders are the current mutable state behind UI, CLI, API, and event log.">
            {model.runtimeOrders.length === 0 ? (
              <p className="aa-meta">No runtime orders yet. Accept a proposal and fund escrow to create the live order chain.</p>
            ) : (
              <DataTable
                columns={[
                  { key: "id", label: "Order" },
                  { key: "orderStatus", label: "Order" },
                  { key: "ledgerStatus", label: "Ledger" },
                  { key: "acceptanceStatus", label: "Acceptance" },
                  { key: "version", label: "Version" }
                ]}
                rows={model.runtimeOrders}
              />
            )}
          </SectionCard>
          <SectionCard title="Runtime artifacts" subtitle="A valid order must expose grants, execution runs, deliveries, and acceptance reviews.">
            <DataTable
              columns={[
                { key: "artifact", label: "Artifact" },
                { key: "count", label: "Count" }
              ]}
              rows={[
                { artifact: "RiskPermissionGrant", count: String(model.runtimeGrants.length) },
                { artifact: "ExecutionRun", count: String(model.runtimeRuns.length) },
                { artifact: "DeliveryPackage", count: String(model.runtimeDeliveries.length) },
                { artifact: "AcceptanceReview", count: String(model.runtimeReviews.length) }
              ]}
            />
          </SectionCard>
        </div>
        <SectionCard title="Sandbox order paths" tone="warning" subtitle="Accepted, revision, and dispute paths remain visible with finance and reputation references.">
          <DataTable
            columns={[
              { key: "packageId", label: "Package" },
              { key: "orderId", label: "Order" },
              { key: "orderStatus", label: "Order status" },
              { key: "ledgerStatus", label: "Ledger" },
              { key: "acceptanceStatus", label: "Acceptance" },
              { key: "reputationEventId", label: "Reputation event" }
            ]}
            rows={model.sampleOrders}
          />
        </SectionCard>
        <div className="aa-grid aa-grid-2">
          <SectionCard title="Runtime finance evidence" subtitle="Current orders expose payment, invoice, refund, and reconciliation fields from the same DTO.">
            {model.runtimeFinanceRows.length === 0 ? (
              <p className="aa-meta">No runtime finance rows yet.</p>
            ) : (
              <DataTable
                columns={[
                  { key: "orderId", label: "Order" },
                  { key: "paymentRef", label: "Payment" },
                  { key: "invoiceStatus", label: "Invoice" },
                  { key: "refundAmountMinor", label: "Refund" },
                  { key: "reconciliationExport", label: "Export" }
                ]}
                rows={model.runtimeFinanceRows}
              />
            )}
          </SectionCard>
          <SectionCard title="ROI retrospective" subtitle="Orders carry saved hours, usable output, costs, margin, and repurchase signal.">
            <DataTable
              columns={[
                { key: "packageId", label: "Package" },
                { key: "cycleTimeSavedHours", label: "Saved h" },
                { key: "usableResultRate", label: "Usable" },
                { key: "refundCostMinor", label: "Refund cost" },
                { key: "renewalSignal", label: "Renewal" }
              ]}
              rows={model.roiRows}
            />
          </SectionCard>
        </div>
        <RuntimeCommandConsole mode="order-workspace" initialSnapshot={runtimeSnapshot} />
      </div>
    </AppShell>
  );
}
