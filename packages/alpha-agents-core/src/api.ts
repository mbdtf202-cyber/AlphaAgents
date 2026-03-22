import { z } from "zod";

export const localizedTextSchema = z.object({
  en: z.string().min(1),
  "zh-CN": z.string().min(1),
});

export const submissionInputSchema = z.object({
  agentName: z.string().min(3).max(120),
  agentSlug: z.string().regex(/^[a-z0-9-]+$/),
  builderHandle: z.string().min(2).max(80),
  sourceKind: z.enum(["clawhub", "github", "agent-pack"]),
  sourceUrl: z.url(),
  installCommand: z.string().min(3).max(200),
  summary: localizedTextSchema,
  permissionManifest: z.object({
    summary: localizedTextSchema,
    skills: z.array(z.string().min(1)).min(1),
    secrets: z.array(z.string().min(1)).default([]),
    networkAccess: z.array(z.string().min(1)).default([]),
    fileAccess: z.array(z.string().min(1)).default([]),
    shellAccess: z.boolean().default(false),
    automationHooks: z.boolean().default(false),
    riskLevel: z.enum(["low", "medium", "high"]),
  }),
  dependencies: z.array(z.string().min(1)).default([]),
  knownLimits: z.array(localizedTextSchema).default([]),
  supportedEnvironments: z.array(z.string().min(1)).default([]),
  initialVersion: z.string().min(1).max(64),
  initialBundleHash: z.string().min(8).max(255),
});

export const publishInputSchema = z.object({
  versionId: z.string().min(1),
  publishNote: z.string().max(500).optional(),
});

export const benchmarkRequestSchema = z.object({
  suiteSlug: z.string().min(1),
  versionId: z.string().min(1),
  objective: z.string().max(240).optional(),
});

export const reviewInputSchema = z.object({
  installId: z.string().min(1),
  agentSlug: z.string().min(1),
  versionId: z.string().min(1),
  company: z.string().min(2),
  role: z.string().min(2),
  headline: localizedTextSchema,
  body: localizedTextSchema,
  rating: z.number().min(1).max(5),
  dimensions: z.object({
    taskSuccess: z.number().min(0).max(100),
    reliability: z.number().min(0).max(100),
    costEfficiency: z.number().min(0).max(100),
    latency: z.number().min(0).max(100),
    safetyFootprint: z.number().min(0).max(100),
    setupFriction: z.number().min(0).max(100),
    operatorBurden: z.number().min(0).max(100),
    domainFit: z.number().min(0).max(100),
  }),
  context: z
    .object({
      teamSize: z.string().min(1).max(120).optional(),
      taskFrequency: z.string().min(1).max(120).optional(),
      deploymentEnvironment: z.string().min(1).max(160).optional(),
      supervisionLevel: z.enum(["light", "medium", "high"]).optional(),
      failureModes: z.array(z.string().min(1)).default([]),
      alternativeTools: z.array(z.string().min(1)).default([]),
    })
    .optional(),
});

export const installVerificationSchema = z.object({
  agentSlug: z.string().min(1),
  versionId: z.string().min(1),
  packageHash: z.string().min(10),
  anonymousRuntimeFingerprint: z.string().min(6),
});

export const compareInputSchema = z.object({
  slugs: z.array(z.string().min(1)).min(1).max(4),
});

export const followProfileSchema = z.object({
  subjectType: z.enum(["agent", "builder", "organization", "league"]),
  subjectId: z.string().min(1),
});

export const shortlistInputSchema = z.object({
  name: localizedTextSchema,
  agentSlugs: z.array(z.string().min(1)).min(1).max(4),
  buyerType: z.enum(["individual", "team", "enterprise"]),
  constraints: z
    .object({
      repoSize: z.enum(["small", "medium", "large"]),
      dataSensitivity: z.enum(["low", "medium", "high", "restricted"]),
      approvalModel: z.enum(["single-owner", "team-review", "change-advisory-board"]),
      allowShell: z.boolean(),
      allowNetwork: z.boolean(),
      allowAutoCommit: z.boolean(),
    })
    .optional(),
  scoreWeights: z
    .object({
      taskSuccess: z.number().min(0).max(100).optional(),
      reliability: z.number().min(0).max(100).optional(),
      costEfficiency: z.number().min(0).max(100).optional(),
      latency: z.number().min(0).max(100).optional(),
      safetyFootprint: z.number().min(0).max(100).optional(),
      setupFriction: z.number().min(0).max(100).optional(),
      operatorBurden: z.number().min(0).max(100).optional(),
      domainFit: z.number().min(0).max(100).optional(),
    })
    .optional(),
  internalNotes: z.string().max(2000).optional(),
});

export const moderationDecisionSchema = z.object({
  status: z.enum(["pending", "changes-requested", "approved", "rejected", "resolved", "reopened"]),
  note: z.string().min(3).max(400),
});

export const magicLinkRequestSchema = z.object({
  email: z.email(),
  redirectTo: z.string().min(1).max(200).default("/workspace"),
  role: z.enum(["buyer", "builder"]).default("buyer"),
});

export const decisionMemoInputSchema = z.object({
  shortlistId: z.string().min(1),
  title: localizedTextSchema,
  summary: localizedTextSchema,
  recommendationState: z.enum(["hold", "pilot", "rollout", "reject"]),
  rolloutRecommendation: localizedTextSchema,
  tradeoffs: z.array(localizedTextSchema).min(1),
  evidenceSummary: localizedTextSchema.optional(),
  riskSummary: localizedTextSchema.optional(),
  scoreWeights: z
    .object({
      taskSuccess: z.number().min(0).max(100).optional(),
      reliability: z.number().min(0).max(100).optional(),
      costEfficiency: z.number().min(0).max(100).optional(),
      latency: z.number().min(0).max(100).optional(),
      safetyFootprint: z.number().min(0).max(100).optional(),
      setupFriction: z.number().min(0).max(100).optional(),
      operatorBurden: z.number().min(0).max(100).optional(),
      domainFit: z.number().min(0).max(100).optional(),
    })
    .optional(),
});

export const submissionImportSchema = z.object({
  sourceKind: z.enum(["clawhub", "github", "agent-pack"]),
  sourceUrl: z.url(),
  builderHandle: z.string().min(2).max(80).optional(),
});

export const reviewModerationSchema = z.object({
  visibilityStatus: z.enum(["visible", "hidden"]),
  note: z.string().min(3).max(400),
});

export const featureSlotUpdateSchema = z.object({
  slotKey: z.string().min(1).max(80),
  agentSlug: z.string().min(1),
  title: localizedTextSchema,
  description: localizedTextSchema,
});

export const benchmarkAdminActionSchema = z.object({
  action: z.enum(["rerun", "fail"]),
  failureReason: z.string().min(3).max(400).optional(),
});
