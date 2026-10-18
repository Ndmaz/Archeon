# @archeon/core

Framework-neutral operation runtime for TypeScript applications.

> **Status:** pre-release 0.x software. The public API may change before 1.0.0.

## Install

```sh
npm install @archeon/core
```

## Quick start

```ts
import { createApplication, defineModule, defineOperation } from "@archeon/core";

type Services = {
  greetings: { say(name: string): string };
};

const greet = defineOperation<Services>()({
  name: "greetings.say",
  input: {
    parse(value: unknown) {
      if (typeof value !== "string") throw new TypeError("Expected a string");
      return value;
    },
  },
  execute: ({ input, context }) => context.services.greetings.say(input),
});

const app = createApplication({
  modules: [defineModule({ name: "greetings", operations: { greet } })],
  services: { greetings: { say: (name) => `Hello, ${name}!` } },
});

const result = await app.execute("greetings.say", "Archeon");
console.log(result);
```

## Core principles

- Operations have stable names and explicit execution contracts.
- Input parsing is optional and uses a framework-neutral `parse(unknown)` contract.
- Application services are provided by the application.
- Per-invocation request context is passed separately from services.
- Parser and handler errors propagate from core; map them at the transport boundary.
- Core does not provide authentication, authorization, database access, rate limiting, or a validation library.

See the [repository](https://github.com/Ndmaz/Archeon), [getting started guide](https://github.com/Ndmaz/Archeon/blob/main/docs/guides/getting-started.md), and [architecture decisions](https://github.com/Ndmaz/Archeon/tree/main/docs/adr).
