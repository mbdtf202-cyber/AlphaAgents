import { AppShell } from "../../components/alphaagents/shell";
import { Chip, CommandPreview, SectionCard } from "../../components/alphaagents/blocks";
import { RuntimeCommandConsole } from "../../components/alphaagents/runtime-command-console";
import { getQuickOrderModel } from "../../lib/alphaagents/view-models";

export default function QuickOrderPage() {
  const model = getQuickOrderModel();
  return (
    <AppShell shell={model.shell} currentPath="/quick-order">
      <div className="aa-grid aa-grid-2">
        <SectionCard title="Guided Trial Quick Order" subtitle="The first commercial path is guided, frozen, and read-only.">
          <ul className="aa-list">
            {model.steps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Risk boundary" tone="warning" subtitle="No production login, no ad spend, no fund movement.">
          {model.prohibitedSources.map((source) => (
            <Chip key={source} tone="warning">
              {source}
            </Chip>
          ))}
          <CommandPreview command={model.commandPreview} />
        </SectionCard>
        <SectionCard title="Runtime RFP drafts" subtitle="RFP state now comes from the mutable runtime control plane.">
          {model.runtimeRfps.length === 0 ? (
            <p className="aa-meta">No runtime RFP yet. Use CLI or `/api/commands` to create one.</p>
          ) : (
            <ul className="aa-list">
              {model.runtimeRfps.map((rfp: { id: string; rfpStatus: string; category: string }) => (
                <li key={rfp.id}>
                  {rfp.id} / {rfp.rfpStatus} / {rfp.category}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
        <RuntimeCommandConsole mode="quick-order" />
      </div>
    </AppShell>
  );
}
