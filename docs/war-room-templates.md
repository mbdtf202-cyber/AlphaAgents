# AlphaAgents War-room Templates

These templates convert the enterprise trial / PoC runbook into executable operating artifacts. They are repository-ready scaffolds, not canonical requirements and not evidence of real customer orders.

## Template Inventory

| File | Purpose |
| --- | --- |
| `readiness-checklist.md` | Go / no-go before first funded order |
| `finance-checklist.md` | Payment, invoice, refund, and reconciliation checks |
| `capacity-sheet.csv` | Primary and backup supplier capacity ledger |
| `evidence-weighted-decision-table.md` | Partial-release and refund decision record |
| `handoff-note.md` | Supplier handoff and backup activation record |
| `mid-review-board-note.md` | D15-D21 operating review summary |

## Minimum fields

`readiness-checklist.md`

- buyer owner
- package tier
- payment proof present
- acceptance owner
- prohibited source confirmation
- supplier primary
- supplier backup
- QA owner

`finance-checklist.md`

- payer entity
- payment reference
- amount
- currency
- invoice needed yes/no
- refund target
- finance approver

`capacity-sheet.csv`

- supplierId
- role
- category
- weeklyCapacity
- qaPassTarget
- backupFor
- status

`evidence-weighted-decision-table.md`

- orderId
- disputeId
- acceptedCriteriaWeightBps
- penaltyAmountMinor
- releaseAmountMinor
- refundAmountMinor
- operatorReason

`handoff-note.md`

- orderId
- originalSupplier
- backupSupplier
- handoffReason
- evidenceShared
- customerVisibleNotice

`mid-review-board-note.md`

- completedOrders
- passRate
- disputeRate
- qaRejectRate
- averageReviewHours
- marginTrend
- blockerActions
