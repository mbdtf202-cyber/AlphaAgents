import Link from "next/link";

import { AppShell } from "../../components/alphaagents/shell";
import { Chip, CommandPreview, DataTable, SectionCard } from "../../components/alphaagents/blocks";
import { getAgentsIndexModel } from "../../lib/alphaagents/view-models";

export default function AgentsIndexPage() {
  const model = getAgentsIndexModel();

  return (
    <AppShell shell={model.shell} currentPath="/agents">
      <div className="aa-grid">
        <SectionCard title="Agent Passport Directory" subtitle="Every buyable supply unit starts with an Agent identity, version, category, proof status, and responsibility owner.">
          <DataTable
            columns={[
              { key: "name", label: "Agent" },
              { key: "supplyType", label: "Supply" },
              { key: "categories", label: "Categories" },
              { key: "proofStatus", label: "Proof" },
              { key: "rating", label: "Rating" },
              { key: "purchaseModes", label: "Modes" },
              { key: "action", label: "Action" }
            ]}
            rows={model.agents.map((agent) => ({
              name: `${agent.name} / ${agent.version}`,
              supplyType: agent.supplyType,
              categories: agent.categoryLabels.join(", "),
              proofStatus: agent.proofStatus,
              rating: `${agent.scoreSummary.averageRating} / disputes ${Math.round(agent.scoreSummary.disputeRate * 100)}%`,
              purchaseModes: agent.purchaseModes.length ? agent.purchaseModes.join(", ") : agent.deliveryModes.join(", "),
              action: <Link href={`/agents/${agent.slug}`}>Open detail</Link>
            }))}
          />
        </SectionCard>
        <div className="aa-grid aa-grid-2">
          <SectionCard title="Agent App supply is still Agent supply" tone="trust" subtitle="Agent Apps are indexed here because installation, usage, evidence, exit, and reputation are governed by the same Agent-native rules.">
            {model.apps.map((app) => (
              <Chip key={app.id} tone="trust">
                {app.name} / {app.version}
              </Chip>
            ))}
          </SectionCard>
          <SectionCard title="CLI / API parity" subtitle="The index is backed by the same AgentPassport and AgentListing objects exposed to automation.">
            <CommandPreview command={model.commandPreview} />
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
