# Getting started

Archeon is an early 0.x operation runtime for TypeScript applications. The core and minimal Next.js adapter are implemented, but the public API is not yet stable and the packages have not been published. This guide uses the workspace packages as they exist in the repository.

## 1. Define services

Services are ordinary application-owned dependencies. Archeon does not create or manage their lifecycle.

```ts
type Services = {
  users: {
    create(input: { email: string }): Promise<{ id: string; email: string }>;
  };
};

const services: Services = {
  users: {
    async create(input) {
      return { id: crypto.randomUUID(), email: input.email };
    },
  },
};
```

## 2. Define an operation and module

```ts
import { defineModule, defineOperation, createApplication } from "@archeon/core";

type RequestContext = {
  requestId: string;
  principal: { id: string } | null;
};

const createUser = defineOperation<Services, RequestContext>()({
  name: "users.create",
  execute: ({ input, context }) => {
    if (
      typeof input !== "object" ||
      input === null ||
      !("email" in input) ||
      typeof input.email !== "string"
    ) {
      throw new TypeError("Expected an object with a string email");
    }

    return context.services.users.create({ email: input.email });
  },
});

const usersModule = defineModule({
  name: "users",
  operations: { create: createUser },
});

const app = createApplication({
  modules: [usersModule],
  services,
});
```

This example performs an explicit runtime check in the handler. For reusable parsing, an operation can instead declare an `input: { parse(value: unknown) { ... } }` parser. The parser is optional and must return the typed value the handler expects; TypeScript annotations alone do not validate external input.

## 3. Execute the operation

```ts
const user = await app.execute(
  "users.create",
  { email: "person@example.com" },
  {
    request: {
      requestId: "req-123",
      principal: { id: "user-42" },
    },
  },
);
```

Application services are bound at construction. Request context is optional and per invocation. If you do not need request data, call `app.execute("users.create", input)`.

Core propagates parser and handler errors unchanged. Decide how to handle errors at the boundary where the operation is called.

## 4. Use the Next.js adapter

The `@archeon/next` package exports `createNextHandler` for App Router route handlers:

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
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  },
});
```

This assumes `resolvePrincipal` is your application's trusted authentication integration. Archeon does not authenticate or authorize requests automatically. See the [Next.js adapter guide](next-adapter.md) for the full contract.

## Current limitations

- APIs are pre-release and may change.
- Archeon does not supply authentication, authorization, database access, rate limiting, or a validation library.
- The core does not manage service lifecycles.
- The Next.js adapter uses explicit input mapping and error mapping; it does not generate routes from modules.
