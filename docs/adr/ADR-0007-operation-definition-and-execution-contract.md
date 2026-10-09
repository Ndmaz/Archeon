# ADR-0007: Operation definition and execution contract

- **Status:** Proposed
- **Date:** 2026-10-09
- **Scope:** Public core API; implementation is not yet frozen

## Context

Archeon needs one framework-neutral primitive for application capabilities. The original project mixed transport parsing, authentication, rate limiting, persistence, and handler invocation inside a dispatcher. The operation contract must separate the capability's business behavior from its execution environment without introducing abstractions that v0 cannot justify.

## Proposal

An operation definition should expose four fundamental concepts:

1. **Identity:** a stable, unique operation name such as `users.create`.
2. **Input contract:** a typed input shape and, when configured, a runtime parsing/validation boundary.
3. **Execution behavior:** a handler whose return type determines the operation's output type.
4. **Execution context:** explicit access to application-provided services and invocation information.

The intended public helper is `defineOperation()`.

Illustrative shape only — not a frozen API:

```ts
const createUser = defineOperation({
  name: "users.create",
  input: userInputContract,
  execute: async ({ input, context }) => {
    return context.services.users.create(input);
  },
});
```

The example intentionally uses a generic input contract rather than importing a specific validation library. A future Zod integration could implement the contract without making Zod a core dependency.

## Design constraints

- Core must not import Next.js, React, Prisma, NextAuth, Zod, or a specific database/client.
- The operation handler's output type should be inferred from its implementation where practical.
- The context must be explicit, typed, and supplied by the application/runtime; avoid implicit global service access.
- Input supplied from an untrusted boundary must not be assumed valid merely because TypeScript types exist.
- Validation is optional at the core contract level, but the runtime/adapter must make the behavior of absent validation explicit.
- The operation definition should describe a capability, not assume HTTP, CRUD, or a particular persistence model.
- Asynchronous execution must be supported. Whether synchronous handlers are also accepted is an implementation detail to confirm with the initial type tests.
- Do not add policies, hooks, middleware, dependency-injection containers, or lifecycle pipelines to this contract until their ordering and failure semantics are defined.

## Open questions

1. Is operation identity a single string, or should module and operation keys compose it?
2. Is the input contract optional, and what is the exact framework-neutral parser interface?
3. Does the handler receive `input` and `context` in one object, or as positional arguments?
4. What is the minimum execution context: services only, or also identity, logger, request metadata, and cancellation?
5. Are errors thrown by handlers, returned as a result union, or both with a normalization boundary?
6. How do policies such as authorization run relative to input parsing and handler execution?
7. Can an operation be invoked directly, or must every invocation pass through a compiled plan?

## Acceptance criteria before marking accepted

- A concrete TypeScript signature demonstrates inference of input, context, and output.
- Tests cover valid input, invalid input (when a parser exists), asynchronous return values, and thrown errors.
- The contract works without framework or validation-library dependencies.
- One operation can be registered, planned, and executed end-to-end.
- The API is reviewed alongside the execution-context and error-model decisions.

## Consequences

This ADR records a proposal, not a stable public API. Keep the first implementation focused on operation → plan → runtime and use compile-time tests to validate the developer experience before adding more features.
