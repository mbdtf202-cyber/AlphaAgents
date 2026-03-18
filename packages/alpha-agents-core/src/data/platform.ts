import type { DecisionMemo, FeatureSlot, ModerationCase, ShortlistRecord } from "../types";

const sampleProvenance = {
  dataMode: "sample" as const,
  sourceType: "internal-seed" as const,
  label: {
    en: "Sample data",
    "zh-CN": "样例数据",
  },
};

export const shortlists: ShortlistRecord[] = [
  {
    id: "collection-buyer-shortlist",
    name: {
      en: "Engineering Evaluation Profile List",
      "zh-CN": "工程评估 Profile List",
    },
    ownerUserId: "user-sample-buyer",
    createdByUserId: "user-sample-buyer",
    agentSlugs: ["swe-copilot-forge", "research-brief-operator", "workflow-orchestrator"],
    buyerType: "enterprise",
    provenance: sampleProvenance,
  },
];

export const decisionMemos: DecisionMemo[] = [
  {
    id: "decision-memo-sample-1",
    shortlistId: "collection-buyer-shortlist",
    ownerUserId: "user-sample-buyer",
    createdByUserId: "user-sample-buyer",
    title: {
      en: "Evaluation brief for engineering coding agents",
      "zh-CN": "工程编码 Agent 的 Evaluation Brief",
    },
    summary: {
      en: "Recommend piloting SWE Copilot Forge first because its trust profile, repo-grounded reliability, and deployment proof are strongest in the current sample set.",
      "zh-CN": "建议优先试点 SWE Copilot Forge，因为在当前样例集中，它的 trust 档案、仓库内稳定性和部署证明最强。",
    },
    recommendationState: "pilot",
    rolloutRecommendation: {
      en: "Run a two-week guarded pilot with explicit merge approval and benchmark reruns before expansion.",
      "zh-CN": "先进行两周带明确合并审批的受控试点，并在扩容前重跑 benchmark。",
    },
    tradeoffs: [
      {
        en: "Higher cost than lighter workflow agents, but meaningfully stronger codebase fit.",
        "zh-CN": "成本高于更轻量的工作流 Agent，但代码库契合度明显更强。",
      },
    ],
    createdAt: "2026-03-16T10:00:00.000Z",
    updatedAt: "2026-03-16T10:00:00.000Z",
    provenance: sampleProvenance,
  },
];

export const featureSlots: FeatureSlot[] = [
  {
    id: "feature-1",
    title: {
      en: "Featured coding operator",
      "zh-CN": "精选编码操作员",
    },
    description: {
      en: "High confidence on repo-grounded fixes with transparent benchmark evidence.",
      "zh-CN": "在仓库内修复任务上具备高置信表现，且基准证据透明。",
    },
    agentSlug: "swe-copilot-forge",
    provenance: sampleProvenance,
  },
  {
    id: "feature-2",
    title: {
      en: "Featured research operator",
      "zh-CN": "精选研究操作员",
    },
    description: {
      en: "Built for buyer-ready briefs that do not hide uncertainty.",
      "zh-CN": "面向买方可交付简报构建，不掩盖不确定性。",
    },
    agentSlug: "research-brief-operator",
    provenance: sampleProvenance,
  },
  {
    id: "feature-3",
    title: {
      en: "Featured workflow operator",
      "zh-CN": "精选工作流操作员",
    },
    description: {
      en: "Coordinates structured handoffs, approval gates, and operator-ready artifacts.",
      "zh-CN": "协调结构化交接、审批门和面向操作员的交付工件。",
    },
    agentSlug: "workflow-orchestrator",
    provenance: sampleProvenance,
  },
];

export const moderationCases: ModerationCase[] = [
  {
    id: "moderation-support-triage",
    entityType: "version",
    entityId: "ver-support-triage-pilot-0-8-4",
    title: "Support Triage Pilot policy branch review",
    status: "pending",
    reason: {
      en: "A new escalation branch changed policy coverage and needs manual review before re-publishing the verified badge.",
      "zh-CN": "新增升级分支改变了策略覆盖范围，需要人工复核后才能重新发布 verified 标记。",
    },
    assignedTo: "trust-team",
    updatedAt: "2026-03-16T09:10:00.000Z",
    provenance: sampleProvenance,
  },
  {
    id: "moderation-buyer-bakeoff",
    entityType: "submission",
    entityId: "agent-buyer-bakeoff-console",
    title: "Buyer Bakeoff Console first public release review",
    status: "changes-requested",
    reason: {
      en: "Submission needs clearer permission disclosures and stronger claim evidence before public profile publication.",
      "zh-CN": "该投稿需要更清晰的权限披露，并补强声明证据后才能公开发布档案。",
    },
    assignedTo: "marketplace-ops",
    updatedAt: "2026-03-15T18:30:00.000Z",
    provenance: sampleProvenance,
  },
];
