import { InvestigationCommandPort } from './InvestigationCommandPort.js';
import { Dispatch } from 'react';

export class MockCommandAdapter implements InvestigationCommandPort {
  constructor(private dispatch: Dispatch<any>) {}

  private now() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  async startInvestigation(id: string, what: string, where: string, when: string, frequency: string, deviation: string): Promise<void> {
    this.dispatch({ type: 'START', payload: { id, title: what, context: `${where} | ${when}` } });
    this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'SYSTEM', content: 'Investigation opened.', timestamp: this.now() }});
  }

  async addEvidence(id: string, type: string, source: string, content: string): Promise<void> {
    this.dispatch({ type: 'ADD_EVIDENCE', payload: { id, type, source, content, timestamp: this.now(), isConfirmed: true } });
    this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'SYSTEM', content: `Evidence recorded: ${type}`, timestamp: this.now() }});
  }

  async formulateHypothesis(id: string, title: string, description: string): Promise<void> {
    this.dispatch({ type: 'FORMULATE_HYPOTHESIS', payload: { id, title, description, status: 'ACTIVE', confidence: 'LOW' } });
    this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'AGENT', content: `Formulated hypothesis: ${title}`, timestamp: this.now() }});
  }

  async scoreHypothesis(id: string, score: number, confidence: 'LOW' | 'MEDIUM' | 'HIGH' | 'CONFIRMED'): Promise<void> {
    this.dispatch({ type: 'SCORE_HYPOTHESIS', payload: { id, score, confidence } });
    this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'SYSTEM', content: `Hypothesis scored.`, timestamp: this.now() }});
  }

  async rejectHypothesis(id: string): Promise<void> {
    this.dispatch({ type: 'REJECT_HYPOTHESIS', payload: { id } });
    this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'AGENT', content: `Hypothesis rejected based on evidence.`, timestamp: this.now() }});
  }

  async proposeVerification(id: string, proposedAction: string): Promise<void> {
    this.dispatch({ type: 'PROPOSE_VERIFICATION', payload: { id: Date.now().toString(), hypothesisId: id, proposedAction, status: 'PROPOSED' } });
    this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'AGENT', content: `Verification required: ${proposedAction}`, timestamp: this.now() }});
  }

  async approveVerification(id: string): Promise<void> {
    this.dispatch({ type: 'APPROVE_VERIFICATION', payload: { id } });
    this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'HUMAN', content: 'Verification approved.', timestamp: this.now() }});
    this.dispatch({ type: 'ADD_MESSAGE', payload: { id: (Date.now() + 1).toString(), sender: 'SYSTEM', content: 'Verification test started.', timestamp: this.now() }});
  }

  async rejectVerification(id: string): Promise<void> {
    this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'HUMAN', content: 'Verification rejected.', timestamp: this.now() }});
  }

  async recordVerificationResult(id: string, result: string, supports: boolean): Promise<void> {
    this.dispatch({ type: 'RECORD_VERIFICATION_RESULT', payload: { id, result, supports } });
    this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'SYSTEM', content: `Result: ${result}`, timestamp: this.now() }});
  }

  async confirmRootCause(id: string): Promise<void> {
    this.dispatch({ type: 'CONFIRM_ROOT_CAUSE', payload: { id } });
    this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'SYSTEM', content: 'Root cause confirmed. Investigation closed.', timestamp: this.now() }});
  }
  
  // Custom mock method just to drive the demo
  async simulateUserMessage(content: string) {
     this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'HUMAN', content, timestamp: this.now() }});
  }
}
