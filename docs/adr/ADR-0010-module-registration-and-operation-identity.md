# ADR-0010: Module registration and operation identity

- **Status:** Accepted for v0
- **Date:** 2026-10-09

## Context

Archeon needs a predictable way to group operations and resolve them at runtime. Modules organize capabilities without implying a database model, transport, or mandatory service container. Registration must reject ambiguous definitions rather than silently overwrite operations.

## Decision

A module is a named grouping of operation definitions. Each operation declares its own globally unique name. Module names organize operations but do not automatically create, rewrite, or prefix operation identity.

Illustrative shape only:

```ts
const createUser = defineOperation({
  name: "users.create",
  execute: async ({ input, context }) => {
    return context.services.users.create(input);
  },
});

const userModule = defineModule({
  name: "user-management",
  operations: {
    create: createUser,
  },
});
```

The operation name and module name intentionally serve different purposes:
- `users.create` is the stable runtime lookup identity.
- `user-management` is an organizational registration unit.
- The object key `create` is a local label inside the module; it does not override the operation's declared name.

The exact exported function signature remains subject to type tests, but these identity semantics are accepted for v0.

## Naming rules

- Operation names are non-empty, globally unique, dot-separated identifiers such as `users.create` or `payments.verify`.
- Each segment uses lowercase letters and digits, with internal hyphens permitted; segments cannot be empty.
- Module names are non-empty lowercase slugs; internal hyphens are permitted.
- Names are compared exactly. The registry does not silently lowercase, trim, or otherwise normalize an identifier.
- Duplicate operation names across any modules are errors.
- Duplicate module names are errors.
- An operation may be grouped in a module, but module membership does not alter the operation's name.
- Registration never silently replaces an existing module or operation.

## Why not compose operation names from module keys?

Deriving identity from module name and object key can be ergonomic, but it makes identity dependent on where an operation is registered. The same operation could acquire a different runtime identity if moved between modules. Explicit operation names preserve stable identity and allow modules to be organizational rather than semantic namespaces.

The trade-off is some redundancy and the need to choose a name when defining an operation. We accept that clarity for v0.

## Registration behavior

- Modules and operation definitions are validated before application execution begins.
- Registration is deterministic and rejects conflicts rather than merging or overriding.
- The application registry is treated as immutable after construction in v0.
- Dynamic registration and hot replacement are out of scope.

## Acceptance criteria

- Tests cover valid names, invalid names, duplicate operation names across modules, and duplicate module names.
- Moving an operation between modules does not change its declared runtime identity.
- Registration does not mutate or overwrite previously registered definitions.
- Registry behavior is framework-neutral and independent of persistence.

## Consequences

Operation identity is explicit and globally unique; modules are organizational groupings. This choice avoids implicit namespace and override behavior in the first implementation.
