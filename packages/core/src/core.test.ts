import { describe, expect, it, vi } from "vitest";
import {
  createApplication,
  defineModule,
  defineOperation,
  DuplicateModuleError,
  DuplicateOperationError,
  InvalidOperationNameError,
  UnknownOperationError,
} from "./index.js";

type User = { id: string; email: string };
type Services = {
  users: {
    create(input: { email: string }): Promise<User>;
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

const makeCreateUser = () => defineOperation<Services>()({
  name: "users.create",
  input: emailParser,
  execute: async ({ input, context }) => context.services.users.create(input),
});

describe("Archeon core vertical slice", () => {
  it("parses input, binds services, and infers the handler output", async () => {
    const createUser = makeCreateUser();
    const users = defineModule({
      name: "user-management",
      operations: { create: createUser },
    });
    const app = createApplication({
      modules: [users],
      services: {
        users: {
          create: async (input) => ({ id: "u1", email: input.email }),
        },
      } satisfies Services,
    });

    const result = await app.execute("users.create", { email: "dev@example.com" });
    expect(result).toEqual({ id: "u1", email: "dev@example.com" });
    // Compile-time regression: result is inferred as User, not unknown.
    const inferred: User = result;
    expect(inferred.id).toBe("u1");
  });

  it("propagates parser errors and does not execute the handler", async () => {
    const execute = vi.fn(async () => ({ id: "u1", email: "x@y.z" }));
    const operation = defineOperation<Services>()({
      name: "users.create",
      input: emailParser,
      execute,
    });
    const app = createApplication({
      modules: [defineModule({ name: "users", operations: { create: operation } })],
      services: { users: { create: async (input) => ({ id: "u1", email: input.email }) } } satisfies Services,
    });

    await expect(app.execute("users.create", { email: 42 })).rejects.toThrow("Expected an object");
    expect(execute).not.toHaveBeenCalled();
  });

  it("propagates handler failures unchanged", async () => {
    const failure = new Error("database unavailable");
    const operation = defineOperation<Services>()({
      name: "users.create",
      input: emailParser,
      execute: async () => { throw failure; },
    });
    const app = createApplication({
      modules: [defineModule({ name: "users", operations: { create: operation } })],
      services: { users: { create: async (input) => ({ id: "u1", email: input.email }) } } satisfies Services,
    });

    await expect(app.execute("users.create", { email: "a@b.com" })).rejects.toBe(failure);
  });

  it("rejects duplicate operation names", () => {
    const first = defineOperation<Services>()({ name: "users.create", execute: ({ input }) => input });
    const second = defineOperation<Services>()({ name: "users.create", execute: ({ input }) => input });

    expect(() => createApplication({
      modules: [
        defineModule({ name: "first", operations: { first } }),
        defineModule({ name: "second", operations: { second } }),
      ],
      services: { users: { create: async (input) => ({ id: "u1", email: input.email }) } } satisfies Services,
    })).toThrow(DuplicateOperationError);
  });

  it("rejects duplicate module names", () => {
    const operation = defineOperation<Services>()({ name: "users.create", execute: ({ input }) => input });
    const module = defineModule({ name: "users", operations: { create: operation } });

    expect(() => createApplication({
      modules: [module, module],
      services: { users: { create: async (input) => ({ id: "u1", email: input.email }) } } satisfies Services,
    })).toThrow(DuplicateModuleError);
  });

  it("rejects invalid operation names", () => {
    const operation = defineOperation<Services>()({ name: "Users Create", execute: ({ input }) => input });
    expect(() => createApplication({
      modules: [defineModule({ name: "users", operations: { operation } })],
      services: { users: { create: async (input) => ({ id: "u1", email: input.email }) } } satisfies Services,
    })).toThrow(InvalidOperationNameError);
  });

  it("rejects unknown operations", async () => {
    const app = createApplication({ modules: [], services: { users: { create: async (input) => ({ id: "u1", email: input.email }) } } satisfies Services });
    // @ts-expect-error Unknown names are rejected by the public API at compile time.
    await expect(app.execute("users.missing", {})).rejects.toThrow(UnknownOperationError);
  });
});
