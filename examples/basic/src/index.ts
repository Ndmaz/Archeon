import {
  createApplication,
  defineModule,
  defineOperation,
  type InputParser,
} from "@archeon/core";

type Services = {
  users: {
    create(input: { email: string }): Promise<{ id: string; email: string }>;
  };
};

const createUserInput: InputParser<{ email: string }> = {
  parse(value) {
    if (
      typeof value !== "object" ||
      value === null ||
      !("email" in value) ||
      typeof value.email !== "string"
    ) {
      throw new TypeError("Expected input.email to be a string.");
    }
    return { email: value.email };
  },
};

const createUser = defineOperation<Services>()({
  name: "users.create",
  input: createUserInput,
  execute: ({ input, context }) => context.services.users.create(input),
});

const users = defineModule({
  name: "user-management",
  operations: { create: createUser },
});

const app = createApplication({
  modules: [users],
  services: {
    users: {
      create: async (input) => ({ id: "user_1", email: input.email }),
    },
  } satisfies Services,
});

export async function example() {
  return app.execute("users.create", { email: "hello@example.com" });
}
