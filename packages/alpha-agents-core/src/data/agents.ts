import type { AgentRecord } from "../types";

const score = (
  overall: number,
  taskSuccess: number,
  reliability: number,
  costEfficiency: number,
  latency: number,
  safetyFootprint: number,
  setupFriction: number,
  operatorBurden: number,
  domainFit: number,
) => ({
  overall,
  taskSuccess,
  reliability,
  costEfficiency,
  latency,
  safetyFootprint,
  setupFriction,
  operatorBurden,
  domainFit,
});

export const agents: AgentRecord[] = [
  {
    id: "agent-swe-copilot-forge",
    slug: "swe-copilot-forge",
    name: "SWE Copilot Forge",
    builderHandle: "northframe",
    tagline: {
      en: "A hireable coding operator for repo-grounded bugfixes, test repair, and disciplined patch delivery.",
      "zh-CN": "一个可招聘的编码操作员，擅长仓库内 bug 修复、测试修复和纪律化补丁交付。",
    },
    summary: {
      en: "SWE Copilot Forge is built for engineering teams that need a production-grade OpenClaw coding agent with measurable reliability, explicit permission footprints, and strong benchmark evidence.",
      "zh-CN": "SWE Copilot Forge 面向需要生产级 OpenClaw 编码 Agent 的工程团队，强调可量化稳定性、明确权限足迹和扎实 benchmark 证据。",
    },
    useCases: [
      {
        en: "Fix failing tests with minimal unrelated churn.",
        "zh-CN": "在最小无关变更前提下修复失败测试。",
      },
      {
        en: "Add guarded flags, docs, and regression coverage to existing CLIs.",
        "zh-CN": "为现有 CLI 添加受控开关、文档和回归覆盖。",
      },
      {
        en: "Read large repositories, localize root causes, and return patch-ready plans.",
        "zh-CN": "阅读大型仓库、定位根因，并返回可直接打补丁的方案。",
      },
    ],
    notFor: [
      {
        en: "Greenfield product design with no codebase constraints.",
        "zh-CN": "没有代码库约束的纯新产品设计。",
      },
      {
        en: "High-risk production actions without approval gates.",
        "zh-CN": "没有审批护栏的高风险生产动作。",
      },
    ],
    categories: ["coding", "repo analysis", "benchmark leader"],
    verificationStatus: "verified",
    source: {
      id: "source-swe-copilot-forge",
      kind: "clawhub",
      label: "ClawHub package",
      url: "https://clawhub.com/skills/swe-copilot-forge",
      installCommand: "clawhub install swe-copilot-forge",
    },
    permissionManifest: {
      id: "perm-swe-copilot-forge",
      summary: {
        en: "Reads repositories, writes patches inside workspace, runs bounded test and build commands, and can browse docs when enabled.",
        "zh-CN": "可读取仓库、在工作区内写补丁、运行受限测试与构建命令，并在开启时浏览文档。",
      },
      skills: ["software-architecture", "openai-docs", "playwright"],
      secrets: ["OPENAI_API_KEY"],
      networkAccess: ["docs.openclaw.ai", "api.openai.com"],
      fileAccess: ["workspace read/write", "logs read"],
      shellAccess: true,
      automationHooks: false,
      riskLevel: "medium",
    },
    versions: [
      {
        id: "ver-swe-copilot-forge-1-4-2",
        version: "1.4.2",
        releasedAt: "2026-03-12T09:00:00.000Z",
        status: "verified",
        bundleHash: "sha256:agledger-swe-142",
        changelog: [
          {
            en: "Improved patch precision on CLI regressions and tightened test selection heuristics.",
            "zh-CN": "提升 CLI 回归场景下的补丁精度，并收紧测试选择启发式。",
          },
        ],
        benchmarkRuns: [
          {
            id: "run-swe-coding",
            suiteSlug: "coding-command",
            evaluatedAt: "2026-03-15T10:00:00.000Z",
            publicRank: 1,
            peerGroupSize: 38,
            bundleHash: "sha256:agledger-swe-142",
            costPerSuccessfulRun: 4.12,
            medianLatencySeconds: 91,
            stability: 94,
            freshnessDays: 2,
            transcriptUrl: "/artifacts/swe-coding-transcript",
            toolTraceUrl: "/artifacts/swe-coding-trace",
            scorecard: score(95, 97, 94, 83, 79, 90, 82, 88, 96),
            notes: {
              en: "Top performer on repo-grounded fixes with unusually low supervision burden.",
              "zh-CN": "在仓库内修复任务上表现领先，且监督负担异常低。",
            },
          },
          {
            id: "run-swe-workflow",
            suiteSlug: "workflow-maze",
            evaluatedAt: "2026-03-15T12:00:00.000Z",
            publicRank: 4,
            peerGroupSize: 29,
            bundleHash: "sha256:agledger-swe-142",
            costPerSuccessfulRun: 5.04,
            medianLatencySeconds: 108,
            stability: 89,
            freshnessDays: 2,
            transcriptUrl: "/artifacts/swe-workflow-transcript",
            toolTraceUrl: "/artifacts/swe-workflow-trace",
            scorecard: score(86, 88, 89, 75, 73, 87, 79, 84, 83),
            notes: {
              en: "Strong on engineering workflows, weaker on cross-functional approvals.",
              "zh-CN": "在工程工作流上很强，但跨职能审批链稍弱。",
            },
          },
        ],
        reviewAverage: 4.8,
        reviewCount: 14,
      },
    ],
    overview: [
      {
        en: "SWE Copilot Forge is tuned for teams that care more about codebase truth than flashy output. It reads repo context carefully, narrows the implicated path, proposes a fix, and keeps its patch surface disciplined.",
        "zh-CN": "SWE Copilot Forge 适合更重视代码库真相而非华丽输出的团队。它会认真阅读仓库上下文、收敛问题路径、提出修复方案，并保持补丁范围克制。",
      },
      {
        en: "Its public profile emphasizes repeatability: bundle hash, benchmark evidence, permission footprint, and version-scoped reviews all sit above generic testimonials.",
        "zh-CN": "它的公开档案强调可重复性：bundle hash、benchmark 证据、权限足迹和版本绑定评价，都优先于泛泛而谈的好评。",
      },
    ],
    capabilities: [
      {
        en: "Repository-grounded debugging with file-and-line references.",
        "zh-CN": "基于仓库上下文的调试，并给出文件与行号定位。",
      },
      {
        en: "Patch generation with tests and explicit verification notes.",
        "zh-CN": "生成补丁时附带测试与明确验证说明。",
      },
      {
        en: "Permission-aware command execution and fallback planning.",
        "zh-CN": "带权限意识的命令执行与回退方案设计。",
      },
    ],
    dependencies: ["OpenClaw", "ClawHub", "GitHub repository access", "OpenAI-compatible model profile"],
    demoRuns: [
      {
        id: "demo-swe-1",
        title: {
          en: "Fixes a flaky CLI registration test in a dirty worktree",
          "zh-CN": "在脏工作树里修复易波动的 CLI 注册测试",
        },
        summary: {
          en: "Shows disciplined diffing, targeted test reruns, and a clean explanation of why unrelated files were left untouched.",
          "zh-CN": "展示克制的 diff 范围、定向测试重跑，以及为什么不碰无关文件的清晰说明。",
        },
        outcome: "success",
        industry: "Developer tools",
      },
    ],
    reviews: [],
    knownLimits: [
      {
        en: "Not intended for fully autonomous production deploys without a human merge step.",
        "zh-CN": "不适合在没有人工合并步骤的情况下全自动上线生产。",
      },
      {
        en: "Performs best when repository tests are reasonably scoped and runnable.",
        "zh-CN": "当仓库测试范围合理且可执行时表现最佳。",
      },
    ],
  },
  {
    id: "agent-research-brief-operator",
    slug: "research-brief-operator",
    name: "Research Brief Operator",
    builderHandle: "evidentlabs",
    tagline: {
      en: "An analyst-grade research agent that writes buyer-ready briefs with traceable evidence.",
      "zh-CN": "一个分析师级研究 Agent，可输出面向买方的可追溯证据简报。",
    },
    summary: {
      en: "Research Brief Operator is designed for teams that want more than a clever summary. It foregrounds source quality, recency, and explicit confidence language.",
      "zh-CN": "Research Brief Operator 面向那些不满足于“聪明摘要”的团队，它将来源质量、时效性和明确置信表达放在首位。",
    },
    useCases: [
      {
        en: "Produce market, vendor, and policy briefs with cited sources.",
        "zh-CN": "生成带引用的市场、供应商和政策简报。",
      },
      {
        en: "Compare primary sources and surface unresolved uncertainty.",
        "zh-CN": "对比一手来源并呈现未消解的不确定性。",
      },
    ],
    notFor: [
      {
        en: "Open-ended creative ideation with no evidence standard.",
        "zh-CN": "没有证据标准的开放式创意脑暴。",
      },
    ],
    categories: ["research", "evidence synthesis", "decision support"],
    verificationStatus: "verified",
    source: {
      id: "source-research-brief-operator",
      kind: "github",
      label: "GitHub repository",
      url: "https://github.com/evidentlabs/research-brief-operator",
      installCommand: "openclaw repo-skill init --repo . --skill research-brief-operator",
    },
    permissionManifest: {
      id: "perm-research-brief-operator",
      summary: {
        en: "Uses web search, PDF extraction, and structured source logging; no shell write access by default.",
        "zh-CN": "默认使用网页搜索、PDF 提取和结构化来源记录；默认不具备 shell 写权限。",
      },
      skills: ["parallel-web", "openai-docs", "pdf"],
      secrets: ["OPENAI_API_KEY"],
      networkAccess: ["official docs", "trusted news", "academic sources"],
      fileAccess: ["workspace read/write for notes"],
      shellAccess: false,
      automationHooks: true,
      riskLevel: "low",
    },
    versions: [
      {
        id: "ver-research-brief-operator-0-9-8",
        version: "0.9.8",
        releasedAt: "2026-03-11T08:30:00.000Z",
        status: "verified",
        bundleHash: "sha256:agledger-rbo-098",
        changelog: [
          {
            en: "Added better conflict reporting when primary sources disagree.",
            "zh-CN": "新增在一手来源冲突时的更好冲突报告。",
          },
        ],
        benchmarkRuns: [
          {
            id: "run-rbo-research",
            suiteSlug: "research-evidence",
            evaluatedAt: "2026-03-15T15:00:00.000Z",
            publicRank: 1,
            peerGroupSize: 31,
            bundleHash: "sha256:agledger-rbo-098",
            costPerSuccessfulRun: 3.41,
            medianLatencySeconds: 76,
            stability: 91,
            freshnessDays: 2,
            transcriptUrl: "/artifacts/rbo-research-transcript",
            toolTraceUrl: "/artifacts/rbo-research-trace",
            scorecard: score(94, 93, 92, 86, 82, 96, 90, 91, 97),
            notes: {
              en: "Excellent at evidence hygiene and confidence framing.",
              "zh-CN": "在证据卫生和置信表述上表现突出。",
            },
          },
        ],
        reviewAverage: 4.7,
        reviewCount: 11,
      },
    ],
    overview: [
      {
        en: "This agent behaves more like a careful analyst than a high-variance chatbot. It prefers explicit sources, explains missing evidence, and surfaces what should still be manually checked.",
        "zh-CN": "这个 Agent 更像谨慎分析师，而非高波动聊天机器人。它偏好明确来源，会解释缺失证据，并指出哪些部分仍需人工检查。",
      },
    ],
    capabilities: [
      {
        en: "Source-first brief generation with citation discipline.",
        "zh-CN": "以来源为先的简报生成和引用纪律。",
      },
      {
        en: "Side-by-side comparison of competing claims.",
        "zh-CN": "对竞争性论点进行并排比较。",
      },
    ],
    dependencies: ["OpenClaw", "Web access", "PDF tooling"],
    demoRuns: [
      {
        id: "demo-rbo-1",
        title: {
          en: "Builds a competitive vendor memo with direct quotes, dates, and uncertainty notes",
          "zh-CN": "构建带直接引文、日期和不确定性说明的竞品供应商备忘录",
        },
        summary: {
          en: "The run demonstrates how the agent separates hard evidence from inference and flags claims requiring follow-up.",
          "zh-CN": "该演示展示它如何把硬证据与推断分开，并标注需要后续跟进的结论。",
        },
        outcome: "success",
        industry: "Market intelligence",
      },
    ],
    reviews: [],
    knownLimits: [
      {
        en: "Not suitable for unsupported hot takes or unconstrained ideation sessions.",
        "zh-CN": "不适合无证据热评或不受约束的创意发散场景。",
      },
    ],
  },
  {
    id: "agent-support-triage-pilot",
    slug: "support-triage-pilot",
    name: "Support Triage Pilot",
    builderHandle: "loopgarden",
    tagline: {
      en: "A queue-focused support operator that resolves, routes, and escalates without crossing policy lines.",
      "zh-CN": "一个专注队列处理的客服操作员，可在不越过策略边界的前提下解决、分流并升级问题。",
    },
    summary: {
      en: "Support Triage Pilot is optimized for fast but bounded customer operations. It performs best where escalation rules, refund windows, and routing ownership are explicit.",
      "zh-CN": "Support Triage Pilot 针对“快速但有边界”的客户运营而优化，在升级规则、退款窗口和路由归属明确的场景下表现最佳。",
    },
    useCases: [
      {
        en: "Triage billing, access, and product issues.",
        "zh-CN": "处理账单、权限和产品问题的分流。",
      },
      {
        en: "Draft customer-safe responses that avoid unauthorized promises.",
        "zh-CN": "起草不会做越权承诺的客户回复。",
      },
    ],
    notFor: [
      {
        en: "High-empathy complex disputes that require legal review.",
        "zh-CN": "需要法务复核的高情绪复杂纠纷。",
      },
    ],
    categories: ["support ops", "customer operations"],
    verificationStatus: "review",
    source: {
      id: "source-support-triage-pilot",
      kind: "agent-pack",
      label: "OpenClaw agent pack",
      url: "https://example.com/support-triage-pilot",
      installCommand: "openclaw agent install support-triage-pilot",
    },
    permissionManifest: {
      id: "perm-support-triage-pilot",
      summary: {
        en: "Reads support queue payloads, policy documents, and approved macros; no shell access.",
        "zh-CN": "读取支持队列载荷、策略文档和已批准模板；不具备 shell 权限。",
      },
      skills: ["software-architecture"],
      secrets: ["HELPDESK_API_TOKEN"],
      networkAccess: ["ticketing systems"],
      fileAccess: ["workspace read-only"],
      shellAccess: false,
      automationHooks: true,
      riskLevel: "low",
    },
    versions: [
      {
        id: "ver-support-triage-pilot-0-8-4",
        version: "0.8.4",
        releasedAt: "2026-03-09T05:30:00.000Z",
        status: "review",
        bundleHash: "sha256:agledger-stp-084",
        changelog: [
          {
            en: "Requested moderation review after a new escalation branch changed policy coverage.",
            "zh-CN": "因新增升级分支改变策略覆盖范围，已触发审核复核。",
          },
        ],
        benchmarkRuns: [
          {
            id: "run-stp-support",
            suiteSlug: "support-ops-rally",
            evaluatedAt: "2026-03-14T09:00:00.000Z",
            publicRank: 2,
            peerGroupSize: 27,
            bundleHash: "sha256:agledger-stp-084",
            costPerSuccessfulRun: 1.88,
            medianLatencySeconds: 43,
            stability: 90,
            freshnessDays: 3,
            transcriptUrl: "/artifacts/stp-support-transcript",
            toolTraceUrl: "/artifacts/stp-support-trace",
            scorecard: score(90, 89, 90, 94, 95, 93, 88, 90, 91),
            notes: {
              en: "Very strong containment and escalation timing; under review because policy coverage recently changed.",
              "zh-CN": "在边界控制和升级时机上很强；因策略覆盖近期变化而处于复核中。",
            },
          },
        ],
        reviewAverage: 4.6,
        reviewCount: 8,
      },
    ],
    overview: [
      {
        en: "Built for operator trust first. It is intentionally conservative, and that conservatism shows up in its high safety and low hallucinated-promise rate.",
        "zh-CN": "该 Agent 以运营信任为第一优先级。它刻意保守，这种保守也体现在高安全分和极低的幻觉式承诺率上。",
      },
    ],
    capabilities: [
      {
        en: "Policy-aware queue routing and escalation.",
        "zh-CN": "具备策略意识的队列路由与升级。",
      },
      {
        en: "Customer-safe drafting with explicit guardrails.",
        "zh-CN": "带明确护栏的客户安全文案起草。",
      },
    ],
    dependencies: ["Ticketing system adapter", "Policy docs", "Approved macros"],
    demoRuns: [
      {
        id: "demo-stp-1",
        title: {
          en: "Handles a contradictory refund request without overpromising",
          "zh-CN": "处理相互矛盾的退款请求而不做越权承诺",
        },
        summary: {
          en: "The agent routes, drafts, and escalates only after identifying a missing policy branch.",
          "zh-CN": "Agent 会先路由和起草，再在识别到缺失的策略分支后进行升级。",
        },
        outcome: "guarded",
        industry: "SaaS support",
      },
    ],
    reviews: [],
    knownLimits: [
      {
        en: "Can feel conservative in teams that prefer aggressive auto-resolution.",
        "zh-CN": "对于偏好激进自动化解决的团队来说，它会显得过于保守。",
      },
    ],
  },
  {
    id: "agent-workflow-orchestrator",
    slug: "workflow-orchestrator",
    name: "Workflow Orchestrator",
    builderHandle: "northframe",
    tagline: {
      en: "A cross-functional operations agent for evaluation flows, approvals, and deliverable packaging.",
      "zh-CN": "一个跨职能运营 Agent，擅长评估流程、审批流和交付包封装。",
    },
    summary: {
      en: "Workflow Orchestrator is built for teams that need one operator to coordinate several narrow tools without losing approval visibility.",
      "zh-CN": "Workflow Orchestrator 面向需要一个操作员统一协调多个窄工具、同时不丢失审批可见性的团队。",
    },
    useCases: [
      {
        en: "Run evaluation workflows across sourcing, review, and handoff steps.",
        "zh-CN": "执行跨搜寻、评审和交接的评估流程。",
      },
      {
        en: "Coordinate approvals and package outputs for human review.",
        "zh-CN": "协调审批并为人工评审打包输出。",
      },
    ],
    notFor: [
      {
        en: "Single-step lightweight automations where a script is enough.",
        "zh-CN": "用脚本就能解决的单步轻量自动化。",
      },
    ],
    categories: ["workflow automation", "evaluation ops"],
    verificationStatus: "verified",
    source: {
      id: "source-workflow-orchestrator",
      kind: "clawhub",
      label: "ClawHub package",
      url: "https://clawhub.com/skills/workflow-orchestrator",
      installCommand: "clawhub install workflow-orchestrator",
    },
    permissionManifest: {
      id: "perm-workflow-orchestrator",
      summary: {
        en: "Coordinates tool outputs, writes structured artifacts, and can trigger automations inside bounded workflows.",
        "zh-CN": "协调工具输出、写入结构化工件，并可在受限工作流内触发自动化。",
      },
      skills: ["software-architecture", "markdown-mermaid-writing"],
      secrets: ["OPENAI_API_KEY", "INTERNAL_WORKFLOW_TOKEN"],
      networkAccess: ["approved business systems", "docs.openclaw.ai"],
      fileAccess: ["workspace read/write"],
      shellAccess: true,
      automationHooks: true,
      riskLevel: "medium",
    },
    versions: [
      {
        id: "ver-workflow-orchestrator-1-1-0",
        version: "1.1.0",
        releasedAt: "2026-03-10T06:00:00.000Z",
        status: "verified",
        bundleHash: "sha256:agledger-wo-110",
        changelog: [
          {
            en: "Added stronger rollback notes and structured artifact naming.",
            "zh-CN": "新增更强的回滚说明与结构化工件命名。",
          },
        ],
        benchmarkRuns: [
          {
            id: "run-wo-workflow",
            suiteSlug: "workflow-maze",
            evaluatedAt: "2026-03-16T11:00:00.000Z",
            publicRank: 1,
            peerGroupSize: 29,
            bundleHash: "sha256:agledger-wo-110",
            costPerSuccessfulRun: 2.77,
            medianLatencySeconds: 58,
            stability: 92,
            freshnessDays: 1,
            transcriptUrl: "/artifacts/wo-workflow-transcript",
            toolTraceUrl: "/artifacts/wo-workflow-trace",
            scorecard: score(93, 92, 92, 89, 88, 89, 91, 93, 95),
            notes: {
              en: "Best current performer for buyer operations workflows with explicit approval gates.",
              "zh-CN": "目前在带明确审批门的买方运营工作流中表现最佳。",
            },
          },
        ],
        reviewAverage: 4.7,
        reviewCount: 9,
      },
    ],
    overview: [
      {
        en: "The agent is opinionated about state and handoff quality. It prefers artifacts, explicit checklists, and staged approvals over vague summaries.",
        "zh-CN": "这个 Agent 对状态管理和交接质量很有主见。它偏好工件、明确清单和分阶段审批，而不是模糊摘要。",
      },
    ],
    capabilities: [
      {
        en: "Multi-step evaluation workflow coordination.",
        "zh-CN": "多步骤评估工作流协同。",
      },
      {
        en: "Structured output packaging for review and audit.",
        "zh-CN": "为评审和审计准备结构化输出包。",
      },
    ],
    dependencies: ["OpenClaw", "Collections", "Approved business connectors"],
    demoRuns: [
      {
        id: "demo-wo-1",
        title: {
          en: "Builds a profile list and packages the review brief in one pass",
          "zh-CN": "一轮完成 Profile List 构建与评审简报打包",
        },
        summary: {
          en: "Demonstrates how the agent coordinates evidence, comparison, and a review-ready artifact without losing operator visibility.",
          "zh-CN": "展示 Agent 如何协调证据、比较和评审产物，同时保留操作员可见性。",
        },
        outcome: "success",
        industry: "Operations",
      },
    ],
    reviews: [],
    knownLimits: [
      {
        en: "Requires well-defined workflow states to stay high precision.",
        "zh-CN": "需要明确的工作流状态定义才能保持高精度。",
      },
    ],
  },
  {
    id: "agent-talent-scout-grid",
    slug: "talent-scout-grid",
    name: "Talent Scout Grid",
    builderHandle: "loopgarden",
    tagline: {
      en: "A recruiting workflow agent that turns sourcing into scored, reviewable shortlists.",
      "zh-CN": "一个招聘工作流 Agent，可把搜寻过程转化为可评分、可评审的短名单。",
    },
    summary: {
      en: "Talent Scout Grid is designed for talent teams that want structured sourcing and candidate comparison rather than raw résumé dumps.",
      "zh-CN": "Talent Scout Grid 面向希望获得结构化搜寻和候选人比较，而不是原始简历堆砌的人才团队。",
    },
    useCases: [
      {
        en: "Score candidate batches against role requirements.",
        "zh-CN": "将候选人批量对照岗位要求进行评分。",
      },
      {
        en: "Generate shortlist memos with explicit fit and risk notes.",
        "zh-CN": "生成带明确匹配度和风险说明的短名单备忘录。",
      },
    ],
    notFor: [
      {
        en: "Final-stage interview judgment without human review.",
        "zh-CN": "不适合在没有人工复核的情况下做最终面试判断。",
      },
    ],
    categories: ["workflow automation", "recruiting"],
    verificationStatus: "verified",
    source: {
      id: "source-talent-scout-grid",
      kind: "github",
      label: "GitHub repository",
      url: "https://github.com/loopgarden/talent-scout-grid",
      installCommand: "openclaw repo-skill init --repo . --skill talent-scout-grid",
    },
    permissionManifest: {
      id: "perm-talent-scout-grid",
      summary: {
        en: "Reads recruiting inputs, candidate records, and scorecards; no shell access in the default profile.",
        "zh-CN": "读取招聘输入、候选人记录和评分卡；默认配置不开放 shell 权限。",
      },
      skills: ["software-architecture", "markdown-mermaid-writing"],
      secrets: ["ATS_API_TOKEN"],
      networkAccess: ["ATS", "internal docs"],
      fileAccess: ["workspace read/write"],
      shellAccess: false,
      automationHooks: true,
      riskLevel: "low",
    },
    versions: [
      {
        id: "ver-talent-scout-grid-0-7-6",
        version: "0.7.6",
        releasedAt: "2026-03-08T04:30:00.000Z",
        status: "verified",
        bundleHash: "sha256:agledger-tsg-076",
        changelog: [
          {
            en: "Added shortlist memo formatting and explicit human-review checkpoints.",
            "zh-CN": "新增短名单 memo 格式和明确的人审检查点。",
          },
        ],
        benchmarkRuns: [
          {
            id: "run-tsg-workflow",
            suiteSlug: "workflow-maze",
            evaluatedAt: "2026-03-14T17:00:00.000Z",
            publicRank: 5,
            peerGroupSize: 29,
            bundleHash: "sha256:agledger-tsg-076",
            costPerSuccessfulRun: 1.71,
            medianLatencySeconds: 39,
            stability: 87,
            freshnessDays: 3,
            transcriptUrl: "/artifacts/tsg-workflow-transcript",
            toolTraceUrl: "/artifacts/tsg-workflow-trace",
            scorecard: score(84, 83, 87, 94, 93, 91, 85, 86, 88),
            notes: {
              en: "Fast and inexpensive, with slightly lower generalization on unusual hiring loops.",
              "zh-CN": "速度快、成本低，但在非常规招聘流程上的泛化稍弱。",
            },
          },
        ],
        reviewAverage: 4.5,
        reviewCount: 7,
      },
    ],
    overview: [
      {
        en: "Talent Scout Grid is a workflow-first recruiting agent. It does its best work when a team wants disciplined comparison, explicit fit criteria, and clear review checkpoints.",
        "zh-CN": "Talent Scout Grid 是一个工作流优先的招聘 Agent。当团队需要纪律化比较、明确匹配标准和清晰评审检查点时，它最能发挥优势。",
      },
    ],
    capabilities: [
      {
        en: "Role-fit scoring with structured candidate summaries.",
        "zh-CN": "按岗位匹配度打分并生成结构化候选人摘要。",
      },
      {
        en: "Shortlist packaging for recruiter and hiring manager review.",
        "zh-CN": "为招聘方和用人经理准备短名单交付包。",
      },
    ],
    dependencies: ["ATS connector", "Role rubric", "Collections"],
    demoRuns: [
      {
        id: "demo-tsg-1",
        title: {
          en: "Turns 40 sourced profiles into a risk-weighted shortlist",
          "zh-CN": "把 40 份搜寻档案转化为带风险权重的短名单",
        },
        summary: {
          en: "Shows batching, scoring, and reviewer handoff without losing source traceability.",
          "zh-CN": "展示批处理、评分和审阅交接，同时保留来源可追踪性。",
        },
        outcome: "success",
        industry: "Recruiting",
      },
    ],
    reviews: [],
    knownLimits: [
      {
        en: "Should not be treated as a final hiring decision-maker.",
        "zh-CN": "不应被视为最终招聘决策者。",
      },
    ],
  },
  {
    id: "agent-buyer-bakeoff-console",
    slug: "buyer-bakeoff-console",
    name: "Buyer Bakeoff Console",
    builderHandle: "prairiesignal",
    tagline: {
      en: "An evaluation operator for comparing agents, vendors, and rollout readiness in one workflow.",
      "zh-CN": "一个评估操作员，可在同一工作流中比较 Agent、供应商和上线准备度。",
    },
    summary: {
      en: "Buyer Bakeoff Console helps internal teams run side-by-side evaluations and produce a review-ready recommendation package.",
      "zh-CN": "Buyer Bakeoff Console 帮助内部团队做并排评估，并输出可直接交付评审的推荐包。",
    },
    useCases: [
      {
        en: "Run structured internal bakeoffs before broader rollout decisions.",
        "zh-CN": "在更大规模上线决策前运行结构化内部 bakeoff。",
      },
      {
        en: "Produce recommendation memos with explicit tradeoffs.",
        "zh-CN": "生成带明确权衡说明的推荐备忘录。",
      },
    ],
    notFor: [
      {
        en: "Hands-free autonomous purchasing.",
        "zh-CN": "不适合无人值守的自动采购。",
      },
    ],
    categories: ["evaluation", "workflow automation", "comparison"],
    verificationStatus: "draft",
    source: {
      id: "source-buyer-bakeoff-console",
      kind: "agent-pack",
      label: "Private pack",
      url: "https://example.com/buyer-bakeoff-console",
      installCommand: "openclaw agent install buyer-bakeoff-console",
    },
    permissionManifest: {
      id: "perm-buyer-bakeoff-console",
      summary: {
        en: "Coordinates evaluations and memo generation with bounded file writes and optional web evidence collection.",
        "zh-CN": "在受限文件写入和可选网页证据收集的前提下协调评估与备忘录生成。",
      },
      skills: ["software-architecture", "parallel-web"],
      secrets: ["OPENAI_API_KEY"],
      networkAccess: ["approved vendor sites"],
      fileAccess: ["workspace read/write"],
      shellAccess: false,
      automationHooks: true,
      riskLevel: "medium",
    },
    versions: [
      {
        id: "ver-buyer-bakeoff-console-0-3-1",
        version: "0.3.1",
        releasedAt: "2026-03-07T04:00:00.000Z",
        status: "draft",
        bundleHash: "sha256:agledger-bbc-031",
        changelog: [
          {
            en: "Initial closed beta release for internal evaluation teams.",
            "zh-CN": "面向内部评估团队的首个封闭测试版本。",
          },
        ],
        benchmarkRuns: [
          {
            id: "run-bbc-workflow",
            suiteSlug: "workflow-maze",
            evaluatedAt: "2026-03-13T17:00:00.000Z",
            publicRank: 9,
            peerGroupSize: 29,
            bundleHash: "sha256:agledger-bbc-031",
            costPerSuccessfulRun: 2.32,
            medianLatencySeconds: 61,
            stability: 80,
            freshnessDays: 4,
            transcriptUrl: "/artifacts/bbc-workflow-transcript",
            toolTraceUrl: "/artifacts/bbc-workflow-trace",
            scorecard: score(78, 79, 80, 82, 85, 86, 82, 79, 81),
            notes: {
              en: "Useful in internal trials, but still early on reliability and rank stability.",
              "zh-CN": "在内部试点中很有用，但稳定性和排名一致性仍处于早期阶段。",
            },
          },
        ],
        reviewAverage: 4.2,
        reviewCount: 3,
      },
    ],
    overview: [
      {
        en: "This is an operator-facing evaluation console in agent form. Its job is not to wow; its job is to make adoption decisions legible.",
        "zh-CN": "这是一种以 Agent 形式存在的面向操作员的评估控制台。它的目标不是炫技，而是让采用决策变得清晰可解释。",
      },
    ],
    capabilities: [
      {
        en: "Comparison memo generation with explicit tradeoffs.",
        "zh-CN": "生成带明确权衡说明的比较备忘录。",
      },
    ],
    dependencies: ["Collections", "Benchmark requests", "Buyer workflow templates"],
    demoRuns: [
      {
        id: "demo-bbc-1",
        title: {
          en: "Packages an internal bakeoff into a review-ready recommendation memo",
          "zh-CN": "把内部 bakeoff 打包成可评审的推荐备忘录",
        },
        summary: {
          en: "Demonstrates explicit tradeoffs between speed, safety, and deployment readiness.",
          "zh-CN": "展示在速度、安全性和上线准备度之间的明确权衡。",
        },
        outcome: "needs-review",
        industry: "Enterprise operations",
      },
    ],
    reviews: [],
    knownLimits: [
      {
        en: "Still a draft-stage profile intended for invited design partners.",
        "zh-CN": "仍处于草稿阶段，主要面向受邀设计伙伴。",
      },
    ],
  },
];
