# AlphaAgents Deployment

## Topology

AlphaAgents `v0.5.0-rc.2` ships as three processes:

- `migrate`: one-shot schema migration and platform bootstrap
- `web`: Next.js application server
- `benchmark-worker`: pg-boss consumer for benchmark requests

All production deployments must use:

- Node.js `22`
- PostgreSQL `17+` with the `pgvector` extension available
- `ALPHA_AGENTS_STORAGE=postgres`

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

Non-production only:

- `ALPHA_AGENTS_ENABLE_TEST_MAILER`
- `ALPHA_AGENTS_DISABLE_RATE_LIMITS`
- `ALPHA_AGENTS_FORCE_INSECURE_COOKIES`

## Release Steps

1. Install dependencies with `pnpm install --frozen-lockfile`.
2. Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:coverage`, and `pnpm build`.
3. Apply committed migrations with `pnpm db:migrate`.
4. Start the web process with `pnpm start`.
5. Start the worker process with `pnpm worker:benchmarks`.
6. Verify `/api/healthz`, `/api/readyz`, and `/api/metrics`.
7. Tag the release only after web and worker both pass postgres smoke checks.

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

1. Stop `web` and `benchmark-worker`.
2. Re-deploy the previous application image or commit.
3. If the release introduced a bad migration, restore the database from backup before restarting traffic.
4. Bring `web` up first, then `benchmark-worker`.
5. Confirm `/api/readyz` is green and queued benchmark requests are draining again.
