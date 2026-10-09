import type { ModuleDefinition } from "./module.js";
import type { OperationDefinition } from "./operation.js";
import { DuplicateModuleError, DuplicateOperationError, InvalidOperationNameError, UnknownOperationError } from "./errors.js";

export interface ExecutionPlan<TServices = unknown> {
  readonly operationName: string;
  readonly invoke: (input: unknown, services: TServices) => Promise<unknown>;
}

export interface ArcheonApplication<TServices> {
  readonly modules: readonly string[];
  readonly operationNames: readonly string[];
  execute<TOutput = unknown>(
    operationName: string,
    input: unknown,
    services: TServices,
  ): Promise<TOutput>;
}

const OPERATION_NAME = /^[a-z0-9]+(?:[.-][a-z0-9]+)*(?:-[a-z0-9]+)*$/;

export function createApplication<TServices>(
  modules: readonly ModuleDefinition<TServices, any>[],
): ArcheonApplication<TServices> {
  const moduleNames = new Set<string>();
  const plans = new Map<string, ExecutionPlan<TServices>>();

  for (const module of modules) {
    if (moduleNames.has(module.name)) throw new DuplicateModuleError(module.name);
    moduleNames.add(module.name);

    for (const operation of Object.values(module.operations) as OperationDefinition<TServices, any, any>[]) {
      if (!OPERATION_NAME.test(operation.name)) {
        throw new InvalidOperationNameError(operation.name);
      }
      if (plans.has(operation.name)) throw new DuplicateOperationError(operation.name);

      const plan: ExecutionPlan<TServices> = Object.freeze({
        operationName: operation.name,
        invoke: async (input: unknown, services: TServices): Promise<unknown> => {
          const parsedInput = operation.input
            ? await operation.input.parse(input)
            : input;
          return await operation.execute({
            input: parsedInput,
            context: Object.freeze({ services }),
          });
        },
      });
      plans.set(operation.name, plan);
    }
  }

  const operationNames = Object.freeze([...plans.keys()]);
  const registeredModules = Object.freeze([...moduleNames]);

  return Object.freeze({
    modules: registeredModules,
    operationNames,
    async execute<TOutput = unknown>(
      operationName: string,
      input: unknown,
      services: TServices,
    ): Promise<TOutput> {
      const plan = plans.get(operationName);
      if (!plan) throw new UnknownOperationError(operationName);
      return (await plan.invoke(input, services)) as TOutput;
    },
  });
}
