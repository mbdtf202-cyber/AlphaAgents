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
  skills: z.array(z.string().min(1)).min(1),
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

export const shortlistInputSchema = z.object({
  name: localizedTextSchema,
  agentSlugs: z.array(z.string().min(1)).min(1).max(10),
  buyerType: z.enum(["individual", "team", "enterprise"]),
});

export const moderationDecisionSchema = z.object({
  status: z.enum(["pending", "changes-requested", "approved", "rejected"]),
  note: z.string().min(3).max(400),
});
