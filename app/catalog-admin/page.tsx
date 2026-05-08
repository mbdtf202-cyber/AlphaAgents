import { AppShell } from "../../components/alphaagents/shell";
import { CommandPreview, DataTable, SectionCard } from "../../components/alphaagents/blocks";
import { RuntimeCommandConsole } from "../../components/alphaagents/runtime-command-console";
import { getCatalogAdminModel } from "../../lib/alphaagents/view-models";

export default function CatalogAdminPage() {
  const model = getCatalogAdminModel();
  const primaryAgentLabel = model.agent ? `${model.agent.name} / version ${model.agent.version}` : "No primary passport loaded";
  return (
    <AppShell shell={model.shell} currentPath="/catalog-admin">
      <div className="aa-grid aa-grid-2">
        <SectionCard title="Category CRUD" subtitle="Create, update, archive, and restore stay auditable.">
          <DataTable
            columns={[
              { key: "categoryId", label: "Category" },
              { key: "riskLevel", label: "Risk" },
              { key: "opsOwner", label: "Ops owner" },
              { key: "categoryStatus", label: "Status" }
            ]}
            rows={model.categories.map((category) => ({
              categoryId: `${category.name["zh-CN"]} / ${category.categoryId}`,
              riskLevel: category.riskLevel,
              opsOwner: category.opsOwner,
              categoryStatus: category.categoryStatus
            }))}
          />
          <CommandPreview command={"alphaagents agent-category create --json\nalphaagents agent-category archive --json"} />
        </SectionCard>
        <SectionCard title="Agent + listing administration" subtitle="AgentPassport and AgentListing changes remain versioned.">
          <p className="aa-meta">
            Primary passport: {primaryAgentLabel} / {model.listings.length} listings.
          </p>
          <CommandPreview command={"alphaagents agent-passport update --json\nalphaagents agent-listing publish --json"} />
        </SectionCard>
        <RuntimeCommandConsole mode="catalog-admin" />
      </div>
    </AppShell>
  );
}
