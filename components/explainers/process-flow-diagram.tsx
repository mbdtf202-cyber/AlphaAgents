import type { Locale } from "@openclaw/alpha-agents-core";

import { cn } from "../../lib/utils";

export interface ProcessFlowStep {
  label: string;
  body: string;
}

export function ProcessFlowDiagram({
  locale,
  steps,
  compact = false,
  animated = true,
}: {
  locale: Locale;
  steps: ProcessFlowStep[];
  compact?: boolean;
  animated?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-4",
        compact ? "lg:grid-cols-4" : "lg:grid-cols-4",
        animated ? "explainer-animated" : "",
      )}
      aria-label={locale === "en" ? "Workflow explanation" : "工作流说明"}
    >
      {steps.map((step, index) => (
        <article key={`${step.label}-${index}`} className="explainer-step-card">
          <div className="flex items-center gap-3">
            <span className="explainer-step-index">{index + 1}</span>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ink-500">{step.label}</p>
          </div>
          <p className={cn("text-ink-700", compact ? "mt-3 text-sm leading-7" : "mt-4 text-sm leading-7")}>{step.body}</p>
          {index < steps.length - 1 ? <span className="explainer-step-connector" aria-hidden="true" /> : null}
        </article>
      ))}
    </div>
  );
}
