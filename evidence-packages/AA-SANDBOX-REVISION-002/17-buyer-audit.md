# Buyer 2-minute Audit

Evidence status: sandbox_verified

This checklist lets a buyer sponsor inspect whether the revision package is internally traceable. It does not prove real payment or real customer demand.

## Steps

1. Open `07-delivery.pdf` and confirm it states the package id, five competitors, 15 topics, and sandbox status.
2. Open `08-topics.csv` or `08-topics.xlsx` and count 15 topic rows.
3. Pick any five topic rows and copy their `evidenceRefs`.
4. Open `09-evidence-index.csv` and confirm every copied EvidenceRef exists, has `qaStatus=passed`, and has a source URL or artifact URI.
5. Open `11-acceptance-review.json` and confirm `reviewStatus=accepted` and `totalScore >= 85`.
6. Open `12-finance-ledger.json` and confirm `ledgerStatus=released`, `releasedAmountMinor=198000`, and `refundAmountMinor=0`.
7. Open `15-event-sequence.json` and confirm `RevisionRequested` and `RevisionRunStarted` both exist before the final release event.
8. Open `16-cli-api-ui-snapshots.json` and confirm UI, CLI, and API `orderDto` objects match.

## Deterministic sample

| Topic | EvidenceRefs to inspect |
| --- | --- |
| topic_001 | ev_001, ev_002 |
| topic_003 | ev_010, ev_011 |
| topic_005 | ev_013, ev_014 |
| topic_011 | ev_002, ev_014 |
| topic_015 | ev_010, ev_015 |

Pass condition: all referenced evidence ids exist in `09-evidence-index.csv`, `RevisionRequested` exists before release, and no sampled evidence row claims `validated` commercial proof.
