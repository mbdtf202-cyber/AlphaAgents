CREATE TABLE "alpha_agents_arena_competition_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" uuid NOT NULL,
	"agent_id" uuid NOT NULL,
	"agent_version_id" uuid NOT NULL,
	"trading_version_config_id" uuid NOT NULL,
	"owner_user_id" uuid,
	"owner_organization_id" uuid,
	"entry_status" varchar(32) DEFAULT 'pending' NOT NULL,
	"proof_mode" varchar(32) NOT NULL,
	"verification_level" varchar(32) NOT NULL,
	"live_status" varchar(32) NOT NULL,
	"prompt_mode" varchar(32) NOT NULL,
	"ranking_scope" varchar(32) NOT NULL,
	"rule_violation_count" integer DEFAULT 0 NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_arena_competitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"league_slug" varchar(160) NOT NULL,
	"slug" varchar(160) NOT NULL,
	"title" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" varchar(32) NOT NULL,
	"proof_mode" varchar(32) NOT NULL,
	"ranking_scope" varchar(32) NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"initial_capital_usd" numeric(12, 2) DEFAULT '0' NOT NULL,
	"market_scope" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"ruleset_name" varchar(120) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "alpha_agents_arena_competitions_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_arena_leaderboard_rows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" uuid NOT NULL,
	"entry_id" uuid NOT NULL,
	"run_id" uuid,
	"proof_mode" varchar(32) NOT NULL,
	"verification_level" varchar(32) NOT NULL,
	"live_status" varchar(32) NOT NULL,
	"prompt_mode" varchar(32) NOT NULL,
	"ranking_scope" varchar(32) NOT NULL,
	"rank" integer NOT NULL,
	"total_score" numeric(6, 2) DEFAULT '0' NOT NULL,
	"metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"as_of" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_arena_live_credentials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"agent_version_id" uuid NOT NULL,
	"owner_user_id" uuid,
	"owner_organization_id" uuid,
	"created_by_user_id" uuid NOT NULL,
	"account_label" varchar(120) NOT NULL,
	"exchange" varchar(40) NOT NULL,
	"credential_mode" varchar(40) NOT NULL,
	"provider_kind" varchar(40) NOT NULL,
	"status" varchar(32) DEFAULT 'pending' NOT NULL,
	"verification_level" varchar(32) DEFAULT 'review' NOT NULL,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_arena_replay_bundles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"run_id" uuid NOT NULL,
	"title" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"artifact_url" text NOT NULL,
	"chart_url" text,
	"key_moments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"render_status" varchar(32) DEFAULT 'ready' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_arena_report_artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject_type" varchar(32) NOT NULL,
	"subject_id" varchar(255) NOT NULL,
	"kind" varchar(32) NOT NULL,
	"title" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"highlights" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"window_label" varchar(80) NOT NULL,
	"score_version" varchar(80) NOT NULL,
	"proof_modes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"artifact_url" text NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_arena_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" uuid NOT NULL,
	"entry_id" uuid NOT NULL,
	"agent_version_id" uuid NOT NULL,
	"owner_user_id" uuid,
	"owner_organization_id" uuid,
	"provider_kind" varchar(40) NOT NULL,
	"proof_mode" varchar(32) NOT NULL,
	"verification_level" varchar(32) NOT NULL,
	"live_status" varchar(32) NOT NULL,
	"ranking_scope" varchar(32) NOT NULL,
	"run_status" varchar(32) DEFAULT 'queued' NOT NULL,
	"instrument" varchar(80) NOT NULL,
	"rationale_summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"action_summary" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_arena_watchlist_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" uuid,
	"owner_organization_id" uuid,
	"created_by_user_id" uuid NOT NULL,
	"target_type" varchar(32) NOT NULL,
	"target_id" varchar(255) NOT NULL,
	"label" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alpha_agents_trading_version_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_id" uuid NOT NULL,
	"agent_version_id" uuid NOT NULL,
	"owner_user_id" uuid,
	"owner_organization_id" uuid,
	"source_kind" varchar(32) NOT NULL,
	"runtime_image" text NOT NULL,
	"build_status" varchar(32) DEFAULT 'pending' NOT NULL,
	"validation_status" varchar(32) DEFAULT 'pending' NOT NULL,
	"validation_report" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"execution_mode" varchar(32) NOT NULL,
	"prompt_mode" varchar(32) NOT NULL,
	"strategy_summary" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"market_scope" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"supported_providers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"model_metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"risk_profile" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"published_at" timestamp with time zone,
	"frozen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_artifacts" ALTER COLUMN "executor_id" SET DEFAULT 'unknown-executor';--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_artifacts" ALTER COLUMN "execution_ref" SET DEFAULT 'untracked';--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_artifacts" ALTER COLUMN "input_digest" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_artifacts" ALTER COLUMN "environment_digest" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_artifacts" ALTER COLUMN "output_digest" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_runs" ALTER COLUMN "benchmark_request_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_runs" ALTER COLUMN "executor_id" SET DEFAULT 'unknown-executor';--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_runs" ALTER COLUMN "execution_ref" SET DEFAULT 'untracked';--> statement-breakpoint
ALTER TABLE "alpha_agents_submissions" ALTER COLUMN "initial_version" SET DEFAULT '0.1.0';--> statement-breakpoint
ALTER TABLE "alpha_agents_submissions" ALTER COLUMN "initial_bundle_hash" SET DEFAULT 'sha256:pending-initial-bundle';--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_competition_entries" ADD CONSTRAINT "alpha_agents_arena_competition_entries_competition_id_alpha_agents_arena_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."alpha_agents_arena_competitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_competition_entries" ADD CONSTRAINT "alpha_agents_arena_competition_entries_agent_id_alpha_agents_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."alpha_agents_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_competition_entries" ADD CONSTRAINT "alpha_agents_arena_competition_entries_agent_version_id_alpha_agents_agent_versions_id_fk" FOREIGN KEY ("agent_version_id") REFERENCES "public"."alpha_agents_agent_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_competition_entries" ADD CONSTRAINT "alpha_agents_arena_competition_entries_trading_version_config_id_alpha_agents_trading_version_configs_id_fk" FOREIGN KEY ("trading_version_config_id") REFERENCES "public"."alpha_agents_trading_version_configs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_competition_entries" ADD CONSTRAINT "alpha_agents_arena_competition_entries_owner_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_competition_entries" ADD CONSTRAINT "alpha_agents_arena_competition_entries_owner_organization_id_alpha_agents_organizations_id_fk" FOREIGN KEY ("owner_organization_id") REFERENCES "public"."alpha_agents_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_leaderboard_rows" ADD CONSTRAINT "alpha_agents_arena_leaderboard_rows_competition_id_alpha_agents_arena_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."alpha_agents_arena_competitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_leaderboard_rows" ADD CONSTRAINT "alpha_agents_arena_leaderboard_rows_entry_id_alpha_agents_arena_competition_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."alpha_agents_arena_competition_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_leaderboard_rows" ADD CONSTRAINT "alpha_agents_arena_leaderboard_rows_run_id_alpha_agents_arena_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."alpha_agents_arena_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_live_credentials" ADD CONSTRAINT "alpha_agents_arena_live_credentials_agent_id_alpha_agents_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."alpha_agents_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_live_credentials" ADD CONSTRAINT "alpha_agents_arena_live_credentials_agent_version_id_alpha_agents_agent_versions_id_fk" FOREIGN KEY ("agent_version_id") REFERENCES "public"."alpha_agents_agent_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_live_credentials" ADD CONSTRAINT "alpha_agents_arena_live_credentials_owner_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_live_credentials" ADD CONSTRAINT "alpha_agents_arena_live_credentials_owner_organization_id_alpha_agents_organizations_id_fk" FOREIGN KEY ("owner_organization_id") REFERENCES "public"."alpha_agents_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_live_credentials" ADD CONSTRAINT "alpha_agents_arena_live_credentials_created_by_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_replay_bundles" ADD CONSTRAINT "alpha_agents_arena_replay_bundles_run_id_alpha_agents_arena_runs_id_fk" FOREIGN KEY ("run_id") REFERENCES "public"."alpha_agents_arena_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_runs" ADD CONSTRAINT "alpha_agents_arena_runs_competition_id_alpha_agents_arena_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."alpha_agents_arena_competitions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_runs" ADD CONSTRAINT "alpha_agents_arena_runs_entry_id_alpha_agents_arena_competition_entries_id_fk" FOREIGN KEY ("entry_id") REFERENCES "public"."alpha_agents_arena_competition_entries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_runs" ADD CONSTRAINT "alpha_agents_arena_runs_agent_version_id_alpha_agents_agent_versions_id_fk" FOREIGN KEY ("agent_version_id") REFERENCES "public"."alpha_agents_agent_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_runs" ADD CONSTRAINT "alpha_agents_arena_runs_owner_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_runs" ADD CONSTRAINT "alpha_agents_arena_runs_owner_organization_id_alpha_agents_organizations_id_fk" FOREIGN KEY ("owner_organization_id") REFERENCES "public"."alpha_agents_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_watchlist_entries" ADD CONSTRAINT "alpha_agents_arena_watchlist_entries_owner_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_watchlist_entries" ADD CONSTRAINT "alpha_agents_arena_watchlist_entries_owner_organization_id_alpha_agents_organizations_id_fk" FOREIGN KEY ("owner_organization_id") REFERENCES "public"."alpha_agents_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_arena_watchlist_entries" ADD CONSTRAINT "alpha_agents_arena_watchlist_entries_created_by_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_trading_version_configs" ADD CONSTRAINT "alpha_agents_trading_version_configs_agent_id_alpha_agents_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."alpha_agents_agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_trading_version_configs" ADD CONSTRAINT "alpha_agents_trading_version_configs_agent_version_id_alpha_agents_agent_versions_id_fk" FOREIGN KEY ("agent_version_id") REFERENCES "public"."alpha_agents_agent_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_trading_version_configs" ADD CONSTRAINT "alpha_agents_trading_version_configs_owner_user_id_alpha_agents_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."alpha_agents_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alpha_agents_trading_version_configs" ADD CONSTRAINT "alpha_agents_trading_version_configs_owner_organization_id_alpha_agents_organizations_id_fk" FOREIGN KEY ("owner_organization_id") REFERENCES "public"."alpha_agents_organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alpha_agents_arena_entry_competition_idx" ON "alpha_agents_arena_competition_entries" USING btree ("competition_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_arena_entry_version_idx" ON "alpha_agents_arena_competition_entries" USING btree ("agent_version_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_arena_competition_league_idx" ON "alpha_agents_arena_competitions" USING btree ("league_slug");--> statement-breakpoint
CREATE INDEX "alpha_agents_arena_leaderboard_competition_idx" ON "alpha_agents_arena_leaderboard_rows" USING btree ("competition_id","ranking_scope","as_of");--> statement-breakpoint
CREATE INDEX "alpha_agents_arena_live_credential_agent_idx" ON "alpha_agents_arena_live_credentials" USING btree ("agent_id","agent_version_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_arena_replay_run_idx" ON "alpha_agents_arena_replay_bundles" USING btree ("run_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_arena_report_subject_idx" ON "alpha_agents_arena_report_artifacts" USING btree ("subject_type","subject_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_arena_run_competition_idx" ON "alpha_agents_arena_runs" USING btree ("competition_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_arena_run_entry_idx" ON "alpha_agents_arena_runs" USING btree ("entry_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_arena_run_status_idx" ON "alpha_agents_arena_runs" USING btree ("run_status");--> statement-breakpoint
CREATE INDEX "alpha_agents_arena_watchlist_owner_idx" ON "alpha_agents_arena_watchlist_entries" USING btree ("owner_user_id","owner_organization_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_trading_version_agent_idx" ON "alpha_agents_trading_version_configs" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_trading_version_version_idx" ON "alpha_agents_trading_version_configs" USING btree ("agent_version_id");