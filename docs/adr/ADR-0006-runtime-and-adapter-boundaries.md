# ADR-0006: Keep the runtime framework-neutral and adapters thin

- **Status:** Proposed
- **Date:** 2026-10-09

## Context

The original dispatcher mixed HTTP parsing, registry lookup, authentication, rate limiting, protected-field handling, Prisma context, handler invocation, and response mapping. Reusable execution logic should not depend on one transport.

## Proposal

The runtime should execute operations/plans without knowing about HTTP request/response objects. An adapter translates its environment into an invocation and maps the outcome back to that environment.

For a Next.js adapter:

```text
Next.js request
      |
  thin adapter
      |
 operation invocation
      |
 Archeon runtime
      |
 result/error
      |
 HTTP response
```

## Consequences

- Next.js-specific types stay outside framework-neutral core.
- Database clients and auth libraries are not implicit globals owned by the runtime.
- Error mapping, authorization, validation, and rate-limit order must be specified explicitly; they should not be silently inherited from the original dispatcher.
- The exact separation between “runtime” and “executor” remains open until the minimal implementation is designed.
