import { describe, expect, it, vi } from "vitest";
import {
  createApplication,
  defineModule,
  defineOperation,
  DuplicateModuleError,
  DuplicateOperationError,
  InvalidOperationNameError,
  InvalidModuleDefinitionError,
  UnknownOperationError,
} from "./index.js";

type Services = {
  users: {
    create(input: { email: string }): Promise<{ id: string; email: string }>;
    count(): Promise<number>;
  };
};

const services: Services = {
  users: {
    create: async (input) => ({ id: "u-1", email: input.email }),
    count: async () => 7,
  },
};

const parser = {
  parse(value: unknown): { email: string } {
    if (typeof value !== "object" || value === null || !("email" in value) || typeof value.email !== "string") {
      throw new TypeError("email must be a string");
    }
    return { email: value.email };
  },
};

describe("Archeon core review regressions", () => {
  it("supports asynchronous parsers and passes only parsed input to the handler", async () => {
    const parse = vi.fn(async (value: unknown) => parser.parse(value));
    const execute = vi.fn(async ({ input, context }: {
      input: { email: string };
      context: { services: Services };
    }) => context.services.users.create(input));

    const operation = defineOperation<Services>()({
      name: "users.create",
      input: { parse },
      execute,
    });
    const app = createApplication({
      modules: [defineModule({ name: "users", operations: { create: operation } })],
      services,
    });

    await expect(app.execute("users.create", { email: "async@example.com" })).resolves.toEqual({
      id: "u-1",
      email: "async@example.com",
    });
    expect(parse).toHaveBeenCalledTimes(1);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute.mock.calls[0]?.[0].input).toEqual({ email: "async@example.com" });
  });

  it("passes unparsed input through unchanged when no parser is configured", async () => {
    const execute = vi.fn(({ input }: { input: unknown }) => input);
    const operation = defineOperation<Services>()({
      name: "users.echo",
      execute,
    });
    const app = createApplication({
      modules: [defineModule({ name: "users", operations: { echo: operation } })],
      services,
    });
    const input = { arbitrary: ["unvalidated", 1] };

    await expect(app.execute("users.echo", input)).resolves.toBe(input);
    expect(execute.mock.calls[0]?.[0].input).toBe(input);
  });

  it("propagates asynchronous parser rejection without invoking the handler", async () => {
    const failure = new Error("async parse failed");
    const execute = vi.fn(({ input }: { input: unknown }) => input);
    const operation = defineOperation<Services>()({
      name: "users.parse-failure",
      input: { parse: async () => { throw failure; } },
      execute,
    });
    const app = createApplication({
      modules: [defineModule({ name: "users", operations: { parseFailure: operation } })],
      services,
    });

    await expect(app.execute("users.parse-failure", {})).rejects.toBe(failure);
    expect(execute).not.toHaveBeenCalled();
  });

  it("creates a fresh execution context per invocation while reusing bound services", async () => {
    const contexts: unknown[] = [];
    const operation = defineOperation<Services>()({
      name: "users.context",
      execute: ({ context }) => {
        contexts.push(context);
        return context.services.users.count();
      },
    });
    const app = createApplication({
      modules: [defineModule({ name: "users", operations: { context: operation } })],
      services,
    });

    await Promise.all([
      app.execute("users.context", undefined),
      app.execute("users.context", undefined),
    ]);

    expect(contexts).toHaveLength(2);
    expect(contexts[0]).not.toBe(contexts[1]);
    expect((contexts[0] as { services: Services }).services).toBe(services);
    expect((contexts[1] as { services: Services }).services).toBe(services);
  });

  it("exposes immutable registration metadata", () => {
    const operation = defineOperation<Services>()({
      name: "users.count",
      execute: ({ context }) => context.services.users.count(),
    });
    const module = defineModule({ name: "user-queries", operations: { count: operation } });
    const app = createApplication({ modules: [module], services });

    expect(Object.isFrozen(operation)).toBe(true);
    expect(Object.isFrozen(module)).toBe(true);
    expect(Object.isFrozen(module.operations)).toBe(true);
    expect(Object.isFrozen(app)).toBe(true);
    expect(Object.isFrozen(app.modules)).toBe(true);
    expect(Object.isFrozen(app.operationNames)).toBe(true);
    expect(app.modules).toEqual(["user-queries"]);
    expect(app.operationNames).toEqual(["users.count"]);
  });

  it("rejects invalid module names at definition time", () => {
    const operation = defineOperation<Services>()({
      name: "users.count",
      execute: ({ context }) => context.services.users.count(),
    });

    expect(() => defineModule({ name: "Invalid Module", operations: { count: operation } })).toThrow(TypeError);
    expect(() => defineModule({ name: "-invalid", operations: { count: operation } })).toThrow(TypeError);
    expect(() => defineModule({ name: "valid-module", operations: { count: operation } })).not.toThrow();
  });

  it("allows operation registry keys to differ from the operation's stable name", async () => {
    const operation = defineOperation<Services>()({
      name: "users.count",
      execute: ({ context }) => context.services.users.count(),
    });
    const app = createApplication({
      modules: [defineModule({ name: "user-queries", operations: { countUsers: operation } })],
      services,
    });

    await expect(app.execute("users.count", null)).resolves.toBe(7);
    expect(app.operationNames).toEqual(["users.count"]);
  });

  it("rejects duplicate names even when they are registered under different keys", () => {
    const first = defineOperation<Services>()({
      name: "users.count",
      execute: ({ context }) => context.services.users.count(),
    });
    const second = defineOperation<Services>()({
      name: "users.count",
      execute: ({ context }) => context.services.users.count(),
    });

    expect(() => createApplication({
      modules: [
        defineModule({ name: "first-module", operations: { first } }),
        defineModule({ name: "second-module", operations: { second } }),
      ],
      services,
    })).toThrow(DuplicateOperationError);
  });

  it("keeps runtime unknown-operation protection for dynamic callers", async () => {
    const operation = defineOperation<Services>()({
      name: "users.count",
      execute: ({ context }) => context.services.users.count(),
    });
    const app = createApplication({
      modules: [defineModule({ name: "users", operations: { count: operation } })],
      services,
    });
    const dynamicName: string = "users.missing";

    await expect(
      app.execute(dynamicName as "users.count", null),
    ).rejects.toBeInstanceOf(UnknownOperationError);
  });

  it("uses stable framework error codes", () => {
    const duplicateModule = new DuplicateModuleError("users");
    const duplicateOperation = new DuplicateOperationError("users.count");
    const invalidName = new InvalidOperationNameError("Users Count");
    const unknownOperation = new UnknownOperationError("users.missing");

    expect(duplicateModule.code).toBe("DUPLICATE_MODULE");
    expect(duplicateOperation.code).toBe("DUPLICATE_OPERATION");
    expect(invalidName.code).toBe("INVALID_OPERATION_NAME");
    expect(unknownOperation.code).toBe("UNKNOWN_OPERATION");
  });

  it("rejects service objects that do not satisfy an operation's declared context", () => {
    const operation = defineOperation<Services>()({
      name: "users.count",
      execute: ({ context }) => context.services.users.count(),
    });
    const module = defineModule({ name: "users", operations: { count: operation } });

    // Compile-time contract: operation requirements must constrain application services.
    createApplication({
      modules: [module],
      // @ts-expect-error users.count() is required by the operation's declared Services type.
      services: {
        users: {
          create: async (input: { email: string }) => ({ id: "u-1", email: input.email }),
        },
      },
    });
  });

  it("snapshots the operation map at module definition time", () => {
    const source = {
      count: defineOperation<Services>()({
        name: "users.count",
        execute: ({ context }) => context.services.users.count(),
      }),
    };
    const module = defineModule({ name: "snapshot-module", operations: source });
    (source as Record<string, unknown>).extra = defineOperation<Services>()({
      name: "users.extra",
      execute: ({ context }) => context.services.users.count(),
    });
    const app = createApplication({ modules: [module], services });
    expect(app.operationNames).toEqual(["users.count"]);
  });

  it("accepts the intended operation-name grammar and rejects malformed names", () => {
    const makeApp = (name: string) => {
      const operation = defineOperation<Services>()({
        name,
        execute: ({ context }) => context.services.users.count(),
      });
      return createApplication({
        modules: [defineModule({ name: "names", operations: { operation } })],
        services,
      });
    };
    for (const name of ["users.count", "users-count", "users.v2-count", "v1.users.count"]) {
      expect(() => makeApp(name)).not.toThrow();
    }
    for (const name of ["Users.count", "users count", ".users", "users.", "users..count", "users--count", " users.count"]) {
      expect(() => makeApp(name)).toThrow(InvalidOperationNameError);
    }
  });

  it("rejects malformed module objects at application construction", () => {
    const operation = defineOperation<Services>()({
      name: "users.count",
      execute: ({ context }) => context.services.users.count(),
    });
    expect(() => createApplication({
      modules: [{ name: "Invalid Module", operations: { count: operation } }] as never,
      services,
    })).toThrow(InvalidModuleDefinitionError);
    expect(() => createApplication({
      modules: [{ name: "valid-module", operations: null }] as never,
      services,
    })).toThrow(InvalidModuleDefinitionError);
    expect(() => createApplication({
      modules: [{ name: "valid-module", operations: { count: { name: "users.count", execute: 42 } } }] as never,
      services,
    })).toThrow(InvalidModuleDefinitionError);
  });
});
