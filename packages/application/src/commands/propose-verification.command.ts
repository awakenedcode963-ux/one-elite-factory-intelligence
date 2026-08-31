
import { ExecutionContext } from '@fi/contracts';
import { EvidenceItem, HypothesisScoreVector, GovernanceAuthorization } from '@fi/domain';
import { VerificationTestParameters } from '@fi/domain';

export interface ProposeVerificationCommand {
  readonly investigationId: string;
  readonly context: ExecutionContext;
  readonly testId: string;
  readonly   hypothesisId: string;
  readonly   parameters: VerificationTestParameters;
}
