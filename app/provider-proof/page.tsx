import { AppShell } from "../../components/alphaagents/shell";
import { Chip, SectionCard } from "../../components/alphaagents/blocks";
import { getProviderProofModel } from "../../lib/alphaagents/view-models";

export default function ProviderProofPage() {
  const model = getProviderProofModel();
  const cards = [model.primaryAgent, model.secondaryAgent].filter(
    (agent): agent is NonNullable<typeof agent> => agent != null
  );
  const app = model.app;

  return (
    <AppShell shell={model.shell} currentPath="/provider-proof">
      <div className="aa-grid aa-grid-2">
        {cards.map((agent) => (
          <SectionCard key={agent.id} title={agent.name} subtitle={`${agent.legalEntity} / ${agent.humanOwner}`}>
            <div>
              <Chip tone="trust">Proof status: {agent.proofStatus}</Chip>
              <Chip>{agent.version}</Chip>
              <Chip tone={agent.riskLabel.includes("manual") ? "warning" : "default"}>{agent.riskLabel}</Chip>
            </div>
            <p className="aa-meta">{agent.narrative}</p>
          </SectionCard>
        ))}
        {app ? (
          <SectionCard title={app.name} subtitle="Agent App stays inside the same AaaS accountability chain." tone="trust">
            <div>
              {app.acceptanceProof.map((item) => (
                <Chip key={item} tone="trust">
                  {item}
                </Chip>
              ))}
            </div>
            <p className="aa-meta">{app.installBoundary}</p>
          </SectionCard>
        ) : null}
      </div>
    </AppShell>
  );
}
