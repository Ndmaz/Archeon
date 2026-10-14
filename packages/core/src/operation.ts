import { InvalidOperationNameError } from "./errors.js";

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
  TName extends string = string,
> {
  readonly name: TName;
  readonly input?: InputParser<TInput>;
  readonly execute: (
    args: OperationArguments<TInput, TServices>,
  ) => TOutput | Promise<TOutput>;
}

type OperationWithParser<
  TServices,
  TInput,
  TOutput,
  TName extends string,
> = {
  readonly name: TName;
  readonly input: InputParser<TInput>;
  readonly execute: (
    args: OperationArguments<TInput, TServices>,
  ) => TOutput | Promise<TOutput>;
};

type OperationWithoutParser<TServices, TOutput, TName extends string> = {
  readonly name: TName;
  readonly execute: (
    args: OperationArguments<unknown, TServices>,
  ) => TOutput | Promise<TOutput>;
};

export interface OperationBuilder<TServices> {
  <TInput, TOutput, const TName extends string>(
    definition: OperationWithParser<TServices, TInput, TOutput, TName>,
  ): OperationDefinition<TServices, TInput, TOutput, TName>;
  <TOutput, const TName extends string>(
    definition: OperationWithoutParser<TServices, TOutput, TName>,
  ): OperationDefinition<TServices, unknown, TOutput, TName>;
}

export function defineOperation<TServices>(): OperationBuilder<TServices> {
  return ((definition: OperationDefinition<TServices, unknown, unknown, string>) => {
    const name = definition.name;
    if (
      typeof name !== "string" ||
      !/^[a-z0-9]+(?:[.-][a-z0-9]+)*(?:-[a-z0-9]+)*$/.test(name)
    ) {
      throw new InvalidOperationNameError(String(name));
    }

    return Object.freeze({ ...definition });
  }) as OperationBuilder<TServices>;
}
