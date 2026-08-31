
export class ConcurrencyConflictError extends Error {
  constructor(message: string) {
    super(`Concurrency Conflict: ${message}`);
    this.name = this.constructor.name;
  }
}
