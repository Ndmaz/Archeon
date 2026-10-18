# @archeon/next

A thin Next.js App Router adapter for Archeon applications. It accepts standard Web `Request` objects and returns `Response` objects, keeping Next.js types out of `@archeon/core`.

> **Status:** pre-release 0.x software. The public API may change before 1.0.0.

## Install

```sh
npm install @archeon/core @archeon/next
```

## App Router example

```ts
// app/api/greet/route.ts
import { createNextHandler } from "@archeon/next";
import { app } from "@/archeon/app";

export const GET = createNextHandler(app, {
  operation: "greetings.say",
  getInput: (request) =>
    new URL(request.url).searchParams.get("name") ?? "world",
  getRequestContext: (request) => ({
    requestId: request.headers.get("x-request-id") ?? crypto.randomUUID(),
  }),
  onError: (error) => {
    if (error instanceof TypeError) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  },
});
```

The application must already register the `greetings.say` operation. The example assumes its operation input accepts a string.

## Handler contract

- `operation`: a registered operation name, checked against the application type.
- `getInput`: explicit mapping from the request to operation input.
- `getRequestContext`: optional mapping to the application's request-context type.
- `onError`: optional transport-boundary error mapper. Without one, errors produce a generic JSON 500.
- `successStatus`: optional successful response status; defaults to 200.

The adapter does not authenticate or authorize requests, infer request payloads, generate routes, or install validation, database, rate-limit, or middleware integrations automatically. Implement those policies in your application or through separate integrations.

See the [Next.js adapter guide](https://github.com/Ndmaz/Archeon/blob/main/docs/guides/next-adapter.md), [example application](https://github.com/Ndmaz/Archeon/tree/main/examples/next-app), and [repository](https://github.com/Ndmaz/Archeon).
