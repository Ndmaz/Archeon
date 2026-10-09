# Architecture overview

## Status and scope

This is the current architecture direction carried forward from design discussions. It is intentionally a high-level baseline. The repository should not start by implementing every box shown here; core contracts and a vertical slice come first.

## Intended model

```text
Application
  └─ Modules
      └─ Operations
           └─ definition + contracts + execution behavior
                    |
                 Compiler
                    |
              Execution Plan
                    |
                  Runtime
                    |
          configured services/plugins
```

Adapters sit at the boundary:

```text
HTTP / framework request
          |
      Environment adapter
          |
    operation invocation
          |
    Archeon runtime + plan
          |
     result / error mapping
```

## Boundaries

- **Core:** framework-neutral types, operation/module registration, application configuration, and the minimal planning/execution contracts.
- **Runtime:** executes the plan and coordinates the execution lifecycle.
- **Compiler/planner:** transforms registered definitions/configuration into a plan. Start with a small plan builder; do not build an elaborate IR before a concrete need exists.
- **Plugins/integrations:** provide optional capabilities through explicit contracts. Core must not hard-depend on Prisma, NextAuth, Zod, Redis, or Next.js.
- **Adapters:** connect framework-specific inputs/outputs such as Next.js requests and responses.
- **Client integrations:** React hooks or query-library integrations are optional packages, not part of the framework-neutral core.

## Design constraints

1. The primary abstraction is an **operation**, not CRUD.
2. Modules group operations; they do not imply a database schema.
3. Authentication, authorization, rate limiting, validation, persistence, and caching must have explicit boundaries.
4. A dispatcher/adapter should remain thin: parse/normalize the external request, invoke the configured runtime, map the result.
5. Keep the initial execution plan small and inspectable.
6. Add abstractions only when they support a demonstrated use case.
7. Error handling and lifecycle order must be specified before implementing complex middleware/pipeline behavior.

## Not yet decided

The following must be resolved in focused ADRs before implementation hardens them: exact operation input/output contract, sync/async behavior, error/result model, policy evaluation order, service resolution, plan shape, plugin lifecycle, and whether compiler/runtime are separate public packages.
