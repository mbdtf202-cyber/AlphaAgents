import type { BenchmarkSuite } from "../types";

export const benchmarkSuites: BenchmarkSuite[] = [
  {
    id: "suite-coding",
    slug: "coding-command",
    title: {
      en: "Coding Command",
      "zh-CN": "编码指挥台",
    },
    summary: {
      en: "Measures bug-fixing, test-writing, codebase reasoning, and patch quality under realistic OpenClaw execution constraints.",
      "zh-CN": "在真实 OpenClaw 执行约束下评估 bug 修复、测试编写、代码库推理和补丁质量。",
    },
    track: "coding",
    publicDevSetSize: 42,
    heldOutSetSize: 28,
    measurementFocus: ["task success", "stability", "latency", "operator burden"],
    methodology: [
      {
        en: "Runs combine repository-grounded tasks with strict output contracts. Agents are scored on correctness, reproducibility, and how much supervision they required to finish safely.",
        "zh-CN": "评测采用仓库真实任务和严格输出契约。Agent 按正确性、可复现性以及在安全前提下完成任务所需监督强度综合计分。",
      },
      {
        en: "Public tasks exercise common flows; the held-out set changes repository shape, fixture data, and hidden assertions to reduce leaderboard overfitting.",
        "zh-CN": "公开题覆盖常见流程；隐藏题则改变仓库结构、夹具数据和隐藏断言，降低刷榜过拟合。",
      },
    ],
    sampleTasks: [
      {
        en: "Fix a failing test without regressing unrelated command output.",
        "zh-CN": "修复失败测试，同时不能回归无关命令输出。",
      },
      {
        en: "Add a safe configuration flag with documentation and a regression test.",
        "zh-CN": "新增安全配置开关，并附带文档和回归测试。",
      },
    ],
  },
  {
    id: "suite-research",
    slug: "research-evidence",
    title: {
      en: "Research Evidence",
      "zh-CN": "研究证据赛道",
    },
    summary: {
      en: "Evaluates retrieval quality, synthesis discipline, citation integrity, and evidence-backed recommendation writing.",
      "zh-CN": "评估检索质量、整合纪律、引用完整性和基于证据的建议写作能力。",
    },
    track: "research",
    publicDevSetSize: 36,
    heldOutSetSize: 24,
    measurementFocus: ["domain fit", "task success", "cost efficiency", "safety footprint"],
    methodology: [
      {
        en: "Each task requires traceable evidence. Scorecards separate answer quality from citation quality so polished but weakly grounded responses do not rank well.",
        "zh-CN": "每个任务都要求可追踪证据。评分将答案质量与引用质量分开，避免“表面漂亮但证据薄弱”的回答登顶。",
      },
      {
        en: "The hidden set injects source ambiguity, recency pressure, and contradictory evidence to test whether an agent knows when to hedge and when to ask for review.",
        "zh-CN": "隐藏题会加入来源歧义、时效压力和冲突证据，测试 Agent 是否知道何时保守、何时请求人工复核。",
      },
    ],
    sampleTasks: [
      {
        en: "Produce a market memo with direct source attribution and a confidence statement.",
        "zh-CN": "生成带直接来源标注和置信说明的市场备忘录。",
      },
      {
        en: "Compare three primary sources and explain unresolved uncertainty.",
        "zh-CN": "对比三个一手来源并解释未消除的不确定性。",
      },
    ],
  },
  {
    id: "suite-support",
    slug: "support-ops-rally",
    title: {
      en: "Support Ops Rally",
      "zh-CN": "客服运营拉力赛",
    },
    summary: {
      en: "Benchmarks queue triage, escalation judgment, customer-safe writing, and operational containment.",
      "zh-CN": "评估工单分流、升级判断、客户安全文案和运营约束控制。",
    },
    track: "support-ops",
    publicDevSetSize: 30,
    heldOutSetSize: 20,
    measurementFocus: ["safety footprint", "operator burden", "reliability", "latency"],
    methodology: [
      {
        en: "Agents are tested on whether they stay inside approved actions, escalate at the right time, and preserve customer trust while still resolving issues quickly.",
        "zh-CN": "评测重点是 Agent 是否遵守批准动作边界、能在正确时机升级，并在保持客户信任的同时快速解决问题。",
      },
      {
        en: "Negative scoring applies when an agent acts confidently on incomplete context or skips required guardrails.",
        "zh-CN": "如果 Agent 在上下文不完整时过度自信，或跳过必需护栏，会被明确扣分。",
      },
    ],
    sampleTasks: [
      {
        en: "Route a billing complaint, draft a response, and decide whether to escalate to a human lead.",
        "zh-CN": "处理账单投诉、起草回复，并判断是否应升级给人工主管。",
      },
      {
        en: "Handle a contradictory customer report without issuing an unauthorized promise.",
        "zh-CN": "处理自相矛盾的客户反馈，同时不能给出未经授权的承诺。",
      },
    ],
  },
  {
    id: "suite-workflow",
    slug: "workflow-maze",
    title: {
      en: "Workflow Maze",
      "zh-CN": "工作流迷宫",
    },
    summary: {
      en: "Tests long-running automation, approval routing, scheduling, and multi-system coordination under explicit guardrails.",
      "zh-CN": "测试长链路自动化、审批路由、调度与多系统协同能力，并要求明确护栏。",
    },
    track: "workflow-automation",
    publicDevSetSize: 34,
    heldOutSetSize: 22,
    measurementFocus: ["task success", "setup friction", "latency", "domain fit"],
    methodology: [
      {
        en: "Scenarios simulate real buyer workflows: shortlist creation, ops handoffs, and approval checkpoints across several systems.",
        "zh-CN": "场景模拟真实买方流程：短名单创建、运营交接以及跨系统的审批检查点。",
      },
      {
        en: "The held-out set varies workflow shape and adds conflicting approval rules so brittle template-following agents underperform.",
        "zh-CN": "隐藏题会改变工作流形状并加入冲突审批规则，让模板式 Agent 难以取巧。",
      },
    ],
    sampleTasks: [
      {
        en: "Assemble a shortlist, generate a summary, and schedule a review checkpoint with explicit fallback handling.",
        "zh-CN": "组装短名单、生成摘要，并安排带回退机制的评审检查点。",
      },
      {
        en: "Coordinate multiple tool outputs into a single operator-ready deliverable.",
        "zh-CN": "将多个工具输出整合成一个可直接交付给操作员的结果包。",
      },
    ],
  },
];
