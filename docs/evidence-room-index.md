# AlphaAgents Evidence Room Index

This index prevents sample artifacts from being mistaken for customer proof.

## Evidence Axes

| Axis | Values | Meaning |
| --- | --- | --- |
| `commercialEvidenceStatus` | `validated`, `sandbox_verified`, `in_conversation`, `sample_only`, `target_to_collect` | Whether the artifact can be used as customer or financing proof |
| `artifactVerificationStatus` | `draft`, `structure_verified`, `sandbox_verified`, `qa_verified`, `finance_verified` | Whether the artifact shape, QA, finance, and replay checks pass |

Rules:

- `sandbox_verified` never upgrades to `validated` by itself.
- `sandbox_verified` can describe an artifact gate and can be paired with `sample_only`; it cannot describe commercial traction unless real buyer proof is attached.
- `validated` requires real payment, signed or written LOI, procurement email, customer-authorized delivery package, or customer-authorized acceptance evidence.
- `sample_only + sandbox_verified` is safe for product demo and CI gates, not for investor proof.
- Any artifact with missing legal entity, collection entity, refund path, or invoice issuer is `not_signable`.

## Current Packages

| packageId | commercialEvidenceStatus | artifactVerificationStatus | Redaction method | Finance proof | ROI | Buyer demo | Financing proof |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `AA-SANDBOX-TRIAL-001` | `sample_only` | `sandbox_verified` | synthetic sandbox entities, no real customer data | sandbox ledger only | measured fields, sandbox estimates | yes | no |
| `AA-SANDBOX-REVISION-002` | `sample_only` | `sandbox_verified` | synthetic sandbox entities, no real customer data | sandbox ledger only | measured fields, sandbox estimates | yes | no |
| `AA-SANDBOX-DISPUTE-003` | `sample_only` | `sandbox_verified` | synthetic sandbox entities, no real customer data | sandbox ledger only | measured fields, sandbox estimates | yes | no |

## Validated Evidence Gap

Current repository status:

- 0 real paid Trial orders.
- 0 customer-authorized delivery packages.
- 0 procurement emails or signed LOIs.
- 0 repeat buyers.
- 3 sandbox-verified packages proving accepted, revision, and dispute replayability.

Minimum upgrade path to `validated`:

1. Add a paid Trial receipt or signed LOI with buyer authorization to retain a redacted proof record.
2. Add a customer-authorized evidence package with redacted public-safe content.
3. Add buyer acceptance or dispute outcome.
4. Add ROI retrospective with buyer-confirmed fields separated from platform estimates.
5. Add a repeat order, second Trial, Standard upgrade, or annual order-credit negotiation record.
