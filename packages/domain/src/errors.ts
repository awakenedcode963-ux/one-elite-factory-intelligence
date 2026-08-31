export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class InvalidStateTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(`Cannot transition from ${from} to ${to}`);
  }
}

export class UnauthorizedActionError extends DomainError {
  constructor(action: string) {
    super(`Unauthorized action: ${action}`);
  }
}

export class InvariantViolationError extends DomainError {
  constructor(rule: string) {
    super(`Invariant violation: ${rule}`);
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with ID ${id} not found`);
  }
}
