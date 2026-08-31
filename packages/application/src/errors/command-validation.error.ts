
export class CommandValidationError extends Error {
  constructor(message: string) {
    super(`Command Validation Error: ${message}`);
    this.name = this.constructor.name;
  }
}
