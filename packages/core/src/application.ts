import type { ModuleDefinition } from "./module.js";
import type { OperationDefinition } from "./operation.js";
import {
  DuplicateModuleError,
  DuplicateOperationError,
  InvalidOperationNameError,
  InvalidModuleDefinitionError,
  UnknownOperationError,
} from "./errors.js";

type AnyOperation = OperationDefinition<any, any, any, any, any>;
type AnyModule = ModuleDefinition<any, Record<string, AnyOperation>>;
type ServicesOfModule<TModule> =
  TModule extends ModuleDefinition<infer TServices, any> ? TServices : never;
type UnionToIntersection<T> =
  (T extends unknown ? (value: T) => void : never) extends
    (value: infer TIntersection) => void ? TIntersection : never;
type ServicesRequiredByModules<TModules extends readonly AnyModule[]> =
  UnionToIntersection<ServicesOfModule<TModules[number]>>;

type OperationsOf<TModule> =
  TModule extends { readonly operations: infer TOperations }
    ? TOperations[keyof TOperations]
    : never;

type OperationsOfModules<TModules extends readonly AnyModule[]> =
  OperationsOf<TModules[number]>;
type RequestContextOf<TOperation> =
  TOperation extends OperationDefinition<any, any, any, any, infer TRequestContext>
    ? TRequestContext
    : never;
type RequestContextRequiredByModules<TModules extends readonly AnyModule[]> =
  UnionToIntersection<RequestContextOf<OperationsOfModules<TModules>>>;

type OperationName<TModules extends readonly AnyModule[]> =
  OperationsOfModules<TModules> extends infer TOperation
    ? TOperation extends { readonly name: infer TName extends string }
      ? TName
      : never
    : never;

type OutputForName<
  TModules extends readonly AnyModule[],
  TName extends string,
> = OperationsOfModules<TModules> extends infer TOperation
  ? TOperation extends OperationDefinition<any, any, infer TOutput>
    ? TOperation["name"] extends TName
      ? TOutput
      : never
    : never
  : never;

export interface ExecutionPlan {
  readonly operationName: string;
  readonly invoke: (input: unknown, services: unknown, request: unknown) => Promise<unknown>;
}

export interface ApplicationOptions<TModules extends readonly AnyModule[]> {
  readonly modules: TModules;
  readonly services: ServicesRequiredByModules<TModules>;
}

export interface ArcheonApplication<
  TServices,
  TModules extends readonly AnyModule[],
  TRequestContext = unknown,
> {
  readonly modules: readonly string[];
  readonly operationNames: readonly OperationName<TModules>[];
  execute<TName extends OperationName<TModules>>(
    operationName: TName,
    input: unknown,
    execution?: { readonly request?: TRequestContext },
  ): Promise<Awaited<OutputForName<TModules, TName>>>;
}

const OPERATION_NAME = /^[a-z0-9]+(?:[.-][a-z0-9]+)*(?:-[a-z0-9]+)*$/;

export function createApplication<
  const TModules extends readonly AnyModule[],
>(
  options: ApplicationOptions<TModules>,
): ArcheonApplication<
  ServicesRequiredByModules<TModules>,
  TModules,
  RequestContextRequiredByModules<TModules>
> {
  const moduleNames = new Set<string>();
  const plans = new Map<string, ExecutionPlan>();

  if (!Array.isArray(options.modules)) {
    throw new InvalidModuleDefinitionError("Application modules must be an array.");
  }

  for (const module of options.modules) {
    if (
      typeof module !== "object" ||
      module === null ||
      typeof module.name !== "string" ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(module.name) ||
      typeof module.operations !== "object" ||
      module.operations === null ||
      Array.isArray(module.operations)
    ) {
      throw new InvalidModuleDefinitionError("Each module must have a valid slug name and an operations object.");
    }
    if (moduleNames.has(module.name)) throw new DuplicateModuleError(module.name);
    moduleNames.add(module.name);

    for (const operation of Object.values(module.operations) as OperationDefinition<ServicesRequiredByModules<TModules>, any, any>[]) {
      if (
        typeof operation !== "object" ||
        operation === null ||
        typeof operation.name !== "string" ||
        typeof operation.execute !== "function" ||
        (operation.input !== undefined &&
          (typeof operation.input !== "object" ||
            operation.input === null ||
            typeof operation.input.parse !== "function"))
      ) {
        throw new InvalidModuleDefinitionError(`Module "${module.name}" contains a malformed operation definition.`);
      }
      if (!OPERATION_NAME.test(operation.name)) {
        throw new InvalidOperationNameError(operation.name);
      }
      if (plans.has(operation.name)) throw new DuplicateOperationError(operation.name);

      const plan: ExecutionPlan = Object.freeze({
        operationName: operation.name,
        invoke: async (input: unknown, services: unknown, request: unknown): Promise<unknown> => {
          const parsedInput = operation.input
            ? await operation.input.parse(input)
            : input;
          return await operation.execute({
            input: parsedInput,
            context: Object.freeze({
              services: services as ServicesRequiredByModules<TModules>,
              request,
            }),
          });
        },
      });
      plans.set(operation.name, plan);
    }
  }

  const operationNames = Object.freeze([...plans.keys()]) as readonly OperationName<TModules>[];
  const registeredModules = Object.freeze([...moduleNames]);

  return Object.freeze({
    modules: registeredModules,
    operationNames,
    async execute<TName extends OperationName<TModules>>(
      operationName: TName,
      input: unknown,
      execution?: { readonly request?: RequestContextRequiredByModules<TModules> },
    ): Promise<Awaited<OutputForName<TModules, TName>>> {
      const plan = plans.get(operationName);
      if (!plan) throw new UnknownOperationError(operationName);
      return (await plan.invoke(input, options.services, execution?.request)) as Awaited<OutputForName<TModules, TName>>;
    },
  });
}
