import { AppShell } from "../../components/alphaagents/shell";
import { Chip, DataTable, KpiStrip, SectionCard } from "../../components/alphaagents/blocks";
import { getProgramOpsModel } from "../../lib/alphaagents/view-models";

export default function ProgramOpsPage() {
  const model = getProgramOpsModel();
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
            {model.blockers.map((item) => (
              <Chip key={item} tone="warning">
                {item}
              </Chip>
            ))}
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
