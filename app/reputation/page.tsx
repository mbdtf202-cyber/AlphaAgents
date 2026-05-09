import { AppShell } from "../../components/alphaagents/shell";
import { Chip, CliApiEventsPanel, DataTable, SectionCard } from "../../components/alphaagents/blocks";
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
        <SectionCard title="ROI and repurchase signal" subtitle="Reputation cannot rely on score alone; every rating is interpreted with saved time, usable output, refund cost, and renewal signal.">
          <DataTable
            columns={[
              { key: "orderId", label: "Order" },
              { key: "cycleTimeSavedHours", label: "Saved h" },
              { key: "usableResultRate", label: "Usable" },
              { key: "refundCostMinor", label: "Refund cost" },
              { key: "repurchaseSignal", label: "Repurchase" }
            ]}
            rows={model.roiRows}
          />
        </SectionCard>
        <CliApiEventsPanel
          a19Id="A-19-REPUTATION"
          subject="Reputation publication, source-order proof, and buyer-visible ROI"
          commands={["alphaagents reputation show --json", "alphaagents rating submit --json"]}
          apiRoutes={[
            { method: "GET", path: "/api/reputation", purpose: "Read reputation summary, source-order provenance, ROI, disputes, and publication state." },
            { method: "POST", path: "/api/commands", purpose: "Submit ratings and publish ReputationEvent records after acceptance and anti-self-rating gates." }
          ]}
          events={["ReputationEventCreated", "ReputationPublished"]}
          dtoRefs={["ReputationSummary", "ReputationEvent", "RoiRetrospective"]}
        />
      </div>
    </AppShell>
  );
}
