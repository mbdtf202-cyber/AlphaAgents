# AlphaAgents Operations Runbook

## On-Call Checklist

- Watch `/api/readyz` for database health, worker heartbeat age, and benchmark queue backlog.
- Watch `/api/metrics` for:
  - `alpha_agents_benchmark_queue_backlog`
  - `alpha_agents_worker_heartbeat_age_seconds`
  - `alpha_agents_rate_limit_rejections_total`
  - `alpha_agents_request_errors_total`
- Review Sentry for new release-specific exceptions before promoting traffic.

## Incident Handling

1. Confirm whether the issue is `web`, `benchmark-worker`, or database scoped.
2. Check recent deploy SHA and `SENTRY_RELEASE`.
3. Inspect structured logs for the affected request or benchmark id.
4. If `readyz` is red because of worker heartbeat or queue age, restart the worker before restarting web.
5. If auth or write APIs are failing, verify GitHub, Postmark, and database credentials first.

## Data Repair

- Benchmark requests stuck in `queued`:
  - Verify `benchmark-worker` is running.
  - Inspect pg-boss queue state.
  - If the queue is healthy but the request row is stale, mark the request `failed` with a concrete `failureReason` before replaying.
- Incorrect install or review data:
  - Use audit logs to identify the actor and payload.
  - Repair the live row directly in PostgreSQL.
  - Record the repair action in the incident notes.

## Benchmark Worker Recovery

1. Restart `benchmark-worker`.
2. Wait for the next heartbeat to land in `alpha_agents_service_heartbeats`.
3. Confirm `/api/readyz` returns `200`.
4. Check `alpha_agents_benchmark_queue_backlog`; if it stays high, inspect pg-boss jobs and replay or fail stuck requests explicitly.

## Release Candidate Gate

Do not tag `v0.5.0-rc.3` until all of the following are true:

- Git worktree is clean.
- Drizzle migrations are committed.
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:coverage`, and `pnpm build` pass.
- Postgres integration tests pass.
- Browser smoke tests pass with both `web` and `benchmark-worker` running.
