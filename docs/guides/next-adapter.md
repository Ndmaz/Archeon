# Next.js route-handler adapter

The `@archeon/next` package provides a small adapter for App Router route handlers. It uses the Web `Request` and `Response` interfaces, which Next.js route handlers already support, so the framework-neutral core does not import Next.js types.

## Example

```ts
// app/api/users/route.ts
import { createNextHandler } from "@archeon/next";
import { app } from "@/archeon/app";

export const POST = createNextHandler(app, {
  operation: "users.create",
  getInput: (request) => request.json(),
  getRequestContext: async (request) => ({
    requestId: request.headers.get("x-request-id") ?? crypto.randomUUID(),
    principal: await resolvePrincipal(request),
  }),
  onError: (error) => {
    if (error instanceof TypeError) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }
    // Avoid leaking internal exception details.
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  },
});
```

The example assumes `app` is constructed elsewhere and `resolvePrincipal` is your application's trusted authentication integration. Archeon does not authenticate requests automatically.

## Contract

- `operation` must be a registered operation name; TypeScript preserves the application's operation-name union.
- `getInput` explicitly maps the request body/query/route parameters to operation input. The adapter does not guess whether to parse JSON or coerce query strings.
- `getRequestContext` is optional and returns the context type declared by operations in the application.
- Success results are serialized as JSON with status 200 by default. Use `successStatus` to change the status.
- If `onError` is provided, it owns error-to-response mapping. Otherwise, the adapter returns a generic JSON 500 without exposing the error message.
- Parser and handler errors are caught only at this transport boundary; core still propagates them unchanged.
- The handler accepts a standard `Request` and returns a standard `Response`, and can be exported as a Next.js App Router method handler.

## Intentionally out of scope for v0

The adapter does not provide a global route registry, automatic CRUD endpoints, authentication policy, rate limiting, schema validation libraries, response envelopes, or a generalized middleware system. Those concerns should be explicit application choices or separate integrations.
