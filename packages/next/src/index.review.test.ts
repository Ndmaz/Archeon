import { describe, expect, it, vi } from "vitest";
import { createApplication, defineModule, defineOperation } from "@archeon/core";
import { createNextHandler } from "./index.js";

function setup(produce: () => unknown) {
  const run = vi.fn(produce);
  const operation = defineOperation()({
    name: "jobs.run",
    execute: () => run(),
  });
  const app = createApplication({
    modules: [defineModule({ name: "jobs", operations: { run: operation } })],
    services: {},
  });
  return { app, run };
}

const post = () => new Request("https://example.test/api/jobs", { method: "POST" });

describe("@archeon/next success serialization", () => {
  it("returns an empty 204 when the operation succeeds with undefined", async () => {
    const { app, run } = setup(() => undefined);
    const onError = vi.fn(() => new Response("mapped", { status: 418 }));
    const handler = createNextHandler(app, {
      operation: "jobs.run",
      getInput: () => undefined,
      onError,
    });

    const response = await handler(post());

    expect(response.status).toBe(204);
    await expect(response.text()).resolves.toBe("");
    expect(run).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it("keeps a caller-selected success status for an undefined result", async () => {
    const { app } = setup(() => undefined);
    const handler = createNextHandler(app, {
      operation: "jobs.run",
      getInput: () => undefined,
      successStatus: 202,
    });

    const response = await handler(post());

    expect(response.status).toBe(202);
    await expect(response.text()).resolves.toBe("");
  });

  it("routes a non-serializable result through onError after the operation ran once", async () => {
    const { app, run } = setup(() => 10n);
    const onError = vi.fn((_error: unknown) => new Response("mapped", { status: 502 }));
    const handler = createNextHandler(app, {
      operation: "jobs.run",
      getInput: () => undefined,
      onError,
    });

    const response = await handler(post());

    expect(response.status).toBe(502);
    expect(run).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("returns the generic 500 for a non-serializable result without onError", async () => {
    const { app } = setup(() => 10n);
    const handler = createNextHandler(app, {
      operation: "jobs.run",
      getInput: () => undefined,
    });

    const response = await handler(post());

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({ error: "Internal Server Error" });
  });
});
