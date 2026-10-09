# Architecture overview

## Status and scope

This is Archeon’s accepted v0 architecture direction. ADRs define the decisions and their remaining implementation-level questions. The repository should not implement every future concept in advance; the first goal is one small, tested vertical slice.

## Intended model

```text
defineOperation()
      |
      v
define/register modules
      |
      v
application construction
  - validate identities
  - reject duplicates
  - build one in-memory plan per operation
      |
      v
runtime invocation by operation name
  - optional input parsing
  - execute({ input, context })
  - return value or propagate failure
```

Adapters sit at the boundary:

```text
HTTP / framework request
          |
      environment adapter
          |
    operation invocation
          |
    Archeon runtime + plan
          |
     result / error mapping
```

## Core decisions

- **Operation identity:** each operation declares a stable, globally unique name such as `users.create`. Module membership does not change that name.
- **Modules:** organizational groups of operations; they do not imply a database model or transport.
- **Registration:** duplicate operation names and duplicate module names fail deterministically. No silent override or merge behavior.
- **Plan lifecycle:** build one in-memory plan per registered operation during application construction. Resolve plans by operation name at invocation time. Dynamic registration and serialized plans are out of scope for v0.
- **Handler signature:** handlers receive `{ input, context }` as one object.
- **Input validation:** an optional, framework-neutral parser may turn unknown input into typed input. TypeScript types alone are not runtime validation.
- **Errors:** handlers may throw or reject; core propagates failures. Adapters catch failures at external boundaries and map them to safe transport-specific responses.
- **Execution context:** explicit and typed, initially centered on application-provided services.
- **Dependencies:** core remains independent of Next.js, React, Prisma, NextAuth, Zod, and database drivers.

## Boundaries

- **Core:** operation/module definitions, registration, application construction, and minimal type contracts.
- **Planner/compiler:** validates and normalizes definitions into small plans. No optimization-heavy compiler or general-purpose IR in v0.
- **Runtime:** resolves plans, parses input when configured, invokes handlers, and propagates outcomes.
- **Adapters:** translate transport inputs and outputs without moving HTTP semantics into core.
- **Integrations:** use explicit contracts or application-provided services; do not make specific third-party tools core dependencies.
- **Client integrations:** optional; React hooks and query-library integration are not required for the first vertical slice.

## Still to specify before implementation hardens

- Exact TypeScript inference and parser contract.
- Framework-level errors and parser-failure semantics.
- Minimum module/application builder API.
- Minimum package layout and exports.
- Whether the first vertical slice needs any plugin contract at all.

## Design principle

Every abstraction must justify its existence. Implement operation → application construction → plan → runtime first, and let tested use cases earn additional layers.
