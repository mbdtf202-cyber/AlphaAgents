# AlphaAgents Governance Playbook

## Moderation Policy

- `submission`: verify source ownership, permission disclosure quality, benchmark fit, and clarity of known limits before approval.
- `version`: trigger review when a publish request changes permissions, risk level, or benchmark evidence.
- `review`: open a dispute when context is missing, install ownership is contested, or claims conflict with artifact evidence.
- `benchmark-run`: open a dispute when rubric output, traces, or artifacts do not match the declared suite/version.

## Review Dispute Policy

- Builder may dispute a review only when ownership, version targeting, or materially false environment claims are involved.
- Buyer may be asked to provide install proof, runtime context, and failure mode detail before a disputed review remains public.
- Disputed reviews remain visible only if provenance is intact and the factual core of the review remains supported.

## Benchmark Dispute Policy

- Benchmark disputes must include run id, version id, suite slug, and the claimed mismatch.
- Re-runs are required for environment drift, harness bugs, or rubric defects.
- Re-runs are optional for ordinary model variance unless confidence intervals or artifact evidence show structural instability.

## Provenance Handbook

- `sample`: explicit demo/fallback content only. Never represent sample facts as live public truth.
- `live`: persisted events or hydrated catalog entities backed by current storage.
- Public pages may operate in `mixed` mode, but every sample-derived entity must carry visible provenance labeling.

## Queue SLA

- Public benchmark queue: best effort, FIFO.
- Builder paid queue: priority over public queue.
- Enterprise private queue: reserved capacity with explicit turnaround.

## Operating Metrics

- Submission funnel: import -> draft -> moderation -> publish.
- Benchmark funnel: request -> claim -> complete -> surfaced.
- Procurement funnel: compare -> shortlist -> memo -> pilot -> rollout.
- Moderation funnel: opened -> reviewed -> resolved.
