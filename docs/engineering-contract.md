# AlphaAgents 工程契约文档

## 1. 契约地位

机器可读唯一真相源是 [contracts/alphaagents.contract.json](../contracts/alphaagents.contract.json)。本文件是该契约的人类解释层，用来说明设计意图、状态机边界和实现约束；当本文与 JSON 契约冲突时，以 JSON 契约为准，并同步修正文档。

产品文档描述业务意图，验收文档描述通过标准，视觉文档描述界面呈现；实现、数据库、DTO、CLI、API、Agent runtime、事件和测试必须引用同一份机器契约。

硬规则：

- UI、CLI、API、Agent runtime 只能调用同一组 command handlers。
- 所有状态变化只能由 command handler 产生 domain events 后落库。
- 8 个写模型是交易终态唯一 owner；读模型不得持有交易终态。
- 所有写模型使用专用状态字段，不使用泛化 `status` 字段。
- 所有命令必须幂等，必须携带 `expectedVersion`，并使用乐观锁。
- CLI `--json`、API response、UI state snapshot、runtime callback 必须复用同一 DTO。
- 测试必须能从本文件生成 golden path、revision、dispute、refund、permission denial、idempotency replay、tenant isolation、CLI/API/UI equivalence 场景。

## 2. Canonical 命名

### 2.1 状态字段

| 写模型 | Canonical 状态字段 |
| --- | --- |
| `RFP` | `rfpStatus` |
| `Proposal` | `proposalStatus` |
| `EscrowOrder` | `orderStatus`, `ledgerStatus`, `acceptanceStatus` |
| `RiskPermissionGrant` | `grantStatus` |
| `ExecutionRun` | `runStatus` |
| `DeliveryPackage` | `deliveryStatus` |
| `AcceptanceReview` | `reviewStatus` |
| `ReputationEvent` | `eventStatus` |

禁止事项：

- 不得在写模型上新增泛化 `status` 字段。
- 不得在读模型中重新命名交易状态。
- UI badge、CLI 输出和 API DTO 必须使用上表字段名。

### 2.2 通用类型

```ts
type ID<T extends string> = `${T}_${string}`;
type Currency = "CNY";
type SourceChannel = "ui" | "cli" | "api" | "runtime" | "system";
type ActorRole = "buyer" | "seller" | "operator" | "agent_runtime" | "system";
type SubjectType = "agent" | "seller" | "agent_app";

type ErrorCode =
  | "ACTOR_FORBIDDEN"
  | "TENANT_FORBIDDEN"
  | "TOKEN_SCOPE_FORBIDDEN"
  | "VERSION_CONFLICT"
  | "IDEMPOTENCY_CONFLICT"
  | "VALIDATION_FAILED"
  | "STATE_CONFLICT"
  | "RFP_INCOMPLETE"
  | "RFP_NOT_OPEN"
  | "SELLER_NOT_APPROVED"
  | "PROPOSAL_EXPIRED"
  | "PAYMENT_NOT_CONFIRMED"
  | "ESCROW_NOT_FUNDED"
  | "PERMISSION_DENIED"
  | "DELIVERY_INCOMPLETE"
  | "QA_CHECK_FAILED"
  | "CRITERIA_NOT_CONFIRMED"
  | "REVISION_LIMIT_REACHED"
  | "SCOPE_EXPANSION_REQUIRED"
  | "DISPUTE_REASON_REQUIRED"
  | "DECISION_INCOMPLETE"
  | "ORDER_NOT_COMPLETED"
  | "DUPLICATE_RATING"
  | "EVIDENCE_NOT_VISIBLE"
  | "RATE_LIMITED";

interface EvidenceRef {
  id: ID<"ev">;
  tenantId: ID<"org">;
  orderId: ID<"order">;
  sourceType: "public_url" | "buyer_upload" | "runtime_output" | "operator_note" | "finance_record" | "qa_record";
  uri: string;
  hash: string;
  capturedAt: string;
  visibility: "buyer" | "seller" | "operator" | "public_anonymized";
  redactionStatus: "none" | "redacted" | "restricted";
  retentionDays: number;
  linkedClaimId?: string;
  qaStatus: "pending" | "passed" | "failed";
}

interface CommandEnvelope<TPayload> {
  commandId: ID<"cmd">;
  actorId: ID<"user"> | ID<"agent_runtime"> | ID<"system">;
  actorRole: ActorRole;
  sourceChannel: SourceChannel;
  tenantId: ID<"org">;
  tokenScopes: string[];
  idempotencyKey: string;
  correlationId: string;
  expectedVersion: number;
  payload: TPayload;
}

interface CommandSuccess<TEvent, TDto> {
  ok: true;
  aggregateId: string;
  newVersion: number;
  events: TEvent[];
  dto: TDto;
}

interface BuyerOrgProfile {
  id: ID<"org">;
  lifecycleStage: "anonymous_visitor" | "trial_lead" | "org_setup" | "trial_paid" | "accepted_trial" | "repeat_buyer" | "poc_program" | "annual_order_credit_customer" | "churn_risk";
  requesterUserId?: ID<"user">;
  acceptanceOwnerUserId?: ID<"user">;
  financeContactUserId?: ID<"user">;
  authorizedPayerId?: ID<"payer">;
  signerIds: ID<"signer">[];
  invoiceReadiness: "missing" | "partial" | "ready";
  scopeAcknowledgement: "missing" | "accepted";
}

interface BeneficiaryProfile {
  id: ID<"beneficiary">;
  sellerId: ID<"seller">;
  payoutReadiness: "missing" | "kyb_lite_pending" | "ready";
  billingEntityMatch: "matched" | "mismatch" | "unknown";
}

interface AuthorizedSigner {
  id: ID<"signer">;
  orgId: ID<"org">;
  canSign: boolean;
  canApprovePayment: boolean;
  canAcceptDelivery: boolean;
}

interface ProgramWorkspace {
  id: ID<"program">;
  buyerOrgId: ID<"org">;
  activeCreditMinor: number;
  backlogValueMinor: number;
  renewalBlockers: string[];
  qbrStatus: "not_started" | "in_progress" | "ready";
}

interface CommandFailure {
  ok: false;
  errorCode: ErrorCode;
  message: string;
  fieldErrors?: Record<string, string>;
  currentVersion?: number;
  auditEventId?: ID<"event">;
}

type CommandResult<TEvent, TDto> = CommandSuccess<TEvent, TDto> | CommandFailure;
```

### 2.3 Canonical ErrorCode / AuditEventName

错误码、事件名、DTO 字段、command payload、token scope 的可执行列表以 [contracts/alphaagents.contract.json](../contracts/alphaagents.contract.json) 为准。本文只保留解释性表格，防止 UI、CLI、API、runtime 四处复制后漂移。

| ErrorCode | 触发场景 | 必须写入的审计事件 |
| --- | --- | --- |
| `ACTOR_FORBIDDEN` | 角色不允许执行该 command | `CommandActorDenied` |
| `TENANT_FORBIDDEN` | 访问其他租户对象或 tenant mismatch | `UnauthorizedAccessAttempted` |
| `TOKEN_SCOPE_FORBIDDEN` | token 缺少 command scope | `TokenScopeDenied` |
| `VERSION_CONFLICT` | `expectedVersion` 与聚合版本不一致 | `OptimisticLockRejected` |
| `IDEMPOTENCY_CONFLICT` | 同一 idempotency key 搭配不同 payload | `IdempotencyConflictDetected` |
| `VALIDATION_FAILED` | 字段、范围、MVP 风险边界或 payload 校验失败 | `CommandValidationFailed` |
| `STATE_CONFLICT` | 状态机不允许该迁移 | `StateTransitionRejected` |
| `EVIDENCE_NOT_VISIBLE` | EvidenceRef 不属于本租户或可见范围不允许 | `EvidenceAccessDenied` |
| `PERMISSION_DENIED` | runtime 工具超出 grant allowlist | `PermissionDenied` |
| `RATE_LIMITED` | 超出命令、导出、runtime 或财务频率限制 | `RateLimitDenied` |

## 3. 写模型 Schema

组织、签约、收款和 Program 相关对象在 MVP 中是读模型或投影，不是新的交易终态 owner：

- `BuyerOrgProfile`
- `BeneficiaryProfile`
- `AuthorizedSigner`
- `ProgramWorkspace`

它们服务于 `public showcase -> signup / buyer org setup -> guided trial activation -> order workspace -> evidence room -> program ops` 这条旅程，但不得绕过 `RFP`、`EscrowOrder`、`AcceptanceReview` 或 `ReputationEvent` 修改交易真相。

对应命令边界也必须机器可读并与 UI/API/CLI 对齐：

- `buyer-org.setup` 只更新买方组织签约、付款、验收和 scope acknowledgement 相关字段，不得直接改写订单终态。
- `agent-app.install`、`agent-app.record-usage`、`agent-app.exit` 只维护 Agent App 安装/使用/退出记录，不能绕过订单、证据、验收、财务和声誉链。
- `program.allocate-credit`、`program.record-drawdown`、`program.update-qbr` 只更新 ProgramWorkspace 投影与 program event，不得直接改写 EscrowOrder、AcceptanceReview 或 ReputationEvent。

### 3.1 RFP

```ts
type RfpStatus = "draft" | "published" | "quoting" | "selected" | "ordered" | "cancelled";

interface RFP {
  id: ID<"rfp">;
  tenantId: ID<"org">;
  buyerOrgId: ID<"org">;
  createdBy: ID<"user">;
  rfpStatus: RfpStatus;
  version: number;
  sku: "cross_border_competitor_topic_pack";
  packageTier: "trial" | "standard" | "pro";
  category: string;
  market: string;
  channels: string[];
  language: string;
  competitors: string[];
  competitorDiscoveryRule?: string;
  prohibitedSources: string[];
  deliverableFormat: ("pdf" | "xlsx" | "md" | "csv")[];
  acceptanceTemplateId: ID<"acceptance_template">;
  budgetAmountMinor: number;
  currency: Currency;
  deadlineAt: string;
  invoiceProfileId?: ID<"invoice_profile">;
  attachmentRefs: ID<"ev">[];
  eventRefs: ID<"event">[];
  createdAt: string;
  updatedAt: string;
}
```

Invariants:

- `rfpStatus="ordered"` requires one selected proposal and one created EscrowOrder.
- `budgetAmountMinor > 0`.
- `prohibitedSources` must include production account, private group, paid account, ad account, and fund movement exclusions for MVP.
- `deadlineAt` must respect package SLA.

### 3.2 Proposal

```ts
type ProposalStatus = "submitted" | "selected" | "declined" | "expired" | "withdrawn";

interface Proposal {
  id: ID<"proposal">;
  tenantId: ID<"org">;
  rfpId: ID<"rfp">;
  sellerId: ID<"seller">;
  agentId: ID<"agent">;
  proposalStatus: ProposalStatus;
  version: number;
  priceAmountMinor: number;
  currency: Currency;
  deliveryHours: number;
  includedScope: string[];
  outOfScopePricing: string[];
  evidenceStandard: string;
  revisionLimit: 1;
  responsibleOwner: string;
  capacityReservedUntil: string;
  proposalSnapshot: Record<string, unknown>;
  eventRefs: ID<"event">[];
  createdAt: string;
  updatedAt: string;
}
```

Invariants:

- At most one `selected` proposal per RFP.
- Selecting one proposal emits decline/expiry events for non-selected proposals.
- Seller must be approved and have available capacity at submission time.

### 3.3 EscrowOrder

```ts
type OrderStatus =
  | "created"
  | "funded"
  | "in_progress"
  | "delivery_submitted"
  | "ready_for_acceptance"
  | "revision_requested"
  | "disputed"
  | "resolved"
  | "accepted"
  | "released"
  | "partially_released"
  | "refunded"
  | "closed";

type LedgerStatus = "not_funded" | "escrowed" | "locked" | "released" | "partially_released" | "refunded";
type AcceptanceStatus = "not_ready" | "qa_pending" | "ready" | "accepted" | "revision_requested" | "disputed" | "resolved";

interface EscrowOrder {
  id: ID<"order">;
  tenantId: ID<"org">;
  rfpId: ID<"rfp">;
  proposalId: ID<"proposal">;
  buyerOrgId: ID<"org">;
  sellerId: ID<"seller">;
  agentId: ID<"agent">;
  orderStatus: OrderStatus;
  ledgerStatus: LedgerStatus;
  acceptanceStatus: AcceptanceStatus;
  version: number;
  amountMinor: number;
  currency: Currency;
  platformFeeBps: number;
  providerPayoutMinor: number;
  releasedAmountMinor: number;
  refundAmountMinor: number;
  revisionUsed: boolean;
  termsSnapshot: Record<string, unknown>;
  releaseRules: Record<string, unknown>;
  paymentRef?: string;
  invoiceProfileId?: ID<"invoice_profile">;
  eventRefs: ID<"event">[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}
```

Invariants:

- Execution cannot start before `ledgerStatus="escrowed"` or `ledgerStatus="locked"`.
- `released`, `partially_released`, `refunded`, and `closed` are execution-terminal.
- `ledgerStatus` cannot move from `released`, `partially_released`, or `refunded` back to `escrowed`.
- Funds cannot move while `orderStatus="disputed"` before `dispute.resolve`.

### 3.4 RiskPermissionGrant

```ts
type GrantStatus = "requested" | "approved" | "revoked" | "expired" | "denied";

interface RiskPermissionGrant {
  id: ID<"grant">;
  tenantId: ID<"org">;
  orderId: ID<"order">;
  agentId: ID<"agent">;
  grantStatus: GrantStatus;
  version: number;
  resourceType: "public_web" | "buyer_upload" | "generated_artifact";
  permissions: ("read" | "write_artifact")[];
  toolAllowlist: string[];
  expiresAt: string;
  approvedBy: ID<"user"> | ID<"system">;
  revokedBy?: ID<"user">;
  eventRefs: ID<"event">[];
}
```

Invariants:

- MVP grant cannot include account publishing, ad spend, fund movement, production mutation, or destructive delete tools.
- Runtime must present an approved, unexpired grant for every tool call.

### 3.5 ExecutionRun

```ts
type RunStatus = "queued" | "running" | "succeeded" | "failed" | "cancelled";

interface ExecutionRun {
  id: ID<"run">;
  tenantId: ID<"org">;
  orderId: ID<"order">;
  agentId: ID<"agent">;
  runStatus: RunStatus;
  version: number;
  inputRefs: ID<"ev">[];
  permissionGrantIds: ID<"grant">[];
  startedAt?: string;
  endedAt?: string;
  costUsageMinor: number;
  toolCallRefs: ID<"tool_call">[];
  outputRefs: ID<"ev">[];
  failureReason?: string;
  eventRefs: ID<"event">[];
}
```

Invariants:

- Run can write evidence but cannot decide QA, acceptance, ledger, or reputation.
- Failed run must include `failureReason` and audit event.

### 3.6 DeliveryPackage

```ts
type DeliveryStatus = "draft" | "submitted" | "qa_passed" | "qa_rejected" | "superseded";

interface DeliveryPackage {
  id: ID<"delivery">;
  tenantId: ID<"org">;
  orderId: ID<"order">;
  deliveryStatus: DeliveryStatus;
  version: number;
  executionRunIds: ID<"run">[];
  artifactRefs: ID<"ev">[];
  evidenceRefs: ID<"ev">[];
  summary: string;
  criteriaMapping: Record<string, ID<"ev">[]>;
  knownLimitations: string[];
  submittedBy: ID<"user"> | ID<"agent_runtime">;
  submittedAt?: string;
  qaChecklistId?: ID<"qa">;
  supersedesDeliveryId?: ID<"delivery">;
  eventRefs: ID<"event">[];
}
```

Invariants:

- Submitted package requires at least one artifact, one evidence ref, criteria mapping, and known limitations.
- QA rejection never consumes buyer revision allowance.
- Resubmission creates a new delivery or marks prior package `superseded`; it must not overwrite old package records.

### 3.7 AcceptanceReview

```ts
type ReviewStatus = "accepted" | "revision_requested" | "disputed";

interface AcceptanceReview {
  id: ID<"review">;
  tenantId: ID<"org">;
  orderId: ID<"order">;
  deliveryPackageId: ID<"delivery">;
  reviewStatus: ReviewStatus;
  version: number;
  criteriaScores: Record<string, number>;
  totalScore: number;
  decisionReason: string;
  requestedFixes?: string[];
  disputeReason?: string;
  submittedBy: ID<"user"> | ID<"operator">;
  eventRefs: ID<"event">[];
  createdAt: string;
}
```

Invariants:

- Accepted review requires all required criteria confirmed.
- Revision review must bind each requested fix to a failed criterion.
- Dispute review must include reason and evidence refs.

### 3.8 ReputationEvent

```ts
type ReputationEventStatus = "pending" | "published" | "hidden_by_policy";

interface ReputationEvent {
  id: ID<"rep">;
  tenantId: ID<"org">;
  subjectType: SubjectType;
  subjectId: ID<"agent"> | ID<"seller"> | ID<"agent_app">;
  sourceOrderId: ID<"order">;
  eventStatus: ReputationEventStatus;
  version: number;
  agentVersion: string;
  ratingBreakdown: {
    quality: number;
    timeliness: number;
    evidence: number;
    communication: number;
    value: number;
  };
  deliveryOutcome: "accepted" | "partially_released" | "refunded" | "disputed_resolved";
  disputeOutcome?: string;
  evidenceRefs: ID<"ev">[];
  eventRefs: ID<"event">[];
  createdAt: string;
}
```

Invariants:

- Only completed, partially released, refunded, or resolved disputed orders can produce reputation events.
- One buyer rating per order per subject.
- Negative outcomes cannot be hidden unless policy moderation records `hidden_by_policy`.
- `agent_app` follows the same reputation, dispute, and evidence rules as `agent`; it is not a looser subject type.

## 4. 完整状态迁移表

### 4.1 RFP

| From | Command | Guard | To | Event | Side effect | Forbidden |
| --- | --- | --- | --- | --- | --- | --- |
| new | `rfp.create` | buyer tenant valid, required draft fields valid | `draft` | `RfpDraftCreated` | save draft | non-buyer actor |
| `draft` | `rfp.publish` | acceptance template, budget, deliverables, permission scope complete | `published` | `RfpPublished` | visible to approved sellers | high-risk MVP scope |
| `published` | `proposal.submit` | seller approved, capacity available | `quoting` | `ProposalSubmitted` | create Proposal | seller not approved |
| `quoting` | `proposal.submit` | RFP open | `quoting` | `ProposalSubmitted` | add Proposal | expired RFP |
| `published`/`quoting` | `proposal.accept` | buyer owns RFP, proposal valid | `selected` | `ProposalSelected` | create EscrowOrder `created` | wrong tenant |
| `selected` | `escrow.fund` | payment confirmed | `ordered` | `RfpOrdered` | order becomes funded | payment missing |
| `draft`/`published`/`quoting` | `rfp.cancel` | buyer owner, no selected proposal | `cancelled` | `RfpCancelled` | notify sellers | selected/ordered |

### 4.2 Proposal

| From | Command | Guard | To | Event | Side effect | Forbidden |
| --- | --- | --- | --- | --- | --- | --- |
| new | `proposal.submit` | RFP published/quoting, seller approved, agent passport valid | `submitted` | `ProposalSubmitted` | reserve capacity | unapproved seller |
| `submitted` | `proposal.accept` | buyer owns RFP, proposal unexpired | `selected` | `ProposalSelected` | decline/expire other proposals | expired proposal |
| `submitted` | `proposal.withdraw` | seller owns proposal | `withdrawn` | `ProposalWithdrawn` | release capacity | selected proposal |
| `submitted` | system expiry | capacity deadline passed | `expired` | `ProposalExpired` | release capacity | already selected |
| `submitted` | system decline | another proposal selected | `declined` | `ProposalDeclined` | release capacity | none |

### 4.3 EscrowOrder

| From | Command | Guard | To | Event | Side effect | Forbidden |
| --- | --- | --- | --- | --- | --- | --- |
| new | `proposal.accept` | proposal selected | `created` | `EscrowOrderCreated` | ledger `not_funded`, acceptance `not_ready` | direct order create |
| `created` | `escrow.fund` | payment confirmed, terms signed | `funded` | `EscrowFunded` | ledger `escrowed`; create default grant request | missing payment |
| `funded` | `run.start` | grants approved, no freeze | `in_progress` | `RunStarted` | ledger `locked`; create ExecutionRun | grant denied/expired |
| `revision_requested` | `run.start` | revision allowed, grants approved | `in_progress` | `RevisionRunStarted` | create revision ExecutionRun | revision limit reached |
| `in_progress` | `delivery.submit` | delivery complete, run succeeded or seller attested | `delivery_submitted` | `DeliverySubmitted` | acceptance `qa_pending` | incomplete delivery |
| `delivery_submitted` | `delivery.qa_pass` | QA checklist pass | `ready_for_acceptance` | `DeliveryQaPassed` | acceptance `ready`, notify buyer | failed QA |
| `delivery_submitted` | `delivery.qa_reject` | failed items recorded | `in_progress` | `DeliveryQaRejected` | return to seller, no buyer revision consumed | missing reject reason |
| `ready_for_acceptance` | `acceptance.accept` | buyer confirms criteria | `accepted` | `AcceptanceAccepted` | acceptance `accepted` | missing criteria |
| `accepted` | `escrow.release` | ledger locked, no dispute | `released` | `EscrowReleased` | ledger `released` | dispute open |
| `released` | `rating.submit` | buyer rating not submitted | `closed` | `ReputationEventCreated` | publish reputation | duplicate rating |
| `ready_for_acceptance` | `acceptance.request-revision` | failed criteria, revision unused | `revision_requested` | `RevisionRequested` | acceptance `revision_requested` | scope expansion |
| `ready_for_acceptance` | `dispute.open` | reason and evidence refs present | `disputed` | `DisputeOpened` | acceptance `disputed`, freeze ledger | missing reason |
| `revision_requested` | `dispute.open` | seller missed SLA or revision unsatisfactory | `disputed` | `DisputeOpened` | freeze ledger | no buyer claim |
| `disputed` | `dispute.resolve` | decision table complete | `resolved` | `DisputeResolved` | acceptance `resolved` | incomplete decision |
| `resolved` | `escrow.release` | decision full release | `released` | `EscrowReleased` | ledger `released` | wrong decision |
| `resolved` | `escrow.partial-release` | decision has release/refund split | `partially_released` | `EscrowPartiallyReleased` | ledger `partially_released` | split mismatch |
| `resolved` | `escrow.refund` | decision refund | `refunded` | `EscrowRefunded` | ledger `refunded` | wrong decision |
| `resolved` | `acceptance.request-revision` | decision continue revision | `revision_requested` | `RevisionRequested` | keep ledger locked | no revision decision |

Forbidden global transitions:

- `created -> in_progress`
- `funded -> accepted`
- `delivery_submitted -> accepted`
- `revision_requested -> released`
- `disputed -> released`
- `released/refunded/partially_released/closed -> in_progress`

### 4.4 RiskPermissionGrant

| From | Command | Guard | To | Event | Side effect | Forbidden |
| --- | --- | --- | --- | --- | --- | --- |
| new | `escrow.fund` | order funded, MVP resource scope | `requested` | `PermissionRequested` | queue approval | high-risk tool |
| `requested` | `permission.approve` | operator/system approval, allowlist valid | `approved` | `PermissionApproved` | runtime can start | unsupported tool |
| `requested` | `permission.deny` | reason present | `denied` | `PermissionDenied` | block run | missing reason |
| `approved` | `permission.revoke` | operator owner | `revoked` | `PermissionRevoked` | cancel future tool calls | wrong tenant |
| `approved` | system expiry | `expiresAt` passed | `expired` | `PermissionExpired` | runtime access denied | none |

### 4.5 ExecutionRun

| From | Command | Guard | To | Event | Side effect | Forbidden |
| --- | --- | --- | --- | --- | --- | --- |
| new | `run.start` | order funded/revision, grants approved | `queued` | `RunQueued` | queue runtime job | unfunded order |
| `queued` | runtime callback | worker picked up job | `running` | `RunStarted` | tool access audit begins | grant expired |
| `running` | runtime callback | outputs produced | `succeeded` | `RunSucceeded` | attach output EvidenceRefs | unauthorized output |
| `running` | runtime callback | failure reason present | `failed` | `RunFailed` | notify seller/operator | missing reason |
| `queued`/`running` | `run.cancel` | operator/seller allowed | `cancelled` | `RunCancelled` | stop tool access | order already terminal |

### 4.6 DeliveryPackage

| From | Command | Guard | To | Event | Side effect | Forbidden |
| --- | --- | --- | --- | --- | --- | --- |
| new | `delivery.submit` | artifacts, evidence, mapping complete | `submitted` | `DeliverySubmitted` | order `delivery_submitted` | incomplete evidence |
| `submitted` | `delivery.qa_pass` | checklist pass | `qa_passed` | `DeliveryQaPassed` | order `ready_for_acceptance` | failed checklist |
| `submitted` | `delivery.qa_reject` | failed items present | `qa_rejected` | `DeliveryQaRejected` | order back to `in_progress` | missing failed items |
| `qa_rejected` | new `delivery.submit` | fixes reference old failed items | `superseded` | `DeliverySuperseded` | new package submitted | overwrite old package |

### 4.7 AcceptanceReview

| From | Command | Guard | To | Event | Side effect | Forbidden |
| --- | --- | --- | --- | --- | --- | --- |
| new | `acceptance.accept` | buyer owner, criteria confirmed | `accepted` | `AcceptanceAccepted` | order `accepted` | non-buyer |
| new | `acceptance.request-revision` | failed criteria and fixes present | `revision_requested` | `RevisionRequested` | order `revision_requested` | no criterion |
| new | `dispute.open` | dispute reason and evidence refs | `disputed` | `DisputeOpened` | order `disputed` | missing reason |

### 4.8 ReputationEvent

| From | Command | Guard | To | Event | Side effect | Forbidden |
| --- | --- | --- | --- | --- | --- | --- |
| new | `rating.submit` | order completed, buyer owner, no duplicate | `pending` | `ReputationEventCreated` | moderation queue | incomplete order |
| `pending` | system publish | policy pass | `published` | `ReputationPublished` | update Agent/Seller projections | policy fail |
| `pending` | operator moderation | policy reason present | `hidden_by_policy` | `ReputationHidden` | audit moderation | hide negative without policy |

## 5. Command Surface

### 5.1 Buyer/seller/runtime commands

| Command | CLI | API endpoint | UI action | Runtime | Actor | Required scope |
| --- | --- | --- | --- | --- | --- | --- |
| `rfp.create` | `alphaagents rfp create` | `POST /v1/rfps` | Save RFP draft | no | buyer | `buyer:rfps.write` |
| `rfp.publish` | `alphaagents rfp publish` | `POST /v1/rfps/{id}/publish` | Publish RFP | no | buyer | `buyer:rfps.write` |
| `proposal.submit` | `alphaagents proposal submit` | `POST /v1/proposals` | Submit proposal | no | seller | `seller:proposals.write` |
| `proposal.accept` | `alphaagents proposal accept` | `POST /v1/proposals/{id}/accept` | Accept proposal | no | buyer | `buyer:orders.write` |
| `escrow.fund` | `alphaagents escrow fund` | `POST /v1/orders/{id}/fund` | Confirm payment/escrow | no | buyer/operator | `buyer:orders.write` or `finance:ledger.write` |
| `run.start` | `alphaagents run start` | `POST /v1/orders/{id}/runs` | Start run | yes | seller/runtime | `seller:runs.write` or `runtime:runs.write` |
| `delivery.submit` | `alphaagents delivery submit` | `POST /v1/orders/{id}/deliveries` | Submit delivery | yes | seller/runtime | `seller:deliveries.write` or `runtime:deliveries.write` |
| `acceptance.accept` | `alphaagents acceptance accept` | `POST /v1/orders/{id}/acceptance/accept` | Accept delivery | no | buyer | `buyer:acceptance.write` |
| `acceptance.request-revision` | `alphaagents acceptance request-revision` | `POST /v1/orders/{id}/acceptance/revision` | Request revision | no | buyer/operator | `buyer:acceptance.write` |
| `dispute.open` | `alphaagents dispute open` | `POST /v1/orders/{id}/disputes` | Open dispute | no | buyer/operator | `buyer:disputes.write` |
| `rating.submit` | `alphaagents rating submit` | `POST /v1/orders/{id}/rating` | Submit rating | no | buyer | `buyer:ratings.write` |
| `reputation.show` | `alphaagents reputation show` | `GET /v1/agents/{id}/reputation` | View reputation | no | authorized | `reputation:read` |
| `evidence.show` | `alphaagents evidence show` | `GET /v1/evidence/{id}` | View evidence | no | authorized | `evidence:read` |

### 5.2 Operator/system-only commands

| Command | API endpoint | UI action | Actor | Required scope |
| --- | --- | --- | --- | --- |
| `delivery.qa_pass` | `POST /v1/deliveries/{id}/qa/pass` | QA approve | operator/system | `operator:qa.write` |
| `delivery.qa_reject` | `POST /v1/deliveries/{id}/qa/reject` | QA reject | operator/system | `operator:qa.write` |
| `dispute.resolve` | `POST /v1/disputes/{id}/resolve` | Resolve dispute | operator | `operator:disputes.write` |
| `escrow.release` | `POST /v1/orders/{id}/ledger/release` | Release funds | system/operator | `finance:ledger.write` |
| `escrow.partial-release` | `POST /v1/orders/{id}/ledger/partial-release` | Partial release | system/operator | `finance:ledger.write` |
| `escrow.refund` | `POST /v1/orders/{id}/ledger/refund` | Refund | system/operator | `finance:ledger.write` |
| `permission.approve` | `POST /v1/grants/{id}/approve` | Approve grant | operator/system | `operator:permissions.write` |
| `permission.revoke` | `POST /v1/grants/{id}/revoke` | Revoke grant | operator | `operator:permissions.write` |
| `evidence.export` | `POST /v1/orders/{id}/evidence/export` | Export evidence package | operator/buyer | `evidence:export` |
| `evidence.delete` | `DELETE /v1/evidence/{id}` | Data deletion | operator/system | `evidence:delete` |

Operator commands may have admin CLI equivalents, but must not appear as buyer-facing CLI examples.

## 6. Field-level Command Contracts

All commands share transaction rules:

- Start transaction after envelope, tenant, token, idempotency, and rate-limit preflight.
- Load aggregate by `(tenantId, id)` with write lock for mutating commands.
- Reject if `expectedVersion` differs from current aggregate version.
- Validate state transition before writing.
- Persist aggregate update, domain event, idempotency record, and audit event in one transaction.
- Return canonical DTO projection after commit.

### 6.1 Command table

| Command | Required payload | Validation and guard | Success events | Failure codes | Response DTO |
| --- | --- | --- | --- | --- | --- |
| `rfp.create` | `sku`, `packageTier`, `category`, `market`, `channels`, `language`, `budgetAmountMinor`, `currency`, draft `deliverableFormat` | buyer tenant active, amount > 0, SKU supported | `RfpDraftCreated` | `VALIDATION_FAILED`, `ACTOR_FORBIDDEN` | `RfpDto` |
| `rfp.publish` | `rfpId`, `acceptanceTemplateId`, `competitors` or `competitorDiscoveryRule`, `prohibitedSources`, `deadlineAt` | owner buyer, draft complete, MVP risk scope only | `RfpPublished` | `RFP_INCOMPLETE`, `STATE_CONFLICT`, `VALIDATION_FAILED` | `RfpDto` |
| `proposal.submit` | `rfpId`, `sellerId`, `agentId`, `priceAmountMinor`, `deliveryHours`, `includedScope`, `evidenceStandard`, `responsibleOwner`, `capacityReservedUntil` | RFP open, seller approved, agent passport valid, capacity available | `ProposalSubmitted`, optional `RfpQuotingStarted` | `SELLER_NOT_APPROVED`, `RFP_NOT_OPEN`, `VALIDATION_FAILED` | `ProposalDto` |
| `proposal.accept` | `proposalId`, `termsSnapshot`, `invoiceProfileId?` | buyer owns RFP, proposal submitted and unexpired | `ProposalSelected`, `EscrowOrderCreated`, `ProposalDeclined[]` | `PROPOSAL_EXPIRED`, `ACTOR_FORBIDDEN`, `STATE_CONFLICT` | `OrderDto` |
| `escrow.fund` | `orderId`, `paymentRef`, `receivedAt`, `receivedBy`, `invoiceProfileId?` | order created, finance evidence visible, terms signed | `EscrowFunded`, `PermissionRequested`, `RfpOrdered` | `PAYMENT_NOT_CONFIRMED`, `STATE_CONFLICT`, `EVIDENCE_NOT_VISIBLE` | `OrderDto` |
| `run.start` | `orderId`, `permissionGrantIds`, `runtimeProfileId?` | funded or revision_requested, grants approved/unexpired, tool allowlist valid | `RunQueued`, `RunStarted` when synchronous | `ESCROW_NOT_FUNDED`, `PERMISSION_DENIED`, `STATE_CONFLICT` | `RunDto` |
| `delivery.submit` | `orderId`, `executionRunIds`, `artifactRefs`, `evidenceRefs`, `criteriaMapping`, `knownLimitations` | order in_progress, refs visible, criteria mapped, files valid | `DeliverySubmitted` | `DELIVERY_INCOMPLETE`, `EVIDENCE_NOT_VISIBLE`, `STATE_CONFLICT` | `DeliveryDto` |
| `delivery.qa_pass` | `deliveryPackageId`, `qaChecklistId`, `sampledFacts`, `minorNotes?` | delivery submitted, checklist pass, no material/critical error | `DeliveryQaPassed` | `QA_CHECK_FAILED`, `STATE_CONFLICT` | `OrderDto` |
| `delivery.qa_reject` | `deliveryPackageId`, `failedItems`, `rejectReason`, `fixSlaHours` | delivery submitted, failed items non-empty | `DeliveryQaRejected` | `VALIDATION_FAILED`, `STATE_CONFLICT` | `OrderDto` |
| `acceptance.accept` | `orderId`, `deliveryPackageId`, `criteriaConfirmations`, `criteriaScores`, `decisionReason` | ready_for_acceptance, buyer owner, all required criteria confirmed | `AcceptanceAccepted` | `CRITERIA_NOT_CONFIRMED`, `ACTOR_FORBIDDEN`, `STATE_CONFLICT` | `OrderDto` |
| `acceptance.request-revision` | `orderId`, `deliveryPackageId`, `failedCriteria`, `requestedFixes`, `decisionReason` | ready/resolved, revision unused or decision allows revision, no scope expansion | `RevisionRequested` | `REVISION_LIMIT_REACHED`, `SCOPE_EXPANSION_REQUIRED`, `STATE_CONFLICT` | `OrderDto` |
| `dispute.open` | `orderId`, `deliveryPackageId`, `disputeReason`, `evidenceRefs` | ready/revision, buyer or operator, refs visible | `DisputeOpened` | `DISPUTE_REASON_REQUIRED`, `EVIDENCE_NOT_VISIBLE`, `STATE_CONFLICT` | `OrderDto` |
| `dispute.resolve` | `orderId`, `decision`, `criteriaWeights`, `releaseAmountMinor`, `refundAmountMinor`, `operatorReason`, `evidenceRefs` | disputed, operator scope, amounts sum to order amount or documented penalty | `DisputeResolved` | `DECISION_INCOMPLETE`, `ACTOR_FORBIDDEN`, `VALIDATION_FAILED` | `OrderDto` |
| `escrow.release` | `orderId`, `releaseReason`, `financeEvidenceRef` | accepted/resolved full release, ledger locked, no dispute | `EscrowReleased` | `STATE_CONFLICT`, `EVIDENCE_NOT_VISIBLE` | `OrderDto` |
| `escrow.partial-release` | `orderId`, `releaseAmountMinor`, `refundAmountMinor`, `decisionRef` | resolved partial release, finance approval complete | `EscrowPartiallyReleased` | `DECISION_INCOMPLETE`, `STATE_CONFLICT` | `OrderDto` |
| `escrow.refund` | `orderId`, `refundAmountMinor`, `refundReason`, `financeEvidenceRef` | resolved refund or contract refund clause | `EscrowRefunded` | `STATE_CONFLICT`, `EVIDENCE_NOT_VISIBLE` | `OrderDto` |
| `rating.submit` | `orderId`, `subjectType`, `subjectId`, `agentVersion`, `ratingBreakdown`, `comment?`, `deliveryOutcome` | order completed, buyer owner, no duplicate rating | `ReputationEventCreated`, `ReputationPublished?` | `ORDER_NOT_COMPLETED`, `DUPLICATE_RATING`, `ACTOR_FORBIDDEN` | `ReputationDto` |
| `permission.approve` | `grantId`, `toolAllowlist`, `expiresAt`, `approvalReason` | operator/system, MVP resource scope only | `PermissionApproved` | `TOKEN_SCOPE_FORBIDDEN`, `VALIDATION_FAILED`, `STATE_CONFLICT` | `GrantDto` |
| `permission.revoke` | `grantId`, `revocationReason` | operator, active grant | `PermissionRevoked` | `ACTOR_FORBIDDEN`, `STATE_CONFLICT` | `GrantDto` |
| `evidence.export` | `orderId`, `evidenceRefs`, `exportReason`, `redactionMode` | buyer owner or operator, refs visible, export limit available | `EvidenceExportRequested`, `EvidenceExported` | `EVIDENCE_NOT_VISIBLE`, `RATE_LIMITED` | `EvidenceExportDto` |
| `evidence.delete` | `evidenceId`, `deletionReason`, `retentionOverride?` | operator/system, retention policy allows delete | `EvidenceDeletionRequested`, `EvidenceDeleted` | `TOKEN_SCOPE_FORBIDDEN`, `STATE_CONFLICT` | `EvidenceDeletionDto` |
| `run.cancel` | `runId`, `cancelReason` | seller/operator, run queued/running | `RunCancelled` | `ACTOR_FORBIDDEN`, `STATE_CONFLICT` | `RunDto` |
| `proposal.withdraw` | `proposalId`, `withdrawReason` | seller owner, proposal submitted | `ProposalWithdrawn` | `ACTOR_FORBIDDEN`, `STATE_CONFLICT` | `ProposalDto` |
| `rfp.cancel` | `rfpId`, `cancelReason` | buyer owner, no selected proposal | `RfpCancelled` | `ACTOR_FORBIDDEN`, `STATE_CONFLICT` | `RfpDto` |

### 6.2 Idempotency storage

`CommandIdempotencyRecord`:

```ts
interface CommandIdempotencyRecord {
  tenantId: ID<"org">;
  idempotencyKey: string;
  commandName: string;
  actorId: string;
  payloadHash: string;
  resultHash: string;
  eventIds: ID<"event">[];
  responseDtoHash: string;
  createdAt: string;
  expiresAt: string;
}
```

Rules:

- Same key + same command + same payload hash returns previous result.
- Same key + different payload hash returns `IDEMPOTENCY_CONFLICT`.
- Mutating command idempotency records retain at least 30 days; finance commands retain 7 years or accounting policy duration.

## 7. Security Contract

### 7.1 Tenant resolution

Tenant is resolved in this order:

1. Auth token organization claim.
2. Explicit CLI profile org, if token permits.
3. Runtime grant tenant for agent callbacks.

Request `tenantId` in body is advisory only; server must compare it with resolved tenant. Mismatch returns `TENANT_FORBIDDEN` and writes `UnauthorizedAccessAttempted`.

### 7.2 Token scope to command mapping

Every command checks:

- actor role.
- token scope.
- object-level ownership.
- state guard.
- evidence visibility.

Token scope alone is never enough to authorize a command.

### 7.3 Runtime tool allowlist

MVP allowed runtime tools:

- read public URL.
- read buyer-uploaded order artifact.
- write generated artifact.
- write evidence metadata.

MVP denied tools:

- account login.
- content publishing.
- ad spend.
- fund movement.
- production-data mutation or deletion.
- scraping private groups or non-authorized paid accounts.

Denied runtime call returns `PERMISSION_DENIED`, writes `PermissionDenied`, and does not create EvidenceRef.

### 7.4 Evidence visibility

Before any EvidenceRef is attached to DTO or export:

- `tenantId` must match.
- actor must be buyer owner, assigned seller, authorized operator, or runtime with grant.
- `visibility` must allow actor role.
- `redactionStatus="restricted"` requires operator reason or buyer owner.
- export writes `EvidenceExported` with actor, reason, ref count, and hash.

### 7.5 Rate limits and audit

| Surface | Limit | Audit on deny |
| --- | --- | --- |
| CLI mutating command | 60/min per actor | `RateLimitDenied` |
| Evidence export | 10/hour per org | `EvidenceExportDenied` |
| Runtime tool call | per grant policy | `RuntimeToolDenied` |
| Finance command | 20/hour per finance actor | `FinanceCommandDenied` |

Unauthorized, forbidden, rate-limited, and evidence-denied attempts must create audit events without leaking object details across tenants.

### 7.6 Permission matrix

| Actor / Object | RFP | Proposal | EscrowOrder | Grant | Run | Delivery | QA | Acceptance | Dispute | Ledger | Evidence | Reputation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Buyer owner | create/update/publish/cancel own | read/accept | read/fund own | read own | read own | read own | read result | accept/revision/dispute | open/read | read own | read/export own | submit/read |
| Seller owner | read open | submit/withdraw own | read won | read assigned | start/read assigned | submit own | read result | read | respond/read | read payout | read authorized | read own |
| Agent runtime | none | none | read assigned summary | read approved | create/update assigned | submit if delegated | none | none | none | none | write authorized evidence | none |
| Operator | read/manage | read/manage | read/manage | approve/revoke | read/cancel | read/manage | pass/reject | assist | resolve | release/refund | read/export/delete | moderate |
| Finance ops | read finance fields | none | read finance | none | none | none | none | none | read decision | fund/release/refund/reconcile | write finance evidence | none |
| System | expiry/projection | expiry/decline | automated transitions | expiry | callbacks | callbacks | automated checks | timeout events | none | automated release by decision | retention events | aggregate |
| Other tenant | none | none | none | none | none | none | none | none | none | none | none | none |

Field-level enforcement:

- Buyer owner cannot see seller payout bank details.
- Seller owner cannot see buyer-only uploads unless EvidenceRef visibility allows seller.
- Runtime cannot read finance evidence.
- Operator access to restricted EvidenceRef requires reason and audit event.
- Finance ops cannot change delivery, QA, acceptance, or reputation.

## 8. DTO Snapshots

DTO、event payload、command payload、scope 和错误码必须由 [contracts/alphaagents.contract.json](../contracts/alphaagents.contract.json) 生成或校验。`node scripts/verify-contract.mjs` 是最小门槛；后续实现可以再从同一 JSON 生成 TypeScript types、OpenAPI、CLI help 和 runtime manifest。

Minimum `OrderDto`:

```ts
interface OrderDto {
  id: ID<"order">;
  tenantId: ID<"org">;
  rfpId: ID<"rfp">;
  proposalId: ID<"proposal">;
  buyerOrgId: ID<"org">;
  sellerId: ID<"seller">;
  agentId: ID<"agent">;
  orderStatus: OrderStatus;
  ledgerStatus: LedgerStatus;
  acceptanceStatus: AcceptanceStatus;
  amountMinor: number;
  currency: Currency;
  nextAction: {
    actorRole: ActorRole;
    command: string;
    reason: string;
  };
  evidenceCompleteness: number;
  qaSummary?: {
    qaChecklistId: ID<"qa">;
    result: "pending" | "passed" | "rejected";
    materialErrorCount: number;
    criticalErrorCount: number;
  };
  cliPreview: string;
  version: number;
}
```

Snapshot rule:

- UI screenshot tests and CLI `--json` tests compare this DTO shape.
- IDs and timestamps may be normalized; field names and state values may not.

### 8.1 Finance Rules

财务计算只允许使用整数分，不允许前端用浮点数重算。部分放款公式以机器契约为准：

```text
releaseAmountMinor = floor(orderAmountMinor * acceptedCriteriaWeightBps / 10000) - penaltyAmountMinor
refundAmountMinor = orderAmountMinor - releaseAmountMinor
providerPayoutMinor = floor(releaseAmountMinor * payoutRatioBps / 10000)
platformFeeMinor = releaseAmountMinor - providerPayoutMinor
```

规则：

- `acceptedCriteriaWeightBps` 来自冻结的 `buyerAcceptanceMiniTerms` 验收项裁决，不来自主观总分文本。
- `payoutRatioBps` 在 order terms snapshot 中冻结；Pro、企业 PoC 和白标订单不得存储区间。
- `releaseAmountMinor + refundAmountMinor + penaltyAmountMinor` 必须能对回 `orderAmountMinor`。
- Buyer-facing 文案使用 `conditional release workflow`；内部模型可以继续使用 `EscrowOrder` 和 `EscrowFunded`，但不得对外声称持牌清结算能力。

## 9. Golden Test Package

### 9.1 Sandbox seed fixture

Golden fixture 以 [evidence-packages/AA-SANDBOX-TRIAL-001](../evidence-packages/AA-SANDBOX-TRIAL-001) 为准。它是 `sample_only + sandbox_verified`，只证明结构、状态、事件、证据包、财务账本和 UI/CLI/API snapshot 可校验，不证明真实客户付款。

```json
{
  "orderId": "order_sandbox_trial_001",
  "evidenceStatus": "sandbox_verified",
  "buyerOrg": {"id": "org_buyer_sandbox", "name": "NorthStar Beauty Sandbox"},
  "buyerUser": {"id": "user_buyer_sandbox", "role": "buyer"},
  "seller": {"id": "seller_harbor_sandbox", "approvalScore": 91},
  "agent": {"id": "agent_mira_sandbox", "version": "1.0.0"},
  "packageTier": "trial",
  "amountMinor": 198000,
  "currency": "CNY",
  "competitors": ["GlowLab", "PureSkin", "Dermory", "CalmRoot", "SkinNova"],
  "requiredFiles": "contracts.requiredEvidencePackageFiles",
  "snapshotRule": "UI, CLI, and API OrderDto must be byte-equivalent after fixture normalization"
}
```

### 9.2 Golden path expected sequence

| Step | Command | Expected model state | Expected event | Expected DTO assertion |
| ---: | --- | --- | --- | --- |
| 1 | `rfp.create` | RFP `rfpStatus=draft` | `RfpDraftCreated` | `RfpDto.rfpStatus=draft` |
| 2 | `rfp.publish` | RFP `published` | `RfpPublished` | CLI/API/UI all show `published` |
| 3 | `proposal.submit` | Proposal `submitted`, RFP `quoting` | `ProposalSubmitted` | proposal visible to buyer |
| 4 | `proposal.accept` | Proposal `selected`, Order `created` | `ProposalSelected`, `EscrowOrderCreated` | `OrderDto.orderStatus=created` |
| 5 | `escrow.fund` | Order `funded`, ledger `escrowed`, RFP `ordered` | `EscrowFunded`, `RfpOrdered`, `PermissionRequested` | `ledgerStatus=escrowed` |
| 6 | `permission.approve` | Grant `approved` | `PermissionApproved` | run CTA enabled |
| 7 | `run.start` | Run `queued/running`, Order `in_progress` | `RunQueued`, `RunStarted` | `nextAction=seller delivery.submit` |
| 8 | runtime success | Run `succeeded` | `RunSucceeded` | output refs visible |
| 9 | `delivery.submit` | Delivery `submitted`, Order `delivery_submitted` | `DeliverySubmitted` | QA pending banner |
| 10 | `delivery.qa_pass` | Delivery `qa_passed`, Order `ready_for_acceptance` | `DeliveryQaPassed` | acceptance CTA enabled |
| 11 | `acceptance.accept` | Review `accepted`, Order `accepted` | `AcceptanceAccepted` | release pending |
| 12 | `escrow.release` | Order `released`, ledger `released` | `EscrowReleased` | rating CTA enabled |
| 13 | `rating.submit` | Reputation `published`, Order `closed` | `ReputationEventCreated`, `ReputationPublished` | reputation average updated |

### 9.3 Negative and branch cases

| Scenario | Steps | Required assertions |
| --- | --- | --- |
| Revision | QA pass -> buyer revision -> revision run -> new delivery -> QA pass -> accept | ledger remains `locked`; `revisionUsed=true`; no release before accept |
| Dispute partial release | ready -> dispute.open -> dispute.resolve partial -> escrow.partial-release -> rating | release + refund amounts match decision table; reputation outcome `partially_released` |
| Refund | ready -> dispute.open -> resolve refund -> escrow.refund -> rating | ledger `refunded`; negative reputation allowed |
| Permission denial | runtime reads non-granted resource | returns `PERMISSION_DENIED`; writes audit; no EvidenceRef |
| Idempotency replay | replay `escrow.fund` same key/payload | same event ids and DTO; different payload returns `IDEMPOTENCY_CONFLICT` |
| Tenant isolation | other tenant reads order/evidence | `TENANT_FORBIDDEN`; no object detail leaked |
| CLI/API/UI equivalence | same fixture action via UI and CLI | event sequence and DTO snapshot identical after ID/time normalization |
| Stale version | command with old expectedVersion | `VERSION_CONFLICT`, includes currentVersion |
| Evidence export denied | seller exports buyer-only evidence | `EVIDENCE_NOT_VISIBLE`, writes audit |
| Finance release blocked | release while disputed | `STATE_CONFLICT`, no ledger event |

## 10. Event Log Rules

Event shape:

```ts
interface DomainEvent {
  eventId: ID<"event">;
  tenantId: ID<"org">;
  aggregateId: string;
  aggregateType: "RFP" | "Proposal" | "EscrowOrder" | "RiskPermissionGrant" | "ExecutionRun" | "DeliveryPackage" | "AcceptanceReview" | "ReputationEvent";
  eventName: string;
  version: number;
  actorId: string;
  actorRole: ActorRole;
  sourceChannel: SourceChannel;
  correlationId: string;
  payloadHash: string;
  createdAt: string;
}
```

Rules:

- Events are append-only.
- Corrections create new events.
- Evidence deletions keep tombstone metadata and deletion event.
- Finance events require `paymentRef`, `financeEvidenceRef`, or `operatorReason`.
- Event names must match command success table; no UI-only events.

## 11. Performance and Maintainability Boundaries

- Active order list reads a read model, not raw events.
- Order detail may load last 100 events inline; older events paginate.
- Evidence package export is async for more than 50 evidence refs.
- CLI `--json` output must stay stable and snapshot-tested.
- Tables must support `(tenantId, stateField, updatedAt)` indexes for every write model.
- Evidence binaries live in object storage; transaction DB stores metadata and hash.
- Contracts must be packaged as a shared module before UI/API/CLI/runtime implementation.
