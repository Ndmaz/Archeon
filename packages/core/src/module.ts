import type { OperationDefinition } from "./operation.js";

type AnyOperation = OperationDefinition<any, any, any>;

type ServicesOf<TOperation> =
  TOperation extends OperationDefinition<infer TServices, any, any>
    ? TServices
    : never;

export interface ModuleDefinition<
  TServices,
  TOperations extends Record<string, AnyOperation> = Record<string, AnyOperation>,
> {
  readonly name: string;
  readonly operations: TOperations;
}

export function defineModule<
  TOperations extends Record<string, AnyOperation>,
>(definition: {
  readonly name: string;
  readonly operations: TOperations;
}): ModuleDefinition<ServicesOf<TOperations[keyof TOperations]>, TOperations> {
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
  }) as ModuleDefinition<ServicesOf<TOperations[keyof TOperations]>, TOperations>;
}
