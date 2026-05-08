import { AppShell } from "../../components/alphaagents/shell";
import { Chip, CommandPreview, DataTable, KpiStrip, SectionCard } from "../../components/alphaagents/blocks";
import { getWorkbenchModel } from "../../lib/alphaagents/view-models";

export default function WorkbenchPage() {
  const model = getWorkbenchModel();
  return (
    <AppShell shell={model.shell} currentPath="/workbench">
      <div className="aa-grid">
        <KpiStrip items={model.kpis} />
        <SectionCard title="Category strip" subtitle="Categories stay in the first viewport.">
          {model.categories.map((category) => (
            <Chip key={category.categoryId}>{category.name["zh-CN"]}</Chip>
          ))}
        </SectionCard>
        <div className="aa-split">
          <SectionCard title="Active work table" subtitle="Orders, projects, and subscriptions stay ahead of logs.">
            <DataTable
              columns={[
                { key: "orderId", label: "Order" },
                { key: "orderStatus", label: "Status" },
                { key: "amountMinor", label: "Amount" },
                { key: "nextAction", label: "Next action" },
                { key: "badge", label: "Proof" }
              ]}
              rows={model.activeOrders.map((order) => ({
                orderId: order.orderId,
                orderStatus: order.orderStatus,
                amountMinor: `¥${(order.amountMinor / 100).toLocaleString("en-US")}`,
                nextAction: order.nextAction,
                badge: order.badge
              }))}
            />
          </SectionCard>
          <SectionCard title="Conditional release trust rail" tone="trust" subtitle="Buyer-facing finance language stays explicit.">
            {model.trustRail.map((item) => (
              <Chip key={item} tone="trust">
                {item}
              </Chip>
            ))}
            <CommandPreview command="alphaagents evidence show --order AA-ORD-1061 --json" mismatch />
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
