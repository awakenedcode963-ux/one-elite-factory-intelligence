
import { ExecutionContext } from '@fi/contracts';
import { EvidenceItem, HypothesisScoreVector, GovernanceAuthorization } from '@fi/domain';
import { VerificationTestParameters } from '@fi/domain';

export interface SupersedeEvidenceCommand {
  readonly investigationId: string;
  readonly context: ExecutionContext;
  readonly oldEvidenceId: string;
  readonly   newEvidence: EvidenceItem;
}
