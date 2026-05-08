import { AppShell } from "../../components/alphaagents/shell";
import { Chip, SectionCard } from "../../components/alphaagents/blocks";
import { getBuyerOrgSetupModel } from "../../lib/alphaagents/view-models";

export default function BuyerOrgSetupPage() {
  const model = getBuyerOrgSetupModel();
  return (
    <AppShell shell={model.shell} currentPath="/buyer-org-setup">
      <div className="aa-grid aa-grid-2">
        <SectionCard title="Buyer org preflight" subtitle="Registration is not just email login.">
          <ul className="aa-list">
            {model.fields.map((field) => (
              <li key={field}>{field}</li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Readiness panel" tone="trust" subtitle="Authority chain, invoice, and scope acknowledgment gate high-risk buying.">
          {model.readiness.map((item) => (
            <div key={item.label} className="aa-meta" style={{ marginBottom: 10 }}>
              <strong>{item.label}</strong>: {item.status}
            </div>
          ))}
          <Chip tone="warning">High-risk purchases blocked until these stay green</Chip>
        </SectionCard>
      </div>
    </AppShell>
  );
}
