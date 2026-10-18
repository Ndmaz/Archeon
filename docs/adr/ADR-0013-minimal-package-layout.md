# ADR-0013: Minimal v0 package and workspace layout

- **Status:** Proposed
- **Date:** 2026-10-09

## Context

Archeon is intended to remain framework-neutral at its core while adapters and integrations may eventually be published independently. At the same time, creating many empty packages before there are real contracts would add workspace complexity without proving the architecture.

## Proposal

Use a small monorepo workspace with only the core package and one example initially:

```text
Archeon/
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── tsconfig.base.json
├── README.md
├── docs/
├── packages/
│   └── core/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
└── examples/
    └── basic/
        ├── package.json
        └── src/
```

The exact tooling choice must be confirmed against the maintainers' environment before files are created. The current proposal is pnpm workspaces with TypeScript, a small test runner, and a build tool only where required by package exports.

## Package boundaries

### Core

Owns only the framework-neutral primitives required for the first vertical slice:
- operation definition and its types;
- module definition and registration;
- application construction and duplicate validation;
- minimal in-memory plan construction;
- runtime lookup and execution;
- framework-level errors needed to express those contracts.

Core must not depend on Next.js, React, Prisma, NextAuth, Zod, database drivers, or a specific logging vendor.

### Basic example

Demonstrates the public API from a consumer perspective and serves as an integration test for package exports and inferred types. It should not require Next.js or a database in the first iteration.

### Future packages

Do not create placeholder packages for Next.js, React, Zod, auth, Prisma, caching, or rate limiting now. Add a package only when a tested integration has a clear contract and can be demonstrated in an example.

## Tooling principles

- Keep the build and test toolchain small.
- Add strict TypeScript settings and compile-time type tests.
- Run tests, type checks, and package build in CI.
- Avoid adding a bundler unless package output or export conditions require it.
- Commit the lockfile for reproducible installs.
- Keep public exports intentional; do not expose internal plan types by default.

## Trade-offs

A monorepo gives core and examples a shared development workflow and allows future adapters to be added without a repository migration. It does introduce workspace configuration and package-manager assumptions earlier than a single package would.

The proposal limits that cost by creating only one actual package and one consumer example. If the initial package layout proves more complex than the vertical slice warrants, start with a single root package and revisit before publishing.

## Acceptance criteria

- A clean install works from the repository root.
- Core can be built and type-checked independently.
- The example imports core through its public package exports, not source-relative paths.
- Tests exercise public behavior and inferred types.
- No future integration package exists solely as an empty placeholder.

## Consequences

This is a proposed starting layout, not an instruction to scaffold every future package. The implementation should be the deciding evidence; only create the workspace when the core contract is ready to be implemented.
