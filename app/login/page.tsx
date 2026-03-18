import { getCurrentLocale } from "../../lib/locale";
import { getStorageMode } from "../../lib/server/env";
import { LoginPanels } from "../../components/login-panels";

function resolveLoginError(error: string | undefined, locale: "en" | "zh-CN") {
  if (!error) {
    return undefined;
  }

  const messages = {
    github_not_configured: {
      en: "GitHub sign-in is not configured in this environment yet.",
      "zh-CN": "当前环境尚未配置 GitHub 登录。",
    },
    invalid_oauth_state: {
      en: "GitHub sign-in could not be verified. Please start again.",
      "zh-CN": "GitHub 登录状态校验失败，请重新开始。",
    },
    github_exchange_failed: {
      en: "GitHub token exchange failed. Please try again.",
      "zh-CN": "GitHub token 交换失败，请重试。",
    },
    github_email_missing: {
      en: "GitHub did not return a usable email address.",
      "zh-CN": "GitHub 没有返回可用邮箱地址。",
    },
    github_login_failed: {
      en: "GitHub sign-in failed. Please try again.",
      "zh-CN": "GitHub 登录失败，请重试。",
    },
    missing_token: {
      en: "The sign-in link is incomplete.",
      "zh-CN": "登录链接不完整。",
    },
  } as const;

  const localized = messages[error as keyof typeof messages];
  if (localized) {
    return locale === "en" ? localized.en : localized["zh-CN"];
  }

  return error;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const locale = await getCurrentLocale();
  const params = await searchParams;
  const mode = getStorageMode();
  const errorMessage = resolveLoginError(params.error, locale);

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
        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900">{errorMessage}</div>
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
