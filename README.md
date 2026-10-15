# Archeon

**An operation runtime for TypeScript applications.**

Archeon provides a typed, operation-first model for defining application capabilities, compiling their definitions into execution plans, and running them through a framework-neutral core.

> **Project status:** early 0.x prototype. The core runtime and a minimal Next.js route-handler adapter are implemented and CI-tested. APIs are not yet stable and packages are not yet published.

## Core vocabulary

- **Operation** — a named application capability with a contract and execution behavior.
- **Module** — a named group of related operations.
- **Execution plan** — the runtime-oriented representation produced from an operation and its configuration.
- **Runtime** — executes a plan using the configured services and capabilities.
- **Plugin** — extends the framework through explicit integration points.
- **Adapter** — connects Archeon to an environment such as Next.js or React.

The public entry point is `defineOperation()`. The current v0 contract is documented in the accepted ADRs and implemented in `@archeon/core`; it remains pre-release and may change before 1.0.

## Repository status

The repository currently includes:

- `@archeon/core` — operation definitions, modules, application construction, parsing, execution plans, and typed execution context.
- `@archeon/next` — a thin adapter for Next.js App Router route handlers using standard Web `Request`/`Response` APIs.
- `examples/basic` — a framework-neutral consumer example.
- `docs/adr/` and `docs/guides/` — architecture decisions and usage guides.

The public contracts are still being refined. See the [roadmap](docs/roadmap.md) before relying on an API for production.

## Current API shape

```ts
const app = createApplication({
  modules: [usersModule],
  services,
});

const result = await app.execute("users.create", input, {
  request: {
    requestId: "req-123",
    principal: { id: "user-42" },
  },
});
```

Application services are bound at construction; request context is per invocation and optional. See the [execution-context guide](docs/guides/execution-context.md) and [Next.js adapter guide](docs/guides/next-adapter.md).

## Development branches

- `main` — stable, reviewed state and release history.
- `dev` — integration branch for active development and architecture work.
- `testing` — temporary integration-validation branch before promotion to `main`.

Use short-lived `feature/*`, `docs/*`, or `fix/*` branches from `dev`. Merge into `dev` through pull requests; promote validated work from `dev` to `testing`, then from `testing` to `main`. Avoid direct commits to `main`.

See [the architecture overview](docs/architecture/overview.md), [terminology](docs/terminology.md), [roadmap](docs/roadmap.md), and [ADRs](docs/adr/).

## Guiding principle

**Every abstraction must justify its existence.** Keep the first implementation thin, prove the operation → plan → runtime path, and add compiler sophistication, plugins, adapters, and caching only where a demonstrated use case warrants them.
