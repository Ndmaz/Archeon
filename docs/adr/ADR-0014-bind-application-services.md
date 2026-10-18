# ADR-0014: Bind application services at construction

- **Status:** Accepted
- **Date:** 2026-10-09

## Context

The first runtime prototype accepted services as an argument to every `app.execute()` call. This made the same application instance capable of receiving a different dependency graph on every invocation. That can be useful for request-scoped dependencies, but it also weakens the meaning of an application instance and encourages repetitive call-site plumbing.

Archeon needs a small, understandable lifecycle before adapters are built around it.

## Decision

For v0, `createApplication()` receives both the registered modules and a service object:

```ts
const app = createApplication({
  modules: [usersModule],
  services,
});

const user = await app.execute("users.create", input);
```

The application binds that service object for its lifetime. Each operation receives it through `context.services`. The core does not create, dispose, or otherwise manage service instances.

The service type is inferred from the `services` value and checked against operation handler requirements as far as TypeScript's structural typing permits. Request-specific data (such as the authenticated principal, request metadata, or trace identifier) must not be smuggled into a mutable shared service object; it belongs in a future per-invocation context extension or adapter-specific request scope, which requires a separate design decision.

## Trade-offs

### Benefits

- Call sites are simpler: callers provide input, not the dependency graph.
- A constructed application has a clear and stable dependency configuration.
- Operations cannot accidentally receive a different service object from an individual caller.
- Adapters have a straightforward application entry point.

### Costs and limitations

- Request-scoped dependencies are not directly modeled by this v0 contract.
- The core does not manage service lifecycle or resource cleanup.
- Tests needing alternate dependencies construct another application instance.
- A mutable service object can still be mutated externally; binding a reference is not deep immutability.

## Consequences

- The public invocation form is `app.execute(operationName, input)`.
- Services are provided once in `createApplication({ modules, services })`.
- The application freezes its own public wrapper and registration metadata, but does not deep-freeze or clone service instances.
- Future request context support must be explicit and must not silently change the lifetime of `context.services`.

## Acceptance criteria

- The basic example constructs an application with services once.
- Tests prove operation execution uses the bound services.
- The public return type of `app.execute()` is inferred from the named operation's handler.
- Unknown operation names are rejected by TypeScript when the registered operation-name union is known, and still produce a runtime error for untyped/dynamic callers.
