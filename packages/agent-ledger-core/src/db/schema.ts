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
  "agent_ledger_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    githubHandle: varchar("github_handle", { length: 120 }),
    role: varchar("role", { length: 32 }).default("buyer").notNull(),
    locale: varchar("locale", { length: 12 }).default("en").notNull(),
    profile: jsonb("profile").default(sql`'{}'::jsonb`).notNull(),
    ...timestamps,
  },
  (table) => [index("agent_ledger_users_email_idx").on(table.email)],
);

export const organizations = pgTable("agent_ledger_organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  description: jsonb("description").default(sql`'{}'::jsonb`).notNull(),
  ...timestamps,
});

export const builderProfiles = pgTable(
  "agent_ledger_builder_profiles",
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
  (table) => [index("agent_ledger_builder_handle_idx").on(table.handle)],
);

export const agentRecords = pgTable(
  "agent_ledger_agents",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    builderProfileId: uuid("builder_profile_id").references(() => builderProfiles.id),
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
  (table) => [index("agent_ledger_agent_slug_idx").on(table.slug)],
);

export const agentSources = pgTable("agent_ledger_agent_sources", {
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

export const permissionManifests = pgTable("agent_ledger_permission_manifests", {
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
  "agent_ledger_agent_versions",
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
  (table) => [index("agent_ledger_agent_version_agent_idx").on(table.agentId)],
);

export const benchmarkSuitesTable = pgTable("agent_ledger_benchmark_suites", {
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

export const benchmarkTasks = pgTable("agent_ledger_benchmark_tasks", {
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
  "agent_ledger_benchmark_runs",
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
  (table) => [index("agent_ledger_benchmark_run_version_idx").on(table.agentVersionId)],
);

export const benchmarkScorecards = pgTable("agent_ledger_benchmark_scorecards", {
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

export const verifiedInstallsTable = pgTable("agent_ledger_verified_installs", {
  id: uuid("id").defaultRandom().primaryKey(),
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

export const verifiedReviewsTable = pgTable("agent_ledger_verified_reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
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
  ...timestamps,
});

export const collectionsTable = pgTable("agent_ledger_collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  ownerId: uuid("owner_id").references(() => users.id),
  name: jsonb("name").default(sql`'{}'::jsonb`).notNull(),
  buyerType: varchar("buyer_type", { length: 32 }).notNull(),
  agentSlugs: jsonb("agent_slugs").default(sql`'[]'::jsonb`).notNull(),
  ...timestamps,
});

export const moderationCasesTable = pgTable("agent_ledger_moderation_cases", {
  id: uuid("id").defaultRandom().primaryKey(),
  entityType: varchar("entity_type", { length: 64 }).notNull(),
  entityId: varchar("entity_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  status: varchar("status", { length: 32 }).notNull(),
  reason: jsonb("reason").default(sql`'{}'::jsonb`).notNull(),
  assignedTo: varchar("assigned_to", { length: 80 }).notNull(),
  ...timestamps,
});

export const featureSlotsTable = pgTable("agent_ledger_feature_slots", {
  id: uuid("id").defaultRandom().primaryKey(),
  agentId: uuid("agent_id").references(() => agentRecords.id),
  title: jsonb("title").default(sql`'{}'::jsonb`).notNull(),
  description: jsonb("description").default(sql`'{}'::jsonb`).notNull(),
  slotKey: varchar("slot_key", { length: 80 }).notNull().unique(),
  ...timestamps,
});
