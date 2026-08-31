import { InvestigationSnapshot } from './snapshots.js';
import { DomainEvent, InvestigationOpened, EvidenceRecorded, HypothesisFormulated, VerificationProposed, VerificationApproved, VerificationCompleted, RootCauseConfirmed, EvidenceSuperseded } from './events.js';
import { ProblemDefinition, EvidenceItem, RootCause, HypothesisScoreVector, GovernanceAuthorization, EvidenceType } from './value-objects.js';
import { Hypothesis, HypothesisState, VerificationTest, VerificationTestState, VerificationTestParameters, ConfidenceLevel, HypothesisStatus, VerificationStatus } from './entities.js';
import { InvalidStateTransitionError, InvariantViolationError, EntityNotFoundError } from './errors.js';

export enum InvestigationStatus {
  INFORMATION_GATHERING = 'INFORMATION_GATHERING',
  HYPOTHESIS_FORMATION = 'HYPOTHESIS_FORMATION',
  VERIFICATION_REQUIRED = 'VERIFICATION_REQUIRED',
  ROOT_CAUSE_SUPPORTED = 'ROOT_CAUSE_SUPPORTED',
  ROOT_CAUSE_CONFIRMED = 'ROOT_CAUSE_CONFIRMED'
}

export class Investigation {
  private _id: string;
  private _status: InvestigationStatus = InvestigationStatus.INFORMATION_GATHERING;
  private _problem: ProblemDefinition;
  
  private _evidence: Map<string, EvidenceItem> = new Map();
  private _hypotheses: Map<string, Hypothesis> = new Map();
  private _verifications: Map<string, VerificationTest> = new Map();
  
  private _rootCause?: RootCause;
  private _events: DomainEvent[] = [];

  constructor(id: string, problem: ProblemDefinition, isRehydration: boolean = false) {
    this._id = id;
    // CRITICAL FIX: Defensively clone to prevent input reference aliasing
    this._problem = { ...problem };
    if (!isRehydration) {
      this.addEvent(new InvestigationOpened(this.id, this._problem));
    }
  }


  // --- REHYDRATION SEAM ---
  public static rehydrate(snapshot: InvestigationSnapshot): Investigation {
    if (!snapshot || typeof snapshot.id !== 'string' || !snapshot.problem || typeof snapshot.problem !== 'object') {
      throw new TypeError("Invalid structural snapshot");
    }
    // 1. Explicit controlled construction path via normal constructor using flag
    const instance = new Investigation(snapshot.id, snapshot.problem, true);

    // 2. Direct mapping of internal state
    instance._status = snapshot.status;
    
    // 3. Reconstruct collections safely (deep cloning where needed)
    instance._evidence = new Map(
      snapshot.evidence.map(e => [
        e.id, 
        { ...e, provenance: { ...e.provenance } }
      ])
    );

    instance._hypotheses = new Map(
      snapshot.hypotheses.map(h => [
        h.id, 
        Hypothesis.rehydrate(h)
      ])
    );

    instance._verifications = new Map(
      snapshot.verifications.map(v => [
        v.id, 
        VerificationTest.rehydrate(v)
      ])
    );

    instance._rootCause = snapshot.rootCause 
      ? { ...snapshot.rootCause } 
      : undefined;

    // 4. Ensure events remain completely empty
    instance._events = [];

    return instance;
  }

  // Properties (Read-Only access to state)
  get id(): string { return this._id; }
  get status(): InvestigationStatus { return this._status; }
  get problem(): ProblemDefinition { return { ...this._problem }; }
  
  get rootCause(): RootCause | undefined { 
    return this._rootCause ? { ...this._rootCause } : undefined; 
  }
  
  get domainEvents(): ReadonlyArray<DomainEvent> { 
    return [...this._events]; 
  }
  
  get evidence(): ReadonlyArray<EvidenceItem> { 
    return Array.from(this._evidence.values()).map(e => ({ 
      ...e, 
      provenance: { ...e.provenance } 
    })); 
  }
  
  get hypotheses(): ReadonlyArray<HypothesisState> { 
    return Array.from(this._hypotheses.values()).map(h => h.getState()); 
  }
  
  get verifications(): ReadonlyArray<VerificationTestState> { 
    return Array.from(this._verifications.values()).map(v => v.getState()); 
  }

  public clearEvents(): void {
    this._events = [];
  }

  private addEvent(event: DomainEvent): void {
    this._events.push(event);
  }

  // CRITICAL FIX: Terminal State Lock
  private ensureNotClosed(): void {
    if (this._status === InvestigationStatus.ROOT_CAUSE_CONFIRMED) {
      throw new InvariantViolationError("Investigation is closed. No further investigative mutations are allowed.");
    }
  }

  // 1. Evidence
  public recordEvidence(evidence: EvidenceItem): void {
    this.ensureNotClosed();
    
    if (this._evidence.has(evidence.id)) {
      throw new InvariantViolationError(`Evidence with ID ${evidence.id} already exists.`);
    }
    
    // CRITICAL FIX: Defensively clone to prevent input reference aliasing
    const detachedEvidence: EvidenceItem = { 
      ...evidence, 
      provenance: { ...evidence.provenance } 
    };
    
    this._evidence.set(detachedEvidence.id, detachedEvidence);
    this.addEvent(new EvidenceRecorded(this.id, detachedEvidence));
    
    // Auto-transition to HYPOTHESIS_FORMATION if still in INFORMATION_GATHERING
    if (this._status === InvestigationStatus.INFORMATION_GATHERING) {
      this._status = InvestigationStatus.HYPOTHESIS_FORMATION;
    }
  }

  public supersedeEvidence(oldEvidenceId: string, newEvidence: EvidenceItem): void {
    this.ensureNotClosed();
    
    const oldEvidence = this._evidence.get(oldEvidenceId);
    if (!oldEvidence) {
      throw new EntityNotFoundError('Evidence', oldEvidenceId);
    }
    
    if (this._evidence.has(newEvidence.id)) {
      throw new InvariantViolationError(`Evidence with ID ${newEvidence.id} already exists. Cannot supersede into an existing ID.`);
    }
    
    // Create superseded copy of old evidence
    const supersededOld = { ...oldEvidence, supersededBy: newEvidence.id };
    this._evidence.set(oldEvidenceId, supersededOld);
    
    // CRITICAL FIX: Defensively clone new evidence to prevent input reference aliasing
    const detachedNewEvidence: EvidenceItem = { 
      ...newEvidence, 
      provenance: { ...newEvidence.provenance } 
    };
    
    this._evidence.set(detachedNewEvidence.id, detachedNewEvidence);
    this.addEvent(new EvidenceSuperseded(this.id, oldEvidenceId, detachedNewEvidence));
  }

  // 2. Hypotheses
  public formulateHypothesis(id: string, description: string): void {
    this.ensureNotClosed();
    
    if (this._status === InvestigationStatus.INFORMATION_GATHERING) {
      throw new InvalidStateTransitionError(this._status, InvestigationStatus.HYPOTHESIS_FORMATION);
    }
    
    if (this._hypotheses.has(id)) {
      throw new InvariantViolationError(`Hypothesis with ID ${id} already exists.`);
    }
    
    const hypothesis = new Hypothesis(id, description);
    this._hypotheses.set(id, hypothesis);
    this.addEvent(new HypothesisFormulated(this.id, id, description));
  }

  public scoreHypothesis(hypothesisId: string, score: HypothesisScoreVector): void {
    this.ensureNotClosed();
    
    const hypothesis = this._hypotheses.get(hypothesisId);
    if (!hypothesis) {
      throw new EntityNotFoundError('Hypothesis', hypothesisId);
    }
    
    let confidence = ConfidenceLevel.LOW;
    
    // Try to adjust confidence
    if (score.likelihood >= 80) {
      // Cannot raise to HIGH without FACT
      const hasFact = Array.from(this._evidence.values()).some(e => e.type === EvidenceType.FACT && !e.supersededBy);
      if (!hasFact) {
        throw new InvariantViolationError("Cannot raise hypothesis confidence to HIGH without FACT evidence.");
      }
      confidence = ConfidenceLevel.HIGH;
    } else if (score.likelihood >= 50) {
      confidence = ConfidenceLevel.MEDIUM;
    }

    // Input score is defensively cloned inside Hypothesis entity
    hypothesis.updateScore(score, confidence);

    // Auto-transition to VERIFICATION_REQUIRED if applicable
    if (this._status === InvestigationStatus.HYPOTHESIS_FORMATION && confidence !== ConfidenceLevel.LOW) {
      this._status = InvestigationStatus.VERIFICATION_REQUIRED;
    }
  }

  public rejectHypothesis(hypothesisId: string): void {
    this.ensureNotClosed();
    
    const hypothesis = this._hypotheses.get(hypothesisId);
    if (!hypothesis) {
      throw new EntityNotFoundError('Hypothesis', hypothesisId);
    }
    hypothesis.reject();
  }

  // 3. Verification
  public proposeVerification(testId: string, hypothesisId: string, parameters: VerificationTestParameters): void {
    this.ensureNotClosed();
    
    const hypothesis = this._hypotheses.get(hypothesisId);
    if (!hypothesis) {
      throw new EntityNotFoundError('Hypothesis', hypothesisId);
    }
    if (hypothesis.status === HypothesisStatus.REJECTED) {
      throw new InvariantViolationError("Cannot propose verification for a rejected hypothesis.");
    }
    
    if (this._verifications.has(testId)) {
      throw new InvariantViolationError(`VerificationTest with ID ${testId} already exists.`);
    }

    // Input parameters are defensively cloned inside VerificationTest constructor
    const test = new VerificationTest(testId, hypothesisId, parameters);
    this._verifications.set(testId, test);
    this.addEvent(new VerificationProposed(this.id, testId, hypothesisId, test.parameters));
  }

  public approveVerification(testId: string, authorization: GovernanceAuthorization): void {
    this.ensureNotClosed();
    
    const test = this._verifications.get(testId);
    if (!test) {
      throw new EntityNotFoundError('VerificationTest', testId);
    }
    if (test.status !== VerificationStatus.PROPOSED) {
      throw new InvariantViolationError(`Cannot approve test that is in ${test.status} state.`);
    }
    
    test.approve();
    this.addEvent(new VerificationApproved(this.id, testId, authorization));
  }

  public recordVerificationResult(testId: string, actualResult: string, successful: boolean): void {
    this.ensureNotClosed();
    
    const test = this._verifications.get(testId);
    if (!test) {
      throw new EntityNotFoundError('VerificationTest', testId);
    }
    if (test.status !== VerificationStatus.APPROVED) {
      throw new InvariantViolationError("No verification result may be recorded unless the test has been explicitly approved.");
    }

    test.evaluate(actualResult, successful);
    
    this.addEvent(new VerificationCompleted(this.id, testId, successful));

    if (successful && (this._status === InvestigationStatus.VERIFICATION_REQUIRED || this._status === InvestigationStatus.HYPOTHESIS_FORMATION)) {
      this._status = InvestigationStatus.ROOT_CAUSE_SUPPORTED;
    }
  }

  // 4. Root Cause Confirmation
  public confirmRootCause(hypothesisId: string, testId: string, authorization: GovernanceAuthorization): void {
    this.ensureNotClosed(); // Also protects confirmRootCause

    const hypothesis = this._hypotheses.get(hypothesisId);
    if (!hypothesis) {
      throw new EntityNotFoundError('Hypothesis', hypothesisId);
    }
    
    if (hypothesis.status === HypothesisStatus.REJECTED) {
      throw new InvariantViolationError("Cannot confirm a rejected hypothesis as root cause.");
    }
    
    const test = this._verifications.get(testId);
    if (!test) {
      throw new EntityNotFoundError('VerificationTest', testId);
    }
    if (test.targetHypothesisIdProp !== hypothesisId) {
      throw new InvariantViolationError("Verification test does not target the specified hypothesis.");
    }
    if (test.status !== VerificationStatus.EVALUATED || !test.successful) {
      throw new InvariantViolationError("Root cause confirmation requires a successful evaluated verification test.");
    }

    this._rootCause = {
      hypothesisId,
      verificationTestId: testId,
      confirmedBy: authorization.approverId,
      confirmedAt: authorization.timestamp
    };
    
    hypothesis.confirm();
    this._status = InvestigationStatus.ROOT_CAUSE_CONFIRMED;
    
    this.addEvent(new RootCauseConfirmed(this.id, hypothesisId, testId));
  }
}
