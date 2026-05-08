export const dynamic = "force-dynamic";

import { AppShell } from "../../components/alphaagents/shell";
import { Chip, CommandPreview, DataTable, SectionCard } from "../../components/alphaagents/blocks";
import { getCustomAgentModel } from "../../lib/alphaagents/view-models";

export default function CustomAgentPage() {
  const model = getCustomAgentModel();

  return (
    <AppShell shell={model.shell} currentPath="/custom-agent">
      <div className="aa-grid">
        <SectionCard title="Custom Agent Intake" subtitle="Custom Agent flow is checklist-first: intake, milestones, UAT, change orders, and deployment boundary.">
          <ul className="aa-list">
            {model.intakeChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <CommandPreview
            command={
              "alphaagents custom-project request --json\nalphaagents custom-project confirm-milestone --json\nalphaagents custom-project submit-uat --json\nalphaagents custom-project create-change-order --json"
            }
          />
        </SectionCard>
        <SectionCard title="Custom project runtime state" subtitle="Demand freeze, milestones, UAT, and change orders are runtime-backed, not page-only notes.">
          {model.runtimeProjects.length === 0 ? (
            <p className="aa-meta">No custom project yet. Create one through the custom-project runtime command lane.</p>
          ) : (
            <DataTable
              columns={[
                { key: "id", label: "Project" },
                { key: "projectStatus", label: "Status" },
                { key: "uatStatus", label: "UAT" },
                { key: "milestones", label: "Milestones" },
                { key: "changeOrders", label: "Change orders" }
              ]}
              rows={model.runtimeProjects.map((project: { id: string; projectStatus: string; uatStatus: string; milestones: unknown[]; changeOrders: unknown[] }) => ({
                id: project.id,
                projectStatus: project.projectStatus,
                uatStatus: project.uatStatus,
                milestones: String(project.milestones.length),
                changeOrders: String(project.changeOrders.length)
              }))}
            />
          )}
        </SectionCard>
        <SectionCard title="Custom project event trail" subtitle="Milestone, UAT, and change-order events stay visible for procurement and delivery review.">
          {model.runtimeEvents.length === 0 ? (
            <p className="aa-meta">No custom project events yet.</p>
          ) : (
            <DataTable
              columns={[
                { key: "eventName", label: "Event" },
                { key: "recordedAt", label: "Recorded at" }
              ]}
              rows={model.runtimeEvents}
            />
          )}
          <div style={{ marginTop: 12 }}>
            <Chip tone="warning">UAT required before acceptance</Chip>
            <Chip tone="warning">Change orders stay explicit</Chip>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
