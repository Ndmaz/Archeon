import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = process.cwd();
const temp = mkdtempSync(join(tmpdir(), "archeon-package-smoke-"));
const tarballsDir = join(temp, "tarballs");
const consumerDir = join(temp, "consumer");
mkdirSync(tarballsDir);
mkdirSync(consumerDir);

function run(command, args, options = {}) {
  execFileSync(command, args, { stdio: "inherit", ...options });
}

try {
  run("pnpm", ["--filter", "@archeon/core", "pack", "--pack-destination", tarballsDir], { cwd: root });
  run("pnpm", ["--filter", "@archeon/next", "pack", "--pack-destination", tarballsDir], { cwd: root });

  const tarballs = readdirSync(tarballsDir).filter((file) => file.endsWith(".tgz"));
  const coreTarball = tarballs.find((file) => file.startsWith("archeon-core-"));
  const nextTarball = tarballs.find((file) => file.startsWith("archeon-next-"));
  if (!coreTarball || !nextTarball) {
    throw new Error(`Expected both package tarballs. Found: ${tarballs.join(", ")}`);
  }

  writeFileSync(join(consumerDir, "package.json"), JSON.stringify({
    name: "archeon-package-consumer-smoke",
    private: true,
    type: "module",
    scripts: { typecheck: "tsc --noEmit -p tsconfig.json", test: "node smoke.mjs" },
  }, null, 2) + "\n");

  writeFileSync(join(consumerDir, "tsconfig.json"), JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "NodeNext",
      moduleResolution: "NodeNext",
      strict: true,
      skipLibCheck: false,
      noEmit: true,
      types: [],
    },
    include: ["consumer.mts"],
  }, null, 2) + "\n");

  writeFileSync(join(consumerDir, "consumer.mts"), `import { createApplication, defineModule, defineOperation } from "@archeon/core";
import { createNextHandler } from "@archeon/next";

type Services = { greeting: { say(name: string): string } };
type RequestContext = { requestId: string };

const greet = defineOperation<Services, RequestContext>()({
  name: "greetings.say",
  input: { parse(value: unknown) {
    if (typeof value !== "string") throw new TypeError("Expected a string");
    return value;
  } },
  execute: ({ input, context }) => context.services.greeting.say(input),
});
const app = createApplication({
  modules: [defineModule({ name: "greetings", operations: { greet } })],
  services: { greeting: { say: (name: string) => \`hello \${name}\` } },
});
const handler = createNextHandler(app, {
  operation: "greetings.say",
  getInput: () => "Archeon",
  getRequestContext: () => ({ requestId: "smoke-test" }),
});
void handler;
`);

  writeFileSync(join(consumerDir, "smoke.mjs"), `import assert from "node:assert/strict";
import { createApplication, defineModule, defineOperation } from "@archeon/core";
import { createNextHandler } from "@archeon/next";

const operation = defineOperation<{}, { requestId: string }>()({
  name: "smoke.greet",
  input: { parse(value) {
    if (typeof value !== "string") throw new TypeError("Expected string input");
    return value;
  } },
  execute: ({ input, context }) => ({ greeting: "hello " + input, requestId: context.request?.requestId }),
});
const app = createApplication({
  modules: [defineModule({ name: "smoke", operations: { greet: operation } })],
  services: {},
});
assert.deepEqual(await app.execute("smoke.greet", "Archeon", { request: { requestId: "runtime-smoke" } }), {
  greeting: "hello Archeon",
  requestId: "runtime-smoke",
});
const handler = createNextHandler(app, {
  operation: "smoke.greet",
  getInput: () => "package",
  getRequestContext: () => ({ requestId: "adapter-smoke" }),
});
const response = await handler(new Request("https://example.test/smoke"));
assert.equal(response.status, 200);
assert.deepEqual(await response.json(), { greeting: "hello package", requestId: "adapter-smoke" });
console.log("Packed-package consumer smoke test passed.");
`);

  const corePath = join(tarballsDir, coreTarball);
  const nextPath = join(tarballsDir, nextTarball);
  run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--prefix", consumerDir,
    corePath, nextPath, "typescript@^5.9.3"]);
  run("npm", ["run", "typecheck", "--prefix", consumerDir]);
  run("npm", ["test", "--prefix", consumerDir]);
} finally {
  rmSync(temp, { recursive: true, force: true });
}
