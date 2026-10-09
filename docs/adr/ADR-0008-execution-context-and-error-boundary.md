# ADR-0008: Execution context and error boundary

- **Status:** Proposed
- **Date:** 2026-10-09
- **Scope:** Framework-neutral execution semantics

## Context

Operations need access to application dependencies and invocation information. Archeon also needs predictable error behavior across direct execution and adapters such as Next.js. The original dispatcher coupled context construction and HTTP status mapping to one framework and authentication setup.

## Proposal: explicit execution context

The runtime supplies an explicit context to an operation handler. The context should be generic over application-provided services so applications can type their own capabilities without Archeon owning a dependency-injection container.

Illustrative shape only:

```ts
type ExecutionContext<TServices> = {
  services: TServices;
  // Other fields are intentionally undecided.
};
```

Core should not assume a particular shape for authentication identity, database clients, request objects, or loggers. If the runtime needs standard metadata (for example, an invocation ID or cancellation signal), it must be added deliberately with defined semantics.

## Proposal: error boundary

- Operation handlers may throw or reject; the runtime must not silently swallow these failures.
- The core execution boundary should preserve the original error for programmatic callers or normalize it into a documented framework-neutral error/result contract.
- Transport adapters map execution outcomes to transport-specific representations. HTTP status codes must not leak into core.
- Do not expose internal exception messages to untrusted clients by default; adapters/applications choose a safe public error representation.
- Error normalization must preserve enough information for diagnostics without forcing a logging vendor or observability package into core.

## Questions to resolve

1. Should core expose a discriminated result union, throw errors, or support both through a single documented boundary?
2. Which errors are framework-level (unknown operation, invalid input, policy denial) versus application-defined?
3. What stable error codes, if any, should exist in v0?
4. Does context contain only application-provided services, or also standard invocation metadata?
5. How should cancellation and deadlines propagate?
6. Should authorization/policy failures be represented by a core error type or supplied by an integration?

## Constraints

- Do not map errors to HTTP status codes in core.
- Do not require a logger, tracing system, database, or auth provider.
- Avoid building a general dependency-injection container without a concrete need.
- Define policy/lifecycle ordering before implementing middleware or a pipeline.

## Acceptance criteria before marking accepted

- Type tests prove that service types flow into operation handlers without casts.
- Unit tests cover successful execution, synchronous throws, asynchronous rejection, and unknown operation behavior.
- The adapter can map failures to its own response model without changing core.
- The chosen error contract is documented and demonstrated in the minimal end-to-end example.

## Consequences

This ADR establishes explicit context and a transport-neutral error boundary as design goals. Exact fields and error types remain open until the minimal runtime prototype is tested.
