# ADR-0012: Application construction and runtime errors

- **Status:** Proposed
- **Date:** 2026-10-09

## Context

Archeon needs to distinguish invalid application configuration from failures that occur while executing an operation. Duplicate names and malformed definitions should be caught before serving invocations, while handler failures should preserve ordinary throw/reject semantics.

## Proposal

Application construction validates static structure and creates the runtime-ready registry/plans. Failures that can be determined from definitions should be raised during construction, not deferred until the first invocation.

Initial error categories to consider:

- Invalid operation or module name.
- Duplicate operation or module name.
- Invalid operation definition.
- Unknown operation requested at invocation time.

Operation-handler and input-parser failures are application/runtime execution failures and propagate as defined in ADR-0008 and ADR-0011.

These are conceptual categories, not a commitment to one exported error class per category. The implementation should use the smallest useful stable error surface.

## Boundary rules

- Application-construction errors must identify the invalid definition or conflicting name clearly for developers.
- Runtime lookup of an unknown operation should fail deterministically with a documented core error.
- Handler and parser errors should not be silently swallowed or converted into HTTP errors by core.
- Adapters may map core errors to transport-specific status codes and safe public messages.
- Internal exception messages must not be returned to untrusted clients by default.

## Trade-offs

Failing early makes application startup/build more predictable but means applications cannot rely on dynamic operation registration in v0. A small set of framework errors improves testability; too many specialized error classes would freeze unnecessary API surface before real integrations exist.

## Acceptance criteria

- Invalid and duplicate definitions fail during application construction.
- Unknown operation lookup fails deterministically.
- Handler exceptions and parser failures propagate.
- Tests verify core behavior independently of an HTTP adapter.
- The implementation documents which errors are stable public API versus internal diagnostics.

## Consequences

This proposal favors early structural validation and a small explicit error surface. The exact class names, error codes, and whether all categories share a common base remain open until implementation tests demonstrate the need.
