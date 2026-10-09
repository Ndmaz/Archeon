# Archeon

**An operation runtime for TypeScript applications.**

Archeon explores a typed, operation-first model for composing application capabilities, compiling their definitions into execution plans, and running them through a pluggable runtime.

> **Project status:** architecture and repository foundation. The architecture documents record our current design direction; they are not a promise that every proposed package or abstraction will ship in v0.

## Core vocabulary

- **Operation** — a named application capability with a contract and execution behavior.
- **Module** — a named group of related operations.
- **Execution plan** — the runtime-oriented representation produced from an operation and its configuration.
- **Runtime** — executes a plan using the configured services and capabilities.
- **Plugin** — extends the framework through explicit integration points.
- **Adapter** — connects Archeon to an environment such as Next.js or React.

The intended public entry point is `defineOperation()`. The exact API and the boundary between operation definitions, plans, and runtime execution will be refined through documented architecture decisions before implementation.

## Repository status

The repository currently contains the design baseline and development workflow. No API or package layout should be treated as stable until the core contracts and a minimal end-to-end example are implemented and tested.

## Development branches

- `main` — stable, reviewed state and release history.
- `dev` — integration branch for active development and architecture work.
- `testing` — temporary integration-validation branch before promotion to `main`.

Use short-lived `feature/*`, `docs/*`, or `fix/*` branches from `dev`. Merge into `dev) through pull requests; promote validated work from `dev` to `testing`, then from `testing` to `main`. Avoid direct commits to `main`.

See [the architecture overview](docs/architecture/overview.md), [terminology](docs/terminology.md), [roadmap](docs/roadmap.md), and [ADRs](docs/adr/).

## Guiding principle

**Every abstraction must justify its existence.** Keep the first implementation thin, prove the operation → plan → runtime path, and add compiler sophistication, plugins, adapters, and caching only where a demonstrated use case warrants them.
