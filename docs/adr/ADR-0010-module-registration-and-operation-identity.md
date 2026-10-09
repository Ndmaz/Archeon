# ADR-0010: Module registration and operation identity

- **Status:** Proposed
- **Date:** 2026-10-09

## Context

Archeon needs a predictable way to group operations and resolve them at runtime. Modules should organize capabilities without implying a database model, transport, or mandatory service container. Registration must reject ambiguous definitions rather than silently overwrite operations.

## Proposal

A module is a named grouping of operation definitions. An application registers modules, and the application-level registry resolves each operation by a stable operation name.

Illustrative shape only:

```ts
const userModule = defineModule({
  name: "users",
  operations: {
    create: createUser,
    disable: disableUser,
  },
});
```

The public signature and whether module keys compose operation names are not frozen by this proposal.

## Identity proposal

- Each operation has a stable, non-empty name.
- Runtime lookup uses the operation name, not a database model or HTTP route.
- Duplicate operation names across the final application registry are an error.
- Duplicate module names are an error unless a future, explicit composition mechanism defines otherwise.
- Registration must not silently replace an existing operation.
- The first implementation should prefer deterministic registration and clear errors over implicit override/merge behavior.

## Trade-offs

Rejecting duplicates may make plugin composition more explicit, but prevents order-dependent behavior and accidental replacement. A flat operation-name registry is simple to reason about; namespacing and module ownership can remain visible in the operation's name and module structure.

## Open questions

1. Must an operation name be globally qualified (for example, `users.create`) or can the module name and operation key compose it?
2. Should operation keys have to match the final segment of an operation name?
3. Are modules immutable after application construction?
4. How should a plugin contribute operations while respecting duplicate detection?
5. What name syntax and normalization rules should v0 enforce?

## Acceptance criteria

- Tests cover successful module registration and lookup.
- Duplicate module and operation names fail deterministically.
- Registration does not mutate or overwrite previously registered definitions.
- Registry behavior is framework-neutral and independent of persistence.

## Consequences

This proposal favors explicit identity and fail-fast duplicate detection. Exact naming syntax and module API remain open until the minimal TypeScript API is implemented and tested.
