export enum EvidenceType {
  FACT = 'FACT',
  OBSERVATION = 'OBSERVATION',
  ASSUMPTION = 'ASSUMPTION',
  KNOWLEDGE = 'KNOWLEDGE',
}

export enum ActorType {
  HUMAN = 'HUMAN',
  AGENT = 'AGENT',
  SYSTEM = 'SYSTEM',
}

export interface Provenance {
  readonly actorType: ActorType;
  readonly referenceId: string;
  readonly timestamp: Date;
}

export interface ProblemDefinition {
  readonly what: string;
  readonly where: string;
  readonly when: string;
  readonly frequency: string;
  readonly deviation: string;
}

export interface EvidenceItem {
  readonly id: string;
  readonly content: string;
  readonly type: EvidenceType;
  readonly provenance: Provenance;
  readonly supersededBy?: string; // ID of the new evidence that supersedes this one
}

export interface HypothesisScoreVector {
  readonly evidenceFor: number;
  readonly evidenceAgainst: number;
  readonly likelihood: number; // e.g., 0-100
}

export interface GovernanceAuthorization {
  readonly approverId: string;
  readonly timestamp: Date;
  readonly signature?: string; // Optional cryptographic proof (deferred)
}

export interface RootCause {
  readonly hypothesisId: string;
  readonly verificationTestId: string;
  readonly confirmedBy: string; // the approver ID
  readonly confirmedAt: Date;
}
