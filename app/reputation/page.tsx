import { AppShell } from "../../components/alphaagents/shell";
import { Chip, DataTable, SectionCard } from "../../components/alphaagents/blocks";
import { getReputationModel } from "../../lib/alphaagents/view-models";

export default function ReputationPage() {
  const model = getReputationModel();
  const agent = model.primaryAgent;
  return (
    <AppShell shell={model.shell} currentPath="/reputation">
      <div className="aa-grid aa-grid-2">
        {agent ? (
          <SectionCard title={agent.name} subtitle="Reputation stays bound to the Agent, version, and transaction outcome.">
            <div>
              <Chip tone="trust">Average rating {agent.scoreSummary.averageRating}</Chip>
              <Chip>On-time {Math.round(agent.scoreSummary.onTimeRate * 100)}%</Chip>
              <Chip tone="warning">Dispute {Math.round(agent.scoreSummary.disputeRate * 100)}%</Chip>
            </div>
          </SectionCard>
        ) : null}
        <SectionCard title="Visible outcome history" subtitle="Accepted, partially released, and refunded results all stay visible.">
          <DataTable
            columns={[
              { key: "outcome", label: "Outcome" },
              { key: "proof", label: "Proof status" },
              { key: "note", label: "Signal" }
            ]}
            rows={model.summaries}
          />
        </SectionCard>
      </div>
    </AppShell>
  );
}
