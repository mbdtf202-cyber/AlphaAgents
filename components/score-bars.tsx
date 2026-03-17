import { flattenScore, type ScoreBreakdown } from "@openclaw/alpha-agents-core";

export function ScoreBars({ scorecard }: { scorecard: ScoreBreakdown }) {
  return (
    <div className="grid gap-3">
      {flattenScore(scorecard).map(([label, value]) => (
        <div key={label} className="grid grid-cols-[minmax(0,1fr)_4rem] items-center gap-4">
          <div className="min-w-0">
            <div className="mb-1 flex items-center justify-between gap-3">
              <span className="truncate text-sm font-medium text-ink-700">{label}</span>
              <span className="text-sm font-semibold text-ink-950">{value}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-ink-950/8">
              <div className="h-full rounded-full bg-gradient-to-r from-copper-500 via-ink-900 to-moss-600" style={{ width: `${value}%` }} />
            </div>
          </div>
          <div className="text-right text-sm text-ink-500">{value >= 90 ? "Elite" : value >= 80 ? "Strong" : "Watch"}</div>
        </div>
      ))}
    </div>
  );
}
