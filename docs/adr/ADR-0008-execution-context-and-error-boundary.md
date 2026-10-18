# ADR-0008: Execution context and error boundary

- **Status:** Accepted for v0
- **Date:** 2026-10-09

## Context

Operations need access to application dependencies and invocation information. Archeon also needs predictable error behavior across direct execution and adapters such as Next.js. The original dispatcher coupled context construction and HTTP status mapping to one framework and authentication setup.

## Decision: explicit execution context

The runtime supplies an explicit context to an operation handler through the agreed object argument:

```ts
execute({ input, context })
```

The context should be generic over application-provided services so consumers can type their own capabilities without Archeon owning a dependency-injection container.

Illustrative shape only:

```ts
type ExecutionContext<TServices> = {
  services: TServices;
};
```

This is the minimum conceptual starting point, not a final public type. Core must not assume a particular database client, identity model, request object, or logging vendor. Standard invocation metadata may be added only when a concrete need and its semantics are established.

## Decision: errors throw/reject and propagate

For v0, operation handlers may throw or reject, and the runtime propagates those failures rather than silently swallowing them or requiring every handler to return a result union.

Reasons:
- It preserves ordinary TypeScript and JavaScript async control flow.
- Successful handlers can return their natural output type without wrapping every value.
- It avoids imposing a result-wrapper convention on application business logic.

Trade-offs:
- Callers that need to branch on failure must use `try/catch`.
- Adapters need a defined boundary where failures are caught and mapped to their own error representation.
- Uncaught failures must not become accidental information leaks at external boundaries.

The core runtime must not map errors to HTTP status codes. A framework adapter or application boundary may catch propagated failures and map them to transport-specific responses. Public responses should not expose internal exception messages by default.

## Error behavior requirements

- A successful execution returns the handler's value.
- A synchronous throw or rejected promise propagates to the caller.
- Parser/validation failures propagate according to the parser contract; their precise stable error representation remains to be specified.
- Framework-level errors such as an unknown operation need documented semantics, but do not require a global result-union design.
- Core should preserve the original error for programmatic callers unless a documented framework-level error is raised.
- Logging and observability are not mandatory core dependencies.

## Constraints

- Do not map errors to HTTP status codes in core.
- Do not require a logger, tracing system, database, or auth provider.
- Avoid building a general dependency-injection container without a demonstrated need.
- Define policy/lifecycle ordering before implementing middleware or a pipeline.

## Still open

- Which stable framework-level error classes/codes are necessary in v0.
- Whether parser errors are propagated unchanged or wrapped with operation context.
- Which invocation metadata, if any, belongs in context.
- How cancellation and deadlines propagate.
- How authorization/policy denials are represented by integrations.

## Acceptance criteria

- Type tests prove service types flow into handlers without casts.
- Unit tests cover successful execution, synchronous throws, async rejection, and unknown operation behavior.
- Adapters can map failures to their response model without changing core.
- The error contract is demonstrated in the minimal end-to-end example.

## Consequences

Explicit context and throw/reject propagation are accepted for v0. Exact context fields and stable framework-level error types remain open and must be resolved before implementation hardens them.
