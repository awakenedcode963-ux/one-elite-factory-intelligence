
import { ExecutionContext } from '@fi/contracts';
import { EvidenceItem, HypothesisScoreVector, GovernanceAuthorization } from '@fi/domain';
import { VerificationTestParameters } from '@fi/domain';

export interface RejectHypothesisCommand {
  readonly investigationId: string;
  readonly context: ExecutionContext;
  readonly hypothesisId: string;
}
