import { HypothesisScoreVector } from './value-objects.js';

export enum ConfidenceLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum HypothesisStatus {
  ACTIVE = 'ACTIVE',
  REJECTED = 'REJECTED',
  CONFIRMED = 'CONFIRMED',
}

export interface HypothesisState {
  readonly id: string;
  readonly description: string;
  readonly createdAt: Date;
  readonly status: HypothesisStatus;
  readonly confidenceLevel: ConfidenceLevel;
  readonly score?: HypothesisScoreVector;
}

export class Hypothesis {
  private _status: HypothesisStatus = HypothesisStatus.ACTIVE;
  private _confidenceLevel: ConfidenceLevel = ConfidenceLevel.LOW;
  private _score?: HypothesisScoreVector;

  constructor(
    public readonly id: string,
    public readonly description: string,
    public readonly createdAt: Date = new Date()
  ) {}

  get status(): HypothesisStatus { return this._status; }

  public reject(): void { 
    this._status = HypothesisStatus.REJECTED; 
  }
  
  public confirm(): void { 
    this._status = HypothesisStatus.CONFIRMED; 
  }
  
  public updateScore(score: HypothesisScoreVector, confidence: ConfidenceLevel): void {
    // CRITICAL FIX: Sever input reference aliasing
    this._score = { ...score };
    this._confidenceLevel = confidence;
  }

  public static rehydrate(state: HypothesisState): Hypothesis {
    const instance = new Hypothesis(state.id, state.description, state.createdAt);
    instance._status = state.status;
    instance._confidenceLevel = state.confidenceLevel;
    instance._score = state.score ? { ...state.score } : undefined;
    return instance;
  }
  public getState(): HypothesisState {
    return {
      id: this.id,
      description: this.description,
      createdAt: this.createdAt,
      status: this._status,
      confidenceLevel: this._confidenceLevel,
      score: this._score ? { ...this._score } : undefined
    };
  }
}

export enum VerificationStatus {
  PROPOSED = 'PROPOSED',
  APPROVED = 'APPROVED',
  EXECUTED = 'EXECUTED',
  EVALUATED = 'EVALUATED',
}

export interface VerificationTestParameters {
  readonly baseline: string;
  readonly proposedChange: string;
  readonly expectedResult: string;
}

export interface VerificationTestState {
  readonly id: string;
  readonly targetHypothesisId: string;
  readonly parameters: VerificationTestParameters;
  readonly createdAt: Date;
  readonly status: VerificationStatus;
  readonly actualResult?: string;
  readonly successful?: boolean;
}

export class VerificationTest {
  private _status: VerificationStatus = VerificationStatus.PROPOSED;
  private _actualResult?: string;
  private _successful?: boolean;
  public readonly parameters: VerificationTestParameters;

  constructor(
    public readonly id: string,
    public readonly targetHypothesisId: string,
    parameters: VerificationTestParameters,
    public readonly createdAt: Date = new Date()
  ) {
    // CRITICAL FIX: Sever input reference aliasing
    this.parameters = { ...parameters };
  }

  get status(): VerificationStatus { return this._status; }
  get targetHypothesisIdProp(): string { return this.targetHypothesisId; }
  get successful(): boolean | undefined { return this._successful; }

  public approve(): void {
    this._status = VerificationStatus.APPROVED;
  }

  public evaluate(actualResult: string, successful: boolean): void {
    this._actualResult = actualResult;
    this._successful = successful;
    this._status = VerificationStatus.EVALUATED;
  }

  public static rehydrate(state: VerificationTestState): VerificationTest {
    const instance = new VerificationTest(state.id, state.targetHypothesisId, state.parameters, state.createdAt);
    instance._status = state.status;
    instance._actualResult = state.actualResult;
    instance._successful = state.successful;
    return instance;
  }
  public getState(): VerificationTestState {
    return {
      id: this.id,
      targetHypothesisId: this.targetHypothesisId,
      parameters: { ...this.parameters },
      createdAt: this.createdAt,
      status: this._status,
      actualResult: this._actualResult,
      successful: this._successful
    };
  }
}
