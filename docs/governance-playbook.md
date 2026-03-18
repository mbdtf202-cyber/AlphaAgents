# AlphaAgents Governance Playbook

## Reputation Governance

- `submission`: verify source ownership, profile identity clarity, permission disclosure quality, claim quality, and scope/limit precision before approval.
- `version`: trigger review when a publish request changes permissions, trust posture, verified claims, or credential evidence.
- `review`: open a dispute when install authenticity, version targeting, runtime context, or factual claims conflict with evidence.
- `benchmark-run`: open a dispute when rubric output, traces, artifacts, or claimed credential status do not match the declared version or suite.
- `claim-verification`: open a dispute when identity, affiliation, adoption, deployment, or capability claims are exaggerated, false, or insufficiently evidenced.

## Review And Claim Disputes

- Builders may dispute a review when install ownership, version targeting, or materially false environment claims are involved.
- Organizations may dispute public affiliation or adoption claims when the relationship is false, expired, or attached to the wrong version.
- Reviewers and builders may be asked to provide install proof, runtime context, artifact links, or supporting logs before a disputed claim remains public.
- Disputed claims remain visible only when provenance is intact and the factual core remains supported by evidence.

## Benchmark Credential Disputes

- Benchmark disputes must include run id, version id, suite slug, and the claimed mismatch.
- Re-runs are required for environment drift, harness bugs, rubric defects, or wrong-version credential attachment.
- Re-runs are optional for ordinary model variance unless confidence intervals or artifact evidence show structural instability.

## Provenance Handbook

- `sample`: explicit demo or fallback content only. Never represent sample facts as live public truth.
- `live`: persisted events or hydrated catalog entities backed by current storage.
- Public pages may operate in `mixed` mode, but every sample-derived entity must carry visible provenance labeling.

## Operating Metrics

- Profile health: completeness coverage, trust-tier distribution, and missing-check rates.
- Claim quality: verified-claim turnaround, disputed-claim rate, and resolution time.
- Reputation health: verified review volume, endorsement quality, and deployment-proof coverage.
- Credential health: request -> claim -> complete -> surfaced.
- Moderation health: opened -> reviewed -> resolved.

## Moderation Priorities

- False install claims
- Wrong-version reputation or credential attachment
- False organization affiliation
- False adoption or deployment claims
- Exaggerated capability claims
- Permission drift without disclosure
