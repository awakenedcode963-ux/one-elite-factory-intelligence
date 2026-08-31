import { ExecutionContext } from '../../contracts/src/index.js';
import { AuthorizationEvaluator } from '../../policy/src/index.js';

export class Tool {
  constructor(private evaluator: AuthorizationEvaluator) {}
}
