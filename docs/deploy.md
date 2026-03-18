# AlphaAgents Deployment

## Topology

AlphaAgents `v0.6.1` ships as three runtime services plus an external database:

- `web`: Next.js application server
- `benchmark-worker`: pg-boss consumer for benchmark requests
- `caddy`: TLS termination and reverse proxy
- managed PostgreSQL: persistent application, queue, and moderation state

All production deployments must use:

- Node.js `22`
- PostgreSQL `17+` with the `pgvector` extension available
- `ALPHA_AGENTS_STORAGE=postgres`
- `ALPHA_AGENTS_ENABLE_SAMPLE_OVERLAY=false`

## Required Environment

Copy [`.env.example`](/Users/raki/Desktop/AlphaAgents/.env.example) and set every value before booting production.

Mandatory launch-time variables:

- `ALPHA_AGENTS_STORAGE`
- `DATABASE_URL`
- `ALPHA_AGENTS_AUTH_SECRET`
- `ALPHA_AGENTS_APP_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `POSTMARK_SERVER_TOKEN`
- `POSTMARK_FROM_EMAIL`
- `POSTMARK_MESSAGE_STREAM`
- `SENTRY_DSN`
- `SENTRY_ENVIRONMENT`
- `SENTRY_RELEASE`
- `ALPHA_AGENTS_EXECUTOR_ID`
- `ALPHA_AGENTS_EXECUTOR_KEY_ID`
- `ALPHA_AGENTS_EXECUTOR_ATTESTATION_SECRET`
- `ALPHA_AGENTS_BENCHMARK_VERIFIER_ID`

Non-production only:

- `ALPHA_AGENTS_ENABLE_TEST_MAILER`
- `ALPHA_AGENTS_DISABLE_RATE_LIMITS`
- `ALPHA_AGENTS_FORCE_INSECURE_COOKIES`

## Release Steps

1. Install dependencies with `pnpm install --frozen-lockfile`.
2. Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:coverage`, and `pnpm build`.
3. Build and push the release image to GHCR.
4. Upload `deploy/docker-compose.prod.yml`, `deploy/Caddyfile`, and `scripts/deploy-vm.sh` to the production VM.
5. Write the production `.env` on the VM.
6. Run the deploy script so migrations execute before `web`, `benchmark-worker`, and `caddy` restart.
7. Verify `/api/healthz`, `/api/readyz`, and `/api/metrics`.
8. Tag and publish the GitHub release only after production smoke is green.

## Process Commands

Web:

```bash
pnpm start
```

Worker:

```bash
pnpm worker:benchmarks
```

Migration:

```bash
pnpm db:migrate
```

## Rollback

1. Re-point `ALPHA_AGENTS_IMAGE` in the production `.env` to the previous GHCR tag.
2. Re-run `scripts/deploy-vm.sh`.
3. If the release introduced a bad migration, restore the managed PostgreSQL backup before restarting traffic.
4. Confirm `/api/readyz` is green and queued benchmark requests are draining again.
