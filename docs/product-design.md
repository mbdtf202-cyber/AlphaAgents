# AlphaAgents 产品设计文档

## 1. 一句话定位

**AlphaAgents 是完整 Agent 交易、托管交付、应用分发和企业运营网络。**

甲方不是来浏览 Agent，也不是买一个抽象工具，而是购买一个可验收、可追责、可审计、可复购的业务结果。平台直接面向完整形态建设：标准 Agent、定制 Agent、Agent 原生 App、托管服务 Agent、Agent Squad 和企业内嵌 Agent 都纳入同一套身份、权限、交易、证据和声誉体系。

AlphaAgents 的商业范式是 **Agent as a Service（AaaS）**。它对标传统 SaaS，但不只是把软件界面换成 Agent：传统 SaaS 主要卖软件席位、功能模块和工作流工具，甲方仍然自己操作并承担结果；AaaS 卖的是 Agent 直接执行后的可验收业务结果、持续运营能力和可追责履约证据。

| 维度 | 传统 SaaS | Agent as a Service |
| --- | --- | --- |
| 购买对象 | 软件席位、功能、工作流、存储或调用量 | 可执行 Agent、Agent App、定制 Agent、托管运营、Squad 或企业内嵌 Agent |
| 谁完成工作 | 买方员工使用工具完成 | Agent / Agent App / 服务方在授权边界内完成 |
| 交付物 | Dashboard、记录、导出、自动化配置 | `ExecutionRun`、`DeliveryPackage`、`EvidenceRef`、验收记录和复盘结果 |
| 责任边界 | 软件可用性和账号权限为主 | 需求冻结、权限、执行、QA、验收、争议、财务和声誉全链路 |
| 计费方式 | seat、subscription、usage、module | per order、subscription、usage、milestone、retainer、order-credit、revenue share |
| 续约依据 | 功能使用率、活跃用户、平台留存 | 已验收结果、ROI、复购、争议率、证据完整度和 Agent 声誉 |
| 风控重点 | 账号安全、数据权限、系统可用性 | 高风险动作授权、运行证据、责任人、交付验收、退款/放款条件 |

`Agent App` 不是传统 SaaS 安装包，而是 AaaS 下更产品化的 Agent 交付单元。它可以有 UI、订阅和使用量，但必须继续绑定 Agent 身份、权限边界、运行记录、证据、验收、退出机制和声誉回写。

## 2. 第一性原理

企业愿意付钱，不是因为 Agent 很新，而是因为它能更快、更稳定、更低风险地交付结果。

甲方的真实顾虑：

- 钱打出去，结果不达标怎么办。
- Agent 或服务方是否真的能交付。
- 验收是不是会变成主观扯皮。
- Agent 是否会乱用权限、账号、预算或客户数据。
- 失败、延期、争议时谁负责。
- 采购、法务、财务、安全和业务负责人能不能看懂合同、发票、数据安全、责任边界和审计证据。

因此平台重心不是“更多 Agent 卡片”，而是：

1. 供给分类清楚。
2. Agent 身份真实。
3. 需求和交付足够标准。
4. 资金、订阅或额度释放有条件。
5. 执行过程可追溯。
6. 高风险权限可审批、可撤销、可审计。
7. 争议可以收口。
8. 声誉能沉淀到 Agent、Agent App、服务方、版本和分类。
9. 商务、财务、客服、质检和风控能真实承接订单。

## 3. Agent 分类与目录

平台预设多种高需求 Agent 分类。分类注册表是产品、工程、运营、销售和验收共同使用的基础数据，本节就是分类和目录治理的产品真源，不再拆成独立文档。

默认一级分类：

| 分类 ID | 名称 | 典型场景 |
| --- | --- | --- |
| `finance` | 金融与投研 | 投研、财务分析、风控、报表、对账 |
| `social_media_operations` | 社媒运营与内容增长 | 内容策划、发布、互动、账号运营、复盘 |
| `intelligence_research` | 情报与研究 | 竞品、市场、政策、客户、销售情报 |
| `life_assistant` | 生活助理与个人效率 | 日程、旅行、采购、资料整理、个人任务 |
| `sales_customer_growth` | 销售与客户增长 | 线索、客户画像、邮件/外呼、CRM 回写 |
| `enterprise_operations` | 企业运营与流程自动化 | SOP、工单、审批、项目运营、共享服务 |
| `developer_it_ops` | 开发者与 IT 运维 | 代码、测试、监控、故障、内部工具 |
| `legal_compliance_risk` | 法务、合规与风险 | 合同、政策、审计、风控、合规检查 |
| `data_bi_analytics` | 数据分析与商业智能 | 指标、报表、预测、异常分析 |
| `education_knowledge` | 教育、培训与知识管理 | 课程、答疑、考核、知识库 |
| `vertical_industry` | 行业垂直 Agent | 医疗、地产、制造、物流、跨境电商等 |
| `custom_agent_app` | 定制 Agent 与 Agent 原生 App | 私有工作流、专属 App、集成式 Agent 产品 |

分类必须支持增删改查：

- `create`：新增分类必须有买方场景、默认权限模板、默认验收模板、风险等级和运营 owner。
- `read`：买方、服务方、运营、API 和 CLI 看到同一份分类注册表。
- `update`：改名、改风险等级、改排序、改模板必须留审计事件。
- `archive`：下架分类不删除历史订单，只阻止新上架和新购买。
- `restore`：恢复分类必须重新确认风险、模板、负责人和可售状态。

二级标签不能替代一级分类，但必须用于精确筛选。推荐标签维度：

| 标签维度 | 示例 |
| --- | --- |
| 行业 | beauty, finance, healthcare, real_estate, manufacturing, ecommerce, logistics |
| 任务 | research, writing, publishing, monitoring, reconciliation, coding, qa, planning |
| 权限 | read_only, account_login, publish_content, write_system, ad_spend, fund_related |
| 交付物 | report, spreadsheet, dashboard, workflow_app, api_integration, evidence_package |
| 买方规模 | individual, team, smb, enterprise |
| 风险等级 | low, medium, medium_high, high, regulated |
| 计费 | per_order, subscription, usage_based, milestone, retainer, revenue_share |

分类维护准则：

- 新增分类前先判断是否能用二级标签解决。
- 有真实买方场景、权限模板和验收模板，才允许新增一级分类。
- `categoryId` 一旦有交易历史不得改名或复用。
- 分类归档只阻止新上架和新购买，不能删除历史订单、证据和声誉。
- 高风险分类默认严格准入，后续按证据放宽。

## 4. Agent 供给形态

平台中的 `Agent App`、定制 Agent、托管服务 Agent、Agent Squad 都视为 Agent 供给，不允许另开绕过平台规则的产品线。

| 供给形态 | 买方理解 | 平台要求 |
| --- | --- | --- |
| 标准 Agent | 可直接购买的可复用能力 | AgentPassport、价格、SLA、权限、样例 |
| 托管服务 Agent | Agent 加人工责任人共同交付 | 服务方身份、QA、人工兜底、履约统计 |
| 定制 Agent | 为某个买方开发或配置 | 需求冻结、里程碑、UAT、变更单 |
| Agent 原生 App | 带 UI、工作流或集成的产品化 Agent | App manifest、授权边界、运行证据 |
| Agent Squad | 多 Agent 协同交付一个结果 | 主责 Agent、子 Agent 权限、统一验收 |
| 企业内嵌 Agent | 部署在客户环境或私有系统 | 数据驻留、运维责任、安全审计 |

所有形态必须绑定 owner、版本、权限边界、支持分类、支持 SKU、价格或计费方式、证据规则、验收方式和声誉规则。

## 5. 可购买结果与交易模式

平台支持多种可购买结果：

- 标准情报包、分析包、内容运营包、财务报表包、数据分析包、研发任务包。
- 按订单交付的 Quick Order。
- 买方发起 RFP 后多 Agent 报价。
- 定制 Agent 项目和里程碑交付。
- Agent App 订阅和按使用量计费。
- 托管运营月包、季度包和企业 order-credit。
- 结果可归因场景下的收益分成。
- 私有部署和企业内嵌运行。

交易模式不同，但必须统一受控：

1. 需求有冻结版本。
2. 报价或订阅权益有快照。
3. 权限按 scope 授予。
4. 执行生成 `ExecutionRun`。
5. 交付生成 `DeliveryPackage`。
6. 验收生成 `AcceptanceReview`。
7. 财务或额度变化生成账本事件。
8. 结果写入 `ReputationEvent`。

## 6. 用户与角色

### 6.1 甲方

甲方购买的是可验收业务结果、Agent App 使用权、定制 Agent 交付或长期托管运营能力。

甲方需要提供：

- 组织、角色、付款、发票和授权链。
- 分类、目标、输入资料、禁用事项和输出格式。
- 生产账号、数据、资金或发布权限的授权边界。
- 验收 owner、业务 owner、finance owner 和安全/法务 owner。

甲方获得：

- 可购买的 Agent 分类目录。
- Agent / Agent App / 服务方 proof。
- 可验收交付包。
- 权限、执行、证据、验收、争议和财务记录。
- ROI、复购、订阅、order-credit、定制项目和续约管理。

### 6.2 服务方与 Agent owner

服务方可以上架标准 Agent、托管服务 Agent、Agent App、定制 Agent 模板或 Agent Squad。

服务方需要提供：

- 真实身份或组织信息。
- Agent manifest、App manifest 或 Squad manifest。
- 分类、能力边界、样例交付、工具和权限。
- 标准报价、订阅权益或定制项目报价。
- 责任人、SLA、产能、保密承诺、数据处理承诺和违规责任。

服务方获得：

- 订单、订阅、定制项目和托管运营收入。
- 可复用交付模板和分类流量。
- Agent / Agent App 声誉沉淀。
- 企业采购可读的证据包和履约记录。

### 6.3 平台

平台不是纯撮合，而是负责交易质量：

- 分类注册表。
- AgentPassport / AgentAppPassport。
- SellerProfile / BeneficiaryProfile。
- SKU、报价、订阅和定制项目模板。
- 托管账本、order-credit 和对账。
- 权限审批、撤销和审计。
- 执行记录、交付前 QA、证据包。
- 验收模板、争议裁决、退款和部分放款。
- 声誉图谱、分类质量和供给治理。

## 7. 领域模型契约

交易真相仍由核心写模型持有：

| 写模型 | Owner | 写入来源 | 状态字段 |
| --- | --- | --- | --- |
| `RFP` | Buyer org | `rfp.create`, `rfp.publish`, `proposal.accept` | `rfpStatus` |
| `Proposal` | Seller | `proposal.submit`, `proposal.accept` | `proposalStatus` |
| `EscrowOrder` | Platform ledger | order, finance, acceptance, dispute commands | `orderStatus`, `ledgerStatus`, `acceptanceStatus` |
| `RiskPermissionGrant` | Platform risk | permission commands | `grantStatus` |
| `ExecutionRun` | Agent runtime | `run.start`, runtime callbacks | `runStatus` |
| `DeliveryPackage` | Seller / Agent runtime | `delivery.submit`, QA commands | `deliveryStatus` |
| `AcceptanceReview` | Buyer / operator | acceptance and dispute commands | `reviewStatus` |
| `ReputationEvent` | Platform reputation | rating and dispute resolution | `eventStatus` |

目录、身份和配置由独立控制面维护：

| 模型 | 类型 | 作用 |
| --- | --- | --- |
| `AgentCategory` | Catalog/write model | 维护分类、风险等级、模板绑定和可售状态 |
| `AgentPassport` | Identity/write model | 维护 Agent manifest、版本、权限、样例和 owner |
| `AgentAppPassport` | Identity/write model | 维护 Agent App manifest、安装/授权和运行边界 |
| `AgentListing` | Listing/write model | 维护可售状态、价格、分类、SKU、容量和曝光 |
| `SellerProfile` | Identity/read model | 展示服务方身份、资质、产能、保密承诺和历史履约 |
| `BuyerOrgProfile` | Identity/read model | 展示买方组织、角色、invoice readiness 和授权链 |
| `ProgramWorkspace` | Projection/read model | 展示 backlog、credits、SLA、QBR 和 renewal blockers |
| `EvidenceRef` | Shared record | 证据元数据、hash、存储位置、脱敏状态和可见范围 |

目录模型可以影响供给是否可售，但不得直接改写订单、验收、财务或声誉终态。

## 8. Command Handler 摘要

唯一机器可读真相源是 [contracts/alphaagents.contract.json](../contracts/alphaagents.contract.json)，人类解释见 [工程契约文档](./engineering-contract.md)。

完整平台命令分为四类：

1. 交易命令：RFP、报价、订单、托管、执行、交付、验收、争议、评分。
2. 目录命令：分类、AgentPassport、AgentListing 的增删改查。
3. 风险和财务命令：权限审批、撤销、放款、退款、证据导出、删除。
4. 查询命令：分类目录、Agent 列表、声誉、证据和订单状态。

UI、CLI、API、Agent runtime 和 Agent App 只能调用同一组 command handlers。

## 9. Agent 身份

Agent 身份是首单信任证明、长期运营责任节点和分类治理节点。

Agent 详情必须展示：

- 名称。
- 分类和二级标签。
- 供给形态。
- 所属服务方。
- 支持 SKU、订阅、定制或托管模式。
- 输入要求和输出格式。
- 工具、数据和高风险权限。
- 样例交付和证据包。
- 履约统计、争议记录和评分来源。
- 人工兜底责任人。
- 当前可用产能。
- 保密、数据处理和安全承诺。
- Agent App manifest 或 custom build manifest。
- 版本历史和回滚规则。

`Agent App` 必须被解释为“一种更产品化的 Agent 交付单元”，不是绕过托管、权限、验收和评分的 SaaS 安装包。

## 10. 平台担保承诺

担保不是一句文案，而是一组可执行规则：

- 未确认付款、订阅、额度或合同前，不得执行需要成本或高风险权限的动作。
- 未授权不得登录账号、发布内容、写入生产系统、投放广告或触发资金相关动作。
- 未交付不得放款或确认服务权益消耗。
- 平台 QA 未通过不得进入买方验收。
- 验收通过、订阅权益确认或争议裁决后才进入放款、退款、credit drawdown 或续约记录。
- 限定修改不放款。
- 争议期间资金或权益冻结。
- 所有资金、权限、证据和状态变化必须有事件记录。

## 11. 安全威胁模型

| 风险 | 控制 |
| --- | --- |
| Agent runtime 访问未授权资源 | 订单级或订阅级临时权限、工具 allowlist、过期和撤销 |
| Agent App 借安装绕过平台 | App manifest、运行回调、证据和验收绑定 |
| 定制 Agent 私下绕单 | 合同、工作区、证据、付款和声誉绑定 |
| 内容发布误操作 | preview、双人审批、撤销路径、post-run evidence |
| 广告或资金动作越权 | 牌照/合同检查、权限分级、人工确认、财务审计 |
| 数据泄露 | 租户隔离、可见范围、脱敏、retention、删除请求 |
| 虚假履约 | EvidenceRef、hash、QA、买方验收和争议记录 |

## 12. 核心页面

完整平台页面生态：

1. Public showcase：平台、分类、样例证据、风险边界、采购路径。
2. Agent Catalog：分类浏览、搜索、筛选、Agent App、定制 Agent、对比。
3. Buyer org setup：组织、角色、账单、授权链和合规预检。
4. Quick Order / RFP：标准包、报价、定制项目和订阅入口。
5. Workbench：买方当前动作、订单、项目、订阅、证据和财务。
6. Provider Proof Directory：服务方、Agent、Agent App、样例、产能、责任人。
7. Order / Project workspace：执行、QA、交付、验收、争议和账本。
8. Evidence room：证据包、hash、脱敏、导出、删除和留存。
9. Reputation：Agent、Agent App、服务方、版本和分类的信用图谱。
10. Program ops：多单、order-credit、订阅、QBR、续约和风险。
11. Catalog admin：分类、标签、模板、Agent 上架、下架、恢复。
12. Risk / finance console：权限审批、账本、退款、对账和审计。

## 13. 商务、法务、财务边界

平台可以支持单次订单、订阅、定制项目、托管运营、收益分成、order-credit 和私有部署，但每种模式必须有可审计的合同、付款、发票、退款、对账和责任边界。

内部 conditional release ledger 不等于平台拥有持牌资金清结算能力。外部付款、退款、服务方结算和资金动作必须通过合法支付或银行路径完成，并由 finance evidence 记录。

受监管场景必须按分类和地域声明限制，例如证券投资建议、保险、医疗、法律意见、支付、广告账户资金操作和个人敏感数据处理。

## 14. North Star Metric

**Verified Agent GMV with evidence-backed acceptance.**

平台同时关注：

- 已验收 Agent GMV。
- 分类活跃度和每类合格供给。
- Agent App 运行成功率。
- 定制 Agent 里程碑验收率。
- 托管运营续约率。
- 争议率、退款率、部分放款率。
- 买方复购、order-credit 使用率和 QBR 通过率。
- 权限越权拦截和审计完整度。

## 15. 工程契约

实现必须引用：

- [工程契约文档](./engineering-contract.md)
- [机器可读契约](../contracts/alphaagents.contract.json)

不得新增 UI-only 状态、CLI-only 命令、App-only 交易或目录-only 假数据。任何供给分类、Agent 上架、Agent App 发布、定制 Agent 交付、订阅权益和订单状态，都必须能通过同一套 API/CLI/事件日志回读。
