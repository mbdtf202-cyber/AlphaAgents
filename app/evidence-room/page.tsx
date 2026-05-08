import { AppShell } from "../../components/alphaagents/shell";
import { Chip, DataTable, SectionCard } from "../../components/alphaagents/blocks";
import { getEvidenceRoomModel } from "../../lib/alphaagents/view-models";

export default function EvidenceRoomPage() {
  const model = getEvidenceRoomModel();
  return (
    <AppShell shell={model.shell} currentPath="/evidence-room">
      <div className="aa-grid aa-grid-2">
        <SectionCard title="Evidence room" subtitle="Hash, visibility, redaction, export, and retention remain first-class.">
          <DataTable
            columns={[
              { key: "packageId", label: "Package" },
              { key: "orderId", label: "Order" },
              { key: "ledgerStatus", label: "Ledger" },
              { key: "evidenceStatus", label: "Evidence" }
            ]}
            rows={model.packages}
          />
        </SectionCard>
        <SectionCard title="Export paths" tone="trust" subtitle="Buyer-safe, procurement, and support bundles use the same evidence chain.">
          {model.exportModes.map((item) => (
            <Chip key={item} tone="trust">
              {item}
            </Chip>
          ))}
        </SectionCard>
      </div>
    </AppShell>
  );
}
