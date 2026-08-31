import { ExecutionContext } from '@fi/contracts';
import { ProblemDefinition } from '@fi/domain';

export interface StartInvestigationCommand {
  readonly investigationId: string;
  readonly context: ExecutionContext;
  readonly problem: ProblemDefinition;
}
