
import { ExecutionContext } from '@fi/contracts';
import { EvidenceItem, HypothesisScoreVector, GovernanceAuthorization } from '@fi/domain';
import { VerificationTestParameters } from '@fi/domain';

export interface RecordVerificationResultCommand {
  readonly investigationId: string;
  readonly context: ExecutionContext;
  readonly testId: string;
  readonly   actualResult: string;
  readonly   successful: boolean;
}
