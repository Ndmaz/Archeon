# Operations and modules

## Operation

An operation is a named application capability. Its stable name identifies it independently of the module key used to organize it.

```ts
const createUser = defineOperation<Services>()({
  name: "users.create",
  execute: ({ input, context }) => context.services.users.create(input),
});
```

The handler receives one argument object containing:

- `input`: the value supplied by the caller, or the value returned by the optional parser;
- `context.services`: the application-scoped services object;
- `context.request`: optional per-invocation request context.

The name is globally unique within an application. Current names use lowercase letters and digits separated by dots or hyphens, without leading, trailing, or repeated separators. Duplicate operation names fail during application construction.

## Input parsing

An operation may define a framework-neutral parser:

```ts
const createUser = defineOperation<Services>()({
  name: "users.create",
  input: {
    parse(value: unknown) {
      if (
        typeof value !== "object" ||
        value === null ||
        !("email" in value) ||
        typeof value.email !== "string"
      ) {
        throw new TypeError("Expected a string email");
      }
      return { email: value.email };
    },
  },
  execute: ({ input, context }) => context.services.users.create(input),
});
```

The parser may be synchronous or asynchronous and receives `unknown`. Its return type determines the handler's input type. Archeon does not ship a schema library or assume coercion rules. A Zod or other validation integration may be considered separately, but is not currently part of the core.

When no parser is configured, the handler input is typed as `unknown`. This is intentional: the core must not pretend that unvalidated external data is safe.

## Module

A module groups related operations for organization:

```ts
const usersModule = defineModule({
  name: "users",
  operations: {
    create: createUser,
    // find: findUser,
  },
});
```

The object keys are organizational labels, not operation identities. In the example, the key `create` happens to match the final segment of `users.create`, but this is not required.

Modules do not imply database models, HTTP routes, authorization policy, or automatic CRUD behavior. A module name is a lowercase slug. Duplicate module names fail during application construction.

## Application and execution

```ts
const app = createApplication({
  modules: [usersModule],
  services,
});

const user = await app.execute("users.create", {
  email: "person@example.com",
});
```

The application validates registration, builds one in-memory execution plan per operation, and resolves the plan by stable operation name. The services object is bound once at construction. Request-specific values are passed separately through the optional third argument:

```ts
await app.execute("users.create", input, {
  request: { requestId: "req-123", principal: null },
});
```

All operations registered in one application share a request-context contract inferred from their definitions. Keep that shape consistent across the application.

## Error behavior

Registration and lookup failures use Archeon error classes with stable `code` values. Input parser and handler errors are not automatically translated by core: they reject the execution call unchanged. A transport adapter may map errors to a response, but that mapping is an application decision.

## Design boundaries

- Use operation names for stable identity; use modules for grouping.
- Keep application services stable and request data invocation-scoped.
- Keep HTTP, authentication libraries, schema libraries, and database drivers outside core.
- Prefer an explicit parser and explicit adapter mapping over implicit conventions.
- Do not add a general middleware or plugin abstraction until a concrete use case requires it.
