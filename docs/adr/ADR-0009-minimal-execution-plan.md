# ADR-0009: Minimal execution plan for v0

- **Status:** Proposed
- **Date:** 2026-10-09

## Context

Archeon is intended to make the path from operation definitions to execution explicit. However, an elaborate compiler or intermediate representation would be premature before a working operation can be registered and executed.

## Proposal

For v0, the planner should compile a registered operation definition into a small in-memory execution plan. It should normalize and validate the definition/registration requirements and provide the runtime with the references it needs to execute the operation.

Conceptual shape only:

```ts
type ExecutionPlan<TInput, TOutput, TServices> = {
  operationName: string;
  parseInput?: (input: unknown) => TInput | Promise<TInput>;
  execute: (args: {
    input: TInput;
    context: ExecutionContext<TServices>;
  }) => TOutput | Promise<TOutput>;
};
```

This is illustrative, not a final public type. The plan should not duplicate business logic, serialize functions, or invent generic pipeline stages without a concrete requirement.

## Responsibilities

### Planner/compiler

- Accept registered operation definitions and relevant application configuration.
- Reject invalid or conflicting definitions before execution where possible.
- Produce a stable, inspectable in-memory plan.
- Avoid runtime-specific transport details.

### Runtime

- Resolve the requested operation plan.
- Apply the optional input parser when present.
- Invoke the handler with the parsed input and explicit context.
- Return the successful value.
- Propagate handler/parser failures according to the accepted error contract.

The precise ordering of policies and any future lifecycle stages is outside this minimal plan until those stages are specified.

## Trade-offs

- **Benefits:** a visible definition → plan → execution boundary; a small implementation surface; easy unit testing.
- **Costs:** an in-memory plan containing function references is not a portable serialized artifact; the initial compiler does little optimization; some validation necessarily remains at invocation time.
- **Accepted constraint:** v0 optimizes for clarity and correctness, not compiler sophistication.

## Questions to resolve

1. Is the plan created once when an application is built, or lazily on first invocation?
2. Does a plan exist per operation, with runtime lookup by name, or is a selected operation compiled for each invocation?
3. Which checks belong at definition time, module-registration time, and application-build time?
4. Should plans be exposed publicly for inspection or remain an internal runtime contract?
5. What immutability guarantees are required?

## Acceptance criteria

- A test demonstrates an operation definition being compiled into a plan and executed.
- Invalid operation definitions fail deterministically.
- The runtime has no dependency on HTTP, a database, or a schema library.
- The plan is minimal and contains only fields required by the first end-to-end use case.

## Consequences

Keep the compiler/planner as a small normalization and validation boundary for v0. Revisit IR, optimization, multi-step plans, and plan serialization only when a real use case requires them.
