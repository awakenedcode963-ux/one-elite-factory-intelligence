import { ProblemDefinition, EvidenceItem, RootCause } from './value-objects.js';
import { HypothesisState, VerificationTestState } from './entities.js';
import { InvestigationStatus } from './aggregate.js';

export interface ProblemDefinitionSnapshot extends ProblemDefinition {}
export interface EvidenceSnapshot extends EvidenceItem {}
export interface HypothesisSnapshot extends HypothesisState {}
export interface VerificationSnapshot extends VerificationTestState {}
export interface RootCauseSnapshot extends RootCause {}

export interface InvestigationSnapshot {
  readonly id: string;
  readonly status: InvestigationStatus;
  readonly problem: ProblemDefinitionSnapshot;
  readonly evidence: ReadonlyArray<EvidenceSnapshot>;
  readonly hypotheses: ReadonlyArray<HypothesisSnapshot>;
  readonly verifications: ReadonlyArray<VerificationSnapshot>;
  readonly rootCause?: RootCauseSnapshot;
}
