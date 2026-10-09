export interface InputParser<TInput> {
  parse(input: unknown): TInput | Promise<TInput>;
}

export interface ExecutionContext<TServices> {
  readonly services: TServices;
}

export interface OperationArguments<TInput, TServices> {
  readonly input: TInput;
  readonly context: ExecutionContext<TServices>;
}

export interface OperationDefinition<
  TServices,
  TInput = unknown,
  TOutput = unknown,
> {
  readonly name: string;
  readonly input?: InputParser<TInput>;
  readonly execute: (
    args: OperationArguments<TInput, TServices>,
  ) => TOutput | Promise<TOutput>;
}

type OperationWithParser<TServices, TInput, TOutput> = {
  readonly name: string;
  readonly input: InputParser<TInput>;
  readonly execute: (
    args: OperationArguments<TInput, TServices>,
  ) => TOutput | Promise<TOutput>;
};

type OperationWithoutParser<TServices, TOutput> = {
  readonly name: string;
  readonly execute: (
    args: OperationArguments<unknown, TServices>,
  ) => TOutput | Promise<TOutput>;
};

export interface OperationBuilder<TServices> {
  <TInput, TOutput>(
    definition: OperationWithParser<TServices, TInput, TOutput>,
  ): OperationDefinition<TServices, TInput, TOutput>;
  <TOutput>(
    definition: OperationWithoutParser<TServices, TOutput>,
  ): OperationDefinition<TServices, unknown, TOutput>;
}

export function defineOperation<TServices>(): OperationBuilder<TServices> {
  return ((definition: OperationDefinition<TServices, unknown, unknown>) => {
    const name = definition.name;
    if (typeof name !== "string" || name.length === 0 || name.trim() !== name) {
      throw new TypeError("Operation name must be a non-empty, trimmed string.");
    }

    return Object.freeze({ ...definition });
  }) as OperationBuilder<TServices>;
}
