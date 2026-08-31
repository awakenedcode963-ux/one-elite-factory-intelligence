export interface InvestigationCommandPort {
  startInvestigation(id: string, what: string, where: string, when: string, frequency: string, deviation: string): Promise<void>;
  addEvidence(id: string, type: string, source: string, content: string): Promise<void>;
  formulateHypothesis(id: string, title: string, description: string): Promise<void>;
  scoreHypothesis(id: string, score: number, confidence: string): Promise<void>;
  rejectHypothesis(id: string): Promise<void>;
  proposeVerification(id: string, proposedAction: string): Promise<void>;
  approveVerification(id: string): Promise<void>;
  rejectVerification(id: string): Promise<void>;
  recordVerificationResult(id: string, result: string, supportsHypothesis: boolean): Promise<void>;
  confirmRootCause(id: string): Promise<void>;
}
