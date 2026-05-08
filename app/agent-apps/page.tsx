export const dynamic = "force-dynamic";

import Link from "next/link";

import { AppShell } from "../../components/alphaagents/shell";
import { Chip, DataTable, SectionCard } from "../../components/alphaagents/blocks";
import { getAgentAppsIndexModel } from "../../lib/alphaagents/view-models";

export default function AgentAppsIndexPage() {
  const model = getAgentAppsIndexModel();

  return (
    <AppShell shell={model.shell} currentPath="/agent-apps">
      <div className="aa-grid">
        <SectionCard title="Agent Apps" subtitle="App-style Agent delivery units still stay inside identity, evidence, acceptance, and exit rules.">
          <DataTable
            columns={[
              { key: "title", label: "Agent App" },
              { key: "billingMode", label: "Billing" },
              { key: "proofStatus", label: "Proof" },
              { key: "capacityAvailable", label: "Capacity" },
              { key: "action", label: "Action" }
            ]}
            rows={model.apps.map((app) => ({
              title: app.title,
              billingMode: app.billingMode,
              proofStatus: app.proofStatus,
              capacityAvailable: String(app.capacityAvailable),
              action: <Link href={`/agent-apps/${app.slug}`}>Open detail</Link>
            }))}
          />
        </SectionCard>
        <SectionCard title="Runtime install and usage summary" subtitle="Subscription and usage still emit runtime proof instead of acting like a SaaS seat ledger.">
          <div>
            <Chip tone="trust">Installs: {model.runtimeInstalls.length}</Chip>
            <Chip tone="trust">Usage runs: {model.runtimeUsageRuns.length}</Chip>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
