import { describe, expect, it, vi } from "vitest";
import { createApplication, defineModule, defineOperation } from "@archeon/core";
import { createNextHandler } from "./index.js";

type Services = {
  users: { create(input: { email: string }): Promise<{ id: string; email: string }> };
};
type RequestContext = { requestId: string; principal: { id: string } | null };

function makeApp() {
  const create = defineOperation<Services, RequestContext>()({
    name: "users.create",
    execute: ({ input, context }) => {
      if (typeof input !== "object" || input === null || !("email" in input) || typeof input.email !== "string") {
        throw new TypeError("invalid email input");
      }
      return context.services.users.create({ email: input.email });
    },
  });
  return createApplication({
    modules: [defineModule({ name: "users", operations: { create } })],
    services: {
      users: { create: async (input) => ({ id: "u-1", email: input.email }) },
    } satisfies Services,
  });
}

describe("@archeon/next", () => {
  it("maps a Request into input and request context and returns JSON", async () => {
    const app = makeApp();
    const handler = createNextHandler(app, {
      operation: "users.create",
      getInput: async (request) => request.json(),
      getRequestContext: (request) => ({
        requestId: request.headers.get("x-request-id") ?? "missing",
        principal: { id: "user-1" },
      }),
    });

    const response = await handler(new Request("https://example.test/api/users", {
      method: "POST",
      headers: { "content-type": "application/json", "x-request-id": "req-1" },
      body: JSON.stringify({ email: "person@example.com" }),
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ id: "u-1", email: "person@example.com" });
  });

  it("returns a generic 500 and does not leak an unhandled error message", async () => {
    const app = makeApp();
    const handler = createNextHandler(app, {
      operation: "users.create",
      getInput: () => { throw new Error("private database detail"); },
    });

    const response = await handler(new Request("https://example.test/api/users"));
    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Internal Server Error" });
  });

  it("delegates error mapping to the adapter caller", async () => {
    const app = makeApp();
    const onError = vi.fn((_error: unknown) => Response.json({ error: "Invalid input" }, { status: 400 }));
    const handler = createNextHandler(app, {
      operation: "users.create",
      getInput: () => { throw new TypeError("bad input"); },
      onError,
    });

    const response = await handler(new Request("https://example.test/api/users"));
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Invalid input" });
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("keeps request-context resolution optional", async () => {
    const app = makeApp();
    const handler = createNextHandler(app, {
      operation: "users.create",
      getInput: () => ({ email: "without-context@example.com" }),
    });

    const response = await handler(new Request("https://example.test/api/users"));
    expect(response.status).toBe(200);
  });
});
