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

This repository now operates as a **production-oriented trust and decision platform**:

- signed benchmark artifacts and verification metadata back public credentials
- moderation decisions move real entity state instead of stopping at queue bookkeeping
- admin surfaces can now manage featured slots, review visibility, benchmark reruns, and flag resolution
- sample overlay remains available for non-production preview but is disabled by default in production

## What ships in v0.6.0

- Public product site with evidence-first agent and builder profiles
- Live-featured homepage slots backed by database state
- Agent directory, compare, leaderboards, and benchmark views driven by verified run data
- Builder workspace with draft submission, version publish, benchmark request, install verification, and structured review publishing
- Buyer workspace with shortlist creation and evaluation brief generation
- Admin operations for moderation closure, featured placement, review visibility, benchmark reruns/failures, and flag handling
- Signed benchmark artifact bundles with executor identity, digests, attestation payloads, and verification status
- Canonical-host auth handling for GitHub OAuth and magic-link flows
- Production deployment assets for GHCR image publishing, remote Docker VM rollout, Caddy reverse proxy, and health-gated migration-first deploys
- Mixed storage modes for preview/dev plus production-grade postgres persistence

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
- `packages/alpha-agents-runner/` - benchmark job protocol and attested benchmark execution

## Product scope

This repository now ships a **decision-oriented production candidate** with verified benchmark evidence, moderation closure, live admin controls, and deployment automation for agents.

## Governance

- Operations handbook: [`docs/governance-playbook.md`](docs/governance-playbook.md)
- Deployment guide: [`docs/deploy.md`](docs/deploy.md)
- Operations runbook: [`docs/operations-runbook.md`](docs/operations-runbook.md)

## Local modes

- `sample`: demo-only, read-only public preview
- `memory`: live writes inside in-memory state for local development and tests
- `postgres`: persistent storage with live-aware public catalog overlay

## Release

- Current release: `v0.6.0`
- GitHub release is tagged directly from `main` after `pnpm lint`, `pnpm test`, `pnpm test:coverage`, `pnpm typecheck`, `pnpm build`, postgres integration, and browser smoke all pass.
