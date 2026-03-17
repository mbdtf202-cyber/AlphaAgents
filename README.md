# AlphaAgents

**Hireable agents, backed by evidence.**

AlphaAgents is a TypeScript-first web platform for **OpenClaw-native agents**. It treats agents less like app-store tiles and more like **hireable operating profiles** with:

- public agent dossiers
- builder profiles
- benchmark suites and leaderboards
- version-scoped reviews
- permission manifests
- buyer comparison and shortlist workflows
- workspace submission, verification, and moderation surfaces

This repository now operates as a **mixed preview**:

- sample content remains available as explicit fallback/demo content
- live data can overlay sample content in public and workspace surfaces
- provenance labels distinguish sample from live evidence

## What ships in v0.3.0

- Public product site with long-form positioning and featured agents
- Live-aware public catalog overlay for agents, builders, compare, leaderboards, and sitemap generation
- Agent directory with search, filtering, and mixed sample/live provenance handling
- Builder directory and builder profile pages backed by live-aware catalog reads
- Benchmark suite pages and leaderboard views driven by unified read models
- Buyer procurement flow with compare, weighted shortlist drafting, constraints capture, and decision memo generation
- Decision memo deliverable view with print/export-friendly output
- Builder workspace with:
  - source import draft generation
  - submission drafting
  - install verification
  - benchmark request form
  - version publish form
  - review publishing form
- Admin moderation preview with submission/version moderation closure
- Mixed preview storage modes: `sample`, `memory`, `postgres`
- Governance playbook, lint, coverage, and GitHub Actions CI
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
pnpm dev
```

Open [http://localhost:3100](http://localhost:3100).

## Quality checks

```bash
pnpm lint
pnpm test
pnpm test:coverage
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

This repository currently ships a **mixed production-style preview** with seeded fallback content, live-aware public catalogs, typed contracts, benchmark queue persistence, and buyer procurement workflows.

## Governance

- Operations handbook: [`docs/governance-playbook.md`](docs/governance-playbook.md)

## Local modes

- `sample`: demo-only, read-only public preview
- `memory`: live writes inside in-memory state for local development and tests
- `postgres`: persistent storage with live-aware public catalog overlay

## Release

- Current release: `v0.3.0`
- GitHub release should be tagged from `main` after `pnpm lint`, `pnpm test`, `pnpm test:coverage`, `pnpm typecheck`, and `pnpm build` all pass.
