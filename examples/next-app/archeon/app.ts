import { createApplication, defineModule, defineOperation } from "@archeon/core";

type Services = {
  greeting: { say(name: string): { message: string } };
};
type RequestContext = { requestId: string };

const sayGreeting = defineOperation<Services, RequestContext>()({
  name: "greetings.say",
  input: {
    parse(value: unknown) {
      if (typeof value !== "string") throw new TypeError("Expected the name to be a string");
      return value;
    },
  },
  execute: ({ input, context }) => ({
    ...context.services.greeting.say(input),
    requestId: context.request?.requestId ?? "no-request-id",
  }),
});

const greetingsModule = defineModule({ name: "greetings", operations: { say: sayGreeting } });

export const app = createApplication({
  modules: [greetingsModule],
  services: { greeting: { say: (name: string) => ({ message: "Hello, " + name + "!" }) } } satisfies Services,
});
