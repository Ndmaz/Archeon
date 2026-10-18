import type { ArcheonApplication } from "@archeon/core";

type OperationNameOf<TApp> =
  TApp extends { execute: (operationName: infer TName, ...args: any[]) => any }
    ? TName
    : never;

type RequestContextOf<TApp> =
  TApp extends ArcheonApplication<any, any, infer TRequestContext>
    ? TRequestContext
    : unknown;

export interface NextErrorResponse {
  readonly status: number;
  readonly body: unknown;
}

export interface NextHandlerOptions<
  TApp extends ArcheonApplication<any, any, any>,
  TOperation extends OperationNameOf<TApp> & string,
> {
  /** Registered Archeon operation to execute for this route. */
  readonly operation: TOperation;
  /** Explicitly maps the incoming request to the operation input. */
  readonly getInput: (request: Request) => unknown | Promise<unknown>;
  /** Maps transport-specific data to the application's request context. */
  readonly getRequestContext?: (
    request: Request,
  ) => RequestContextOf<TApp> | Promise<RequestContextOf<TApp>>;
  /** Maps an error to an HTTP response. Unhandled errors become a generic 500. */
  readonly onError?: (
    error: unknown,
    request: Request,
  ) => Response | Promise<Response>;
  /** HTTP status for a successful operation response. Defaults to 200. */
  readonly successStatus?: number;
}

/**
 * Creates a Web Request/Response-compatible handler that can be exported from
 * a Next.js App Router route file. Core remains independent of Next.js types.
 */
export function createNextHandler<
  TApp extends ArcheonApplication<any, any, any>,
  TOperation extends OperationNameOf<TApp> & string,
>(
  app: TApp,
  options: NextHandlerOptions<TApp, TOperation>,
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    try {
      const input = await options.getInput(request);
      const requestContext = options.getRequestContext
        ? await options.getRequestContext(request)
        : undefined;

      const result = requestContext === undefined
        ? await app.execute(options.operation as never, input)
        : await app.execute(
            options.operation as never,
            input,
            { request: requestContext } as never,
          );

      return Response.json(result, { status: options.successStatus ?? 200 });
    } catch (error) {
      if (options.onError) return await options.onError(error, request);
      return Response.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  };
}
