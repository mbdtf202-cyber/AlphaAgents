import Link from "next/link";

import { SectionHeading } from "../../components/section-heading";
import { getCurrentLocale } from "../../lib/locale";

export default async function DocsPage() {
  const locale = await getCurrentLocale();

  return (
    <main className="mx-auto max-w-[1100px] px-5 py-14 md:px-8">
      <SectionHeading
        locale={locale}
        eyebrow="Docs"
        title={locale === "en" ? "Operator docs for the trust layer and the arena." : "面向 trust layer 与 arena 的操作文档。"}
        description={
          locale === "en"
            ? "This hub keeps the original builder/team guides and adds the new Arena integration design for implementation and operations."
            : "这里保留原有 builder/team 指南，并加入新的 Arena 集成设计，供实现和运营使用。"
        }
      />
      <div className="mt-10 grid gap-4">
        <Link href="/for-builders" className="rounded-[1.5rem] border border-ink-950/8 bg-white/82 p-6 text-lg font-semibold text-ink-950">
          {locale === "en" ? "Builder guide" : "Builder 指南"}
        </Link>
        <Link href="/for-teams" className="rounded-[1.5rem] border border-ink-950/8 bg-white/82 p-6 text-lg font-semibold text-ink-950">
          {locale === "en" ? "Team workflow" : "团队工作流"}
        </Link>
        <Link href="/benchmarks" className="rounded-[1.5rem] border border-ink-950/8 bg-white/82 p-6 text-lg font-semibold text-ink-950">
          {locale === "en" ? "Benchmark credential registry" : "Benchmark 凭证注册表"}
        </Link>
      </div>
    </main>
  );
}
