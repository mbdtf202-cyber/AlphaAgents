# AlphaAgents US Buyer Payment / Refund Sheet

This sheet is buyer-facing. It explains first-order payment and refund handling in one page. It is not a claim of licensed payment clearing.

## What the buyer needs to know

| Question | Current answer |
| --- | --- |
| Who signs the order? | The contracting entity is not yet filled in this repository. Until it is filled, the package is for business review only and is not enterprise procurement ready. |
| Who receives payment? | The collection entity is not yet filled in this repository. Payment routing cannot be treated as final legal guidance until that field is filled. |
| Who issues the invoice? | The invoice issuer is not yet filled in this repository. Trial buyers can review the product pack, but finance review must wait for a filled issuer entity. |
| Who receives the refund? | Refunds must go back to the original payer or a contract-authorized payer. The final remitter entity is not yet filled in this repository. |
| How long do payment/refund actions take? | Trial payment confirmation target: 2 hours after valid proof. Refund target after approved decision: 5 business days. |

## What is already fixed

- Trial default package: `1,980 CNY`, `48 hours`, `5 competitors`, `20 evidence refs`, `15 topic ideas`.
- No execution starts before payment confirmation.
- QA must pass before buyer acceptance.
- Buyer can only choose `accept`, `request one bounded revision`, or `open dispute`.
- Funds can only be `released`, `partially released`, or `refunded` after acceptance or dispute resolution.

## Current legal status

- Suitable for business review and product evaluation.
- Not suitable for enterprise legal or finance sign-off until `contractingEntity`, `collectionEntity`, `invoiceIssuer`, `refundRemitter`, `legalContact`, `financeContact`, and `subprocessors` are filled.
- Internal state names may use `EscrowOrder`, but buyer-facing language remains `conditional release workflow`.
