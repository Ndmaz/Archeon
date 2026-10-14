export class ArcheonError extends Error {
  readonly code: string;

  constructor(code: string, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = new.target.name;
    this.code = code;
  }
}

export class DuplicateModuleError extends ArcheonError {
  constructor(name: string) {
    super("DUPLICATE_MODULE", `A module named "${name}" is already registered.`);
  }
}

export class DuplicateOperationError extends ArcheonError {
  constructor(name: string) {
    super("DUPLICATE_OPERATION", `An operation named "${name}" is already registered.`);
  }
}

export class UnknownOperationError extends ArcheonError {
  constructor(name: string) {
    super("UNKNOWN_OPERATION", `No operation named "${name}" is registered.`);
  }
}

export class InvalidOperationNameError extends ArcheonError {
  constructor(name: string) {
    super("INVALID_OPERATION_NAME", `Invalid operation name: "${name}".`);
  }
}

export class InvalidModuleDefinitionError extends ArcheonError {
  constructor(message: string) {
    super("INVALID_MODULE_DEFINITION", message);
  }
}
