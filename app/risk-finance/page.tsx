import { AppShell } from "../../components/alphaagents/shell";
import { Chip, CommandPreview, DataTable, SectionCard } from "../../components/alphaagents/blocks";
import { getRiskFinanceModel } from "../../lib/alphaagents/view-models";

export default function RiskFinancePage() {
  const model = getRiskFinanceModel();
  return (
    <AppShell shell={model.shell} currentPath="/risk-finance">
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
    </AppShell>
  );
}
