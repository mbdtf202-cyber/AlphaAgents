import { getCurrentLocale } from "../../lib/locale";
import { getStorageMode } from "../../lib/server/env";
import { LoginPanels } from "../../components/login-panels";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const locale = await getCurrentLocale();
  const params = await searchParams;
  const mode = getStorageMode();

  return (
    <main className="mx-auto grid max-w-[1080px] gap-8 px-5 py-16 md:px-8 lg:grid-cols-[1fr_1fr]">
      <section className="surface-panel rounded-[2.5rem] p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-copper-700">{locale === "en" ? "Auth" : "登录"}</p>
        <h1 className="mt-3 font-display text-5xl text-ink-950">{locale === "en" ? "Sign in to the trust layer" : "登录到信任层"}</h1>
        <p className="mt-5 text-lg leading-8 text-ink-700">
          {locale === "en"
            ? "Builder and team actions now require a real session. Public profiles remain browseable, but reputation updates, deployment proof, moderation, follows, profile lists, and credential requests are authenticated operations."
            : "Builder 和团队动作现在都要求真实 session。公开档案仍可匿名浏览，但信誉更新、部署证明、审核、关注、Profile List 和凭证请求都已变成需要身份的操作。"}
        </p>
        {params.error ? (
          <div className="mt-6 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900">{params.error}</div>
        ) : null}
        <div className="mt-6 rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3 text-sm text-ink-700">
          {locale === "en"
            ? `Current storage mode: ${mode}.`
            : `当前存储模式：${mode}。`}
        </div>
      </section>

      <section className="grid gap-6">
        <LoginPanels locale={locale} />
      </section>
    </main>
  );
}
