import { createNextHandler } from "@archeon/next";
import { app } from "../../../archeon/app";

export const GET = createNextHandler(app, {
  operation: "greetings.say",
  getInput: (request) => new URL(request.url).searchParams.get("name") ?? "world",
  getRequestContext: (request) => ({
    requestId: request.headers.get("x-request-id") ?? crypto.randomUUID(),
  }),
  onError: (error) => {
    if (error instanceof TypeError) return Response.json({ error: "Invalid greeting input" }, { status: 400 });
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  },
});
