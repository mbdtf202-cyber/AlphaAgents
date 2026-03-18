CREATE EXTENSION IF NOT EXISTS "pgcrypto";
--> statement-breakpoint
CREATE EXTENSION IF NOT EXISTS "vector";
--> statement-breakpoint
CREATE TABLE "alpha_agents_agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"builder_profile_id" uuid,
	"owner_user_id" uuid,
	"owner_organization_id" uuid,
	"slug" varchar(160) NOT NULL,
	"name" varchar(160) NOT NULL,
	"status" varchar(32) NOT NULL,
	"tagline" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"categories" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"search_document" text DEFAULT '' NOT NULL,
	"search_embedding" vector(1536),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "alpha_agents_agents_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_agent_sources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"kind" varchar(32) NOT NULL,
	"label" varchar(120) NOT NULL,
	"url" text NOT NULL,
	"install_command" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_agent_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"version" varchar(64) NOT NULL,
	"bundle_hash" varchar(255) NOT NULL,
	"status" varchar(32) NOT NULL,
	"released_at" timestamp with time zone NOT NULL,
	"changelog" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"review_average" numeric(3, 2) DEFAULT '0' NOT NULL,
	"review_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid NOT NULL,
	"actor_organization_id" uuid,
	"event_type" varchar(80) NOT NULL,
	"entity_type" varchar(80) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"previous_state" jsonb,
	"new_state" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_auth_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" varchar(32) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"email" varchar(255),
	"profile" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_auth_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"active_organization_id" uuid,
	"token_hash" varchar(255) NOT NULL,
	"role" varchar(32) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"last_used_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "alpha_agents_auth_sessions_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_benchmark_artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"benchmark_request_id" uuid NOT NULL,
	"bundle_hash" varchar(255) NOT NULL,
	"transcript_url" text NOT NULL,
	"tool_trace_url" text NOT NULL,
	"final_artifact_url" text,
	"screenshot_url" text,
	"html_artifact_url" text,
	"rubric" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_benchmark_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid,
	"owner_organization_id" uuid,
	"created_by_user_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"agent_version_id" uuid NOT NULL,
	"suite_id" uuid NOT NULL,
	"objective" text,
	"status" varchar(32) DEFAULT 'queued' NOT NULL,
	"queue_job_id" varchar(255),
	"queued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_benchmark_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"suite_id" uuid NOT NULL,
	"agent_version_id" uuid NOT NULL,
	"public_rank" integer DEFAULT 0 NOT NULL,
	"peer_group_size" integer DEFAULT 0 NOT NULL,
	"bundle_hash" varchar(255) NOT NULL,
	"cost_per_successful_run" numeric(8, 2) DEFAULT '0' NOT NULL,
	"median_latency_seconds" integer DEFAULT 0 NOT NULL,
	"stability" integer DEFAULT 0 NOT NULL,
	"freshness_days" integer DEFAULT 0 NOT NULL,
	"transcript_url" text NOT NULL,
	"tool_trace_url" text NOT NULL,
	"notes" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_benchmark_scorecards" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"benchmark_run_id" uuid NOT NULL,
	"overall" integer NOT NULL,
	"task_success" integer NOT NULL,
	"reliability" integer NOT NULL,
	"cost_efficiency" integer NOT NULL,
	"latency" integer NOT NULL,
	"safety_footprint" integer NOT NULL,
	"setup_friction" integer NOT NULL,
	"operator_burden" integer NOT NULL,
	"domain_fit" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_benchmark_suites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" varchar(160) NOT NULL,
	"track" varchar(64) NOT NULL,
	"title" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"methodology" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"public_dev_set_size" integer DEFAULT 0 NOT NULL,
	"held_out_set_size" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "alpha_agents_benchmark_suites_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_benchmark_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"suite_id" uuid NOT NULL,
	"visibility" varchar(16) NOT NULL,
	"prompt" text NOT NULL,
	"rubric" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"fixture_ref" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_builder_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"organization_id" uuid,
	"handle" varchar(80) NOT NULL,
	"name" varchar(160) NOT NULL,
	"kind" varchar(32) NOT NULL,
	"headline" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"bio" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"specialties" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"embedding" vector(1536),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "alpha_agents_builder_profiles_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_claim_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_type" varchar(24) NOT NULL,
	"subject_id" varchar(255) NOT NULL,
	"claim_type" varchar(24) NOT NULL,
	"label" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" varchar(24) NOT NULL,
	"verified_at" timestamp with time zone,
	"evidence_url" text,
	"related_version_id" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_decision_memos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"shortlist_id" uuid NOT NULL,
	"owner_user_id" uuid,
	"owner_organization_id" uuid,
	"created_by_user_id" uuid NOT NULL,
	"title" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"recommendation_state" varchar(24) NOT NULL,
	"rollout_recommendation" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"tradeoffs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"evidence_summary" jsonb,
	"risk_summary" jsonb,
	"score_weights" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_endorsements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_type" varchar(24) NOT NULL,
	"subject_id" varchar(255) NOT NULL,
	"author_type" varchar(24) NOT NULL,
	"author_id" varchar(255) NOT NULL,
	"author_name" varchar(160) NOT NULL,
	"author_headline" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"body" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"verified" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_feature_slots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid,
	"title" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"description" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"slot_key" varchar(80) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "alpha_agents_feature_slots_slot_key_unique" UNIQUE("slot_key")
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_featured_work" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_type" varchar(24) NOT NULL,
	"subject_id" varchar(255) NOT NULL,
	"title" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"artifact_url" text,
	"published_at" timestamp with time zone NOT NULL,
	"verified" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_magic_link_challenges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(32) NOT NULL,
	"redirect_to" varchar(255) NOT NULL,
	"token_hash" varchar(255) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "alpha_agents_magic_link_challenges_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_moderation_cases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid,
	"owner_organization_id" uuid,
	"entity_type" varchar(64) NOT NULL,
	"entity_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"status" varchar(32) NOT NULL,
	"reason" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"assigned_to" varchar(80) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_organization_memberships" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"organization_id" uuid NOT NULL,
	"role" varchar(24) DEFAULT 'member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(160) NOT NULL,
	"slug" varchar(160) NOT NULL,
	"description" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "alpha_agents_organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_permission_manifests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"skills" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"secrets" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"network_access" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"file_access" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"shell_access" integer DEFAULT 0 NOT NULL,
	"automation_hooks" integer DEFAULT 0 NOT NULL,
	"risk_level" varchar(16) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_rate_limit_buckets" (
	"key" varchar(191) PRIMARY KEY NOT NULL,
	"points" integer NOT NULL,
	"expire" bigint
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_relationship_edges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(32) NOT NULL,
	"from_type" varchar(24) NOT NULL,
	"from_id" varchar(255) NOT NULL,
	"to_type" varchar(24) NOT NULL,
	"to_id" varchar(255) NOT NULL,
	"verified" integer DEFAULT 0 NOT NULL,
	"note" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_service_heartbeats" (
	"id" varchar(191) PRIMARY KEY NOT NULL,
	"service_name" varchar(120) NOT NULL,
	"instance_id" varchar(120) NOT NULL,
	"status" varchar(32) DEFAULT 'ok' NOT NULL,
	"last_heartbeat_at" timestamp with time zone DEFAULT now() NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_shortlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid,
	"owner_organization_id" uuid,
	"created_by_user_id" uuid NOT NULL,
	"name" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"buyer_type" varchar(32) NOT NULL,
	"agent_slugs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"constraints" jsonb,
	"score_weights" jsonb,
	"internal_notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid,
	"owner_organization_id" uuid,
	"created_by_user_id" uuid NOT NULL,
	"agent_name" varchar(160) NOT NULL,
	"agent_slug" varchar(160) NOT NULL,
	"builder_handle" varchar(80) NOT NULL,
	"source_kind" varchar(32) NOT NULL,
	"source_url" text NOT NULL,
	"install_command" text NOT NULL,
	"summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"permission_manifest" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"dependencies" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"known_limits" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"supported_environments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"github_handle" varchar(120),
	"role" varchar(32) DEFAULT 'buyer' NOT NULL,
	"locale" varchar(12) DEFAULT 'en' NOT NULL,
	"profile" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "alpha_agents_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_verified_installs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid,
	"owner_organization_id" uuid,
	"agent_id" uuid NOT NULL,
	"agent_version_id" uuid NOT NULL,
	"verification_token" varchar(255) NOT NULL,
	"package_hash" varchar(255) NOT NULL,
	"anonymous_runtime_fingerprint" varchar(255) NOT NULL,
	"verified_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "alpha_agents_verified_installs_verification_token_unique" UNIQUE("verification_token")
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_verified_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid,
	"owner_organization_id" uuid,
	"agent_id" uuid NOT NULL,
	"agent_version_id" uuid NOT NULL,
	"install_id" uuid NOT NULL,
	"company" varchar(160) NOT NULL,
	"role" varchar(120) NOT NULL,
	"headline" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"body" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"rating" integer NOT NULL,
	"dimensions" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"context" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alpha_agents_agents" ADD CONSTRAINT "alpha_agents_agents_builder_profile_id_alpha_agents_builder_profiles_id_fk" FOREIGN KEY ("builder_profile_id") REFERENCES "public"."alpha_agents_builder_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_agents" ADD CONSTRAINT "alpha_agents_agents_owner_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_agents" ADD CONSTRAINT "alpha_agents_agents_owner_organization_id_alpha_agents_organizations_id_fk" FOREIGN KEY ("owner_organization_id") REFERENCES "public"."alpha_agents_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_agent_sources" ADD CONSTRAINT "alpha_agents_agent_sources_agent_id_alpha_agents_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."alpha_agents_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_agent_versions" ADD CONSTRAINT "alpha_agents_agent_versions_agent_id_alpha_agents_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."alpha_agents_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_audit_logs" ADD CONSTRAINT "alpha_agents_audit_logs_actor_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_audit_logs" ADD CONSTRAINT "alpha_agents_audit_logs_actor_organization_id_alpha_agents_organizations_id_fk" FOREIGN KEY ("actor_organization_id") REFERENCES "public"."alpha_agents_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_auth_accounts" ADD CONSTRAINT "alpha_agents_auth_accounts_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_auth_sessions" ADD CONSTRAINT "alpha_agents_auth_sessions_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_auth_sessions" ADD CONSTRAINT "alpha_agents_auth_sessions_active_organization_id_alpha_agents_organizations_id_fk" FOREIGN KEY ("active_organization_id") REFERENCES "public"."alpha_agents_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_artifacts" ADD CONSTRAINT "alpha_agents_benchmark_artifacts_benchmark_request_id_alpha_agents_benchmark_requests_id_fk" FOREIGN KEY ("benchmark_request_id") REFERENCES "public"."alpha_agents_benchmark_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_requests" ADD CONSTRAINT "alpha_agents_benchmark_requests_owner_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_requests" ADD CONSTRAINT "alpha_agents_benchmark_requests_owner_organization_id_alpha_agents_organizations_id_fk" FOREIGN KEY ("owner_organization_id") REFERENCES "public"."alpha_agents_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_requests" ADD CONSTRAINT "alpha_agents_benchmark_requests_created_by_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_requests" ADD CONSTRAINT "alpha_agents_benchmark_requests_agent_id_alpha_agents_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."alpha_agents_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_requests" ADD CONSTRAINT "alpha_agents_benchmark_requests_agent_version_id_alpha_agents_agent_versions_id_fk" FOREIGN KEY ("agent_version_id") REFERENCES "public"."alpha_agents_agent_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_requests" ADD CONSTRAINT "alpha_agents_benchmark_requests_suite_id_alpha_agents_benchmark_suites_id_fk" FOREIGN KEY ("suite_id") REFERENCES "public"."alpha_agents_benchmark_suites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_runs" ADD CONSTRAINT "alpha_agents_benchmark_runs_suite_id_alpha_agents_benchmark_suites_id_fk" FOREIGN KEY ("suite_id") REFERENCES "public"."alpha_agents_benchmark_suites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_runs" ADD CONSTRAINT "alpha_agents_benchmark_runs_agent_version_id_alpha_agents_agent_versions_id_fk" FOREIGN KEY ("agent_version_id") REFERENCES "public"."alpha_agents_agent_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_scorecards" ADD CONSTRAINT "alpha_agents_benchmark_scorecards_benchmark_run_id_alpha_agents_benchmark_runs_id_fk" FOREIGN KEY ("benchmark_run_id") REFERENCES "public"."alpha_agents_benchmark_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_tasks" ADD CONSTRAINT "alpha_agents_benchmark_tasks_suite_id_alpha_agents_benchmark_suites_id_fk" FOREIGN KEY ("suite_id") REFERENCES "public"."alpha_agents_benchmark_suites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_builder_profiles" ADD CONSTRAINT "alpha_agents_builder_profiles_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_builder_profiles" ADD CONSTRAINT "alpha_agents_builder_profiles_organization_id_alpha_agents_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."alpha_agents_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_decision_memos" ADD CONSTRAINT "alpha_agents_decision_memos_shortlist_id_alpha_agents_shortlists_id_fk" FOREIGN KEY ("shortlist_id") REFERENCES "public"."alpha_agents_shortlists"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_decision_memos" ADD CONSTRAINT "alpha_agents_decision_memos_owner_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_decision_memos" ADD CONSTRAINT "alpha_agents_decision_memos_owner_organization_id_alpha_agents_organizations_id_fk" FOREIGN KEY ("owner_organization_id") REFERENCES "public"."alpha_agents_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_decision_memos" ADD CONSTRAINT "alpha_agents_decision_memos_created_by_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_feature_slots" ADD CONSTRAINT "alpha_agents_feature_slots_agent_id_alpha_agents_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."alpha_agents_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_moderation_cases" ADD CONSTRAINT "alpha_agents_moderation_cases_owner_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_moderation_cases" ADD CONSTRAINT "alpha_agents_moderation_cases_owner_organization_id_alpha_agents_organizations_id_fk" FOREIGN KEY ("owner_organization_id") REFERENCES "public"."alpha_agents_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_organization_memberships" ADD CONSTRAINT "alpha_agents_organization_memberships_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_organization_memberships" ADD CONSTRAINT "alpha_agents_organization_memberships_organization_id_alpha_agents_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."alpha_agents_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_permission_manifests" ADD CONSTRAINT "alpha_agents_permission_manifests_agent_id_alpha_agents_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."alpha_agents_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_shortlists" ADD CONSTRAINT "alpha_agents_shortlists_owner_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_shortlists" ADD CONSTRAINT "alpha_agents_shortlists_owner_organization_id_alpha_agents_organizations_id_fk" FOREIGN KEY ("owner_organization_id") REFERENCES "public"."alpha_agents_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_shortlists" ADD CONSTRAINT "alpha_agents_shortlists_created_by_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_submissions" ADD CONSTRAINT "alpha_agents_submissions_owner_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_submissions" ADD CONSTRAINT "alpha_agents_submissions_owner_organization_id_alpha_agents_organizations_id_fk" FOREIGN KEY ("owner_organization_id") REFERENCES "public"."alpha_agents_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_submissions" ADD CONSTRAINT "alpha_agents_submissions_created_by_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_verified_installs" ADD CONSTRAINT "alpha_agents_verified_installs_owner_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_verified_installs" ADD CONSTRAINT "alpha_agents_verified_installs_owner_organization_id_alpha_agents_organizations_id_fk" FOREIGN KEY ("owner_organization_id") REFERENCES "public"."alpha_agents_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_verified_installs" ADD CONSTRAINT "alpha_agents_verified_installs_agent_id_alpha_agents_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."alpha_agents_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_verified_installs" ADD CONSTRAINT "alpha_agents_verified_installs_agent_version_id_alpha_agents_agent_versions_id_fk" FOREIGN KEY ("agent_version_id") REFERENCES "public"."alpha_agents_agent_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_verified_reviews" ADD CONSTRAINT "alpha_agents_verified_reviews_owner_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_verified_reviews" ADD CONSTRAINT "alpha_agents_verified_reviews_owner_organization_id_alpha_agents_organizations_id_fk" FOREIGN KEY ("owner_organization_id") REFERENCES "public"."alpha_agents_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_verified_reviews" ADD CONSTRAINT "alpha_agents_verified_reviews_agent_id_alpha_agents_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."alpha_agents_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_verified_reviews" ADD CONSTRAINT "alpha_agents_verified_reviews_agent_version_id_alpha_agents_agent_versions_id_fk" FOREIGN KEY ("agent_version_id") REFERENCES "public"."alpha_agents_agent_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_verified_reviews" ADD CONSTRAINT "alpha_agents_verified_reviews_install_id_alpha_agents_verified_installs_id_fk" FOREIGN KEY ("install_id") REFERENCES "public"."alpha_agents_verified_installs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alpha_agents_agent_slug_idx" ON "alpha_agents_agents" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "alpha_agents_agent_version_agent_idx" ON "alpha_agents_agent_versions" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_audit_entity_idx" ON "alpha_agents_audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_audit_actor_idx" ON "alpha_agents_audit_logs" USING btree ("actor_user_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_auth_account_provider_idx" ON "alpha_agents_auth_accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_auth_session_user_idx" ON "alpha_agents_auth_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_auth_session_token_idx" ON "alpha_agents_auth_sessions" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "alpha_agents_benchmark_request_version_idx" ON "alpha_agents_benchmark_requests" USING btree ("agent_version_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_benchmark_request_status_idx" ON "alpha_agents_benchmark_requests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "alpha_agents_benchmark_request_queue_job_idx" ON "alpha_agents_benchmark_requests" USING btree ("queue_job_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_benchmark_run_version_idx" ON "alpha_agents_benchmark_runs" USING btree ("agent_version_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_builder_handle_idx" ON "alpha_agents_builder_profiles" USING btree ("handle");--> statement-breakpoint
CREATE INDEX "alpha_agents_claim_subject_idx" ON "alpha_agents_claim_verifications" USING btree ("subject_type","subject_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_endorsement_subject_idx" ON "alpha_agents_endorsements" USING btree ("subject_type","subject_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_featured_work_subject_idx" ON "alpha_agents_featured_work" USING btree ("subject_type","subject_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_magic_link_email_idx" ON "alpha_agents_magic_link_challenges" USING btree ("email");--> statement-breakpoint
CREATE INDEX "alpha_agents_magic_link_token_idx" ON "alpha_agents_magic_link_challenges" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "alpha_agents_org_membership_user_idx" ON "alpha_agents_organization_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_org_membership_org_idx" ON "alpha_agents_organization_memberships" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_rate_limit_expire_idx" ON "alpha_agents_rate_limit_buckets" USING btree ("expire");--> statement-breakpoint
CREATE INDEX "alpha_agents_relationship_target_idx" ON "alpha_agents_relationship_edges" USING btree ("to_type","to_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_relationship_source_idx" ON "alpha_agents_relationship_edges" USING btree ("from_type","from_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_service_heartbeat_service_idx" ON "alpha_agents_service_heartbeats" USING btree ("service_name");--> statement-breakpoint
CREATE INDEX "alpha_agents_service_heartbeat_last_seen_idx" ON "alpha_agents_service_heartbeats" USING btree ("last_heartbeat_at");--> statement-breakpoint
CREATE INDEX "alpha_agents_users_email_idx" ON "alpha_agents_users" USING btree ("email");
