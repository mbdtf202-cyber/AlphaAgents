export const dynamic = "force-dynamic";

import { AppShell } from "../../components/alphaagents/shell";
import { Chip, CommandPreview, DataTable, KpiStrip, SectionCard } from "../../components/alphaagents/blocks";
import { RuntimeCommandConsole } from "../../components/alphaagents/runtime-command-console";
import { getWorkbenchModel } from "../../lib/alphaagents/view-models";
import { getRuntimeSnapshot } from "../../lib/alphaagents/runtime-queries";

export default function WorkbenchPage() {
  const model = getWorkbenchModel();
  const runtimeSnapshot = getRuntimeSnapshot();
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
              rows={model.activeOrders.map((order: { orderId: string; orderStatus: string; amountMinor: number; nextAction: string; badge: string }) => ({
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
        <div className="aa-grid aa-grid-2">
          <SectionCard title="Buyer action queue" subtitle="Orders, acceptance, and finance next steps stay visible above logs.">
            {model.actionQueue.length === 0 ? (
              <p className="aa-meta">No live action queue yet. Start the trial intake flow to create shared runtime work.</p>
            ) : (
              <DataTable
                columns={[
                  { key: "objectId", label: "Order" },
                  { key: "orderStatus", label: "Order" },
                  { key: "acceptanceStatus", label: "Acceptance" },
                  { key: "nextAction", label: "Next action" }
                ]}
                rows={model.actionQueue}
              />
            )}
          </SectionCard>
          <SectionCard title="Agent App runs" subtitle="Workbench keeps App usage proof visible alongside orders and subscriptions.">
            {model.appRuns.length === 0 ? (
              <p className="aa-meta">No App usage proof yet. Install an Agent App and record usage to keep the AaaS loop visible.</p>
            ) : (
              <DataTable
                columns={[
                  { key: "id", label: "Run" },
                  { key: "appId", label: "App" },
                  { key: "usageStatus", label: "Usage status" }
                ]}
                rows={model.appRuns}
              />
            )}
          </SectionCard>
        </div>
        <RuntimeCommandConsole mode="quick-order" initialSnapshot={runtimeSnapshot} />
      </div>
    </AppShell>
  );
}
