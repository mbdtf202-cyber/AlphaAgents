export const dynamic = "force-dynamic";

import { AppShell } from "../../components/alphaagents/shell";
import { CommandPreview, DataTable, SectionCard } from "../../components/alphaagents/blocks";
import { RuntimeCommandConsole } from "../../components/alphaagents/runtime-command-console";
import { getRuntimeSnapshot } from "../../lib/alphaagents/runtime-queries";
import { getProjectsIndexModel } from "../../lib/alphaagents/view-models";

export default function ProjectsPage() {
  const model = getProjectsIndexModel();
  const runtimeSnapshot = getRuntimeSnapshot();

  return (
    <AppShell shell={model.shell} currentPath="/projects">
      <div className="aa-grid">
        <SectionCard title="Projects and Programs" subtitle="Custom Agent delivery, milestones, UAT, change orders, order-credit, QBR, and renewal blockers share one project workspace.">
          <CommandPreview command={model.commandPreview} />
        </SectionCard>
        <div className="aa-grid aa-grid-2">
          <SectionCard title="Custom project runtime state" subtitle="Demand freeze, milestone confirmation, UAT submission, and change orders are runtime-backed.">
            {model.runtimeProjects.length === 0 ? (
              <p className="aa-meta">No custom project yet. Use the custom Agent intake lane to create one.</p>
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
          <SectionCard title="Program workspaces" subtitle="Order-credit and recurring managed delivery keep credit, backlog, QBR, and renewal state visible.">
            <DataTable
              columns={[
                { key: "id", label: "Program" },
                { key: "activeCreditMinor", label: "Credit" },
                { key: "backlogValueMinor", label: "Backlog" },
                { key: "qbrStatus", label: "QBR" },
                { key: "blockers", label: "Blockers" }
              ]}
              rows={model.runtimePrograms.map((program: { activeCreditMinor: number; backlogValueMinor: number; renewalBlockers: string[] }) => ({
                ...program,
                activeCreditMinor: `¥${(program.activeCreditMinor / 100).toLocaleString("en-US")}`,
                backlogValueMinor: `¥${(program.backlogValueMinor / 100).toLocaleString("en-US")}`,
                blockers: program.renewalBlockers.join(", ") || "none"
              }))}
            />
          </SectionCard>
        </div>
        <div className="aa-grid aa-grid-2">
          <SectionCard title="Custom intake checklist" tone="warning" subtitle="Custom Agent work cannot bypass demand freeze, UAT, evidence, and change-order boundaries.">
            <ul className="aa-list">
              {model.customIntake.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </SectionCard>
          <SectionCard title="Program queues" subtitle="Program ops stays buyer-operational, not a log-first screen.">
            <DataTable
              columns={[
                { key: "queue", label: "Queue" },
                { key: "status", label: "Status" },
                { key: "owner", label: "Owner" }
              ]}
              rows={model.programQueues}
            />
          </SectionCard>
        </div>
        <RuntimeCommandConsole mode="custom-agent" initialSnapshot={runtimeSnapshot} />
      </div>
    </AppShell>
  );
}
