# AlphaAgents Documentation Index

This directory is the default entry point for project context. Read this file first, then open only the one document needed for the task.

## Authority Order

1. `README.md` defines the public product position and shortest onboarding path.
2. `docs/README.md` routes readers and prevents stale context from becoming the default.
3. `docs/product-design.md` is the product authority for platform scope, categories, transactions, roles, domain objects, and business boundaries.
4. `docs/frontend-visual-design.md` is the UI authority for surfaces, layout, interaction language, visual system, responsive rules, and accessibility.
5. `docs/acceptance.md` is the delivery authority. A feature is incomplete unless it satisfies this checklist and the matching verification scripts.
6. `docs/engineering-contract.md` explains the machine contract. `contracts/alphaagents.contract.json` remains the machine-readable source of truth.
7. `docs/operations.md` is the commercial operations authority for the starting lane, procurement review, sales enablement, evidence status, finance controls, enterprise trial / PoC cadence, and templates.

## Canonical Documents

| Need | Read | Status |
| --- | --- | --- |
| Public positioning and shortest setup path | [../README.md](../README.md) | Entry |
| Product scope and AaaS model | [product-design.md](./product-design.md) | Canonical |
| Frontend surfaces, visual system, responsive rules, and table degradation | [frontend-visual-design.md](./frontend-visual-design.md) | Canonical |
| Acceptance and completion gates | [acceptance.md](./acceptance.md) | Canonical |
| Domain, command, event, DTO, security, and state rules | [engineering-contract.md](./engineering-contract.md) | Contract explanation |
| Commercial starting lane, procurement, evidence, finance, and runbooks | [operations.md](./operations.md) | Operating contract |

## Generated Or Machine-Checked Artifacts

| Artifact | Purpose |
| --- | --- |
| `contracts/alphaagents.contract.json` | Machine-readable command, DTO, enum, package, and evidence contract |
| `design/alphaagents-design-tokens.json` | Design token source |
| `design/visual-masters/alphaagents-visual-master.html` | Visual master source |
| `design/visual-fixtures/orders.json` | Visual state fixture source |
| `evidence-packages/AA-SANDBOX-*` | Sandbox evidence packages for structure and replayability checks |

## Cleanup Rules

- Do not create a new strategy, procurement, evidence, finance, runbook, template, breakpoint, or table-priority document.
- Put product scope in `product-design.md`, UI and responsive rules in `frontend-visual-design.md`, completion rules in `acceptance.md`, contract explanations in `engineering-contract.md`, and commercial operations in `operations.md`.
- Do not reintroduce reduced-scope launch framing. The product is full-platform AaaS; `operations.md` only defines the first sellable lane and operating controls.
- Do not promote `sample_only` or `sandbox_verified` evidence to commercial validation.
- Do not link execution templates from `README.md`; keep templates embedded in `operations.md`.
