# ADR-0002: Operation as the public primitive

- **Status:** Accepted as vocabulary; API details remain open
- **Date:** 2026-10-09

## Context

The project began with CRUD handlers and action dispatching. The abstraction has broadened to include named application capabilities with contracts, policies, dependencies, and execution behavior.

## Decision

Use **operation** as the public conceptual primitive and `defineOperation()` as the intended definition helper. An operation represents a meaningful capability an application exposes, such as `users.create`, `orders.checkout`, or `payments.verify`.

“Action” may describe an internal execution step if that distinction proves useful, but it is not the preferred public primitive.

## Consequences

- Public APIs and docs should say “operation” consistently.
- The exact function signature, input/output typing, metadata, and error semantics are not decided by this ADR.
- Do not assume that every operation must be an HTTP endpoint or CRUD action.
