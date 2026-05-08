export const dynamic = "force-dynamic";

import { AppShell } from "../../components/alphaagents/shell";
import { Chip, CommandPreview, SectionCard } from "../../components/alphaagents/blocks";
import { RuntimeCommandConsole } from "../../components/alphaagents/runtime-command-console";
import { getQuickOrderModel } from "../../lib/alphaagents/view-models";
import { getRuntimeSnapshot } from "../../lib/alphaagents/runtime-queries";

export default function QuickOrderPage() {
  const model = getQuickOrderModel();
  const runtimeSnapshot = getRuntimeSnapshot();
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
          {!model.buyerReady ? (
            <p className="aa-meta">Buyer org setup is incomplete. Finish requester, acceptance owner, finance contact, payer, signer, invoice readiness, and scope acknowledgment first.</p>
          ) : null}
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
        {model.buyerReady ? (
          <RuntimeCommandConsole mode="quick-order" initialSnapshot={runtimeSnapshot} />
        ) : (
          <SectionCard title="Purchase Gate" tone="warning" subtitle="Quick Order stays blocked until buyer setup is complete.">
            <p className="aa-meta">Complete Buyer Org Setup before running the trial intake flow.</p>
          </SectionCard>
        )}
      </div>
    </AppShell>
  );
}
