ALTER TABLE "alpha_agents_benchmark_artifacts" ADD COLUMN "executor_id" varchar(160) DEFAULT 'unknown-executor' NOT NULL;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_artifacts" ADD COLUMN "execution_ref" varchar(255) DEFAULT 'untracked' NOT NULL;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_artifacts" ADD COLUMN "input_digest" varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_artifacts" ADD COLUMN "environment_digest" varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_artifacts" ADD COLUMN "output_digest" varchar(255) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_artifacts" ADD COLUMN "replay_ref" text;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_artifacts" ADD COLUMN "artifact_manifest" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_artifacts" ADD COLUMN "attestation" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_artifacts" ADD COLUMN "verification_status" varchar(32) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_artifacts" ADD COLUMN "verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_artifacts" ADD COLUMN "verifier_id" varchar(160);--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_artifacts" ADD COLUMN "verification_failure_reason" text;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_runs" ADD COLUMN "benchmark_request_id" uuid;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_runs" ADD COLUMN "executor_id" varchar(160) DEFAULT 'unknown-executor' NOT NULL;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_runs" ADD COLUMN "execution_ref" varchar(255) DEFAULT 'untracked' NOT NULL;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_runs" ADD COLUMN "verification_status" varchar(32) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_runs" ADD COLUMN "verified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_runs" ADD COLUMN "verifier_id" varchar(160);--> statement-breakpoint
ALTER TABLE "alpha_agents_submissions" ADD COLUMN "initial_version" varchar(64) DEFAULT '0.1.0' NOT NULL;--> statement-breakpoint
ALTER TABLE "alpha_agents_submissions" ADD COLUMN "initial_bundle_hash" varchar(255) DEFAULT 'sha256:pending-initial-bundle' NOT NULL;--> statement-breakpoint
ALTER TABLE "alpha_agents_verified_reviews" ADD COLUMN "visibility_status" varchar(32) DEFAULT 'visible' NOT NULL;--> statement-breakpoint
ALTER TABLE "alpha_agents_benchmark_runs" ADD CONSTRAINT "alpha_agents_benchmark_runs_benchmark_request_id_alpha_agents_benchmark_requests_id_fk" FOREIGN KEY ("benchmark_request_id") REFERENCES "public"."alpha_agents_benchmark_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "alpha_agents_benchmark_run_request_idx" ON "alpha_agents_benchmark_runs" USING btree ("benchmark_request_id");--> statement-breakpoint
CREATE INDEX "alpha_agents_benchmark_run_verification_idx" ON "alpha_agents_benchmark_runs" USING btree ("verification_status");
