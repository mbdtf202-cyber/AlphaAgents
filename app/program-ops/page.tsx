export const dynamic = "force-dynamic";

import { AppShell } from "../../components/alphaagents/shell";
import { Chip, DataTable, KpiStrip, SectionCard } from "../../components/alphaagents/blocks";
import { RuntimeCommandConsole } from "../../components/alphaagents/runtime-command-console";
import { getProgramOpsModel } from "../../lib/alphaagents/view-models";
import { getRuntimeSnapshot } from "../../lib/alphaagents/runtime-queries";

export default function ProgramOpsPage() {
  const model = getProgramOpsModel();
  const runtimeSnapshot = getRuntimeSnapshot();
  return (
    <AppShell shell={model.shell} currentPath="/program-ops">
      <div className="aa-grid">
        <KpiStrip
          items={[
            { label: "Backlog value", value: `¥${(model.program.backlogValueMinor / 100).toLocaleString("en-US")}` },
            { label: "Active credits", value: `¥${(model.program.activeCreditMinor / 100).toLocaleString("en-US")}` },
            { label: "QBR status", value: model.program.qbrStatus },
            { label: "Renewal blockers", value: String(model.program.renewalBlockers.length) }
          ]}
        />
        <div className="aa-grid aa-grid-2">
          <SectionCard title="Program workspace" subtitle="Recurring usage, QBR, and backlog control.">
            <DataTable
              columns={[
                { key: "queue", label: "Queue" },
                { key: "status", label: "Status" },
                { key: "owner", label: "Owner" }
              ]}
              rows={model.queues}
            />
          </SectionCard>
          <SectionCard title="Renewal blockers" tone="warning" subtitle="Logs do not outrank renewal blockers in the viewport.">
            {model.blockers.map((item: string) => (
              <Chip key={item} tone="warning">
                {item}
              </Chip>
            ))}
          </SectionCard>
        </div>
        <div className="aa-grid aa-grid-2">
          <SectionCard title="Live program state" subtitle="Credits, QBR, and backlog come from the shared runtime state, not static projection only.">
            <DataTable
              columns={[
                { key: "label", label: "Field" },
                { key: "value", label: "Value" }
              ]}
              rows={[
                { label: "Program ID", value: model.program.id },
                { label: "Active credit", value: `¥${(model.program.activeCreditMinor / 100).toLocaleString("en-US")}` },
                { label: "Backlog value", value: `¥${(model.program.backlogValueMinor / 100).toLocaleString("en-US")}` },
                { label: "QBR status", value: model.program.qbrStatus }
              ]}
            />
          </SectionCard>
          <SectionCard title="Program event log" subtitle="Credit allocation, drawdown, and QBR updates remain auditable.">
            {model.programEvents.length === 0 ? (
              <p className="aa-meta">No live program events yet. Run the program credit cycle to generate ledger-safe program operations.</p>
            ) : (
              <DataTable
                columns={[
                  { key: "eventName", label: "Event" },
                  { key: "recordedAt", label: "Recorded at" }
                ]}
                rows={model.programEvents}
              />
            )}
          </SectionCard>
        </div>
        <SectionCard title="ROI and renewal evidence" subtitle="Program renewal review uses saved hours, usable results, contribution signal, and repurchase readiness from order retrospectives.">
          <DataTable
            columns={[
              { key: "packageId", label: "Package" },
              { key: "cycleTimeSavedHours", label: "Saved h" },
              { key: "usableResultRate", label: "Usable" },
              { key: "contributionMarginEstimate", label: "Margin" },
              { key: "renewalSignal", label: "Renewal" }
            ]}
            rows={model.roiRows}
          />
        </SectionCard>
        <RuntimeCommandConsole mode="program-ops" initialSnapshot={runtimeSnapshot} />
      </div>
    </AppShell>
  );
}
