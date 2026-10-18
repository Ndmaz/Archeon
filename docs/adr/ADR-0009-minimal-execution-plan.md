# ADR-0009: Minimal execution plan for v0

- **Status:** Accepted for v0
- **Date:** 2026-10-09

## Context

Archeon needs a visible boundary between operation definitions and runtime execution. An elaborate compiler or intermediate representation would be premature before a working operation can be registered and executed.

## Decision

For v0, application construction builds one in-memory execution plan per registered operation. The resulting application/runtime retains an immutable registry of these plans and resolves a plan by the operation's stable name when invoked.

The plan is an internal runtime-oriented representation. It is not a serialized artifact and is not initially a public extension point.

Illustrative shape only:

```ts
type ExecutionPlan<TInput, TOutput, TServices> = {
  readonly operationName: string;
  readonly parseInput?: (input: unknown) => TInput | Promise<TInput>;
  readonly execute: (args: {
    input: TInput;
    context: ExecutionContext<TServices>;
  }) => TOutput | Promise<TOutput>;
};
```

This is conceptual, not a frozen exported type. The actual implementation may retain an operation definition rather than copy its functions into the plan, if that proves simpler and preserves the same behavior.

## Responsibilities

### Definition and registration

- Validate that operation and module names are non-empty and well-formed.
- Reject duplicate operation names and duplicate module names.
- Avoid implicit replacement, merge, or override behavior.
- Keep registered definitions stable after application construction.

### Application construction / planning

- Validate registration and definition-level invariants before serving invocations.
- Build the per-operation plans once, not once per request.
- Fail application construction deterministically if the registry is invalid.
- Keep plans in memory and expose no serialization guarantee.

### Runtime

- Resolve a plan by operation name.
- Apply its optional parser to unknown input when one is configured.
- Invoke the handler with parsed input and explicit context.
- Return the handler's value and propagate parser/handler failures.
- Remain independent of HTTP, database, and validation-library implementations.

## Why build once?

Building once detects structural errors before invocation and avoids repeating plan construction for every call. The trade-off is that application configuration and operation definitions should be treated as immutable after construction; dynamic registration is outside v0.

## Trade-offs and non-goals

- **Benefits:** explicit definition → plan → runtime separation, deterministic setup, straightforward unit testing.
- **Costs:** plans contain function references and are not portable serialized artifacts; changing definitions requires rebuilding the application.
- **Not in v0:** compiler optimization, a general-purpose IR, multi-step workflows, plan serialization, dynamic hot registration, or a public compiler plugin API.

## Acceptance criteria

- A test demonstrates definition → application construction → plan lookup → execution.
- Invalid names and duplicates fail during registration/application construction.
- A plan is not rebuilt per invocation.
- Parser and handler errors propagate.
- The runtime remains framework-neutral.

## Consequences

The plan lifecycle and scope are accepted for v0. The precise internal type and whether the plan stores function references directly or retains the definition may be decided during implementation, provided the behavior above is preserved.
