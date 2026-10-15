# Execution context and services

Archeon separates application-scoped dependencies from invocation-scoped request data.

## Application services

Services are provided once when the application is constructed:

```ts
const app = createApplication({
  modules: [usersModule],
  services,
});
```

Handlers access them through `context.services`. Archeon does not create, dispose, or deep-freeze these service instances. Keep them suitable for the lifetime of the application.

## Per-invocation request context

Use the second type parameter to `defineOperation` to describe request data that an operation expects:

```ts
type RequestContext = {
  requestId: string;
  principal: { id: string } | null;
};

const createUser = defineOperation<Services, RequestContext>()({
  name: "users.create",
  execute: ({ input, context }) => {
    const requestId = context.request?.requestId;
    const principal = context.request?.principal;
    return context.services.users.create(input);
  },
});
```

Pass request-specific data as the third argument to `app.execute()`:

```ts
await app.execute("users.create", input, {
  request: {
    requestId: "req-123",
    principal: { id: "user-42" },
  },
});
```

The third argument is optional. If omitted, `context.request` is `undefined`. Its declared type comes from the request-context types used by operations registered in the application.

## Lifetime and boundaries

- `context.services` references the services object bound at application construction.
- `context.request` belongs to one invocation; do not store it in shared mutable services.
- The core treats request context as opaque data. It does not authenticate the principal, parse HTTP requests, create request IDs, or import framework types.
- A transport adapter should translate transport-specific information into this application-owned shape.
- Parser and handler errors still propagate unchanged through core. A transport adapter may map them to protocol responses at its boundary.

## Safety note

Request context is not proof of authentication or authorization. Adapters and application policy code must establish trust before putting an authenticated principal in the context. Never treat arbitrary client-supplied fields as a trusted principal.
