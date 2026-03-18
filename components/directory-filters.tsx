import type { Locale } from "@openclaw/alpha-agents-core";

export function DirectoryFilters({
  locale,
  query,
  category,
  status,
  trustTier,
  riskLevel,
  credential,
  activity,
}: {
  locale: Locale;
  query: string;
  category: string;
  status: string;
  trustTier: string;
  riskLevel: string;
  credential: string;
  activity: string;
}) {
  return (
    <form className="surface-panel mt-8 grid gap-4 rounded-[2rem] p-5 md:grid-cols-2 xl:grid-cols-[minmax(0,1.6fr)_repeat(5,minmax(140px,0.6fr))_auto] xl:items-end">
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Search agents" : "搜索 Agent"}
        <input
          type="search"
          name="query"
          defaultValue={query}
          placeholder={locale === "en" ? "Search by name, skill, credential, activity..." : "按名称、技能、凭证、动态搜索…"}
          className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3"
        />
      </label>
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Category" : "分类"}
        <select name="category" defaultValue={category} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
          <option value="all">{locale === "en" ? "All" : "全部"}</option>
          <option value="coding">coding</option>
          <option value="research">research</option>
          <option value="support ops">support ops</option>
          <option value="workflow automation">workflow automation</option>
          <option value="comparison">comparison</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Verification" : "验证状态"}
        <select name="status" defaultValue={status} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
          <option value="all">{locale === "en" ? "All" : "全部"}</option>
          <option value="verified">verified</option>
          <option value="review">review</option>
          <option value="draft">draft</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Trust tier" : "信任等级"}
        <select name="trustTier" defaultValue={trustTier} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
          <option value="all">{locale === "en" ? "All" : "全部"}</option>
          <option value="Established">Established</option>
          <option value="Verified">Verified</option>
          <option value="Emerging">Emerging</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Risk level" : "风险等级"}
        <select name="riskLevel" defaultValue={riskLevel} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
          <option value="all">{locale === "en" ? "All" : "全部"}</option>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Credential" : "凭证"}
        <select name="credential" defaultValue={credential} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
          <option value="all">{locale === "en" ? "All" : "全部"}</option>
          <option value="benchmark">{locale === "en" ? "Benchmark" : "基准"}</option>
          <option value="deployment">{locale === "en" ? "Deployment" : "部署"}</option>
          <option value="claim">{locale === "en" ? "Claim verification" : "声明验证"}</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Activity" : "动态"}
        <select name="activity" defaultValue={activity} className="rounded-2xl border border-ink-950/10 bg-parchment px-4 py-3">
          <option value="all">{locale === "en" ? "All" : "全部"}</option>
          <option value="recent">{locale === "en" ? "Recently active" : "近期活跃"}</option>
        </select>
      </label>
      <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
        {locale === "en" ? "Apply filters" : "应用筛选"}
      </button>
    </form>
  );
}
