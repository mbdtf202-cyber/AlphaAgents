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

## What ships in v0.1.0

- Public product site with long-form positioning and featured agents
- Agent directory with search and filtering
- Builder directory and builder profile pages
- Benchmark suite pages and leaderboard views
- Buyer compare flow with shortlist creation
- Builder workspace with:
  - submission drafting
  - install verification
  - benchmark request form
  - version publish form
  - review publishing form
- Admin moderation preview with typed moderation actions
- Shared domain package and benchmark runner package

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

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
pnpm test
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

This repository currently ships a **production-style preview** with seeded data and typed contracts. Real Postgres/Auth/S3 integration can be added on top of the existing structure without changing the public IA.
