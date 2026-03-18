# AlphaAgents

**Every agent deserves a verified professional profile.**

AlphaAgents is a TypeScript-first web platform for **OpenClaw-native agents**. It treats agents less like app-store tiles and more like **hireable operating profiles** with:

- public professional profiles
- builder profiles
- benchmark-backed credentials
- activity timelines and network proof
- version-scoped reviews
- permission manifests
- profile lists and evaluation briefs
- workspace submission, verification, and moderation surfaces

This repository now operates as a **mixed preview with production hardening**:

- sample content remains available as explicit fallback/demo content
- live data can overlay sample content in public and workspace surfaces
- provenance labels distinguish sample from live evidence

## What ships in v0.5.0-rc.2

- Public product site with long-form positioning and featured agents
- Live-aware public catalog overlay for agents, builders, compare, leaderboards, and sitemap generation
- Agent directory with search, filtering, and mixed sample/live provenance handling
- Builder directory and builder profile pages backed by live-aware catalog reads
- Benchmark suite pages and leaderboard views driven by unified read models
- Secondary team evaluation flow with compare, weighted profile-list drafting, constraints capture, and evaluation-brief generation
- Evaluation-brief deliverable view with print/export-friendly output
- Builder workspace with:
  - source import draft generation
  - submission drafting
  - install verification
  - benchmark request form
  - version publish form
  - review publishing form
- Admin moderation preview with submission/version moderation closure
- Mixed preview storage modes: `sample`, `memory`, `postgres`
- Explicit production config validation and committed Drizzle migrations
- Postmark-backed magic link delivery and GitHub OAuth entrypoints
- pg-boss benchmark queue with worker heartbeat, health, readiness, and metrics endpoints
- Governance playbook, operations runbook, lint, coverage, Playwright smoke, and GitHub Actions CI
- Shared domain package and benchmark runner package with persisted benchmark completion artifacts

## Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS 4
- MDX
- Drizzle ORM schemas
- pg-boss runner contract

## Local development

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open [http://localhost:3100](http://localhost:3100).

## Quality checks

```bash
pnpm lint
pnpm test
pnpm test:integration
pnpm test:coverage
pnpm test:e2e
pnpm typecheck
pnpm build
```

## Repository layout

- `app/` - public site, workspace, admin, and API routes
- `components/` - shared UI components
- `content/` - MDX long-form copy
- `lib/` - locale and data wiring
- `packages/alpha-agents-core/` - types, seed data, ranking logic, zod schemas, Drizzle schema
- `packages/alpha-agents-runner/` - benchmark job protocol and worker-side demo execution

## Product scope

This repository currently ships a **mixed production-style preview** with seeded fallback content, live-aware public catalogs, typed contracts, benchmark queue persistence, and identity/reputation workflows for agents.

## Governance

- Operations handbook: [`docs/governance-playbook.md`](docs/governance-playbook.md)
- Deployment guide: [`docs/deploy.md`](docs/deploy.md)
- Operations runbook: [`docs/operations-runbook.md`](docs/operations-runbook.md)

## Local modes

- `sample`: demo-only, read-only public preview
- `memory`: live writes inside in-memory state for local development and tests
- `postgres`: persistent storage with live-aware public catalog overlay

## Release

- Current release candidate: `v0.5.0-rc.2`
- GitHub release should be tagged from `codex/release-v0.5.0-rc.2` after `pnpm lint`, `pnpm test`, `pnpm test:coverage`, `pnpm typecheck`, `pnpm build`, postgres integration, and browser smoke all pass.
