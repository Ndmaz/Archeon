# ADR-0016: Keep the Next.js adapter thin and explicit

- **Status:** Accepted
- **Date:** 2026-10-15

## Context

The core now supports typed, per-invocation request context. The first adapter should prove that Archeon can be called from a Next.js App Router route without pulling HTTP concerns into core or guessing application-specific input, authentication, or error semantics.

## Decision

The `@archeon/next` package exports `createNextHandler(app, options)`. It accepts and returns standard Web API types: `Request` and `Response`. Next.js App Router handlers support these types, so the adapter does not need to import `NextRequest` or depend on Next.js internals.

The options are explicit:

- `operation`: a registered operation name, constrained by the application's inferred operation-name union.
- `getInput(request)`: required; maps the incoming request to the operation input. The adapter does not guess between JSON, query parameters, path parameters, or coercion rules.
- `getRequestContext(request)`: optional; maps request-specific data to the request-context type declared by the application's operations.
- `successStatus`: optional success status, defaulting to 200.
- `onError(error, request)`: optional transport error mapper. If omitted, unhandled errors return a generic JSON 500 without leaking the thrown message.

## Alternatives considered

### Automatic JSON/query parsing

Rejected for v0. Automatic parsing creates ambiguity around GET/POST semantics, coercion, body shape, and route parameters. Callers should state how a route maps to an operation.

### Automatic Archeon error-to-HTTP mapping

Deferred. The initial core error surface covers registration and lookup, not a complete application-domain error taxonomy. Applications should supply an explicit mapper until a stable error taxonomy exists.

### Import Next.js-specific request/response types

Rejected. The Web Request/Response contract is sufficient for route handlers and keeps adapter typing smaller. A future demonstrated Next-specific need can justify a narrower integration.

### Dynamic operation dispatch from route segments

Deferred. A universal `/[module]/[operation]` endpoint would expose a broad dispatch surface and force authorization, input, and HTTP policy decisions that belong to applications.

## Consequences

- The adapter has no Next.js runtime dependency; it is designed for Next.js App Router route handlers through Web APIs.
- Input parsing, request-context construction, and error mapping remain explicit.
- Core continues to propagate errors unchanged; the adapter catches them only at the HTTP boundary.
- The adapter does not add authentication, authorization, rate limiting, automatic CRUD routes, response envelopes, or middleware.
- CI builds and type-checks both packages and tests adapter behavior using standard `Request` and `Response` objects.

## Acceptance criteria

- The operation name and request-context return type are checked by TypeScript.
- Tests cover successful JSON responses, request-context wiring, default 500 behavior, custom error mapping, and omitted request context.
- The core package remains free of Next.js imports.
