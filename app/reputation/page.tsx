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
              <Chip tone="trust">Average rating {model.reputationSummary?.averageRating ?? agent.scoreSummary.averageRating}</Chip>
              <Chip>Reviews {model.reputationSummary?.reviewCount ?? agent.orderHistory.completed}</Chip>
              <Chip tone="warning">Dispute {Math.round((model.reputationSummary?.disputeRate ?? agent.scoreSummary.disputeRate) * 100)}%</Chip>
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
        <SectionCard title="Rating provenance ledger" subtitle="Each rating row shows the order, subject, version, category, outcome, and published status behind the score.">
          <DataTable
            columns={[
              { key: "reputationEventId", label: "Reputation event" },
              { key: "sourceOrderId", label: "Source order" },
              { key: "subjectType", label: "Subject" },
              { key: "agentVersion", label: "Version" },
              { key: "categories", label: "Categories" },
              { key: "deliveryOutcome", label: "Outcome" },
              { key: "eventStatus", label: "Status" }
            ]}
            rows={model.provenanceRows}
          />
        </SectionCard>
      </div>
    </AppShell>
  );
}
