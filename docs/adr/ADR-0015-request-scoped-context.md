# ADR-0015: Separate request-scoped context from application services

- **Status:** Accepted
- **Date:** 2026-10-15

## Context

ADR-0014 binds application services once during `createApplication()`. The current execution context contains only `services`. This is intentionally stable, but a real request adapter needs to pass invocation-specific values such as an authenticated principal, request ID, locale, or tracing metadata.

Putting those values into the shared services object would blur lifetimes and can cause cross-request leakage if a mutable object is reused. Making the core depend on a framework request object would violate the framework-neutral boundary.

## Decision

For v0, keep application services application-scoped and add an explicit, optional, framework-neutral request context to each invocation.

The intended public shape is:

```ts
const result = await app.execute("users.create", input, {
  request: {
    principal,
    requestId,
  },
});
```

Handlers continue to receive one object:

```ts
execute: ({ input, context }) => {
  context.services.users.create(input);
  context.request.principal;
}
```

The contract is:

- `context.services` is the stable service object bound at application construction.
- `context.request` is the caller-provided value for this execution only.
- The request value is opaque to the core: no HTTP, Next.js, authentication-provider, or tracing-library types are imported.
- Request context is optional. Core-only calls that do not need it remain simple.
- The value is passed through, not cloned, deeply frozen, authenticated, or otherwise interpreted by core.
- An adapter is responsible for constructing request context and mapping framework objects into a small application-owned shape.
- Errors thrown by parsing or handlers continue to propagate unchanged; transport adapters may translate them at the boundary.

The TypeScript contract should allow an application to declare a request-context type and have that type flow to operation handlers and the third argument of `app.execute()`. Operations registered in one application share the same request-context contract. If an application does not declare one, the context should be safely typed as `unknown`, not `any`.

## Alternatives considered

### Put request data in services

Rejected. It mixes lifetimes and encourages mutable shared state, which can leak data across concurrent requests.

### Pass the raw framework request into every operation

Rejected. It couples the core to adapters and makes operation code harder to reuse in jobs, tests, CLIs, and other transports.

### Use ambient async-local state

Rejected for v0. It introduces implicit execution state and runtime-specific behavior when an explicit argument is sufficient.

### Add a generic middleware/pipeline system now

Rejected. Request context does not require a general middleware abstraction. An adapter can create the context and call `app.execute()`.

## Consequences

- Extend `ExecutionContext` with a `request` field.
- Extend `app.execute()` with an optional third argument carrying request context.
- Keep `services` bound at application construction and do not mutate it per request.
- Add tests for request context passthrough, absent context, and concurrent invocations receiving distinct context values.
- Add type tests proving request context is typed at the operation and execute call sites.
- Design the Next.js adapter to map request/session information into this context; do not expose `NextRequest` to the core.
- Do not add lifecycle hooks, middleware, async-local storage, or a generalized context bag beyond this contract in v0.

## Acceptance criteria

- Existing two-argument `app.execute(name, input)` calls continue to work.
- A supplied request context reaches only that invocation's operation call.
- `context.services` retains the same application-bound reference across invocations.
- The core imports no transport or authentication-specific types.
- Runtime and compile-time tests cover the contract before the Next.js adapter is merged.
