import { customType, index, integer, jsonb, numeric, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const vector = customType<{ data: number[] }>({
  dataType() {
    return "vector(1536)";
  },
});

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

export const users = pgTable(
  "alpha_agents_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    githubHandle: varchar("github_handle", { length: 120 }),
    role: varchar("role", { length: 32 }).default("buyer").notNull(),
    locale: varchar("locale", { length: 12 }).default("en").notNull(),
    profile: jsonb("profile").default(sql`'{}'::jsonb`).notNull(),
    ...timestamps,
  },
  (table) => [index("alpha_agents_users_email_idx").on(table.email)],
);

export const organizations = pgTable("alpha_agents_organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  description: jsonb("description").default(sql`'{}'::jsonb`).notNull(),
  ...timestamps,
});

export const organizationMemberships = pgTable(
  "alpha_agents_organization_memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    role: varchar("role", { length: 24 }).default("member").notNull(),
    ...timestamps,
  },
  (table) => [index("alpha_agents_org_membership_user_idx").on(table.userId), index("alpha_agents_org_membership_org_idx").on(table.organizationId)],
);

export const authAccounts = pgTable(
  "alpha_agents_auth_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    provider: varchar("provider", { length: 32 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    profile: jsonb("profile").default(sql`'{}'::jsonb`).notNull(),
    ...timestamps,
  },
  (table) => [index("alpha_agents_auth_account_provider_idx").on(table.provider, table.providerAccountId)],
);

export const authSessions = pgTable(
  "alpha_agents_auth_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .references(() => users.id)
      .notNull(),
    activeOrganizationId: uuid("active_organization_id").references(() => organizations.id),
    tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
    role: varchar("role", { length: 32 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }).defaultNow().notNull(),
    ...timestamps,
  },
  (table) => [index("alpha_agents_auth_session_user_idx").on(table.userId), index("alpha_agents_auth_session_token_idx").on(table.tokenHash)],
);

export const magicLinkChallenges = pgTable(
  "alpha_agents_magic_link_challenges",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    role: varchar("role", { length: 32 }).notNull(),
    redirectTo: varchar("redirect_to", { length: 255 }).notNull(),
    tokenHash: varchar("token_hash", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [index("alpha_agents_magic_link_email_idx").on(table.email), index("alpha_agents_magic_link_token_idx").on(table.tokenHash)],
);

export const builderProfiles = pgTable(
  "alpha_agents_builder_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id),
    organizationId: uuid("organization_id").references(() => organizations.id),
    handle: varchar("handle", { length: 80 }).notNull().unique(),
    name: varchar("name", { length: 160 }).notNull(),
    kind: varchar("kind", { length: 32 }).notNull(),
    headline: jsonb("headline").default(sql`'{}'::jsonb`).notNull(),
    bio: jsonb("bio").default(sql`'{}'::jsonb`).notNull(),
    specialties: jsonb("specialties").default(sql`'[]'::jsonb`).notNull(),
    embedding: vector("embedding"),
    ...timestamps,
  },
  (table) => [index("alpha_agents_builder_handle_idx").on(table.handle)],
);

export const agentRecords = pgTable(
  "alpha_agents_agents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    builderProfileId: uuid("builder_profile_id").references(() => builderProfiles.id),
    ownerUserId: uuid("owner_user_id").references(() => users.id),
    ownerOrganizationId: uuid("owner_organization_id").references(() => organizations.id),
    slug: varchar("slug", { length: 160 }).notNull().unique(),
    name: varchar("name", { length: 160 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    tagline: jsonb("tagline").default(sql`'{}'::jsonb`).notNull(),
    summary: jsonb("summary").default(sql`'{}'::jsonb`).notNull(),
    categories: jsonb("categories").default(sql`'[]'::jsonb`).notNull(),
    searchDocument: text("search_document").default("").notNull(),
    searchEmbedding: vector("search_embedding"),
    ...timestamps,
  },
  (table) => [index("alpha_agents_agent_slug_idx").on(table.slug)],
);

export const agentSources = pgTable("alpha_agents_agent_sources", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentId: uuid("agent_id")
    .references(() => agentRecords.id)
    .notNull(),
  kind: varchar("kind", { length: 32 }).notNull(),
  label: varchar("label", { length: 120 }).notNull(),
  url: text("url").notNull(),
  installCommand: text("install_command").notNull(),
  ...timestamps,
});

export const permissionManifests = pgTable("alpha_agents_permission_manifests", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentId: uuid("agent_id")
    .references(() => agentRecords.id)
    .notNull(),
  summary: jsonb("summary").default(sql`'{}'::jsonb`).notNull(),
  skills: jsonb("skills").default(sql`'[]'::jsonb`).notNull(),
  secrets: jsonb("secrets").default(sql`'[]'::jsonb`).notNull(),
  networkAccess: jsonb("network_access").default(sql`'[]'::jsonb`).notNull(),
  fileAccess: jsonb("file_access").default(sql`'[]'::jsonb`).notNull(),
  shellAccess: integer("shell_access").default(0).notNull(),
  automationHooks: integer("automation_hooks").default(0).notNull(),
  riskLevel: varchar("risk_level", { length: 16 }).notNull(),
  ...timestamps,
});

export const agentVersions = pgTable(
  "alpha_agents_agent_versions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    agentId: uuid("agent_id")
      .references(() => agentRecords.id)
      .notNull(),
    version: varchar("version", { length: 64 }).notNull(),
    bundleHash: varchar("bundle_hash", { length: 255 }).notNull(),
    status: varchar("status", { length: 32 }).notNull(),
    releasedAt: timestamp("released_at", { withTimezone: true }).notNull(),
    changelog: jsonb("changelog").default(sql`'[]'::jsonb`).notNull(),
    reviewAverage: numeric("review_average", { precision: 3, scale: 2 }).default("0").notNull(),
    reviewCount: integer("review_count").default(0).notNull(),
    ...timestamps,
  },
  (table) => [index("alpha_agents_agent_version_agent_idx").on(table.agentId)],
);

export const benchmarkSuitesTable = pgTable("alpha_agents_benchmark_suites", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  track: varchar("track", { length: 64 }).notNull(),
  title: jsonb("title").default(sql`'{}'::jsonb`).notNull(),
  summary: jsonb("summary").default(sql`'{}'::jsonb`).notNull(),
  methodology: jsonb("methodology").default(sql`'[]'::jsonb`).notNull(),
  publicDevSetSize: integer("public_dev_set_size").default(0).notNull(),
  heldOutSetSize: integer("held_out_set_size").default(0).notNull(),
  ...timestamps,
});

export const benchmarkTasks = pgTable("alpha_agents_benchmark_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  suiteId: uuid("suite_id")
    .references(() => benchmarkSuitesTable.id)
    .notNull(),
  visibility: varchar("visibility", { length: 16 }).notNull(),
  prompt: text("prompt").notNull(),
  rubric: jsonb("rubric").default(sql`'{}'::jsonb`).notNull(),
  fixtureRef: varchar("fixture_ref", { length: 255 }),
  ...timestamps,
});

export const benchmarkRunsTable = pgTable(
  "alpha_agents_benchmark_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    suiteId: uuid("suite_id")
      .references(() => benchmarkSuitesTable.id)
      .notNull(),
    agentVersionId: uuid("agent_version_id")
      .references(() => agentVersions.id)
      .notNull(),
    publicRank: integer("public_rank").default(0).notNull(),
    peerGroupSize: integer("peer_group_size").default(0).notNull(),
    bundleHash: varchar("bundle_hash", { length: 255 }).notNull(),
    costPerSuccessfulRun: numeric("cost_per_successful_run", { precision: 8, scale: 2 }).default("0").notNull(),
    medianLatencySeconds: integer("median_latency_seconds").default(0).notNull(),
    stability: integer("stability").default(0).notNull(),
    freshnessDays: integer("freshness_days").default(0).notNull(),
    transcriptUrl: text("transcript_url").notNull(),
    toolTraceUrl: text("tool_trace_url").notNull(),
    notes: jsonb("notes").default(sql`'{}'::jsonb`).notNull(),
    ...timestamps,
  },
  (table) => [index("alpha_agents_benchmark_run_version_idx").on(table.agentVersionId)],
);

export const benchmarkRequestsTable = pgTable(
  "alpha_agents_benchmark_requests",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: uuid("owner_user_id").references(() => users.id),
    ownerOrganizationId: uuid("owner_organization_id").references(() => organizations.id),
    createdByUserId: uuid("created_by_user_id")
      .references(() => users.id)
      .notNull(),
    agentId: uuid("agent_id")
      .references(() => agentRecords.id)
      .notNull(),
    agentVersionId: uuid("agent_version_id")
      .references(() => agentVersions.id)
      .notNull(),
    suiteId: uuid("suite_id")
      .references(() => benchmarkSuitesTable.id)
      .notNull(),
    objective: text("objective"),
    status: varchar("status", { length: 32 }).default("queued").notNull(),
    queuedAt: timestamp("queued_at", { withTimezone: true }).defaultNow().notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [index("alpha_agents_benchmark_request_version_idx").on(table.agentVersionId), index("alpha_agents_benchmark_request_status_idx").on(table.status)],
);

export const benchmarkArtifactsTable = pgTable("alpha_agents_benchmark_artifacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  benchmarkRequestId: uuid("benchmark_request_id")
    .references(() => benchmarkRequestsTable.id)
    .notNull(),
  bundleHash: varchar("bundle_hash", { length: 255 }).notNull(),
  transcriptUrl: text("transcript_url").notNull(),
  toolTraceUrl: text("tool_trace_url").notNull(),
  finalArtifactUrl: text("final_artifact_url"),
  screenshotUrl: text("screenshot_url"),
  htmlArtifactUrl: text("html_artifact_url"),
  rubric: jsonb("rubric").default(sql`'{}'::jsonb`).notNull(),
  ...timestamps,
});

export const benchmarkScorecards = pgTable("alpha_agents_benchmark_scorecards", {
  id: uuid("id").defaultRandom().primaryKey(),
  benchmarkRunId: uuid("benchmark_run_id")
    .references(() => benchmarkRunsTable.id)
    .notNull(),
  overall: integer("overall").notNull(),
  taskSuccess: integer("task_success").notNull(),
  reliability: integer("reliability").notNull(),
  costEfficiency: integer("cost_efficiency").notNull(),
  latency: integer("latency").notNull(),
  safetyFootprint: integer("safety_footprint").notNull(),
  setupFriction: integer("setup_friction").notNull(),
  operatorBurden: integer("operator_burden").notNull(),
  domainFit: integer("domain_fit").notNull(),
  ...timestamps,
});

export const verifiedInstallsTable = pgTable("alpha_agents_verified_installs", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerUserId: uuid("owner_user_id").references(() => users.id),
  ownerOrganizationId: uuid("owner_organization_id").references(() => organizations.id),
  agentId: uuid("agent_id")
    .references(() => agentRecords.id)
    .notNull(),
  agentVersionId: uuid("agent_version_id")
    .references(() => agentVersions.id)
    .notNull(),
  verificationToken: varchar("verification_token", { length: 255 }).notNull().unique(),
  packageHash: varchar("package_hash", { length: 255 }).notNull(),
  anonymousRuntimeFingerprint: varchar("anonymous_runtime_fingerprint", { length: 255 }).notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }).notNull(),
  ...timestamps,
});

export const verifiedReviewsTable = pgTable("alpha_agents_verified_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerUserId: uuid("owner_user_id").references(() => users.id),
  ownerOrganizationId: uuid("owner_organization_id").references(() => organizations.id),
  agentId: uuid("agent_id")
    .references(() => agentRecords.id)
    .notNull(),
  agentVersionId: uuid("agent_version_id")
    .references(() => agentVersions.id)
    .notNull(),
  installId: uuid("install_id")
    .references(() => verifiedInstallsTable.id)
    .notNull(),
  company: varchar("company", { length: 160 }).notNull(),
  role: varchar("role", { length: 120 }).notNull(),
  headline: jsonb("headline").default(sql`'{}'::jsonb`).notNull(),
  body: jsonb("body").default(sql`'{}'::jsonb`).notNull(),
  rating: integer("rating").notNull(),
  dimensions: jsonb("dimensions").default(sql`'{}'::jsonb`).notNull(),
  context: jsonb("context").default(sql`'{}'::jsonb`).notNull(),
  ...timestamps,
});

export const shortlistsTable = pgTable("alpha_agents_shortlists", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerUserId: uuid("owner_user_id").references(() => users.id),
  ownerOrganizationId: uuid("owner_organization_id").references(() => organizations.id),
  createdByUserId: uuid("created_by_user_id")
    .references(() => users.id)
    .notNull(),
  name: jsonb("name").default(sql`'{}'::jsonb`).notNull(),
  buyerType: varchar("buyer_type", { length: 32 }).notNull(),
  agentSlugs: jsonb("agent_slugs").default(sql`'[]'::jsonb`).notNull(),
  constraints: jsonb("constraints"),
  scoreWeights: jsonb("score_weights"),
  internalNotes: text("internal_notes"),
  ...timestamps,
});

export const decisionMemosTable = pgTable("alpha_agents_decision_memos", {
  id: uuid("id").defaultRandom().primaryKey(),
  shortlistId: uuid("shortlist_id")
    .references(() => shortlistsTable.id)
    .notNull(),
  ownerUserId: uuid("owner_user_id").references(() => users.id),
  ownerOrganizationId: uuid("owner_organization_id").references(() => organizations.id),
  createdByUserId: uuid("created_by_user_id")
    .references(() => users.id)
    .notNull(),
  title: jsonb("title").default(sql`'{}'::jsonb`).notNull(),
  summary: jsonb("summary").default(sql`'{}'::jsonb`).notNull(),
  recommendationState: varchar("recommendation_state", { length: 24 }).notNull(),
  rolloutRecommendation: jsonb("rollout_recommendation").default(sql`'{}'::jsonb`).notNull(),
  tradeoffs: jsonb("tradeoffs").default(sql`'[]'::jsonb`).notNull(),
  evidenceSummary: jsonb("evidence_summary"),
  riskSummary: jsonb("risk_summary"),
  scoreWeights: jsonb("score_weights"),
  ...timestamps,
});

export const submissionsTable = pgTable("alpha_agents_submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerUserId: uuid("owner_user_id").references(() => users.id),
  ownerOrganizationId: uuid("owner_organization_id").references(() => organizations.id),
  createdByUserId: uuid("created_by_user_id")
    .references(() => users.id)
    .notNull(),
  agentName: varchar("agent_name", { length: 160 }).notNull(),
  agentSlug: varchar("agent_slug", { length: 160 }).notNull(),
  builderHandle: varchar("builder_handle", { length: 80 }).notNull(),
  sourceKind: varchar("source_kind", { length: 32 }).notNull(),
  sourceUrl: text("source_url").notNull(),
  installCommand: text("install_command").notNull(),
  summary: jsonb("summary").default(sql`'{}'::jsonb`).notNull(),
  permissionManifest: jsonb("permission_manifest").default(sql`'{}'::jsonb`).notNull(),
  dependencies: jsonb("dependencies").default(sql`'[]'::jsonb`).notNull(),
  knownLimits: jsonb("known_limits").default(sql`'[]'::jsonb`).notNull(),
  supportedEnvironments: jsonb("supported_environments").default(sql`'[]'::jsonb`).notNull(),
  status: varchar("status", { length: 32 }).default("pending").notNull(),
  ...timestamps,
});

export const moderationCasesTable = pgTable("alpha_agents_moderation_cases", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerUserId: uuid("owner_user_id").references(() => users.id),
  ownerOrganizationId: uuid("owner_organization_id").references(() => organizations.id),
  entityType: varchar("entity_type", { length: 64 }).notNull(),
  entityId: varchar("entity_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  reason: jsonb("reason").default(sql`'{}'::jsonb`).notNull(),
  assignedTo: varchar("assigned_to", { length: 80 }).notNull(),
  ...timestamps,
});

export const auditLogsTable = pgTable(
  "alpha_agents_audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorUserId: uuid("actor_user_id")
      .references(() => users.id)
      .notNull(),
    actorOrganizationId: uuid("actor_organization_id").references(() => organizations.id),
    eventType: varchar("event_type", { length: 80 }).notNull(),
    entityType: varchar("entity_type", { length: 80 }).notNull(),
    entityId: varchar("entity_id", { length: 255 }).notNull(),
    previousState: jsonb("previous_state"),
    newState: jsonb("new_state"),
    metadata: jsonb("metadata"),
    ...timestamps,
  },
  (table) => [index("alpha_agents_audit_entity_idx").on(table.entityType, table.entityId), index("alpha_agents_audit_actor_idx").on(table.actorUserId)],
);

export const featureSlotsTable = pgTable("alpha_agents_feature_slots", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentId: uuid("agent_id").references(() => agentRecords.id),
  title: jsonb("title").default(sql`'{}'::jsonb`).notNull(),
  description: jsonb("description").default(sql`'{}'::jsonb`).notNull(),
  slotKey: varchar("slot_key", { length: 80 }).notNull().unique(),
  ...timestamps,
});
