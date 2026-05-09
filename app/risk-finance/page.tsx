export const dynamic = "force-dynamic";

import { AppShell } from "../../components/alphaagents/shell";
import { Chip, CliApiEventsPanel, CommandPreview, DataTable, SectionCard } from "../../components/alphaagents/blocks";
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
          <SectionCard title="High-risk action preview" tone="warning" subtitle="S-02 / UI-28: risky tools need explicit authorization, preview fields, audit events, and a visible revoke path before execution.">
            <div>
              {model.highRiskPermissionPreview.previewFields.map((field) => (
                <Chip key={field}>{field}</Chip>
              ))}
            </div>
            <CommandPreview command={model.highRiskPermissionPreview.revokeCommand} />
            <p className="aa-meta">{model.highRiskPermissionPreview.blockedUntil}</p>
          </SectionCard>
          <SectionCard title="Finance sample states" tone="trust" subtitle="Buyer-facing wording stays conditional release, not licensed clearing.">
            <DataTable
              columns={[
                { key: "packageId", label: "Package" },
                { key: "orderId", label: "Order" },
                { key: "paymentLanguage", label: "Buyer language" },
                { key: "ledgerStatus", label: "Ledger" },
                { key: "paymentRef", label: "Payment ref" },
                { key: "invoiceStatus", label: "Invoice" },
                { key: "reconciliationStatus", label: "Reconciliation" }
              ]}
              rows={model.sampleOrders}
            />
          </SectionCard>
        </div>
        <SectionCard title="Authorization / preview / audit / revoke checklist" subtitle="Risk reviewers can verify each high-risk action without opening logs or guessing which CLI action matches the UI.">
          <DataTable
            columns={[
              { key: "label", label: "Gate" },
              { key: "gate", label: "Machine key" },
              { key: "command", label: "CLI" },
              { key: "evidence", label: "Evidence" }
            ]}
            rows={model.riskActionChecklist}
          />
        </SectionCard>
        <div className="aa-grid aa-grid-2">
          <SectionCard title="Seller admission controls" subtitle="Approved supply must hold admission score >= 80, payout readiness, and capacity before it can quote.">
            <DataTable
              columns={[
                { key: "legalEntity", label: "Seller" },
                { key: "admissionScore", label: "Score" },
                { key: "admissionStatus", label: "Admission" },
                { key: "gate", label: "Gate" },
                { key: "payoutReadiness", label: "Payout" },
                { key: "capacityAvailable", label: "Capacity" }
              ]}
              rows={model.sellerAdmissions}
            />
          </SectionCard>
          <SectionCard title="Category unit economics" subtitle="Finance can compare GMV, take rate, payout, QA minutes, CAC, dispute cost, and contribution margin by category.">
            <DataTable
              columns={[
                { key: "categoryLabel", label: "Category" },
                { key: "averageGmv", label: "Avg GMV" },
                { key: "takeRate", label: "Take rate" },
                { key: "providerPayout", label: "Payout" },
                { key: "qaOpsMinutes", label: "QA min" },
                { key: "cac", label: "CAC" },
                { key: "disputeCost", label: "Dispute" },
                { key: "contributionMargin", label: "Margin" }
              ]}
              rows={model.categoryUnitEconomics}
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
          <SectionCard title="Live runtime finance evidence" subtitle="Contracting entity, invoice issuer, payment refs, refunds, and reconciliation exports must stay visible to finance.">
            {model.runtimeFinanceRows.length === 0 ? (
              <p className="aa-meta">No live finance rows yet. Fund or close an order to create finance evidence.</p>
            ) : (
              <DataTable
                columns={[
                  { key: "orderId", label: "Order" },
                  { key: "paymentRef", label: "Payment ref" },
                  { key: "contractingEntity", label: "Contracting" },
                  { key: "invoiceIssuer", label: "Invoice issuer" },
                  { key: "invoiceStatus", label: "Invoice" },
                  { key: "refundAmountMinor", label: "Refund" },
                  { key: "reconciliationExport", label: "Export" }
                ]}
                rows={model.runtimeFinanceRows}
              />
            )}
          </SectionCard>
        </div>
        <div className="aa-grid aa-grid-2">
          <SectionCard title="Sample finance evidence" subtitle="Sandbox packages carry contract, invoice, refund, and reconciliation fields for B-06 / T-03 review.">
            <DataTable
              columns={[
                { key: "packageId", label: "Package" },
                { key: "contractingEntity", label: "Contracting" },
                { key: "collectionEntity", label: "Collection" },
                { key: "invoiceIssuer", label: "Invoice issuer" },
                { key: "refundRemitter", label: "Refund remitter" },
                { key: "reconciliationExport", label: "Export" }
              ]}
              rows={model.financeEvidenceRows}
            />
          </SectionCard>
          <SectionCard title="ROI retrospectives" subtitle="Every sample order records saved cycle time, usable results, costs, and renewal signal.">
            <DataTable
              columns={[
                { key: "packageId", label: "Package" },
                { key: "cycleTimeSavedHours", label: "Saved hours" },
                { key: "usableResultRate", label: "Usable" },
                { key: "acceptanceScore", label: "Score" },
                { key: "contributionMarginEstimate", label: "Margin" },
                { key: "repurchaseSignal", label: "Repurchase" }
              ]}
              rows={model.roiRows}
            />
          </SectionCard>
        </div>
        <div className="aa-grid aa-grid-2">
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
        <CliApiEventsPanel
          a19Id="A-19-RISK-FINANCE"
          subject="Permission control, dispute resolution, finance evidence, and ledger events"
          commands={["alphaagents permission approve --json", "alphaagents dispute resolve --json"]}
          apiRoutes={[
            { method: "POST", path: "/api/commands", purpose: "Approve, deny, revoke permissions and resolve disputes with optimistic version gates." },
            { method: "GET", path: "/api/runtime-state", purpose: "Read grants, runtime orders, ledger, finance rows, and emitted events after each action." }
          ]}
          events={["PermissionApproved", "PermissionDenied", "PermissionRevoked", "DisputeResolved"]}
          dtoRefs={["PermissionGrant", "RuntimeOrder", "FinanceEvidence"]}
        />
        <RuntimeCommandConsole mode="risk-finance" initialSnapshot={runtimeSnapshot} />
      </div>
    </AppShell>
  );
}
