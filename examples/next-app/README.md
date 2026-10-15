# Archeon + Next.js App Router example

A minimal Next.js App Router application that runs an Archeon operation through @archeon/next.

## Prerequisites

- Node.js 20 or newer
- npm

After @archeon/core and @archeon/next are published, install dependencies and run:

```sh
cd examples/next-app
npm install
npm run dev
```

Open http://localhost:3000 and request /api/greet?name=Archeon. The endpoint returns a JSON greeting and request ID.

## Structure

- archeon/app.ts defines a typed operation, module, and application.
- app/api/greet/route.ts maps the Web request to operation input and request context.
- app/page.tsx links to the endpoint.

Authentication, authorization, persistence, and validation-library integrations are intentionally out of scope. The operation parser is framework-neutral and does not replace application-specific security policy.
