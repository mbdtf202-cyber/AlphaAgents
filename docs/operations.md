# AlphaAgents Commercial Operations

This is the single operating document for the commercial starting lane, procurement review, sales enablement, evidence boundaries, finance controls, enterprise trial / PoC cadence, and runbook templates.

It is not the product, UI, acceptance, or machine-contract authority. If this file conflicts with `product-design.md`, `frontend-visual-design.md`, `acceptance.md`, `engineering-contract.md`, or `contracts/alphaagents.contract.json`, fix this file or the contract and rerun verification.

## 1. Commercial Starting Lane

AlphaAgents is a full Agent as a Service platform. The current first sellable lane is a narrow commercial entry lane, not a reduced product scope.

- Default first purchase: `跨境电商竞品监控与内容选题情报包`.
- Default first ICP: `US TikTok Shop beauty and personal-care` teams, plus agencies serving the same category.
- Default motion: `Trial Quick Order -> acceptance or bounded revision -> Standard / Pro repeat order -> PoC -> annual order-credit or managed program`.
- Default operating boundary: read-only public-source research or customer-uploaded copies only.
- Buyer-facing finance language: `conditional release`; internal ledger states must not be marketed as licensed payment clearing.

The first order must prove a buyer can purchase a bounded Agent-delivered result, review evidence, complete acceptance, and move through finance and reputation gates without ambiguity.

## 2. Default Trial Gate

Trial is the default first commercial action because it proves speed, evidence readability, acceptance behavior, and finance discipline before enterprise expansion.

Before payment or execution, every Trial must capture:

- buyer org name
- requester
- acceptance owner
- billing contact
- invoice requirement
- authorized payer
- read-only scope acknowledgement
- category / market / competitors
- package, SLA, price, refund boundary, acceptance window, and provider assignment rule

Execution must not start when payment proof, payer match, invoice profile, acceptance owner, or scope acknowledgement is missing.

## 3. Purchase Paths

| Path | Buyer fit | Entry | Finance | Expansion |
| --- | --- | --- | --- | --- |
| Trial Quick Order | First proof of delivery quality | `1,980 CNY`, 48h, 5 competitors | Single payment then conditional release | Can become Standard or PoC after acceptance |
| Standard / Pro | Repeatable category work | Larger evidence and output scope | Frozen terms snapshot | Repeat order or managed program |
| Enterprise PoC | Multi-order procurement review | 5-10 orders over 4-6 weeks | Contracted payment plan or order-level conditional release | Annual order-credit or managed program |
| Agent App subscription | Productized Agent delivery | subscription / usage access | Usage drawdown and cancellation proof | Program, private deployment, or custom workflow |
| Custom Agent / project | Bespoke workflow | custom intake and milestones | milestone, retainer, or order-credit | UAT, change order, renewal |
| Program / order-credit | Recurring enterprise operations | annual or quarterly credit pool | drawdown, QBR, renewal, reconciliation | category expansion |
| Revenue share / 私有部署 | Strategic enterprise lane | contract-specific terms | audited finance evidence | governed expansion only |

`per_order`, `subscription`, `order_credit`, custom, 收益分成, and 私有部署 are payment or engagement modes. None can bypass Agent identity, permissions, execution proof, QA, acceptance, dispute handling, finance evidence, or reputation writeback.

## 4. Procurement Review Pack

This section replaces the old procurement pack. It is a review aid until real contracting entity, collection entity, invoice issuer, refund remitter, legal contact, finance contact, and subprocessor records are filled.

Procurement must answer:

- what is being bought: cross-border ecommerce competitor monitoring and content-topic intelligence package
- who uses it: US TikTok Shop / Amazon beauty and personal-care growth or agency teams
- who accepts it: named acceptance owner with three buyer-facing checks
- what is excluded: production account login, publishing, ad spend, funds movement, private data scraping, unlimited revision, Agent source-code buyout
- how money is controlled: payment confirmation, QA before acceptance, conditional release, refund, partial release, reconciliation export
- what evidence exists: delivery package, evidence index, QA checklist, acceptance record, finance ledger, ROI retrospective

Enterprise, custom, subscription, order-credit, PoC, and 高风险权限 purchases require explicit authority chain, invoice readiness, signer, payer, legal/security review, scope acknowledgement, and permission preview before execution.

## 5. Buyer Acceptance Mini Terms

Trial buyers only judge three things:

| Check | Pass condition | Failed action |
| --- | --- | --- |
| Competitor coverage | 5 agreed competitors are covered, or source limitations are disclosed | Bounded revision |
| Evidence replayability | Key claims have EvidenceRef, live links, screenshots, or hash fallback | Bounded revision or dispute |
| Usable topics | At least 10 topic ideas can enter content planning | Bounded revision |

The platform can keep internal QA scoring, weighted release formulas, and dispute rules, but first-order buyers should not need to learn the full scoring model.

## 6. Sandbox Packages And Evidence Status

Current sandbox packages:

| Package | Status | Purpose |
| --- | --- | --- |
| `AA-SANDBOX-TRIAL-001` | `sample_only + sandbox_verified` | Accepted Trial path |
| `AA-SANDBOX-REVISION-002` | `sample_only + sandbox_verified` | Bounded revision path |
| `AA-SANDBOX-DISPUTE-003` | `sample_only + sandbox_verified` | Dispute and partial-release path |

Evidence statuses:

| Status | Meaning |
| --- | --- |
| `validated` | Real payment, signed contract, procurement email, LOI, customer-authorized delivery package, or customer-authorized acceptance evidence |
| `sandbox_verified` | Artifact structure, event sequence, finance ledger, and UI/CLI/API replay are verified in repo fixtures |
| `in_conversation` | Clear buyer contact, budget, acceptance owner, next step, and expected timing |
| `sample_only` | Sales demo or product test, never customer proof |
| `target_to_collect` | Target account or evidence gap not yet collected |

Rules:

- `sandbox_verified` never upgrades to `validated` by itself.
- `sample_only + sandbox_verified` is safe for demos and CI, not investor or customer proof.
- Missing legal entity, collection entity, refund path, or invoice issuer means `not_signable`.
- Validated business readiness requires payment evidence, acceptance evidence, finance evidence, and honest ICP-specific repeatability.
- Gate phrase for verification: validated business readiness requires payment evidence.

## 7. Validated Evidence Gap

Current repository status:

- 0 real paid Trial orders.
- 0 customer-authorized delivery packages.
- 0 procurement emails or signed LOIs.
- 0 repeat buyers.
- 3 sandbox-verified packages proving accepted, revision, and dispute replayability.

What we can claim now:

- Product and evidence-package structure are `sandbox_verified`.
- The starting lane, Trial gate, buyer acceptance terms, conditional release language, and procurement review requirements are specified.
- UI, CLI, API, event, finance, and evidence replayability are verified against sandbox packages.
- 不能声称已有真实付费客户，不能把样例访谈、目标账户、沙盒包或模板包装成真实商业牵引。

Minimum upgrade path to `validated`:

1. Add paid Trial receipt or signed LOI with buyer authorization to retain a redacted proof record.
2. Add customer-authorized evidence package with redacted public-safe content.
3. Add buyer acceptance, bounded revision, or dispute outcome.
4. Add ROI retrospective with buyer-confirmed fields separated from platform estimates.
5. Add repeat order, second Trial, Standard upgrade, or annual order-credit negotiation record.

## 8. Market Validation Operating Frame

Starting ICP remains intentionally narrow:

- US TikTok Shop / Amazon beauty and personal-care brand content teams.
- Cross-border agencies serving 5-20 similar beauty, skincare, personal-care, oral-care, hair-care, men's-care, or beauty-device accounts.

Do not pursue buyers who require production account login, automatic publishing, ad-budget operation, funds movement, prompt/source-code purchase, or vague monthly AI tooling without a named acceptance owner.

Every target account, interview, LOI, or case record must carry one of the evidence statuses above. Financing material may only put `validated` records in the validated section.

## 9. Enterprise Trial / PoC Cadence

Enterprise trial / PoC is an operating mode for buyers already in procurement or multi-order evaluation. It is not the default product entry and does not reduce the full-platform AaaS scope.

Success definition:

- 5-10 order-level transactions complete the evidence -> QA -> acceptance -> finance -> reputation loop.
- At least 70% orders are accepted and total loop completion is at least 80%.
- At least one buyer places three orders or enters annual order-credit discussion.
- Every order has evidence package, finance ledger, QA, AcceptanceReview, and ROI retrospective.
- High-risk permission bypass incidents remain 0.

Daily war-room ledger fields:

- `activeOrders`
- `blockedOrders`
- `cashStatus`
- `qaStatus`
- `sellerCapacity`
- `buyerNextAction`
- `riskEvents`

Go / no-go before first funded order:

- buyer owner named
- package tier frozen
- payment proof path defined
- acceptance owner named
- prohibited-source confirmation complete
- primary and backup supplier assigned
- QA owner assigned
- finance approver assigned

## 10. Finance And Dispute Templates

Finance checklist fields:

- payer entity
- payment reference
- amount
- currency
- invoice needed yes/no
- refund target
- finance approver

Evidence-weighted dispute decision fields:

- orderId
- disputeId
- acceptedCriteriaWeightBps
- penaltyAmountMinor
- releaseAmountMinor
- refundAmountMinor
- operatorReason

Handoff fields:

- orderId
- originalSupplier
- backupSupplier
- handoffReason
- evidenceShared
- customerVisibleNotice

Mid-review fields:

- completedOrders
- passRate
- disputeRate
- qaRejectRate
- averageReviewHours
- marginTrend
- blockerActions

All entries in this section are templates until linked to validated buyer, order, evidence, finance, and acceptance artifacts.

## 11. US Buyer Payment / Refund Sheet

Buyer-facing finance explanation:

- Contracting entity, collection entity, invoice issuer, refund remitter, legal contact, finance contact, and subprocessors are not filled in this repository.
- The package is suitable for business review and product evaluation, not enterprise legal or finance sign-off.
- Refunds must go back to the original payer or a contract-authorized payer.
- Trial payment confirmation target: 2 hours after valid proof.
- Refund target after approved decision: 5 business days.
- Internal state names may use `EscrowOrder`, but buyer-facing language remains `conditional release workflow`.
