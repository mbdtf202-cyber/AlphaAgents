import type { Collection, FeatureSlot, ModerationCase } from "../types";

export const collections: Collection[] = [
  {
    id: "collection-buyer-shortlist",
    name: {
      en: "Buyer Evaluation Shortlist",
      "zh-CN": "买方评估短名单",
    },
    owner: "prairiesignal",
    agentSlugs: ["swe-copilot-forge", "research-brief-operator", "workflow-orchestrator"],
    buyerType: "enterprise",
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
  },
  {
    id: "moderation-buyer-bakeoff",
    entityType: "submission",
    entityId: "agent-buyer-bakeoff-console",
    title: "Buyer Bakeoff Console first public release review",
    status: "changes-requested",
    reason: {
      en: "Submission needs clearer permission disclosures and a stronger benchmark evidence block before public listing.",
      "zh-CN": "该投稿需要更清晰的权限披露，并补强 benchmark 证据模块后才能公开展示。",
    },
    assignedTo: "marketplace-ops",
    updatedAt: "2026-03-15T18:30:00.000Z",
  },
];
