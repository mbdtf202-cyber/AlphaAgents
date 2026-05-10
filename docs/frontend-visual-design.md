# AlphaAgents 前端视觉设计方案

## 1. 设计定位

AlphaAgents 的界面不是普通官网、聊天产品或单一订单工具，而是完整 Agent 交易、托管交付、应用分发和企业运营网络的控制台。

第一屏要让甲方快速判断：

- 我能买哪些 Agent 分类。
- 哪些 Agent、Agent App、定制 Agent 或 Squad 值得信任。
- 钱、订阅、额度或里程碑是否受控。
- 权限、账号、发布、生产写入、资金相关动作是否安全。
- 交付物、证据、验收、争议和声誉是否可回放。
- 下一步该做什么。

视觉执行物以仓库内文件为准：

- Token 真源：[design/alphaagents-design-tokens.json](../design/alphaagents-design-tokens.json)。
- 视觉母版：[design/visual-masters/alphaagents-visual-master.html](../design/visual-masters/alphaagents-visual-master.html)。
- 状态 fixtures：[design/visual-fixtures/orders.json](../design/visual-fixtures/orders.json)。
- 品牌符号：[design/brand/ledger-passport-mark.svg](../design/brand/ledger-passport-mark.svg)。
- 响应式规则：[breakpoints-and-layout.md](./breakpoints-and-layout.md)。
- 表格降级规则：[table-column-priority.md](./table-column-priority.md)。

视觉门槛由 `node scripts/verify-visual-system.mjs` 校验。文档中的色值、断点、状态示例若与 JSON 或视觉母版冲突，以可校验工件为准。

核心气质是专业、可信、可审计、采购友好、运营工具感。界面应像企业采购平台、SaaS 控制台、托管订单系统、Agent 应用目录和开发者审计控制面的结合体，而不是普通 AI 产品官网。

界面必须清楚表达 **Agent as a Service（AaaS）对标传统 SaaS**：视觉上可以借鉴 SaaS 的控制台、订阅、权限和组织管理结构，但购买模型不是“买工具自己干”，而是“购买 Agent 执行并验收结果”。因此核心页面都要回答四个问题：

- 谁实际完成工作：标准 Agent、Agent App、定制 Agent、托管服务 Agent、Squad、企业内嵌 Agent 或人工责任人。
- 买方验收什么：订单结果、订阅周期结果、App run、里程碑、证据包或运营复盘。
- 什么证明完成：`ExecutionRun`、`DeliveryPackage`、`EvidenceRef`、QA、验收和财务事件。
- 出问题谁负责：Agent owner、服务方、平台规则、争议机制、退款/放款条件和退出路径。

不得把 Agent App 画成普通 SaaS 应用商店安装页。Agent App 可以有订阅和应用式 UI，但视觉上必须保留 Agent 身份、权限、运行证据、验收、声誉和退出机制。

## 2. 品牌策略

### 2.1 品牌人格

- 冷静：不夸大 Agent 能力，不用魔法式文案。
- 精准：所有承诺都落到价格、周期、验收、证据、权限和责任。
- 可信：强调托管、QA、争议、履约、授权和可回放证据。
- 高效：让买方快速找到分类、选择供给、下单或发起定制。
- 工程化：UI、CLI、API、事件和 Agent runtime 使用同一语言。

### 2.2 视觉关键词

推荐关键词：

- procurement-grade
- operational
- verifiable
- calm intelligence
- evidence-first
- catalog-to-transaction
- dense but readable

禁用关键词：

- futuristic neon
- AI magic
- social feed first
- creator marketplace
- unrelated high-risk operations console
- landing-page hero

### 2.3 文案语气

文案要像企业采购和运营台：

- 用「已绑定验收模板和证据要求」替代「智能可靠」。
- 用「发布动作需要账号授权和预览确认」替代「一键发布」。
- 用「证据包完整度 96%」替代「可信可靠」。
- 用「未授权不得执行」替代「权限安全有保障」。
- 用「缺 2 个验收项，不能进入验收」替代「请完善信息」。

### 2.4 Logo / 符号方向

不要用抽象 AI 光球。品牌符号方向为：

**Ledger Passport mark：身份卡轮廓 + 账本格线 + check/hash 角标。**

含义：

- 身份卡：Agent、Agent App、服务方和分类身份。
- 账本格线：托管、订阅、额度、付款、发票、对账。
- check/hash：验收和证据不可篡改。

符号应适合 16px favicon、侧边栏图标、证据包水印和导出 PDF 页眉。

## 3. 设计原则

1. 分类优先：首屏必须能进入金融、社媒运营、情报、生活助理、企业运营、开发者、法务合规、数据分析、行业垂直、定制 Agent 与 Agent App 等分类。
2. 交易优先：目录不是展示墙，每个可售对象都要能进入订单、订阅、定制、托管或咨询路径。
3. 信任优先：突出履约记录、托管状态、权限边界、验收节点、争议处理。
4. Agent 原生：每个 Agent、Agent App、订单、执行、交付、评分都要显示机器可读身份和状态。
5. CLI/API 对齐：每个核心 UI 动作都应能追溯对应命令、事件名和证据引用，但默认折叠。
6. 风险可见：账号登录、发布、广告投放、生产写入、资金相关动作必须有高可见授权和审计提示。
7. 密度适中：桌面端偏运营后台密度，移动端保持核心决策信息优先。
8. 克制高级：少装饰、少渐变、少空白，使用清晰层级、稳定网格、可读数据。

## 4. 信息层级

全局信息层级从高到低为：

1. Agent 分类、当前工作区、订单/订阅/项目/额度状态。
2. 可执行动作：搜索 Agent、发起 Quick Order、发布 RFP、订阅 Agent App、创建定制项目、提交验收、评价。
3. 风险与信任：托管金额、付款/发票状态、授权状态、履约率、争议率、交付记录、认证状态。
4. 运营数据：成交量、响应时间、复购率、完成率、分类标签、可用产能。
5. CLI / API / runtime 对齐信息：命令、事件、状态、证据。
6. 辅助说明：规则、帮助文档、日志。

页面生态必须覆盖完整买方和运营旅程：

1. `Public showcase`
2. `Agent Catalog`
3. `Buyer org setup`
4. `Quick Order / RFP`
5. `Workbench`
6. `Provider Proof Directory`
7. `Agent / Agent App detail`
8. `Order / Project workspace`
9. `Evidence room`
10. `Reputation`
11. `Program ops`
12. `Catalog admin`
13. `Risk / finance console`

这些页面分别回答：

- 平台是什么，分类和风险边界是什么。
- 我能买哪些 Agent、Agent App、定制 Agent 或 Squad。
- 谁能代表组织下单、付款、授权和验收。
- 如何购买标准包、发 RFP、订阅 App 或发起定制。
- 现在最重要的动作是什么。
- 平台为什么敢推荐这个服务方和 Agent。
- 这个 Agent 的能力、权限、版本和历史是否可信。
- 钱、权益、执行、交付、验收和争议进行到哪。
- 证据如何导出、审计、脱敏和保留。
- 长期来看谁可靠。
- 多单、订阅、order-credit 和续约如何运营。
- 分类、AgentPassport、AgentListing 如何增删改查。
- 高风险权限、财务、退款和对账如何控制。

## 5. 首页 / 工作台第一屏 Wireframe

### 5.1 Desktop 1440px

```text
┌──────────────┬────────────────────────────────────────────────────────┬──────────────────────────┐
│ Sidebar 240  │ Topbar: org verified | balance/credits | active work   │ Trust & risk rail 320    │
│              ├────────────────────────────────────────────────────────┤                          │
│ Workbench    │ Category strip: Finance | Social Ops | Intel | Custom  │ Permission status        │
│ Catalog      │ CTA: Search Agent / Start order / Request custom       │ Conditional release      │
│ Agent Apps   ├────────────────────────────────────────────────────────┤ Evidence completeness    │
│ Orders       │ Action queue: acceptance | permission review | invoice │ High-risk approvals      │
│ Programs     ├────────────────────────────────────────────────────────┤ Recent delivery package  │
│ Reputation   │ Active work table: orders / projects / subscriptions   │ Finance/invoice summary  │
│ Admin        ├────────────────────────────────────────────────────────┤ CLI/events collapsed     │
│              │ Recommended Agents / Apps / custom templates           │                          │
└──────────────┴────────────────────────────────────────────────────────┴──────────────────────────┘
```

首屏可见边界：

- 不能把分类入口放到二屏。
- 不能把资金、订阅、额度或权限状态藏到二级页。
- 不能默认展开日志或 CLI。
- 不能用大 hero 占掉可操作区域。

### 5.2 Tablet 1024px

- 左侧导航收起为 72px。
- 右侧 Trust & risk rail 折叠为顶部横向 trust bar。
- Category strip 保持首屏可见。
- Active work 使用 4 列优先表格：对象、状态、金额/权益、下一步。
- CLI/events 进入抽屉。

### 5.3 Mobile 390px

首屏顺序：

1. 顶部组织、额度和风险摘要。
2. 分类横向 selector。
3. 主按钮：`找 Agent`、`发需求`、`定制 Agent`。
4. 待验收、待授权、待付款、争议提醒。
5. 信任摘要：托管、QA、证据、权限、争议 SLA。
6. 推荐 Agent / Agent App 折叠列表。

移动端不展示完整后台表格，使用分组列表和底部固定 CTA。

## 6. 导航结构

主导航采用 SaaS 侧边栏结构，避免官网式顶部导航。

一级导航：

- 工作台：总览订单、订阅、定制项目、验收、资金、权限。
- Agent Catalog：按分类浏览、搜索、筛选、对比。
- Agent Apps：应用型 Agent、安装、订阅、运行记录。
- 定制 Agent：需求 intake、里程碑、UAT、变更单。
- 发布需求：Quick Order、RFP、托管运营、私有部署入口。
- Provider Proof Directory：服务方证明、责任人、样例、风险边界。
- 订单与项目：付款、托管、QA、交付、验收、争议。
- Evidence Room：证据、hash、redaction、export packet。
- Reputation：Agent、Agent App、服务方、版本、分类信用图谱。
- Program Ops：backlog、credits、subscription、QBR、renewal blocker。
- Catalog Admin：分类、标签、模板、AgentPassport、AgentListing CRUD。
- Risk / Finance：权限审批、账本、退款、对账、审计。

导航视觉：

- 左侧宽度 240px，收起后 72px。
- 当前项使用左侧 3px 色条 + 浅色背景。
- 图标统一使用线性图标，避免 emoji。
- 导航底部固定显示企业认证状态、余额、额度或风险提醒。

## 7. 分类与目录视觉

### 7.1 分类入口

分类入口必须在 Agent Catalog 和 Workbench 首屏可见。默认分类：

| 分类 | 首屏展示方式 |
| --- | --- |
| 金融与投研 | 高风险 badge、合规提示、报告/对账模板 |
| 社媒运营与内容增长 | 发布权限 badge、账号授权状态、内容/复盘模板 |
| 情报与研究 | 证据完整度、来源类型、时效 |
| 生活助理与个人效率 | 隐私边界、任务确认、偏好记忆 |
| 销售与客户增长 | CRM 权限、触达合规、线索质量 |
| 企业运营与流程自动化 | SOP、审批、工单、系统写回 |
| 开发者与 IT 运维 | repo 权限、测试、回滚、安全扫描 |
| 法务、合规与风险 | 人工复核、适用地域、非法律意见提示 |
| 数据分析与商业智能 | 数据口径、图表、导出、复现 |
| 教育、培训与知识管理 | 课程、考核、知识库引用 |
| 行业垂直 Agent | 行业字段、专用风险、模板 |
| 定制 Agent 与 Agent 原生 App | 定制 intake、App manifest、部署和退出 |

### 7.2 Agent Catalog

页面目标：让买方像查企业采购目录一样查 Agent，而不是刷营销卡片。

布局：

- 顶部为搜索栏、分类 tabs、供给形态 segmented control。
- 左侧为筛选栏：分类、标签、价格、交付周期、计费模式、认证、评分、成交量、风险等级、供给形态。
- 主区域默认使用表格视图，支持紧凑卡片视图。
- 右侧可选为对比栏，最多固定 3 个 Agent。

固定字段：

- Agent / Agent App 名称。
- 供给形态：标准 Agent、托管服务 Agent、定制 Agent、Agent App、Squad、企业内嵌。
- 服务方法务主体。
- 人工责任人。
- 分类和二级标签。
- proof 状态：`validated` / `sample_only + sandbox_verified` / `not yet approved`。
- 计费模式和起步价格。
- 当前产能。
- 履约率、QA 通过率、争议率。
- 高风险权限 badge。
- 操作：查看资质、查看样例、发起订单、订阅 App、请求定制、加入对比。

视觉重点：

- 信任数据优先级高于宣传文案。
- 使用表格化对齐，让价格、评分、周期易比较。
- 推荐、认证、热销只作为小标签，不做大面积装饰。
- 高风险权限不隐藏在 tooltip。

### 7.3 Catalog Admin

页面目标：支持分类、标签、模板、AgentPassport、AgentListing 的增删改查。

布局：

- 左侧为对象树：分类、标签、权限模板、验收模板、AgentPassport、AgentListing。
- 主区域为表格和详情编辑器。
- 右侧为审计日志、影响范围、历史订单保护提醒。

关键交互：

- 分类 create/update/archive/restore。
- AgentPassport create/update/suspend。
- AgentListing publish/update/archive。
- 模板绑定和风险等级变更必须显示影响范围。
- 已有历史交易的分类不允许物理删除。

## 8. 信任证据链视觉化

### 8.1 下单前必须出现

- 分类、供给形态、价格、周期、范围。
- 服务方准入状态。
- Agent / Agent App 能力边界。
- 样例交付。
- 平台托管、订阅或额度规则。
- 权限、发布、账号、生产写入、资金相关风险边界。
- 退款、争议、取消、退出摘要。

视觉形式：

- `TrustBadge` 用于准入、QA、托管、证据完整。
- `RiskBadge` 用于账号登录、发布、广告、生产写入、资金动作。
- `EvidencePreview` 展示 2-3 个脱敏样例。
- `ConditionalReleaseStrip` 用 4 步说明未确认权益不得执行、QA 后验收、验收后放款、争议冻结。

### 8.2 订单 / 项目页固定可见

- 托管金额、订阅权益、额度或里程碑。
- 当前资金/权益状态。
- 当前权限状态。
- 下一步责任人。
- SLA 倒计时。
- 验收动作。
- 争议入口。

视觉形式：

- 右侧固定 `OrderControlPanel`。
- 顶部 `StatusTimeline`。
- 交付区内嵌 `EvidenceCompletenessMeter`。

### 8.3 战绩页必须量化

- 完成订单。
- 准时率。
- 首次验收通过率。
- 平均修改次数。
- 争议率。
- 复购率。
- 订阅续约率。
- 定制项目 UAT 通过率。
- 证据完整度。

差评、退款、争议、下架、暂停不能只藏在折叠区。

## 9. 全局 CLI / API 对齐交互

每个核心页面应有一个可展开的「CLI / API / Events」入口。默认用户视图优先显示业务状态，不默认展开命令。

要求：

- 命令内容可复制。
- 命令参数来自当前页面状态。
- 命令执行后的事件名可见。
- 页面状态和 CLI/API 状态使用同一套字段命名。
- 危险命令必须显示权限、审批和风险提示。
- 内部一致性异常必须阻断关键动作，但买方表层语言不直接暴露工程术语。

示例展示：

```bash
alphaagents agent-listing search \
  --category social_media_operations \
  --supply-type agent_app \
  --risk medium_high \
  --json
```

```bash
alphaagents agent-category update \
  --category finance \
  --risk high \
  --acceptance-template acceptance_finance_research_v1 \
  --json
```

页面不需要把 CLI 做成主视觉，但必须让企业运营、开发者、API 用户和 Agent runtime 能清楚知道 UI 动作背后的机器命令。

## 10. 核心页面视觉方案

### 10.1 工作台

页面目标：让甲方和运营立刻知道当前最重要的交易、权限、验收、财务和证据动作。

布局：

- 顶部为组织状态条：企业认证、余额/额度、活跃订单、订阅、争议 SLA、消息。
- 第一模块为分类入口和快捷动作。
- 第二模块为行动队列：待授权、待付款、待验收、QA 异常、发票问题、续约风险。
- 第三模块为活跃工作表：订单、项目、订阅、Agent App 运行。
- 右侧为 Trust & risk rail。

关键模块：

- 分类入口。
- 找 Agent、发需求、定制 Agent、订阅 Agent App。
- 最近交付证据。
- 资金、权益和退款规则。
- 推荐 Agent / Agent App / 服务方候选。

视觉重点：

- 首屏不能出现泛平台介绍。
- 分类和当前动作必须比营销文案更高优先级。
- 付款、发票、权限、验收、争议状态必须可见。

### 10.2 Quick Order / RFP

页面目标：让甲方快速、明确、可验收地购买标准 Agent 或发起报价。

布局：

- 步骤条：选择分类和供给形态 -> 输入目标和资料 -> 选择权限 -> 验收标准 -> 付款/发票 -> 发布确认。
- 左侧为主表单。
- 右侧为需求质量评分、权限风险、平台担保说明、CLI 预览。

关键模块：

- 分类、市场、语言、渠道、目标。
- 标准包、订阅、定制或托管模式。
- Agent 能力要求、供给形态、数据访问范围。
- 验收标准：数量、质量、证据、事实错误边界、人工确认节点。
- 风险提示：账号权限、发布、生产写入、资金或受监管动作必须内联显示。
- 付款、发票、订阅权益或额度信息。
- CLI 预览：`alphaagents rfp create` 和 `alphaagents rfp publish`。

视觉重点：

- 主按钮为「提交并进入确认」。
- 保存草稿为次级按钮。
- 表单错误直接显示在字段下方。
- 右侧质量评分用进度条和 checklist 帮助甲方补齐需求。

### 10.3 Public Showcase

页面目标：让匿名访问者先看懂完整平台、分类、样例、风险边界和责任链。

布局：

- 顶部采用 procurement-style overview，不用大 hero。
- 首屏同时展示 Agent as a Service 定位、Agent 分类、样例 evidence package、Provider proof 摘要、风险边界、注册入口。
- 使用紧凑对照区解释 AaaS 与传统 SaaS 的差异：传统 SaaS 是工具和席位，AlphaAgents 是 Agent 执行、证据、验收和责任链。
- 下方展示 Agent App、定制 Agent、托管交付、订阅/order-credit、proof 说明和采购问题。

视觉重点：

- 分类入口和注册 CTA 必须在首屏同见。
- 样例证据和责任边界优先于品牌叙事。
- 公开展示要为企业采购和老板服务，而不是为流量 hero 服务。
- AaaS/SaaS 对照不做长文案营销，采用 2-4 列紧凑数据块：购买对象、谁做事、验收对象、责任证明。

### 10.4 Signup / Buyer Org Setup

页面目标：让注册过程完成组织预检，而不是只收一个邮箱。

布局：

- 步骤条：`Org profile -> Roles -> Billing -> Authority chain -> Scope acknowledgement -> Ready`
- 左侧为组织和角色表单。
- 右侧为 readiness panel：authority chain、invoice completeness、required approvals、next step。

关键模块：

- legal name / billing country / invoice title / tax id
- requester / acceptance owner / finance contact / authorized payer / signer
- 是否需要 PO、DPA、安全问卷
- 账号、发布、生产写入、资金相关权限 acknowledgement

视觉重点：

- checklist-first，不做长篇解释文本。
- 未完成 authority chain 或 billing 的状态必须可见。
- 这页必须让 buyer 明白谁有权下单、付款、授权和验收。

### 10.5 Agent / Agent App Detail

页面目标：帮助甲方判断这个 Agent、Agent App、定制模板或 Squad 是否值得托管执行。

布局：

- 顶部摘要区：名称、分类、供给形态、认证、评分、价格、履约数据、主要 CTA。
- 中部使用 Tab：身份、能力说明、应用场景、交付样例、战绩、评价、风险、CLI/API。
- 右侧固定 proof 面板：责任人、proof 状态、风险边界、权限需求、可购买模式。

关键内容：

- Agent 身份证。
- Agent App manifest 或 custom build manifest。
- AaaS 交付说明：这个对象不是单纯工具，而是如何执行、提交证据、进入验收、回写声誉。
- 能力边界：明确能做什么、不能做什么。
- 权限需求：只读、账号登录、发布、系统写入、广告、资金相关。
- 机器可读 manifest：模型、工具、输入输出 schema、runtime 要求。
- 交付物示例：报告、内容、自动化结果、执行日志、App run。
- 历史战绩：成功订单、复购客户、平均响应时间、订阅续约。
- 风险与合规：失败补救、退款规则、争议处理、撤销路径。

视觉重点：

- 详情页不要做品牌官网式大 hero。
- 首屏必须同时看到 Agent 信任摘要和交易入口。
- CTA 分层：主操作按供给形态显示「下单」「订阅」「请求定制」「安装并授权」，次操作「联系服务方」。
- CLI/API Tab 中展示 `alphaagents reputation show`、`alphaagents evidence show` 和 listing 查询命令。

### 10.6 交易订单 / 项目验收

页面目标：让甲方清楚知道钱、权益、权限、任务、交付和验收做到哪。

布局：

- 顶部状态时间线：已确认 -> 权限审批 -> 执行中 -> 已提交 -> QA -> 验收中 -> 已完成；争议作为异常分支。
- 左侧为订单/项目详情和交付物。
- 中部为执行日志、QA checklist、关键节点、Agent 输出。
- 右侧为资金/权益、付款/发票、权限、验收动作、争议入口、CLI 命令记录。

关键模块：

- 托管金额、订阅权益、额度、里程碑和释放条件。
- 付款和发票状态。
- 权限审批和撤销状态。
- 执行进度、当前责任方、下一步动作。
- QA checklist。
- 交付物列表：文件、链接、截图、数据报告、运行日志。
- 验收表单：通过、限定修改、发起争议、里程碑确认、取消/续约。
- 操作记录：谁在何时提交、确认、修改、留言。

视觉重点：

- 状态必须明确，不能只靠颜色。
- 验收按钮区域要固定且高可见。
- 危险操作如「发起争议」「撤销授权」「取消订阅」需要二次确认。
- 所有金额、权益、时间、责任方使用清晰数据样式。

### 10.7 Evidence Room

页面目标：让订单证据、Agent App 运行记录、QA、裁决和导出有一个独立的审计空间。

布局：

- 顶部摘要：对象、evidence count、redaction mode、hash、export status。
- 中部表格：evidenceId、sourceType、linked claim、qaStatus、visibility、capturedAt。
- 右侧为 export action、buyer-safe bundle、procurement packet、support packet、operator note。

视觉重点：

- 必须表格优先，不做图片流。
- visibility、redaction、hash 必须是高优先级字段。
- 从订单、Agent App run、定制项目一跳可达。

### 10.8 Reputation

页面目标：形成平台可信任的 Agent 信用系统。

布局：

- 顶部为战绩摘要：完成订单、履约率、平均评分、复购率、订阅续约率、争议率。
- 中部为评价列表，支持按分类、供给形态、订单类型、评分、Agent 版本筛选。
- 右侧为评分分布、趋势和 reputation event 时间线。

关键模块：

- 客户评价：评分、文字、订单类型、是否复购、是否平台验收通过。
- 交付指标：准时率、修改次数、响应速度、验收通过率。
- 版本履历：不同 Agent / Agent App 版本的评分来源。
- 风险记录：争议、超时、退款、平台处罚。
- CLI 查询：`alphaagents reputation show` 和 `alphaagents evidence show`。

视觉重点：

- 评价必须可追溯到订单类型，但隐藏敏感信息。
- 战绩数据要比主观文案更显眼。
- 争议、退款、下架和暂停记录不得默认隐藏。

### 10.9 Program Ops

页面目标：让连续订单、订阅、order-credit、托管运营、企业定制和续约运营有一个长期工作台。

布局：

- 顶部指标：backlog value、active credits、subscription ARR、renewal date、at-risk orders、open blockers。
- 左侧为 order queue / backlog / subscription runs。
- 中部为 weekly review / SLA exception / QBR artifacts。
- 右侧为 renewal blocker、billing issue、security review、capacity plan。

视觉重点：

- 这是密集、安静、运营导向的界面，不是营销页。
- backlog、credits、subscription、renewal blocker 必须比日志更靠前。
- 不把日志放最上面。

## 11. 组件系统

核心组件：

- Sidebar：主导航、收起态、企业认证状态。
- Topbar：全局搜索、命令面板、通知、工作区、账户。
- CategorySelector：一级分类、二级标签、推荐分类。
- SupplyTypeSegment：标准 Agent、托管服务 Agent、定制 Agent、Agent App、Squad、企业内嵌。
- CommandPreview：当前动作的 CLI 命令、事件名、复制按钮。
- DataTable：Agent 列表、订单列表、评价列表、分类管理列表。
- FilterPanel：多条件筛选、已选条件 chips。
- StatusTimeline：订单、项目、订阅和验收进度。
- TrustBadge：认证、托管、履约、风险标识。
- RiskBadge：账号、发布、广告、生产写入、资金相关动作。
- AgentManifestPanel：模型、工具、schema、runtime 要求。
- AgentAppManifestPanel：安装、授权、callback、运行证据。
- MetricTile：成交量、履约率、争议率、响应时间。
- OrderControlPanel：资金托管、订阅权益、付款、发票、释放条件、退款规则。
- EvidenceTimeline：命令、事件、证据、操作者、时间。
- EvidenceCompletenessMeter：证据完整度、失效链接、截图/hash。
- QaChecklist：格式、证据、事实、敏感信息、文件可读性。
- ReviewCard：评分、评价、订单上下文。
- CatalogCrudPanel：分类、AgentPassport、AgentListing 的增删改查。
- OrgReadinessPanel：注册预检、authority chain、invoice completeness。
- EvidenceRoomTable：证据室表格、redaction、visibility、export state。
- ProgramHealthRail：credits、subscription、renewal blocker、capacity warning、QBR status。

组件风格：

- 圆角 6px 或 8px。
- 卡片只用于独立对象，不做卡片套卡片。
- 表格行高 52-64px。
- 按钮高度 36px / 40px / 44px 三档。
- 图标统一 18px 或 20px，线宽一致。
- 命令块使用等宽字体，避免过长命令撑破容器。

## 12. Design Tokens

设计 token 的唯一可执行来源是 [design/alphaagents-design-tokens.json](../design/alphaagents-design-tokens.json)。以下表格是人类阅读摘要，不允许实现方手抄后自行分叉。

### 12.1 颜色

| Token | Value | 用途 |
| --- | --- | --- |
| `--bg-page` | `#F6F7F9` | 页面背景 |
| `--bg-surface` | `#FFFFFF` | 主表面 |
| `--border-subtle` | `#DDE2E8` | 默认边框 |
| `--text-primary` | `#111827` | 主文本 |
| `--text-secondary` | `#5B6472` | 次级文本 |
| `--action-primary` | `#1F6FEB` | 主操作、链接 |
| `--trust` | `#0F766E` | 托管、认证、通过 |
| `--warning` | `#B45309` | 待处理、风险 |
| `--danger` | `#B42318` | 失败、争议、拒绝 |
| `--success` | `#15803D` | 完成、验收通过 |
| `--command-bg` | `#0F172A` | 命令背景 |
| `--command-text` | `#E5E7EB` | 命令文本 |

避免大面积紫蓝渐变。可在小面积标签、图表中使用多色，但整体应以中性灰、白色、蓝、青绿为主。

### 12.2 字体

- 中文优先：PingFang SC / Microsoft YaHei / Noto Sans CJK SC。
- 英文和数字：Inter / system-ui。
- 命令和 ID：ui-monospace / SFMono-Regular / Menlo。
- 数据金额、百分比、时间使用 tabular numbers。

字号：

- 页面标题：24px / 32px。
- 区块标题：18px / 24px。
- 正文：14px 或 16px。
- 辅助说明：12px 或 13px。
- 表格数据：14px。
- CLI 命令：13px 或 14px。

### 12.3 间距与密度

- 基础单位 4px。
- 页面边距桌面 24px，移动端 16px。
- 区块间距 24px。
- 表单字段间距 16px。
- 表格单元格横向间距 16px。
- 工具栏控件间距 8px。
- 表格密度默认 56px 行高；审计表和订单日志可使用 44px 紧凑行高。

## 13. 状态与反馈

必须覆盖以下状态：

- Loading：表格和详情页使用 skeleton，不使用整页空白 spinner。
- Empty：说明当前为空，并给出下一步动作。
- Error：说明失败原因、影响范围、重试方式。
- Saving：表单保存草稿有明确保存中/已保存状态。
- Processing：托管执行中展示当前节点和预计更新时间。
- Permission pending：高风险授权等待审批。
- QA pending：交付已提交但未通过平台 QA。
- Success：发布、下单、验收通过后给出明确结果。
- Risk：权限不足、资金未托管、验收逾期、Agent 超时必须有高可见提示。
- Dispute：争议状态使用独立视觉，不与普通错误混淆。
- Finance pending：付款确认、发票、退款、对账等待处理。
- Internal state mismatch：UI 状态和 CLI/API 状态不一致时必须阻断关键动作，并在买方视图中转译成业务语言。

反馈规则：

- 关键交易动作必须有确认弹窗。
- 异步按钮点击后进入 loading disabled 状态。
- Toast 只用于轻量反馈，订单、支付、权限、验收结果必须在页面内持久显示。
- 状态不只靠颜色表达，必须配合文字、图标或标签。
- CLI 命令复制成功可以用 Toast，但命令执行结果必须进入事件时间线。

### 13.1 前端状态矩阵

| Domain | State | Badge | Primary CTA | Blocker | Recovery |
| --- | --- | --- | --- | --- | --- |
| Category | `draft` | Draft | 提交审核 | 缺 owner、模板或风险等级 | 补齐字段 |
| Category | `active` | Active | 发布 listing | 无 | 正常使用 |
| Category | `archived` | Archived | 恢复分类 | 风险复核缺失 | 完成复核 |
| Listing | `draft` | Draft | 发布 listing | Agent 未通过或分类归档 | 修复准入 |
| Listing | `published` | Published | 下单/订阅/定制 | 无 | 正常交易 |
| Listing | `archived` | Archived | 无 | 已下架 | 恢复或新建 |
| Order | `created` | Awaiting payment | 确认托管 | payment ref 缺失 | 上传流水或线下核验 |
| Order | `funded` | Escrowed | 启动执行 | 权限未批 | 审批权限 |
| Permission | pending | Permission pending | 审批/补授权 | 高风险 scope | buyer + policy 审批 |
| Execution | running | Running | 查看进度 | 无 | 等待或取消 |
| Delivery | submitted | QA pending | 无 | QA 未完成 | 平台处理 |
| Acceptance | ready | Ready | 验收通过 | 验收人未确认 | 提醒买方 |
| Dispute | open | Disputed | 补充证据 | 资金冻结 | 上传证据 |
| Evidence | incomplete | Evidence gap | 无 | 证据低于要求 | 补 evidence refs |
| Reputation | pending | Pending | 发布评价 | policy review | 等待审核 |
| CLI/API | mismatch | Sync review | 无 | DTO snapshot 不一致 | 刷新、重放、联系运营 |

## 14. 响应式

桌面端：

- 1440px 以上使用侧边栏 + 主内容 + 右侧辅助栏。
- 1024-1439px 可隐藏右侧辅助栏，将其折叠为抽屉。
- 表格支持列显示优先级，低优先级列可折叠。

平板端：

- 侧边栏默认收起。
- Agent 列表可从表格切换为紧凑卡片。
- 筛选器使用抽屉。
- CLI 预览折叠为底部 sheet。

移动端：

- 不强行展示完整后台表格。
- 底部导航最多保留 4-5 个核心入口。
- 购买、授权、验收使用分步表单。
- 订单验收页优先显示状态、交付物、验收按钮、资金/权益和权限。
- CLI 命令默认折叠，点击后全屏查看和复制。
- 所有点击目标不小于 44px。

## 15. 可访问性

- 正文对比度至少达到 WCAG AA 4.5:1。
- 所有图标按钮必须有 aria-label。
- 表单必须使用可见 label，不依赖 placeholder。
- 错误信息显示在对应字段下方。
- 键盘 Tab 顺序应符合视觉顺序。
- Focus 状态必须可见。
- 图表不能只靠颜色表达含义。
- 支持 prefers-reduced-motion。
- 弹窗支持 Esc 关闭，并能将焦点返回触发按钮。
- 金额、订单号、状态变化应可被屏幕阅读器正确读取。
- CLI 命令块必须可键盘复制，不能只依赖鼠标 hover。

## 16. 禁止事项

- 禁止把首屏做成普通 landing page。
- 禁止使用巨幅空洞 hero、夸张口号和纯营销 CTA。
- 禁止用单一紫蓝渐变统治视觉。
- 禁止用大面积玻璃拟态、发光边框、漂浮装饰球。
- 禁止只展示 Agent 宣传文案而不展示履约数据。
- 禁止让订单、权益、权限、验收、QA、付款、发票状态隐藏在二级页面。
- 禁止把分类入口放到二屏。
- 禁止卡片套卡片导致信息层级混乱。
- 禁止用颜色作为唯一状态表达。
- 禁止表单只有 placeholder 没有 label。
- 禁止移动端出现横向滚动。
- 禁止让重要交易动作没有确认、没有结果反馈、没有审计记录。
- 禁止 UI 动作没有 CLI/API/事件等价物。
- 禁止 CLI 命令能绕过 UI 中的权限和风险确认。
