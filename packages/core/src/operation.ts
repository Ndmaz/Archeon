import { InvalidOperationNameError } from "./errors.js";

export interface InputParser<TInput> {
  parse(input: unknown): TInput | Promise<TInput>;
}

export interface ExecutionContext<TServices, TRequestContext = unknown> {
  readonly services: TServices;
  readonly request: TRequestContext | undefined;
}

export interface OperationArguments<TInput, TServices, TRequestContext = unknown> {
  readonly input: TInput;
  readonly context: ExecutionContext<TServices, TRequestContext>;
}

export interface OperationDefinition<
  TServices,
  TInput = unknown,
  TOutput = unknown,
  TName extends string = string,
  TRequestContext = unknown,
> {
  readonly name: TName;
  readonly input?: InputParser<TInput>;
  readonly execute: (
    args: OperationArguments<TInput, TServices, TRequestContext>,
  ) => TOutput | Promise<TOutput>;
}

type OperationWithParser<
  TServices,
  TInput,
  TOutput,
  TName extends string,
  TRequestContext,
> = {
  readonly name: TName;
  readonly input: InputParser<TInput>;
  readonly execute: (
    args: OperationArguments<TInput, TServices, TRequestContext>,
  ) => TOutput | Promise<TOutput>;
};

type OperationWithoutParser<TServices, TOutput, TName extends string, TRequestContext> = {
  readonly name: TName;
  readonly execute: (
    args: OperationArguments<unknown, TServices, TRequestContext>,
  ) => TOutput | Promise<TOutput>;
};

export interface OperationBuilder<TServices, TRequestContext = unknown> {
  <TInput, TOutput, const TName extends string>(
    definition: OperationWithParser<TServices, TInput, TOutput, TName, TRequestContext>,
  ): OperationDefinition<TServices, TInput, TOutput, TName, TRequestContext>;
  <TOutput, const TName extends string>(
    definition: OperationWithoutParser<TServices, TOutput, TName, TRequestContext>,
  ): OperationDefinition<TServices, unknown, TOutput, TName, TRequestContext>;
}

export function defineOperation<TServices, TRequestContext = unknown>(): OperationBuilder<TServices, TRequestContext> {
  return ((definition: OperationDefinition<TServices, unknown, unknown, string, TRequestContext>) => {
    const name = definition.name;
    if (
      typeof name !== "string" ||
      !/^[a-z0-9]+(?:[.-][a-z0-9]+)*(?:-[a-z0-9]+)*$/.test(name)
    ) {
      throw new InvalidOperationNameError(String(name));
    }

    return Object.freeze({ ...definition });
  }) as OperationBuilder<TServices, TRequestContext>;
}
