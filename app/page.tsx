import Link from "next/link";

import { AppShell } from "../components/alphaagents/shell";
import { Chip, CommandPreview, DataTable, SectionCard } from "../components/alphaagents/blocks";
import { getShowcaseModel } from "../lib/alphaagents/view-models";

export default function PublicShowcasePage() {
  const model = getShowcaseModel();
  const trial = model.trialListing;

  return (
    <AppShell shell={model.shell} currentPath="/">
      <div className="aa-grid">
        <section className="aa-hero">
          <h2>Complete Agent commerce, managed delivery, Agent Apps, and enterprise operating network.</h2>
          <p>
            Buyers are not here to browse AI. They are here to buy an accountable result with evidence,
            acceptance criteria, risk controls, and finance rules that can survive procurement review.
          </p>
          <div>
            {model.heroBullets.map((item) => (
              <Chip key={item} tone={item.includes("Trial") ? "trust" : item.includes("mismatch") ? "danger" : "default"}>
                {item}
              </Chip>
            ))}
          </div>
          <div className="aa-button-row">
            <Link className="aa-button" href="/catalog">
              Open Agent Catalog
            </Link>
            <Link className="aa-button" href="/buyer-org-setup">
              Start Buyer Org Setup
            </Link>
            <Link className="aa-button" href="/quick-order">
              Start Trial Quick Order
            </Link>
          </div>
        </section>

        <div className="aa-split">
          <SectionCard
            title="AaaS versus traditional SaaS"
            subtitle="The first viewport explains who does the work, what gets accepted, what proves completion, and who is responsible."
          >
            <DataTable
              columns={[
                { key: "label", label: "Question" },
                { key: "saas", label: "Traditional SaaS" },
                { key: "aaas", label: "AlphaAgents AaaS" }
              ]}
              rows={model.aaasComparison}
            />
          </SectionCard>
          <SectionCard title="Trial-first public showcase" tone="trust" subtitle="Procurement-grade positioning before marketing persuasion.">
            <div className="aa-plan aa-plan is-featured">
              <div className="aa-meta">Default first purchase</div>
              <h3>{trial.title}</h3>
              <div className="aa-price">¥{(trial.startingPriceMinor / 100).toLocaleString("en-US")}</div>
              <p className="aa-meta">{trial.deliveryHours}h / 5 competitors / 15 topic ideas / conditional release workflow</p>
            </div>
            <div style={{ marginTop: 12 }}>
              <Chip tone="trust">sample_only + sandbox_verified</Chip>
              <Chip tone="trust">QA pass 91%</Chip>
              <Chip tone="trust">Human owner assigned</Chip>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Provider proof, evidence packages, and command parity" subtitle="Public showcase must not hide the real proof chain.">
          <DataTable
            columns={[
              { key: "packageId", label: "Package" },
              { key: "orderId", label: "Order" },
              { key: "ledgerStatus", label: "Ledger" },
              { key: "acceptanceStatus", label: "Acceptance" },
              { key: "totalScore", label: "Score" }
            ]}
            rows={model.samplePackages}
          />
          <CommandPreview command="alphaagents evidence show --order order_sandbox_trial_001 --json" mismatch />
        </SectionCard>
      </div>
    </AppShell>
  );
}
