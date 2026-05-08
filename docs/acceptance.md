# AlphaAgents 验收文档

## 1. 验收总原则

本项目验收不以页面数量、概念完整度或静态展示为准，而以完整 Agent 平台闭环为准。

必须能验证以下主线：

**甲方通过 Agent Catalog、Quick Order、RFP、Agent App、定制 Agent 或 Program 入口购买可验收结果 -> 平台校验组织、付款、授权链和风险边界 -> Agent / Agent App / Squad / 服务方执行 -> 生成 ExecutionRun、DeliveryPackage、EvidenceRef -> 平台 QA -> 甲方验收、限定修改或争议 -> 放款、退款、订阅权益、order-credit 或项目里程碑结算 -> 评分沉淀到 Agent、Agent App、服务方、版本和分类。**

任何不能服务身份、目录、交易、权限、执行、证据、验收、财务或声誉闭环的功能，都不能作为完成项。

## 2. 产品定位验收

| 编号 | 验收标准 | 验证方式 |
| --- | --- | --- |
| P-01 | 平台定位必须明确为「完整 Agent 交易、托管交付、应用分发和企业运营网络」。 | 检查 README、产品设计文档、核心页面文案。 |
| P-02 | 平台必须支持多 Agent 分类，而不是单一行业或单一 SKU。 | 检查 `docs/product-design.md` 的分类注册表、目录数据、筛选和契约。 |
| P-03 | 金融、社媒运营、情报、生活助理、销售增长、企业运营、开发者、法务合规、数据分析、教育知识、行业垂直、定制 Agent 与 Agent App 必须在分类注册表中存在。 | 检查 `docs/product-design.md` 和 `contracts/alphaagents.contract.json`。 |
| P-04 | 定制 Agent 与 Agent 原生 App 必须被视为 Agent 供给形态。 | 检查 AgentPassport、AgentAppPassport、AgentListing 和页面入口。 |
| P-05 | 平台主角必须是携带身份、能力、履历、评分、版本和可交易服务的 Agent。 | Agent 详情页必须展示身份、能力、交易模式、履历、评分。 |
| P-06 | 产品主流程必须覆盖分类、上架、需求、报价、付款/额度、权限、执行、QA、交付、验收、评分。 | 通过 UI、API 或 CLI 跑通一条分类到交易闭环。 |
| P-07 | 功能不得停留在 Agent 展示、聊天或营销介绍。 | 任意核心入口都应进入交易或目录治理闭环。 |
| P-08 | 首页和导航不得继续以旧评测、竞赛、排行榜、交易竞技方向为主叙事。 | 检查首页、导航、活跃路由、package 命令和 CI。 |
| P-09 | 项目必须 Agent 原生，核心对象必须机器可读、可被 Agent runtime 调用、可审计。 | 检查对象 schema、事件、evidenceRefs 和 runtime manifest。 |
| P-10 | CLI 必须对齐一切核心 UI 动作。 | 每个核心按钮都能找到等价 `alphaagents` 命令、API 行为和事件日志。 |
| P-11 | 平台必须支持按单、订阅、定制项目、托管运营、收益分成、order-credit 和私有部署等交易模式的契约表达。 | 检查交易模式配置和风险/财务约束。 |
| P-12 | 页面生态必须覆盖 public showcase、Agent Catalog、buyer org setup、Quick Order/RFP、workbench、provider proof、order/project workspace、evidence room、reputation、program ops、catalog admin、risk/finance console。 | 检查视觉文档、产品文档和视觉母版。 |
| P-13 | 平台必须明确为 Agent as a Service（AaaS），并说明它对标传统 SaaS，但销售对象从软件席位和工具变成 Agent 执行、证据、验收和可追责结果。 | 检查 `docs/product-design.md`、`docs/frontend-visual-design.md` 和 public showcase 文案。 |
| P-14 | Agent App 不得被解释或实现为绕过平台规则的传统 SaaS 安装包。 | 检查 AgentAppPassport、运行记录、权限、证据、验收、退出和声誉回写。 |

## 3. 目录与分类验收

| 编号 | 验收标准 | 验证方式 |
| --- | --- | --- |
| C-01 | 必须存在 `AgentCategory` 注册表。 | 检查契约、文档或种子数据。 |
| C-02 | 每个分类必须有 `categoryId`、中英文名、风险等级、默认权限模板、默认验收模板、运营 owner、可售状态。 | 检查 `agentCategories`。 |
| C-03 | 分类必须支持 create、read、update、archive、restore。 | 执行或检查 `agent_category.*` 命令。 |
| C-04 | 归档分类不得删除历史订单、证据和声誉。 | 构造归档后回读历史订单。 |
| C-05 | 分类修改必须写入审计事件。 | 检查 `AgentCategoryUpdated` 或等价事件。 |
| C-06 | 每个 AgentListing 必须绑定至少一个分类。 | 检查 listing 数据。 |
| C-07 | 目录必须支持按分类、标签、供给形态、风险、计费、价格、SLA、评分、产能筛选。 | 检查 Agent Catalog 页面或 API。 |
| C-08 | 分类历史快照必须保留，当前分类改名不得改变历史订单回放。 | 检查订单快照。 |

## 4. 可采购性验收

| 编号 | 验收标准 | 验证方式 |
| --- | --- | --- |
| B-01 | Quick Order 必须可直接购买标准 Agent 交付。 | 创建一笔 Quick Order 并检查交付闭环。 |
| B-02 | RFP 必须支持买方发布需求、服务方携 Agent 报价、买方接受报价。 | 检查 RFP、Proposal、EscrowOrder。 |
| B-03 | 定制 Agent 必须支持需求冻结、里程碑、UAT、变更单和交付验收。 | 检查定制项目配置和事件。 |
| B-04 | Agent App 必须支持安装/授权、订阅或权益、运行记录、验收/使用证明和退出机制。 | 检查 AgentAppPassport、listing 和 run records。 |
| B-05 | Program / order-credit 必须支持额度、drawdown、QBR、SLA、证据保留和续约状态。 | 检查 ProgramWorkspace。 |
| B-06 | 必须支持记录合同主体、付款引用、发票信息、开票状态和对账导出。 | 创建订单并检查 finance evidence。 |
| B-07 | 每个订单、项目或订阅周期必须能记录 ROI、节省人时、可用结果、复购或续约信号。 | 检查复盘表。 |
| B-08 | UI、CLI、API、事件日志核心状态一致率 100%。 | 抽检分类、上架、下单、执行、交付、验收、评分。 |
| B-09 | 每单都有可回放证据包或运行证据。 | 导出订单、事件、交付、QA、验收、资金状态。 |
| B-10 | 必须形成分类级单位经济模型。 | GMV、take rate、payout、QA 分钟、获客成本、争议成本、贡献毛利。 |
| B-11 | 必须存在可签 PoC / enterprise / custom project / subscription 合同附件模板。 | 检查采购附件包。 |
| B-12 | 样例、访谈、账户和订单必须区分 `validated`、`sandbox_verified`、`in_conversation`、`sample_only`、`target_to_collect`。 | 检查融资证据包和案例导出。 |
| B-13 | 未填真实签约主体、收款主体、开票主体、退款路径、法务联系人、财务联系人和子处理方清单前，不得标记为 enterprise procurement ready。 | 检查 procurement gate。 |
| B-14 | `sample_only` 或 `sandbox_verified` 不能计入真实商业验证。 | 检查 evidence room 和市场验证包。 |
| B-15 | 订阅、使用量、seat-like 权益或 App 安装只能作为 AaaS 的计费和访问方式，不能替代执行、证据、验收和责任链。 | 创建订阅或 Agent App 使用场景，检查是否生成运行记录、证据、验收/使用证明和声誉事件。 |

## 5. Agent 原生与 CLI 对齐验收

| 编号 | 验收标准 | 验证方式 |
| --- | --- | --- |
| A-01 | 每个写模型必须有稳定 ID、状态、版本、创建者和事件引用。 | 检查交易写模型和目录写模型。 |
| A-02 | 每个核心对象必须支持 JSON 读写或导出。 | 使用 API 或 CLI 获取对象，确认不是只存在前端状态。 |
| A-03 | `AgentPassport` 必须包含 machine-readable manifest。 | 检查模型、工具、输入 schema、输出 schema、权限范围。 |
| A-04 | `AgentAppPassport` 必须包含 App manifest、安装/授权边界、运行回调和版本。 | 检查 Agent App 数据。 |
| A-05 | Agent runtime 执行必须生成 `ExecutionRun` 和 `evidenceRefs`。 | 启动执行后检查运行记录和证据引用。 |
| A-06 | Agent Squad 必须有主责 Agent 和统一验收对象。 | 检查 Squad manifest、权限拆分和订单责任。 |
| A-07 | UI 发布需求必须等价于 `alphaagents rfp publish`。 | 用 UI 和 CLI 各发布一条需求，状态和事件一致。 |
| A-08 | UI 提交报价必须等价于 `alphaagents proposal submit`。 | 用 UI 和 CLI 各提交报价，字段和事件一致。 |
| A-09 | UI 接受报价必须等价于 `alphaagents proposal accept`。 | 检查生成订单和报价状态。 |
| A-10 | UI 打款托管必须等价于 `alphaagents escrow fund`。 | 检查托管金额、资金事件和状态。 |
| A-11 | UI 启动执行必须等价于 `alphaagents run start`。 | 检查 ExecutionRun 状态和日志。 |
| A-12 | UI 提交交付必须等价于 `alphaagents delivery submit`。 | 检查 DeliveryPackage 和证据。 |
| A-13 | UI 验收通过必须等价于 `alphaagents acceptance accept`。 | 检查 AcceptanceReview、订单状态、放款事件。 |
| A-14 | UI 发起争议必须等价于 `alphaagents dispute open`。 | 检查 EscrowOrder 争议状态和资金冻结。 |
| A-15 | UI 提交评分必须等价于 `alphaagents rating submit`。 | 检查 ReputationEvent 和 Agent 身份回写。 |
| A-16 | CLI 不得绕过权限、托管、验收、评分规则。 | 用 CLI 尝试越权和跳状态操作，应被拒绝并记录。 |
| A-17 | CLI 输出必须支持人类可读和机器可读格式。 | 命令至少支持默认文本输出和 `--json` 输出。 |
| A-18 | 每个 CLI 关键命令必须产生事件日志。 | 执行命令后检查事件流。 |
| A-19 | 前端页面必须能查看当前对象的 CLI 命令或事件引用。 | 检查 CommandPreview 或事件时间线。 |

## 6. Command Handler 与状态机验收

| 编号 | 验收标准 | 验证方式 |
| --- | --- | --- |
| CH-01 | 所有写命令必须使用 `CommandEnvelope`。 | 检查 command handler。 |
| CH-02 | 所有写命令必须幂等。 | 同一 `idempotencyKey` 重放返回同一结果。 |
| CH-03 | 所有写命令必须检查 `expectedVersion`。 | 构造旧版本写入，应返回 `VERSION_CONFLICT`。 |
| CH-04 | 所有写命令必须检查 actor role 和 token scope。 | 构造错误角色和 scope。 |
| CH-05 | 所有写命令必须检查 tenant ownership。 | 用其他租户访问应失败。 |
| CH-06 | `proposal.submit` 必须校验服务方准入、AgentPassport 有效、分类可售和 RFP 可报价状态。 | 未准入服务方提交应失败。 |
| CH-07 | `agent_category.archive` 后不得创建新 listing 或新订单。 | 归档分类后尝试上架/下单。 |
| CH-08 | `agent_listing.publish` 必须校验 AgentPassport、分类、价格、权限和验收模板。 | 缺字段发布应失败。 |
| CH-09 | `permission.approve` 必须按风险等级校验高风险权限。 | 未授权高风险工具应失败。 |
| CH-10 | `delivery.qa_pass` 前不得进入买方验收。 | 交付提交后检查状态。 |
| CH-11 | `acceptance.request-revision` 不得扩大原 scope。 | 请求新增范围应失败并要求变更单。 |
| CH-12 | `dispute.resolve` 必须生成可审计裁决。 | 检查裁决、金额和证据引用。 |
| CH-13 | `rating.submit` 必须绑定订单、Agent/Agent App、版本和分类。 | 检查 ReputationEvent。 |
| CH-14 | 机器可读契约必须作为唯一工程真源。 | 运行 `node scripts/verify-contract.mjs`。 |

## 7. 页面验收

### 7.1 Public Showcase

| 编号 | 验收标准 | 验证方式 |
| --- | --- | --- |
| UI-01 | 首屏必须清楚说明完整 Agent 平台定位。 | 检查首页。 |
| UI-02 | 首屏必须能进入 Agent Catalog、Buyer org setup 或 Quick Order/RFP。 | 检查 CTA。 |
| UI-03 | 必须解释 Agent App 和定制 Agent 也是 Agent。 | 检查文案和入口。 |
| UI-04 | 必须展示风险边界、证据、验收和争议机制。 | 检查 public showcase。 |
| UI-04A | Public showcase 必须用紧凑方式解释 AaaS 与传统 SaaS 的差异：谁做事、验收什么、证据是什么、责任归谁。 | 检查首屏或首屏下方采购说明区。 |

### 7.2 Agent Catalog

| 编号 | 验收标准 | 验证方式 |
| --- | --- | --- |
| UI-05 | 目录必须展示一级分类和二级标签。 | 检查筛选和分类页。 |
| UI-06 | 列表必须支持按分类、供给形态、风险、计费、价格、SLA、评分、容量筛选。 | 切换筛选条件检查结果变化。 |
| UI-07 | 每个列表项必须展示 Agent 名称、服务方法务主体、人工责任人、能力标签、proof 状态、成交数、价格/计费、当前产能。 | 打开目录检查每一项。 |
| UI-08 | 未认证或高风险 Agent 必须有清晰标识。 | 检查风险标签和认证标签。 |
| UI-09 | 列表项必须能查看 Agent manifest 或 CLI show 命令。 | 检查 `alphaagents agent-listing search` 或等价事件。 |

### 7.3 Catalog Admin

| 编号 | 验收标准 | 验证方式 |
| --- | --- | --- |
| UI-10 | 管理后台必须支持分类 create/update/archive/restore。 | 操作分类并检查事件。 |
| UI-11 | 管理后台必须支持 AgentPassport 创建、更新、暂停。 | 操作 Agent 并检查版本。 |
| UI-12 | 管理后台必须支持 AgentListing 发布、更新、归档。 | 操作 listing 并检查可售状态。 |
| UI-13 | 分类、Agent、Listing 变更必须有审计日志。 | 检查事件时间线。 |

### 7.4 Buyer Org Setup

| 编号 | 验收标准 | 验证方式 |
| --- | --- | --- |
| UI-14 | 注册流程必须包含 buyer org setup，而不只是邮箱登录。 | 检查组织预检页或视觉母版。 |
| UI-15 | 页面必须收集 requester、acceptance owner、finance contact、authorized payer、signer。 | 检查字段与保存结果。 |
| UI-16 | 页面必须展示 authority chain 和 invoice readiness。 | 检查 readiness panel。 |
| UI-17 | 未完成 scope acknowledgement、billing 或 authority chain 时，不得进入高风险购买、订阅或定制确认。 | 构造缺字段场景。 |

### 7.5 Agent 详情页

| 编号 | 验收标准 | 验证方式 |
| --- | --- | --- |
| UI-18 | 详情页必须展示 Agent 身份证。 | 检查名称、分类、供给形态、所有者、版本、风险标签。 |
| UI-19 | 必须区分自述能力和已验证履历。 | 检查页面分区或字段命名。 |
| UI-20 | 必须展示能力边界和不适用场景。 | 检查能力说明。 |
| UI-21 | 必须展示可购买模式：订单、订阅、定制、托管或私有部署。 | 检查套餐或报价入口。 |
| UI-22 | 必须展示历史订单、评分分布、交付准时率、返工率、争议率。 | 检查战绩模块。 |
| UI-23 | 评分必须绑定真实订单、Agent 版本和分类。 | 检查评分详情或数据模型。 |
| UI-24 | 详情页必须展示 CLI/API Tab 或等价命令入口。 | 检查 Agent 详情页。 |
| UI-24A | Agent App 详情页必须展示 AaaS 交付说明，而不是只展示安装、订阅和功能清单。 | 检查 App manifest、运行证据、验收/使用证明、退出机制和责任人。 |

### 7.6 交易订单 / 验收页

| 编号 | 验收标准 | 验证方式 |
| --- | --- | --- |
| UI-25 | 页面必须展示订单状态、托管/订阅/额度状态、验收状态。 | 检查订单页。 |
| UI-26 | 页面必须展示权限、执行、交付、QA 和证据。 | 检查时间线和证据区。 |
| UI-27 | 验收动作只能是通过、限定修改、争议，或对应订阅/项目的续约、取消、里程碑确认。 | 检查按钮和状态。 |
| UI-28 | 高风险动作必须展示授权、preview、撤销和审计信息。 | 检查风险提示。 |

## 8. 数据模型验收

| 编号 | 验收标准 | 验证方式 |
| --- | --- | --- |
| D-01 | 必须存在 `RFP` 写模型。 | 检查 schema、mock data 或 API。 |
| D-02 | 必须存在 `Proposal` 写模型。 | 检查需求、乙方、Agent、价格、周期关联。 |
| D-03 | 必须存在 `EscrowOrder` 写模型。 | 检查托管金额、支付状态、验收状态。 |
| D-04 | 必须存在 `RiskPermissionGrant` 写模型。 | 检查授权范围、有效期、审批链。 |
| D-05 | 必须存在 `ExecutionRun` 写模型。 | 检查运行日志、工具调用、成本、失败原因。 |
| D-06 | 必须存在 `DeliveryPackage` 写模型。 | 检查交付物、QA 和验收标准映射。 |
| D-07 | 必须存在 `AcceptanceReview` 写模型。 | 检查逐项验收结论。 |
| D-08 | 必须存在 `ReputationEvent` 写模型。 | 检查评分能写入 Agent 和乙方声誉。 |
| D-09 | 必须存在 `AgentCategory` 目录写模型。 | 检查分类状态、模板、owner 和事件。 |
| D-10 | 必须存在 `AgentPassport`、`AgentAppPassport`、`AgentListing`。 | 检查身份、App 和可售视图。 |
| D-11 | `DisputeCase` 只能是 `EscrowOrder` 争议状态的运营投影或子记录。 | 检查 schema 和状态机。 |
| D-12 | `Rating` 只能是评分输入视图，最终必须变成 `ReputationEvent`。 | 检查评分提交逻辑。 |
| D-13 | 所有模型必须能关联 evidenceRefs。 | 检查证据引用字段和查询接口。 |
| D-14 | 所有关键状态变化必须有领域事件。 | 检查事件流或审计日志。 |
| D-15 | 所有 CLI/API DTO 必须复用同一领域契约。 | 检查命名和字段映射。 |

## 9. 交易托管、付款与财务验收

| 编号 | 验收标准 | 验证方式 |
| --- | --- | --- |
| T-01 | 下单前不得显示已托管。 | 未支付订单不得进入执行中。 |
| T-02 | 订阅权益、order-credit、里程碑和收益分成必须有冻结条款。 | 检查 terms snapshot。 |
| T-03 | 放款、退款、部分放款、credit drawdown、订阅续费都必须有 finance evidence。 | 检查账本事件。 |
| T-04 | 内部 conditional release ledger 不得被描述为持牌资金清结算能力。 | 检查文案、状态机和支付说明。 |
| T-05 | 资金、证券、支付、广告预算等受监管动作必须按分类和地域限制。 | 检查风险模板。 |

## 10. 安全与权限验收

| 编号 | 验收标准 | 验证方式 |
| --- | --- | --- |
| S-01 | Agent runtime 不得拥有超出授权的权限。 | 尝试调用未授权工具应失败。 |
| S-02 | 高风险动作必须有显式授权、preview、审计和撤销路径。 | 构造账号登录、发布、写入或资金相关动作。 |
| S-03 | Agent App 不得借安装绕过权限和运行记录。 | 检查 App callback 和 run records。 |
| S-04 | 定制 Agent 不得绕过证据、验收和声誉。 | 检查定制项目闭环。 |
| S-05 | Agent 评分不得由乙方自评生成有效评分。 | 用乙方账号评分应失败。 |
| S-06 | 禁止上架虚假能力、绕单引导、恶意刷单、高风险无授权 Agent。 | 检查上架审核和风控规则。 |

## 11. 运营验收

| 编号 | 验收标准 | 验证方式 |
| --- | --- | --- |
| O-01 | 供应侧必须通过准入评分，低于 80 分不得接单。 | 检查 Seller/Agent 准入记录。 |
| O-02 | 分类必须有运营 owner 和风险 owner。 | 检查分类注册表。 |
| O-03 | 每类至少有默认权限模板和验收模板。 | 检查分类模板绑定。 |
| O-04 | QA 不通过不得进入买方验收。 | 构造缺证据交付包。 |
| O-05 | 冻结、恢复、下架 Agent 或分类必须有操作记录。 | 检查审计日志。 |
| O-06 | 客服和财务接管必须能看到同一订单、证据和账本。 | 检查 workbench 和 finance console。 |

## 12. Evidence artifact gates

| 编号 | 验收标准 | 验证方式 |
| --- | --- | --- |
| E-01 | 样单目录必须包含 RFP、proposal、terms、permission grants、execution run、delivery、topics、evidence index、QA、acceptance、finance ledger、reputation event、ROI retrospective。 | 检查导出目录。 |
| E-02 | 样单必须标注 `sample_only + sandbox_verified`。 | 检查 order summary。 |
| E-03 | 样单不得声称真实商业验证。 | 搜索 `validated` 声明。 |
| E-04 | EvidenceRef 必须有 hash、capturedAt、visibility、redactionStatus。 | 检查证据索引。 |
| E-05 | 导出包必须可被 CLI/API/UI 一致回读。 | 检查 snapshot JSON。 |

## 13. Business readiness gates

| 编号 | 验收标准 | 验证方式 |
| --- | --- | --- |
| G-01 | README 必须说明完整平台定位。 | 检查 README。 |
| G-02 | `product-design.md` 必须列出默认分类和 CRUD 规则。 | 检查 `docs/product-design.md`。 |
| G-03 | 机器契约必须包含分类、供给形态、目录命令和 listing 查询。 | 运行 `node scripts/verify-contract.mjs`。 |
| G-04 | 市场验证材料必须诚实区分 sandbox 和 validated evidence。 | 检查 market validation pack。 |
| G-05 | 采购包必须说明定制 Agent、Agent App、订阅、order-credit 和高风险权限边界。 | 检查 procurement pack。 |
| G-06 | Business readiness gates 必须校验完整平台、分类注册表、Agent App、custom Agent、conditional release 和 evidence gap。 | 运行 `node scripts/verify-business-readiness.mjs`。 |
| G-07 | Business readiness gates 必须校验 AaaS 定位：订阅/App/使用量不得绕过 Agent 身份、执行、证据、验收、财务和声誉闭环。 | 运行 readiness gate 或人工检查产品、视觉、契约和页面。 |

## 14. 必须失败的反例

以下任一情况出现，都不能判定为完成：

1. 只能浏览 Agent，不能发布需求、报价、订阅、定制或下单。
2. 没有 Agent 分类注册表。
3. 定制 Agent 或 Agent App 被做成绕过平台规则的独立入口。
4. 分类只能在前端常量里改，不能通过命令/API 增删改查。
5. 订单没有绑定 Agent，评分无法沉淀到 Agent 身份。
6. Agent 详情只有宣传文案，没有订单、评分、版本和证据。
7. 页面显示已验收，但 CLI/API/事件没有对应状态。
8. 未托管、未授权或未确认权益就允许执行高风险动作。
9. 完成订单后 Agent 评分、成交数、履历没有变化。
10. 样例包把 sandbox evidence 伪装成真实客户证据。
11. 目录、交易、权限、验收、财务和声誉各自维护状态。
12. 把 Agent as a Service 做成普通 SaaS：只卖席位、安装和功能清单，没有 Agent 执行、证据、验收和责任链。

## 15. 最终验收 Checklist

- [ ] README 明确展示完整平台定位。
- [ ] 产品和首屏明确说明 Agent as a Service 对标传统 SaaS，但交付对象是 Agent 执行结果和证据责任链。
- [ ] `product-design.md` 列出所有默认一级分类和 CRUD 规则。
- [ ] 定制 Agent、Agent 原生 App、Agent Squad 都纳入 Agent 统一身份。
- [ ] Agent App 没有退化成传统 SaaS 安装包，仍有权限、运行证据、验收/使用证明、退出和声誉回写。
- [ ] 机器契约包含 catalog、passport、listing 命令和查询。
- [ ] Agent Catalog 支持分类、标签、供给形态、风险、计费和评分筛选。
- [ ] Buyer org setup 覆盖角色、付款、发票、授权链和风险边界。
- [ ] Quick Order、RFP、订阅、定制项目、order-credit 至少有契约表达。
- [ ] 高风险权限有授权、preview、审计和撤销路径。
- [ ] 执行、交付、QA、验收、争议、财务和声誉闭环可回放。
- [ ] Evidence package 可打开、可校验、可导出。
- [ ] Sandbox evidence 不被伪装成真实商业验证。
- [ ] 验证脚本全部通过。
