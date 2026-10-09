import type { OperationDefinition } from "./operation.js";

export interface ModuleDefinition<
  TServices,
  TOperations extends Record<string, OperationDefinition<TServices, never, unknown>> = Record<
    string,
    OperationDefinition<TServices, never, unknown>
  >,
> {
  readonly name: string;
  readonly operations: TOperations;
}

export function defineModule<
  TServices,
  TOperations extends Record<string, OperationDefinition<TServices, any, any>>,
>(definition: {
  readonly name: string;
  readonly operations: TOperations;
}): ModuleDefinition<TServices, TOperations> {
  if (
    typeof definition.name !== "string" ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(definition.name)
  ) {
    throw new TypeError(
      "Module name must be a lowercase slug using letters, digits, and internal hyphens.",
    );
  }

  return Object.freeze({
    name: definition.name,
    operations: Object.freeze({ ...definition.operations }),
  });
}
