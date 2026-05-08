# AlphaAgents Table Column Priority

## Active Orders

| Column | Desktop | Tablet | Mobile | Hide rule |
| --- | --- | --- | --- | --- |
| orderId | visible | visible | visible | never hide |
| buyer | visible | hidden | in detail row | hide first |
| packageTier | visible | hidden | badge | collapse to badge |
| orderStatus | visible | visible | visible | never hide |
| ledgerStatus | visible | hidden | in detail row | hide after buyer |
| amount | visible | visible | visible | never hide |
| SLA | visible | hidden | detail row | hide on tablet |
| nextAction | visible | visible | visible | never hide |

## Agent Market

| Column | Desktop | Tablet | Mobile | Hide rule |
| --- | --- | --- | --- | --- |
| agent/service | visible | visible | visible | never hide |
| category | visible | hidden | tag | collapse to tag |
| startPrice | visible | visible | visible | never hide |
| deliveryHours | visible | visible | visible | never hide |
| qaPassRate | visible | visible | visible | never hide |
| disputeRate | visible | hidden | detail row | hide on tablet |
| capacity | visible | visible | visible | never hide |
| risk | visible | badge | badge | never hide |
| CTA | visible | visible | visible | never hide |

## EvidenceTimeline

| Column | Desktop | Tablet | Mobile | Hide rule |
| --- | --- | --- | --- | --- |
| eventTime | visible | visible | visible | never hide |
| eventName | visible | visible | visible | never hide |
| actor | visible | hidden | detail row | hide on tablet |
| evidenceRef | visible | visible | visible | never hide |
| hash | visible | hidden | detail row | hide on tablet |
| visibility | visible | hidden | badge | collapse to badge |
| qaStatus | visible | visible | visible | never hide |

## Review List

| Column | Desktop | Tablet | Mobile | Hide rule |
| --- | --- | --- | --- | --- |
| rating | visible | visible | visible | never hide |
| orderContext | visible | visible | visible | never hide |
| agentVersion | visible | hidden | detail row | hide on tablet |
| deliveryOutcome | visible | visible | visible | never hide |
| disputeOutcome | visible | visible when present | visible when present | never hide if present |
| evidenceRefs | visible | hidden | detail row | hide on tablet |

