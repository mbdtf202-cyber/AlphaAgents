# AlphaAgents 企业试点 / PoC 执行手册

## 文档边界

本手册是企业试点和付费 PoC 的运营执行 aid，不是默认产品入口，也不降低 AlphaAgents 的完整 AaaS 平台范围。它只在买方已经进入企业采购或多单试点时使用；产品范围、视觉要求和验收标准仍以 canonical 文档和机器契约为准。

## 1. 执行目标

本手册用于把 4-6 周 PoC 从「好想法」变成可执行的订单战情系统。

可直接落仓执行的模板定义见 [war-room-templates.md](./war-room-templates.md)。

PoC 成功定义：

- 5-10 笔按单托管订单完成闭环。
- 至少 70% 订单验收通过，完整闭环成功率不低于 80%。
- 至少 1 个买方连续下 3 单，或进入年度 order-credit 谈判。
- 每单都有 evidence package、finance ledger、QA、AcceptanceReview、ROI 复盘。
- 高风险越权漏拦截为 0。

## 2. D-7 到 D+30 总控表

| 日期 | Owner | 每日动作 | 输入 | 输出 | 证据 | 阻断条件 | 升级 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| D-7 | CEO / Sales | 选定 PoC 账户和预算路径 | 目标账户、访谈 | PoC qualification note | CRM entry | 无预算/无验收人 | 暂停 PoC |
| D-6 | Buyer success | 完成首单 RFP 草稿 | 品类、竞品、渠道 | `RFP draft` | `01-rfp.md` | 信息不全 | 只卖 discovery |
| D-5 | Legal/Ops | 发送 SOW、DPA、资金流说明 | 采购包 | Terms redline v1 | 邮件记录 | 客户要求生产账号 | 改只读范围或拒绝 |
| D-4 | Supply ops | 锁定服务方和备份方 | supplier roster | primary/backup assignment | capacity sheet | 无可用产能 | 缩小范围 |
| D-3 | Finance ops | 确认合同主体、发票和付款路径 | invoice profile | finance setup | finance checklist | 付款主体不清 | 采购/财务会 |
| D-2 | QA lead | 冻结验收模板和 QA 抽样规则 | SOW、RFP | acceptance template | template hash | 验收项主观 | 改成可计数标准 |
| D-1 | Ops lead | War-room 开单检查 | 全部材料 | go/no-go | readiness checklist | 任一核心证据缺失 | 延后开单 |
| D0 | Buyer / Finance | 付款或内部托管确认 | payment ref | `EscrowFunded` | finance ledger | 付款未确认 | 不得执行 |
| D1 | Seller/Agent | 执行与中期风险回报 | grants, RFP | `ExecutionRun` | run log | 权限不足/证据不足 | Risk/Ops 介入 |
| D2 | Seller/QA | Trial 交付、QA、买方验收 | artifacts | delivery + QA | evidence package | 文件打不开/证据少 | QA reject |
| D3 | Buyer success | 收集验收、修改或争议 | review form | AcceptanceReview | review JSON | 买方失联 | 自动提醒 |
| D4 | Finance ops | 放款、退款或部分放款 | AcceptanceReview | ledger event | payout/refund ref | dispute open | 冻结 |
| D5 | Sales | 复盘 ROI 和下一单 | ROI sheet | repeat ask | quote/email | 没有可用选题 | 交付复盘 |
| D6-D7 | Ops/Supply | 修模板和供应排期 | QA notes | v2 playbook | changelog | 同类错误重复 | 暂停该 seller |
| D8-D14 | Sales/Ops | 第 2-3 单和 Standard 转化 | first order proof | repeat order | order package | 首单低于 85 分 | 先修交付 |
| D15-D21 | COO | 5 单复盘、单位经济、争议审查 | 5 order ledgers | PoC mid-review | board note | 毛利为负且无改善 | 降范围/提价 |
| D22-D30 | CEO/Sales | 年度 order-credit 会签 | ROI、案例、SLA | annual proposal | procurement deck | 无复购意愿 | 回到 Trial 渠道 |

每天 17:30 必须更新 war-room ledger：

| 字段 | 说明 |
| --- | --- |
| activeOrders | created/funded/in_progress/ready/disputed |
| blockedOrders | 阻断原因和 owner |
| cashStatus | 已收款、待确认、退款、部分放款 |
| qaStatus | pending/pass/reject |
| sellerCapacity | primary/backup 可用单量 |
| buyerNextAction | 付款、验收、修改、补资料 |
| riskEvents | 权限、证据、敏感数据、CLI mismatch |

## 3. PoC 套餐

| Package | Fee | Orders | Mix | QA | SLA | Retention | Refund boundary | Credit rule |
| --- | ---: | ---: | --- | --- | --- | --- | --- | --- |
| PoC Basic | 28,000 CNY | 5 | 2 Trial + 3 Standard | 单人 QA | Trial 48h / Standard 72h | 365 天 | 未交付、重大事实错误、证据不可回看 | 60 天内签年约抵扣 100% |
| PoC Growth | 48,000 CNY | 8 | 2 Trial + 5 Standard + 1 Pro | 单人 QA + 周复盘 | 优先排期 | 365 天 | 同上；争议按权重部分放款 | 抵扣首年 order-credit 100% |
| PoC Enterprise | 60,000 CNY | 10 | 2 Trial + 6 Standard + 2 Pro | 双人 QA + 月度材料 | 专属 war-room | 730 天可选 | 同上；附 DPA/子处理方清单 | 抵扣首年 order-credit 100% |

所有套餐都不包含：

- 自动发布内容。
- 登录客户生产账号。
- 广告投放、资金代操、后台删除或修改。
- 无限修改。
- Agent 源码买断或月租。

## 4. 财务 SOP

### 4.1 付款确认

付款进入 `escrow.fund` 前必须满足：

1. 付款主体与合同主体或授权付款主体一致。
2. payment reference、截图或银行流水可追溯。
3. 到账金额、币种、订单金额一致。
4. invoice profile 已填写或客户明确暂不开票。
5. Finance ops 和 Ops lead 双人复核企业 PoC；单次 Trial 可由 Finance ops 单人确认。

不得确认付款的情况：

- 截图无流水号且银行未到账。
- 付款主体无法关联订单。
- 金额短付且无书面说明。
- 客户要求平台绕开合同主体收款。

### 4.2 开票和对账

| 动作 | Owner | SLA | 输出 |
| --- | --- | --- | --- |
| 发票信息核验 | Finance ops | 1 个工作日 | invoice profile checked |
| 发票申请 | Finance ops | 验收后 2 个工作日 | invoice request event |
| 发票文件归档 | Finance ops | 开票后 1 个工作日 | invoice EvidenceRef |
| 周对账 | Finance ops | 每周五 | reconciliation export |
| PoC 结算复盘 | Finance ops + COO | D+30 | finance closeout |

### 4.3 放款、退款、部分放款审批

| 金额/动作 | 发起 | 审批 | 证据 |
| --- | --- | --- | --- |
| Trial 全额放款 | system/operator | Finance ops | AcceptanceReview score >= 85 |
| Standard/Pro 全额放款 | system/operator | Finance ops + Ops lead | QA + AcceptanceReview |
| 任意退款 | Finance ops | Ops lead | dispute decision or refund clause |
| 部分放款 | Ops lead | Finance ops + CEO for PoC | evidence-weighted decision table |
| 争议期间资金动作 | 不允许 | 不允许 | 必须先 `dispute.resolve` |

对账 cadence：

- 每日：PoC war-room cash status。
- 每周：订单、发票、放款、退款、供应商 payout 对账。
- 每月或 PoC 结束：平台费、毛利、CAC、争议成本和订单信用抵扣复盘。

## 5. 客服异常脚本

| 场景 | 首响话术 | 内部动作 | 关闭证据 |
| --- | --- | --- | --- |
| 付款失败 | 已收到付款异常反馈。资金未确认前 Agent 不会开始执行，我们会在 2 小时内核验付款引用并告知下一步。 | Finance ops 查 payment ref | payment ticket closed |
| 买方缺资料 | 当前订单还缺少品类/竞品/验收项中的指定信息。补齐前只能保存草稿，不能进入托管执行。 | Buyer success 标记缺项 | RFP checklist pass |
| 买方失联 | 交付包已通过 QA，验收窗口正在计时。请在约定时间内验收、提出限定修改或发起争议。 | 自动提醒 + 人工电话/邮件 | reminder event |
| 乙方失联 | 服务方未在 SLA 内响应，平台已启动备用服务方评估；若影响交付时限，将按条款提供退款或换服务方选项。 | Supply ops 启动 backup | backup decision |
| 交付延期 | 当前订单预计延迟，平台已记录 SLA breach。你可以选择继续等待、换服务方或按条款申请退款。 | Ops lead 更新 ETA | SLA breach event |
| 文件打不开 | 平台 QA 已拦截该交付，不会进入买方验收，也不消耗你的限定修改次数。 | QA reject | fixed file ref |
| 发票争议 | 发票问题已进入财务工单。交付事实和资金裁决会继续按订单验收标准处理。 | Finance ops 查票流 | invoice ticket closed |
| 退款争议 | 资金已冻结，平台将在 2 个工作日内按冻结验收模板、QA 和证据权重裁决。 | Dispute case | decision notice |
| 最终裁决 | 平台已完成裁决，结果、放款/退款金额和依据已写入订单证据包。 | Finance ops 执行 ledger | final notice sent |

客服不得承诺：

- 无条件退款。
- 静默自动验收。
- 绕开 SOW 或验收权重。
- 使用未授权数据源补交证据。

## 6. QA 抽检和拒收标准

### 6.1 抽检比例

| Package | Evidence refs | Fact sample | Link check | Topic actionability |
| --- | ---: | ---: | ---: | ---: |
| Trial | 20 | 至少 10 条关键事实 | 100% | 至少 8 个选题 |
| Standard | 60 | 至少 20 条关键事实 | 100% | 至少 15 个选题 |
| Pro | 100 | 至少 35 条关键事实，二次 QA | 100% | 至少 30 个选题 |

### 6.2 错误等级

| Level | 定义 | 处理 |
| --- | --- | --- |
| minor | 格式、拼写、非核心表述问题，不影响决策 | QA note，可通过或修复 |
| material | 关键竞品、价格、渠道、claim 或证据映射错误，影响部分判断 | QA reject 或限定修改 |
| critical | 伪造证据、引用不可回看且无截图/hash、越权使用数据、核心结论相反 | 争议、退款、冻结服务方 |

### 6.3 证据接受规则

证据必须满足：

- 每个关键结论绑定 `EvidenceRef`。
- public URL 可打开，或有截图/hash 备份。
- buyer upload 只能订单内可见。
- runtime output 必须能追溯 ExecutionRun。
- 导出包中 hash 与 EvidenceRef 一致。

QA reject 的最小修复要求：

- 列出 failed item。
- 指定责任方。
- 给出修复 SLA。
- 新交付包必须 supersede 旧包，不得覆盖旧证据。

### 6.4 选题可执行性评分

| 分数 | 标准 |
| ---: | --- |
| 5 | 有明确受众、hook、产品卖点、内容形式、证据来源、风险提示 |
| 4 | 有 hook、卖点、形式和证据，但生产细节略弱 |
| 3 | 方向可用，但需要买方二次加工 |
| 2 | 只有泛泛建议，无法直接进入排期 |
| 1 | 与品类或证据不匹配 |

Standard 包要求平均选题可执行性不低于 3.5，Pro 不低于 4.0。

## 7. 供应调度和备用机制

### 7.1 Roster

| Supplier | Role | Capacity/week | Categories | QA pass target | Backup for | Status |
| --- | --- | ---: | --- | ---: | --- | --- |
| S-Beauty-01 | Primary seller | 3 Standard | beauty, skincare | 90%+ | Trial/Standard | approved |
| S-Agency-02 | Primary agency | 2 Pro + 3 Standard | beauty, apparel | 92%+ | PoC Growth | approved |
| S-Research-03 | Backup researcher | 4 Trial | Amazon, Shopify | 85%+ | S-Beauty-01 | standby |
| S-Data-04 | Evidence specialist | 6 QA support | evidence index | 95%+ | all | standby |
| S-Content-05 | Topic strategist | 3 Standard | TikTok content | 88%+ | agency orders | probation |

### 7.2 启用备份条件

- 主服务方超时 12 小时无响应。
- 连续 2 次 QA reject。
- 发生权限或保密风险。
- 服务方容量被新的 Pro/PoC 订单占满。
- 买方要求换服务方且理由符合 SOW。

交接规则：

- 旧 ExecutionRun 和 EvidenceRef 保留。
- 新服务方只能访问订单授权资料和必要历史证据。
- Ops lead 记录 handoff note。
- 责任归属按事件时间线区分。
- payout 按已验收贡献和争议裁决分配。

### 7.3 供应方 payout timing

| Order outcome | Payout timing |
| --- | --- |
| Accepted/released | 放款事件后 5 个工作日内 |
| Partial release | 裁决生效且 appeal window 结束后 5 个工作日内 |
| Refunded due supplier fault | 无 payout，记录 penalty |
| Revision in progress | 暂不结算 |
| Dispute open | 暂停结算 |

## 8. War-room 决策规则

必须暂停获客、优先修交付的信号：

- 连续 2 单 QA reject。
- 任一 critical factual error。
- evidence completeness 低于 90%。
- 首单买方复核超过 4 小时且未标记可用选题。
- 争议率超过 10%。
- 平台人工介入超过 2.5h/Standard 且无下降趋势。

必须暂停供应方的信号：

- 绕单。
- 伪造 evidence。
- 未授权访问。
- 最近 5 单中 2 单争议成立。
- 乙方失联导致交付延迟超过 24 小时。
