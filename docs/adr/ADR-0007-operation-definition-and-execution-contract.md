# ADR-0007: Operation definition and execution contract

- **Status:** Accepted for v0
- **Date:** 2026-10-09

## Context

Archeon needs one framework-neutral primitive for application capabilities. The original project mixed transport parsing, authentication, rate limiting, persistence, and handler invocation inside a dispatcher. The operation contract must separate business behavior from its execution environment without introducing abstractions that v0 cannot justify.

## Decision

The public conceptual primitive is an operation, defined through `defineOperation()`. An operation has a stable identity, an optional input parser contract, execution behavior, and an explicit execution context.

The handler receives a single object argument:

```ts
defineOperation({
  name: "users.create",
  input: userInputParser,
  execute: async ({ input, context }) => {
    return context.services.users.create(input);
  },
});
```

This is an illustrative shape that records the agreed design decisions; the exact exported TypeScript signature must still be validated by implementation and type tests.

### Handler arguments: one object

The handler receives `{ input, context }`, rather than positional arguments.

Reasons:
- It gives each value a meaningful name at the call site.
- It can be extended with carefully justified metadata later without changing the positional argument order.
- It keeps handler signatures readable as the execution contract grows.

Trade-off: it introduces a small wrapper object and a slightly more verbose call shape. We accept this for clarity and extensibility.

### Input validation: optional, framework-neutral parser

An operation may declare a parser that accepts unknown input and produces a typed, trusted input value. Core must not depend on a particular schema library.

Conceptual contract:

```ts
type InputParser<TInput> = {
  parse(input: unknown): TInput | Promise<TInput>;
};
```

This snippet is illustrative; exact sync/async and error typing are implementation questions. An integration may adapt Zod or another validator to this boundary.

If no parser is declared, the runtime must not pretend that untrusted data has been validated. The invocation API must communicate its input expectations clearly, and adapters are responsible for deciding how external data enters the runtime.

Reasons:
- Applications can choose their validation technology.
- Operations that do not need structured input are not forced to define a schema.
- Runtime validation remains possible at trust boundaries.

Trade-off: optional validation means safety cannot be inferred from TypeScript types alone. Documentation and adapters must distinguish compile-time typing from runtime validation.

### Execution behavior

The handler's returned value determines its output type. Async handlers are supported. The minimal runtime should not impose HTTP or CRUD semantics on operations.

## Constraints

- Core must not import Next.js, React, Prisma, NextAuth, Zod, or a specific database/client.
- Context is explicit and supplied by the application/runtime.
- Runtime input from an untrusted boundary must not be considered validated solely because of TypeScript annotations.
- Do not add policies, hooks, middleware, dependency-injection containers, or lifecycle pipelines to this contract until their ordering and failure semantics are defined.
- A handler should be testable without a framework adapter.

## Still open

- Exact operation-name syntax and duplicate-name behavior.
- Whether handlers may be synchronous as well as asynchronous (the runtime must support async).
- Exact parser result and error types.
- Minimum execution-context fields and service typing.
- Policy ordering and the relationship between direct invocation and compiled plans.
- Whether parser execution happens before or as part of runtime plan execution.

## Acceptance criteria

- Type tests prove inference of input, context, and output.
- Tests cover parsed input, parser failure, async return values, and handler failures.
- The contract works without framework or validation-library dependencies.
- A registered operation can be planned and executed end-to-end.

## Consequences

The argument style and optional parser boundary are accepted for v0. Exact TypeScript signatures remain subject to implementation and compile-time tests; this ADR does not freeze unrelated runtime or policy features.
