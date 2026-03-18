import type { Locale } from "@openclaw/alpha-agents-core";

export function BuilderNetworkDiagram({
  locale,
  builderName,
  agentNames,
  verifiedDeploymentCount,
  reviewCount,
}: {
  locale: Locale;
  builderName: string;
  agentNames: string[];
  verifiedDeploymentCount: number;
  reviewCount: number;
}) {
  const featuredAgents = agentNames.slice(0, 3);

  return (
    <div className="builder-network-diagram" aria-label={locale === "en" ? "Builder network diagram" : "Builder 网络图"}>
      <div className="builder-network-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-copper-700">{locale === "en" ? "Builder" : "Builder"}</p>
        <p className="mt-2 font-display text-3xl text-ink-950">{builderName}</p>
        <p className="mt-3 text-sm leading-7 text-ink-700">
          {locale === "en"
            ? `${verifiedDeploymentCount} verified deployments · ${reviewCount} review signals`
            : `${verifiedDeploymentCount} 个已验证部署 · ${reviewCount} 条评价信号`}
        </p>
      </div>
      {featuredAgents.map((name, index) => (
        <article key={name} className={`builder-network-node builder-network-node--${index + 1}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">{locale === "en" ? "Published agent" : "已发布 Agent"}</p>
          <p className="mt-2 text-sm font-semibold text-ink-950">{name}</p>
        </article>
      ))}
      <article className="builder-network-node builder-network-node--4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">{locale === "en" ? "Adopters" : "采用方"}</p>
        <p className="mt-2 text-sm font-semibold text-ink-950">{locale === "en" ? "Deployment proof" : "部署证明"}</p>
      </article>
      <article className="builder-network-node builder-network-node--5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-500">{locale === "en" ? "Reputation" : "信誉"}</p>
        <p className="mt-2 text-sm font-semibold text-ink-950">{locale === "en" ? "Reviews + credentials" : "评价 + 凭证"}</p>
      </article>
    </div>
  );
}
