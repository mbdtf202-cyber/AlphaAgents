# Terms Snapshot

| Field | Value |
| --- | --- |
| evidenceStatus | sandbox_verified |
| orderId | order_sandbox_revision_002 |
| packageTier | trial |
| orderAmountMinor | 198000 |
| currency | CNY |
| buyer-facing wording | conditional release workflow |
| external payment mode | sandbox manual confirmation |
| internal ledger wording | internal conditional release ledger, not licensed payment clearing |
| full release condition | acceptanceScore >= 85 and no critical breach |
| partial release condition | 70 <= acceptanceScore < 85 or operator partial-release decision |
| refund condition | acceptanceScore < 70 or critical breach |
| revisionLimit | 1 |
| dataRetentionDays | 365 |
| liabilityCap | sandbox order amount; real contract required before production use |

Deterministic finance formula:

```text
releaseAmountMinor = floor(orderAmountMinor * acceptedCriteriaWeightBps / 10000) - penaltyAmountMinor
refundAmountMinor = orderAmountMinor - releaseAmountMinor
```

For this revision-completed sandbox order:

```text
acceptedCriteriaWeightBps = 10000
penaltyAmountMinor = 0
releaseAmountMinor = 198000
refundAmountMinor = 0
```
