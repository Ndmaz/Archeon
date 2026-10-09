# ADR-0011: Optional input parser contract

- **Status:** Proposed
- **Date:** 2026-10-09

## Context

An operation may need runtime validation of external or otherwise unknown input, but core must not depend on a specific validation library. The handler contract uses an inferred input type, so the parser boundary must connect unknown runtime values to that typed input without asking users to cast unsafely.

## Proposal

An operation may optionally provide a parser whose input is `unknown` and whose successful output determines the handler's input type.

Illustrative contract:

```ts
type InputParser<TInput> = {
  parse(input: unknown): TInput | Promise<TInput>;
};
```

The parser may be synchronous or asynchronous. The runtime awaits its result before calling the operation handler. If no parser is configured, the invocation input is passed through without runtime validation; adapters must not describe it as validated.

## Type inference goals

- With a parser configured, the handler's `input` type is inferred from the parser's output.
- Without a parser, the definition must require or infer an explicit input type in a way that does not silently claim untrusted input has been validated.
- The handler's return type determines the operation output type.
- Consumers should not need `any` or manual casts in ordinary usage.
- Parser libraries such as Zod can be adapted through a small wrapper; core must not import them.

## Failure behavior

- A parser may throw synchronously or reject asynchronously.
- Parser failures propagate to the runtime caller in v0.
- Core does not translate parser errors into HTTP responses.
- Whether the runtime wraps parser errors with operation metadata remains open; preserving the original error as `cause` would be required if wrapping is later adopted.

## Trade-offs

Supporting both synchronous and asynchronous parsing is flexible and easy to await uniformly, but type inference and error behavior need compile-time and runtime tests. Optional parsing reduces friction for trusted/internal use cases, but leaves the trust boundary responsible for validation when no parser exists.

## Acceptance criteria

- Compile-time tests prove input inference from synchronous and asynchronous parsers.
- A parser is called before the handler.
- A thrown parser error and rejected parser promise prevent handler execution and propagate to the caller.
- Operations without parsers are represented honestly in types and documentation.
- Core has no dependency on a schema library.

## Consequences

This proposal standardizes the parser's conceptual direction and failure propagation. The exact exported generic types and inference mechanics remain subject to a minimal TypeScript prototype.
