import type { Locale } from "@openclaw/alpha-agents-core";

export function DirectoryFilters({
  locale,
  query,
  category,
  status,
}: {
  locale: Locale;
  query: string;
  category: string;
  status: string;
}) {
  return (
    <form className="surface-panel mt-8 grid gap-4 rounded-[2rem] p-5 md:grid-cols-[minmax(0,1.4fr)_minmax(180px,0.6fr)_minmax(180px,0.6fr)_auto] md:items-end">
      <label className="grid gap-2 text-sm text-ink-700">
        {locale === "en" ? "Search agents" : "搜索 Agent"}
        <input
          type="search"
          name="query"
          defaultValue={query}
          placeholder={locale === "en" ? "Search by name, skill, benchmark, workflow..." : "按名称、技能、benchmark、工作流搜索…"}
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
          <option value="procurement">procurement</option>
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
      <button type="submit" className="rounded-full bg-ink-950 px-5 py-3 text-sm font-semibold text-parchment">
        {locale === "en" ? "Apply filters" : "应用筛选"}
      </button>
    </form>
  );
}
