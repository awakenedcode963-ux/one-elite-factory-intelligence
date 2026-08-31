import { ExecutionContext, ApprovalToken } from '../../contracts/src/index.js';

export class CapabilityEvaluator {
  evaluate(context: ExecutionContext): boolean {
    return true;
  }
}

export class AuthorizationEvaluator {
  evaluate(context: ExecutionContext): boolean {
    return true;
  }
}

export class ScopeEvaluator {
  evaluate(context: ExecutionContext): boolean {
    return true;
  }
}

export class GovernanceEvaluator {
  evaluate(context: ExecutionContext, token: ApprovalToken): boolean {
    return true;
  }
}
