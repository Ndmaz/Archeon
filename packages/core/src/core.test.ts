import { describe, expect, it, vi } from "vitest";
import {
  createApplication,
  defineModule,
  defineOperation,
  DuplicateModuleError,
  DuplicateOperationError,
  UnknownOperationError,
} from "./index.js";

type Services = {
  users: {
    create(input: { email: string }): Promise<{ id: string; email: string }>;
  };
};

const emailParser = {
  parse(value: unknown): { email: string } {
    if (
      typeof value !== "object" ||
      value === null ||
      !("email" in value) ||
      typeof value.email !== "string"
    ) {
      throw new TypeError("Expected an object with a string email.");
    }
    return { email: value.email };
  },
};

describe("Archeon core vertical slice", () => {
  it("parses input, infers services, and executes the operation", async () => {
    const createUser = defineOperation<Services>()({
      name: "users.create",
      input: emailParser,
      execute: async ({ input, context }) => {
        return context.services.users.create(input);
      },
    });

    const module = defineModule({
      name: "user-management",
      operations: { create: createUser },
    });

    const application = createApplication<Services>([module]);
    const result = await application.execute<{ id: string; email: string }>(
      "users.create",
      { email: "dev@example.com" },
      { users: { create: async (input) => ({ id: "u1", email: input.email }) } },
    );

    expect(result).toEqual({ id: "u1", email: "dev@example.com" });
  });

  it("propagates parser errors and does not execute the handler", async () => {
    const execute = vi.fn(() => "should not run");
    const operation = defineOperation<Services>()({
      name: "users.create",
      input: emailParser,
      execute,
    });
    const app = createApplication<Services>([
      defineModule({ name: "users", operations: { create: operation } }),
    ]);

    await expect(app.execute("users.create", { email: 42 }, {
      users: { create: async (input) => ({ id: "u1", email: input.email }) },
    })).rejects.toThrow("Expected an object");
    expect(execute).not.toHaveBeenCalled();
  });

  it("propagates handler failures", async () => {
    const failure = new Error("database unavailable");
    const operation = defineOperation<Services>()({
      name: "users.create",
      input: emailParser,
      execute: async () => { throw failure; },
    });
    const app = createApplication<Services>([
      defineModule({ name: "users", operations: { create: operation } }),
    ]);

    await expect(app.execute("users.create", { email: "a@b.com" }, {
      users: { create: async (input) => ({ id: "u1", email: input.email }) },
    })).rejects.toBe(failure);
  });

  it("rejects duplicate operation names", () => {
    const first = defineOperation<Services>()({
      name: "users.create",
      execute: ({ input }) => input,
    });
    const second = defineOperation<Services>()({
      name: "users.create",
      execute: ({ input }) => input,
    });

    expect(() => createApplication<Services>([
      defineModule({ name: "first", operations: { first } }),
      defineModule({ name: "second", operations: { second } }),
    ])).toThrow(DuplicateOperationError);
  });

  it("rejects duplicate module names", () => {
    const operation = defineOperation<Services>()({
      name: "users.create",
      execute: ({ input }) => input,
    });
    const module = defineModule({ name: "users", operations: { create: operation } });

    expect(() => createApplication<Services>([module, module])).toThrow(DuplicateModuleError);
  });

  it("rejects unknown operations", async () => {
    const app = createApplication<Services>([]);
    await expect(app.execute("users.missing", {}, {
      users: { create: async (input) => ({ id: "u1", email: input.email }) },
    })).rejects.toThrow(UnknownOperationError);
  });
});
