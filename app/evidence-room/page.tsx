import { AppShell } from "../../components/alphaagents/shell";
import { Chip, CliApiEventsPanel, DataTable, SectionCard } from "../../components/alphaagents/blocks";
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
        <CliApiEventsPanel
          a19Id="A-19-EVIDENCE-ROOM"
          subject="Evidence retention, redaction, export, deletion, and replay"
          commands={["alphaagents evidence show --json", "alphaagents evidence export --json"]}
          apiRoutes={[
            { method: "GET", path: "/api/evidence", purpose: "Read evidence packages, ledgers, hashes, reviews, exports, finance fields, and ROI readbacks." },
            { method: "POST", path: "/api/commands", purpose: "Request evidence export, deletion, review, and acceptance actions through the runtime command bus." }
          ]}
          events={["EvidenceExportRequested", "EvidenceExported", "EvidenceDeletionRequested", "EvidenceDeleted"]}
          dtoRefs={["EvidencePackage", "EvidenceLedger", "EvidenceExport"]}
        />
      </div>
    </AppShell>
  );
}
