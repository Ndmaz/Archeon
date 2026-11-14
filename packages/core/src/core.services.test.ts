import { describe, expect, it } from "vitest";
import { createApplication, defineModule, defineOperation } from "./index.js";

type UserServices = { users: { count(): Promise<number> } };
type MailServices = { mail: { send(to: string): Promise<void> } };

const count = defineOperation<UserServices>()({
  name: "users.count",
  execute: ({ context }) => context.services.users.count(),
});
const notify = defineOperation<MailServices>()({
  name: "mail.notify",
  execute: ({ context }) => context.services.mail.send("team@example.com"),
});
const users = defineModule({ name: "users", operations: { count } });
const mail = defineModule({ name: "mail", operations: { notify } });

const userServices: UserServices = { users: { count: async () => 1 } };
const mailServices: MailServices = { mail: { send: async () => undefined } };

describe("service requirements are derived from operations", () => {
  it("still requires services after a module is copied with spread", () => {
    const copy = { ...users };

    createApplication({
      modules: [copy],
      // @ts-expect-error The copied module's operations still require users.count().
      services: {},
    });

    expect(copy.name).toBe("users");
  });

  it("requires the combined services of every registered module", () => {
    // @ts-expect-error mail.send() is required by the mail module.
    createApplication({ modules: [users, mail], services: userServices });

    const app = createApplication({
      modules: [users, mail],
      services: { ...userServices, ...mailServices },
    });
    expect(app.operationNames).toEqual(["users.count", "mail.notify"]);
  });

  it("captures application services at construction time", async () => {
    const initialServices: UserServices = { users: { count: async () => 1 } };
    const replacementServices: UserServices = { users: { count: async () => 2 } };
    const options = { modules: [users] as const, services: initialServices };
    const app = createApplication(options);

    options.services = replacementServices;

    await expect(app.execute("users.count", undefined)).resolves.toBe(1);
  });
});
