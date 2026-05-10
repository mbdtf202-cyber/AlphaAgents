# AlphaAgents Documentation Index

This directory is the default entry point for project context. Read this file before opening individual documents.

## Authority Order

1. `README.md` defines the public product position and the shortest onboarding path.
2. `docs/README.md` routes readers to the right document and prevents stale context from becoming the default.
3. `docs/product-design.md` is the product authority for platform scope, categories, transactions, roles, domain objects, and business boundaries.
4. `docs/frontend-visual-design.md` is the UI authority for surfaces, layout, interaction language, visual system, responsive rules, and accessibility.
5. `docs/acceptance.md` is the delivery authority. A feature is not complete unless it satisfies this checklist and the matching verification scripts.
6. `contracts/alphaagents.contract.json` is the machine-readable contract. If prose and contract conflict, fix the prose or the contract and rerun verification.

## Canonical Documents

| Need | Read | Status |
| --- | --- | --- |
| Product scope and AaaS model | [product-design.md](./product-design.md) | Canonical |
| Frontend surfaces and visual system | [frontend-visual-design.md](./frontend-visual-design.md) | Canonical |
| Acceptance and completion gates | [acceptance.md](./acceptance.md) | Canonical |
| Domain, command, event, DTO, security, and state rules | [engineering-contract.md](./engineering-contract.md) | Canonical explanation of the machine contract |
| Responsive behavior | [breakpoints-and-layout.md](./breakpoints-and-layout.md) | Supporting contract |
| Table density and mobile degradation | [table-column-priority.md](./table-column-priority.md) | Supporting contract |

## Commercial And Operating Packs

These files support sales, procurement, finance, and operating execution. They do not override the canonical documents above.

| Need | Read | Boundary |
| --- | --- | --- |
| Current first commercial lane and rollout logic | [commercial-starting-lane.md](./commercial-starting-lane.md) | Narrow entry lane, not a downgrade of full-platform scope |
| Procurement, SOW, legal, finance, and security packet | [procurement-pack.md](./procurement-pack.md) | Review pack until real entities and receipts are filled |
| Buyer/seller order, sample, and handoff material | [buyer-seller-order-pack.md](./buyer-seller-order-pack.md) | Sales enablement, not validated customer proof |
| Market validation, target accounts, interview format, and investor evidence boundary | [market-validation-pack.md](./market-validation-pack.md) | Clearly separates `sample_only`, `sandbox_verified`, and real validation |
| Evidence room package map | [evidence-room-index.md](./evidence-room-index.md) | Sandbox package index, not commercial validation |
| Finance control checklist | [finance-checklist.md](./finance-checklist.md) | Operational checklist |
| US buyer payment/refund explanation | [us-buyer-payment-refund-sheet.md](./us-buyer-payment-refund-sheet.md) | Buyer-facing finance explanation |
| Evidence-weighted dispute decision table | [evidence-weighted-decision-table.md](./evidence-weighted-decision-table.md) | Operator decision aid |

## Runbooks And Templates

These are execution aids for the current starting lane and enterprise procurement motion. Keep them out of top-level onboarding unless the reader is operating that lane.

| Need | Read | Boundary |
| --- | --- | --- |
| Enterprise trial / PoC operating cadence | [poc-war-room-runbook.md](./poc-war-room-runbook.md) | Enterprise execution aid |
| War-room artifact templates | [war-room-templates.md](./war-room-templates.md) | Template inventory only |
| Readiness template | [readiness-checklist.md](./readiness-checklist.md) | Template referenced by war-room materials |
| Supplier handoff template | [handoff-note.md](./handoff-note.md) | Template referenced by war-room materials |
| Mid-review template | [mid-review-board-note.md](./mid-review-board-note.md) | Template referenced by war-room materials |
| Capacity sheet | [capacity-sheet.csv](./capacity-sheet.csv) | Starter roster, not capacity proof |

## Generated Or Machine-Checked Artifacts

| Artifact | Purpose |
| --- | --- |
| `contracts/alphaagents.contract.json` | Machine-readable command, DTO, enum, package, and evidence contract |
| `design/alphaagents-design-tokens.json` | Design token source |
| `design/visual-masters/alphaagents-visual-master.html` | Visual master source |
| `design/visual-fixtures/orders.json` | Visual state fixture source |
| `evidence-packages/AA-SANDBOX-*` | Sandbox evidence packages for structure and replayability checks |

## Cleanup Rules

- Do not create a new strategy document when the content belongs in `product-design.md`, `frontend-visual-design.md`, or `acceptance.md`.
- Do not reintroduce reduced-scope launch framing. The product is full-platform AaaS; `commercial-starting-lane.md` only defines the first sellable lane.
- Do not promote `sample_only` or `sandbox_verified` evidence to commercial validation.
- Do not link execution templates from `README.md` unless they are the shortest safe onboarding path.
- When adding a document, add it here and decide whether it is canonical, supporting, operating, template, or generated.
