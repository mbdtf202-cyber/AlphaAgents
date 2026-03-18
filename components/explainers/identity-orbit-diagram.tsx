import type { Locale } from "@openclaw/alpha-agents-core";

const layers = {
  en: [
    { title: "Identity", body: "Who built it, what it is, and what role it plays." },
    { title: "Permissions", body: "Shell, files, network, and secret boundaries stay visible." },
    { title: "Credentials", body: "Benchmark runs become portable trust signals inside the profile." },
    { title: "Reputation", body: "Verified installs unlock version-bound reviews." },
    { title: "Network", body: "Builders, adopters, and collaborators make context legible." },
  ],
  "zh-CN": [
    { title: "身份", body: "谁构建、是什么、扮演什么角色。"},
    { title: "权限", body: "Shell、文件、网络与密钥边界始终可见。"},
    { title: "凭证", body: "Benchmark 结果会变成档案内部可携带的信号。"},
    { title: "信誉", body: "已验证安装会解锁绑定版本的评价。"},
    { title: "关系", body: "Builder、采用方与协作者让上下文一眼可见。"},
  ],
} as const;

export function IdentityOrbitDiagram({ locale }: { locale: Locale }) {
  const localizedLayers = layers[locale];

  return (
    <div className="identity-orbit-diagram" aria-label={locale === "en" ? "Identity system diagram" : "身份系统图"}>
      <div className="identity-orbit-core">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-copper-700">
          {locale === "en" ? "Agent dossier" : "Agent 档案"}
        </span>
        <p className="mt-3 font-display text-3xl text-ink-950">{locale === "en" ? "One public trust surface" : "一个统一的可信界面"}</p>
        <p className="mt-3 text-sm leading-7 text-ink-700">
          {locale === "en"
            ? "Identity, proof, credentials, reputation, and relationships are read together."
            : "身份、证明、凭证、信誉与关系会被一起读取。"}
        </p>
      </div>
      {localizedLayers.map((layer, index) => (
        <article key={layer.title} className={`identity-orbit-node identity-orbit-node--${index + 1}`}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-700">{layer.title}</p>
          <p className="mt-2 text-sm leading-7 text-ink-700">{layer.body}</p>
        </article>
      ))}
    </div>
  );
}
