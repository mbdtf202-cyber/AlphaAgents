import BuilderGuideEn from "../../content/for-builders.en.mdx";
import BuilderGuideZh from "../../content/for-builders.zh-CN.mdx";
import { getCurrentLocale } from "../../lib/locale";

export default async function ForBuildersPage() {
  const locale = await getCurrentLocale();
  const Guide = locale === "en" ? BuilderGuideEn : BuilderGuideZh;

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-14 md:px-8">
      <article className="prose-ledger rounded-[2.5rem] border border-ink-950/8 bg-white/84 px-6 py-10 md:px-10">
        <Guide />
      </article>
    </main>
  );
}
