# ADR-0003: Modules group operations

- **Status:** Proposed
- **Date:** 2026-10-09

## Context

Applications need a way to organize and register related operations without coupling the framework to a database schema or transport.

## Proposal

A module is a named grouping of operations. Conceptually:

```ts
defineModule({
  name: "users",
  operations: {
    create: createUser,
    disable: disableUser,
  },
});
```

This is illustrative only; no public signature is frozen.

## Questions to resolve

- Are operation keys required to match operation names?
- How are duplicate module and operation identifiers handled?
- Can modules declare services or dependencies, or should those be registered separately?
- Are modules immutable after application creation?

## Consequences

Keep modules as organizational/registration units. Do not equate a module with a Prisma model or CRUD resource.
