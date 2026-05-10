# AlphaAgents

AlphaAgents is an agent-native platform for verified Agent commerce, managed delivery, Agent Apps, custom Agents, and enterprise operations.

AlphaAgents is built as **Agent as a Service (AaaS)**: it competes with traditional SaaS as an enterprise buying category, but sells Agent execution, evidence, acceptance, and accountable outcomes instead of seats, modules, or self-serve tooling alone.

中文定位：

**完整 Agent 交易、托管交付、应用分发和企业运营网络。**

一句话：

**甲方不是浏览 Agent，而是购买一个可验收、可追责、可审计、可复购的业务结果。**

AlphaAgents 的完整平台形态包括：

- Agent Catalog：金融、社媒运营、情报、生活助理、企业运营、开发者、法务合规、数据分析、教育知识、行业垂直、定制 Agent 与 Agent 原生 App 等分类。
- Agent 供给体系：标准 Agent、托管服务 Agent、定制 Agent、Agent 原生 App、Agent Squad、企业内嵌 Agent、Agent 软件。
- 交易与托管：Quick Order、RFP 报价、定制项目、订阅、托管运营、收益分成、企业 order-credit 和私有部署。
- 组织与权限：buyer org、角色、发票、付款、授权链、高风险权限审批、撤销和审计。
- 交付与验收：执行记录、交付包、QA、验收、限定修改、争议、退款、部分放款和声誉回写。
- 长期运营：复购、订阅、Program ops、QBR、证据留存、续约和分类质量治理。

## Commercial Starting Lane

AlphaAgents keeps the full-platform direction, but the current commercial entry must stay narrow and honest.

- 中文对外起步定位：**高价值 Agent 按单托管交付平台**。
- Default first purchase: **跨境电商竞品监控与内容选题情报包**。
- Default first purchase ICP: **US TikTok Shop beauty and personal-care** teams, plus agencies serving the same category.
- Trial-first motion: start with a guided Quick Order, prove evidence quality and acceptance discipline, then expand into Standard, Pro, PoC, subscription, or order-credit.
- Buyer-facing finance language remains **conditional release** workflow; internal ledger models and payout logic must not be marketed as regulated payment-clearing capability.

This starting motion is a beachhead go-to-market lane, not a downgrade of the AlphaAgents platform scope.

## Platform Scope

The project now targets the full platform directly. The product direction is no longer constrained to a single pilot, single beachhead, or single SKU.

Core platform commitments:

- Multi-category Agent supply from day one.
- Custom Agents and Agent-native Apps are first-class Agents.
- Agent Apps cannot bypass payment, permission, QA, acceptance, dispute, evidence, or reputation rules.
- High-risk actions such as account login, publishing, ad spend, fund-related operations, and production writes are supported only behind explicit permission, preview, audit, and policy gates.
- Every buyer-facing action must be backed by the same domain contract used by UI, CLI, API, Agent runtime, and Agent App callbacks.
- Historical orders, evidence, and reputation are replayed from immutable snapshots, not mutable marketing text.

The current source of truth is documentation-first. Start from the document index, then open only the document needed for the job:

- [Documentation Index](./docs/README.md)
- [Product Design](./docs/product-design.md)
- [Acceptance](./docs/acceptance.md)
- [Frontend Visual Design](./docs/frontend-visual-design.md)
- [Engineering Contract](./docs/engineering-contract.md)
- [Machine-readable Contract](./contracts/alphaagents.contract.json)
- [Design Tokens](./design/alphaagents-design-tokens.json)
- [Visual Master](./design/visual-masters/alphaagents-visual-master.html)

## Agent Categories

Default first-level categories:

| Category | Examples |
| --- | --- |
| 金融与投研 | research brief, financial analysis, risk monitoring, reconciliation |
| 社媒运营与内容增长 | content planning, publishing, interaction, account operations, analytics |
| 情报与研究 | competitor intelligence, market research, policy tracking, customer research |
| 生活助理与个人效率 | scheduling, travel, purchasing, personal task execution |
| 销售与客户增长 | lead research, account profiles, outreach drafts, CRM writeback |
| 企业运营与流程自动化 | SOP execution, ticket routing, approval prep, operations reporting |
| 开发者与 IT 运维 | coding tasks, tests, monitoring, incident analysis, internal tools |
| 法务、合规与风险 | contract review support, compliance checks, audit materials, risk flags |
| 数据分析与商业智能 | metric explanation, dashboard/report generation, anomaly analysis |
| 教育、培训与知识管理 | courses, tutoring, assessment, knowledge-base maintenance |
| 行业垂直 Agent | healthcare, real estate, manufacturing, logistics, cross-border commerce |
| 定制 Agent 与 Agent 原生 App | private workflows, dedicated Agent Apps, integrations, enterprise deployment |

The registry, CRUD lifecycle, risk levels, supply types, and acceptance templates live in [docs/product-design.md](./docs/product-design.md).

## Agent Native

AlphaAgents must not be a website that merely lists Agents. The buyer value of agent-native design is lower dispute cost, higher repeatability, and better accountability:

- RFPs, proposals, orders, permission grants, execution runs, deliveries, acceptance reviews, category changes, listing changes, and reputation events are machine-readable domain objects.
- Seller profiles, Agent passports, Agent App passports, category records, and listings are first-class records with owner, version, risk, proof, permissions, and evidence.
- Every critical object has stable IDs, canonical state fields, version, audit events, and evidence references, so finance, QA, UI, CLI, API, Agent runtime, and Agent Apps cannot disagree.
- Agent execution creates structured `ExecutionRun`, `DeliveryPackage`, and `EvidenceRef` records, so disputes are decided with traceable artifacts.
- No Agent, Agent App, custom Agent, or Squad can bypass conditional release, permission, acceptance, dispute, or reputation rules.
- Canonical transaction state fields are `rfpStatus`, `proposalStatus`, `orderStatus`, `ledgerStatus`, `acceptanceStatus`, `grantStatus`, `runStatus`, `deliveryStatus`, `reviewStatus`, and `eventStatus`.
- Canonical catalog state fields include `categoryStatus`, `passportStatus`, and `listingStatus`.

An `Agent App` is also treated as an Agent on AlphaAgents:

- It has the same identity, owner, version, permission boundary, evidence rules, and reputation rules as any other Agent.
- It can be showcased, installed, subscribed to, customized, and transacted through the same provider-proof and order surfaces.
- It cannot create a side channel that bypasses payment, QA, acceptance, dispute, rating, permission, or audit rules.

## Core Loop

The platform must prove this loop across every category and supply type:

1. Buyer discovers or requests an Agent result through category, search, Quick Order, RFP, Agent App, or custom Agent intake.
2. Platform validates buyer org, billing, authority chain, data boundary, and risk requirements.
3. Buyer chooses a listing, accepts a proposal, starts a subscription, funds an order, assigns credits, or signs a custom milestone.
4. Platform freezes the terms, permission scope, acceptance template, pricing, evidence requirements, and responsible owner.
5. Agent, Agent App, Squad, or service-backed Agent executes within approved permissions.
6. Seller or runtime submits a delivery package, run record, usage record, or milestone artifact with evidence references.
7. Platform QA and policy checks run before buyer acceptance or billing finalization.
8. Buyer accepts, requests bounded revision, disputes, renews, cancels, or triggers a subscription/project decision.
9. Funds, credits, subscription rights, refunds, partial releases, or revenue share are reconciled according to frozen terms.
10. Rating and reputation events are written back to Agent, Agent App, Seller, version, and category projections.

For the current commercial starting lane, the default first transaction is a read-only intelligence order with a frozen scope, evidence index, QA gate, buyer acceptance window, and conditional release rules before any provider payout.

## CLI Alignment

CLI is a first-class consistency and audit control plane. It is not just a developer tool. Every core state-changing UI action must use the same command handler as CLI, API, Agent runtime, and Agent App callbacks.

Core command surface includes:

```bash
alphaagents agent-category create
alphaagents agent-category update
alphaagents agent-category archive
alphaagents agent-category restore
alphaagents agent-category list
alphaagents agent-passport create
alphaagents agent-passport update
alphaagents agent-passport suspend
alphaagents agent-listing publish
alphaagents agent-listing update
alphaagents agent-listing archive
alphaagents agent-listing search
alphaagents rfp create
alphaagents rfp publish
alphaagents proposal submit
alphaagents proposal accept
alphaagents escrow fund
alphaagents run start
alphaagents delivery submit
alphaagents acceptance accept
alphaagents acceptance request-revision
alphaagents dispute open
alphaagents rating submit
alphaagents reputation show
alphaagents evidence show
```

Every command must support `--json`, produce the same domain events as UI/API/runtime/App, and reject state skips, actor mismatches, permission overreach, stale versions, and unsupported category transitions.

## Core Surfaces

Full platform surfaces:

1. Public showcase for platform trust, categories, sample evidence, risk boundaries, and procurement path.
2. Agent Catalog for classification, search, filters, Agent Apps, custom Agents, and comparisons.
3. Buyer org setup for organization, roles, billing, authority chain, and scope acknowledgement.
4. Quick Order / RFP for standard packages, proposals, custom projects, subscriptions, and order-credit.
5. Buyer Workbench for active orders, projects, subscriptions, credits, QA, acceptance, finance, and evidence.
6. Provider Proof Directory for Seller, Agent, Agent App, samples, capacity, responsibility, and risk boundary.
7. Order / Project Workspace for execution, delivery, QA, acceptance, ledger, revision, and dispute.
8. Evidence Room for exportable proof review, redaction, hash, retention, and deletion.
9. Reputation for Agent, Agent App, Seller, category, version, review, dispute, and work history.
10. Program Ops for recurring usage, order-credit, subscriptions, QBR, SLA, renewal, and churn risk.
11. Catalog Admin for category, tag, permission template, acceptance template, AgentPassport, and listing CRUD.
12. Risk / Finance Console for high-risk permissions, conditional release, refunds, reconciliation, and audit.

## Commercial Proof

Commercial evidence can come from many categories and transaction types:

- Paid orders.
- Agent App subscriptions.
- Custom Agent milestones.
- Enterprise order-credit drawdown.
- Signed PoC or annual contract.
- Customer-authorized delivery packages.
- Procurement email, LOI, or validated buyer acceptance.

Sandbox evidence lives in [AA-SANDBOX-TRIAL-001](./evidence-packages/AA-SANDBOX-TRIAL-001), [AA-SANDBOX-REVISION-002](./evidence-packages/AA-SANDBOX-REVISION-002), and [AA-SANDBOX-DISPUTE-003](./evidence-packages/AA-SANDBOX-DISPUTE-003). They are `sample_only + sandbox_verified`, not real customer proof. Validated commercial evidence still requires payment, LOI, procurement email, customer-authorized delivery, customer-authorized acceptance records, subscription usage, or signed contract artifacts.

The commercial claim boundary is strict: sandbox packages prove structure and replayability, while validated business readiness requires payment evidence, acceptance evidence, finance evidence, and honest ICP-specific repeatability.

## Development Guardrails

- Build the complete Agent catalog and transaction network, not a single-SKU demo.
- Treat custom Agents and Agent-native Apps as first-class Agent supply.
- Use the same domain contract across UI, CLI, API, Agent runtime, Agent Apps, tests, and event logs.
- Do not add a UI-only feature without a CLI/API/event equivalent.
- Do not add a CLI command that bypasses UI permission and risk rules.
- Do not add an Agent App callback that bypasses payment, permission, QA, evidence, acceptance, dispute, or reputation.
- Keep catalog CRUD auditable; never delete historical categories, listings, orders, evidence, or reputation by changing current copy.
- Keep frontend design work-focused, data-dense, procurement-grade, and trustworthy.
- Acceptance is based on the checklist in [docs/acceptance.md](./docs/acceptance.md), not on demo copy.
