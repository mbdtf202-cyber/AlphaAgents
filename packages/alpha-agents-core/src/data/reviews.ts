import type { VerifiedInstall, VerifiedReview } from "../types";

export const verifiedInstalls: VerifiedInstall[] = [
  {
    id: "install-swe-1",
    agentSlug: "swe-copilot-forge",
    versionId: "ver-swe-copilot-forge-1-4-2",
    ownerUserId: "user-sample-buyer",
    verificationToken: "verify_swe_demo_1",
    packageHash: "sha256:agledger-swe-142",
    anonymousRuntimeFingerprint: "fp_workspace_91a0",
    verifiedAt: "2026-03-16T08:00:00.000Z",
  },
  {
    id: "install-rbo-1",
    agentSlug: "research-brief-operator",
    versionId: "ver-research-brief-operator-0-9-8",
    ownerUserId: "user-sample-buyer",
    verificationToken: "verify_rbo_demo_1",
    packageHash: "sha256:agledger-rbo-098",
    anonymousRuntimeFingerprint: "fp_workspace_55be",
    verifiedAt: "2026-03-15T11:20:00.000Z",
  },
];

export const verifiedReviews: VerifiedReview[] = [
  {
    id: "review-swe-1",
    agentSlug: "swe-copilot-forge",
    versionId: "ver-swe-copilot-forge-1-4-2",
    builderHandle: "northframe",
    installId: "install-swe-1",
    ownerUserId: "user-sample-buyer",
    company: "Helix Cloud",
    role: "Engineering Manager",
    headline: {
      en: "The first coding agent we could actually evaluate like a hire.",
      "zh-CN": "这是第一个我们真正能像招聘对象一样评估的编码 Agent。",
    },
    body: {
      en: "What stood out was not only patch quality but the discipline around patch scope, repo references, and test selection. It behaves like a cautious staff engineer, not a demo bot.",
      "zh-CN": "最突出的不只是补丁质量，更是它对补丁范围、仓库定位和测试选择的纪律性。它更像谨慎的资深工程师，而不是演示机器人。",
    },
    rating: 5,
    dimensions: {
      taskSuccess: 97,
      reliability: 95,
      costEfficiency: 80,
      latency: 78,
      safetyFootprint: 92,
      setupFriction: 84,
      operatorBurden: 90,
      domainFit: 96,
    },
    createdAt: "2026-03-16T12:00:00.000Z",
  },
  {
    id: "review-rbo-1",
    agentSlug: "research-brief-operator",
    versionId: "ver-research-brief-operator-0-9-8",
    builderHandle: "evidentlabs",
    installId: "install-rbo-1",
    ownerUserId: "user-sample-buyer",
    company: "Signal Atlas",
    role: "Strategy Director",
    headline: {
      en: "It made evidence quality visible to non-analyst stakeholders.",
      "zh-CN": "它让非分析岗位也能看懂证据质量。",
    },
    body: {
      en: "The best part is how clearly it separates confirmed evidence from inference. That made our review process much faster and safer.",
      "zh-CN": "最好的地方是它能非常清楚地把已确认的证据和推断分开。这让我们的审阅流程更快也更安全。",
    },
    rating: 5,
    dimensions: {
      taskSuccess: 92,
      reliability: 90,
      costEfficiency: 86,
      latency: 83,
      safetyFootprint: 97,
      setupFriction: 91,
      operatorBurden: 88,
      domainFit: 95,
    },
    createdAt: "2026-03-15T16:10:00.000Z",
  },
];
