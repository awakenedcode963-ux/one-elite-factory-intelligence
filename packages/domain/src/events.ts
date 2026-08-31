import { ProblemDefinition, EvidenceItem, GovernanceAuthorization } from './value-objects.js';
import { VerificationTestParameters } from './entities.js';

export interface DomainEvent {
  readonly type: string;
  readonly aggregateId: string;
  readonly timestamp: Date;
}

export class InvestigationOpened implements DomainEvent {
  public readonly type = 'InvestigationOpened';
  public readonly timestamp = new Date();
  public readonly problem: ProblemDefinition;
  
  constructor(public readonly aggregateId: string, problem: ProblemDefinition) {
    this.problem = { ...problem };
  }
}

export class EvidenceRecorded implements DomainEvent {
  public readonly type = 'EvidenceRecorded';
  public readonly timestamp = new Date();
  public readonly evidence: EvidenceItem;
  
  constructor(public readonly aggregateId: string, evidence: EvidenceItem) {
    this.evidence = { ...evidence, provenance: { ...evidence.provenance } };
  }
}

export class EvidenceSuperseded implements DomainEvent {
  public readonly type = 'EvidenceSuperseded';
  public readonly timestamp = new Date();
  public readonly newEvidence: EvidenceItem;
  
  constructor(
    public readonly aggregateId: string, 
    public readonly oldEvidenceId: string, 
    newEvidence: EvidenceItem
  ) {
    this.newEvidence = { ...newEvidence, provenance: { ...newEvidence.provenance } };
  }
}

export class HypothesisFormulated implements DomainEvent {
  public readonly type = 'HypothesisFormulated';
  public readonly timestamp = new Date();
  constructor(
    public readonly aggregateId: string, 
    public readonly hypothesisId: string, 
    public readonly description: string
  ) {}
}

export class VerificationProposed implements DomainEvent {
  public readonly type = 'VerificationProposed';
  public readonly timestamp = new Date();
  public readonly parameters: VerificationTestParameters;
  
  constructor(
    public readonly aggregateId: string, 
    public readonly testId: string, 
    public readonly hypothesisId: string, 
    parameters: VerificationTestParameters
  ) {
    this.parameters = { ...parameters };
  }
}

export class VerificationApproved implements DomainEvent {
  public readonly type = 'VerificationApproved';
  public readonly timestamp = new Date();
  public readonly authorization: GovernanceAuthorization;
  
  constructor(
    public readonly aggregateId: string, 
    public readonly testId: string, 
    authorization: GovernanceAuthorization
  ) {
    this.authorization = { ...authorization };
  }
}

export class VerificationCompleted implements DomainEvent {
  public readonly type = 'VerificationCompleted';
  public readonly timestamp = new Date();
  constructor(
    public readonly aggregateId: string, 
    public readonly testId: string, 
    public readonly successful: boolean
  ) {}
}

export class RootCauseConfirmed implements DomainEvent {
  public readonly type = 'RootCauseConfirmed';
  public readonly timestamp = new Date();
  constructor(
    public readonly aggregateId: string, 
    public readonly hypothesisId: string, 
    public readonly testId: string
  ) {}
}
