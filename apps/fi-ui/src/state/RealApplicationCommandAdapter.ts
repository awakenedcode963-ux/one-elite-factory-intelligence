import { Dispatch } from 'react';
import { InvestigationCommandPort } from './InvestigationCommandPort.js';
import { ExecutionContext, IInvestigationRepository, IUnitOfWork } from '../../../../packages/contracts/src/index.js';
import { 
  StartInvestigationHandler,
  RecordEvidenceHandler,
  FormulateHypothesisHandler,
  ScoreHypothesisHandler,
  RejectHypothesisHandler,
  ProposeVerificationHandler,
  ApproveVerificationHandler,
  RecordVerificationResultHandler,
  ConfirmRootCauseHandler
} from '../../../../packages/application/src/index.js';

// We map generic types so we don't import from @fi/domain in the UI.
export class RealApplicationCommandAdapter implements InvestigationCommandPort {
  private handlers: {
    start: StartInvestigationHandler;
    evidence: RecordEvidenceHandler;
    formulate: FormulateHypothesisHandler;
    score: ScoreHypothesisHandler;
    reject: RejectHypothesisHandler;
    propose: ProposeVerificationHandler;
    approve: ApproveVerificationHandler;
    recordResult: RecordVerificationResultHandler;
    confirm: ConfirmRootCauseHandler;
  };
  
  private context: ExecutionContext = {
    execution_id: 'EX-123',
    task_id: 'TASK-123',
    agent_id: 'UI-AGENT',
    agent_type: 'HUMAN_OVERRIDE',
    tenant_id: 'TENANT-1',
    investigation_id: '',
    authorized_actor_context: { user: 'human' },
    allowed_tools: [],
    allowed_data_domains: [],
    policy_version: '1.0'
  };

  private lastTestId: string = "";

  private approvalToken: any = {
    tenant_id: 'TENANT-1',
    investigation_id: '',
    operation: 'approve_verification',
    target_version: '1',
    fingerprint: 'mock-sig',
    actor: 'human'
  };

  constructor(
    private dispatch: Dispatch<any>,
    repo: IInvestigationRepository<any>,
    uow: IUnitOfWork
  ) {
    this.handlers = {
      start: new StartInvestigationHandler(repo, uow),
      evidence: new RecordEvidenceHandler(repo, uow),
      formulate: new FormulateHypothesisHandler(repo, uow),
      score: new ScoreHypothesisHandler(repo, uow),
      reject: new RejectHypothesisHandler(repo, uow),
      propose: new ProposeVerificationHandler(repo, uow),
      approve: new ApproveVerificationHandler(repo, uow),
      recordResult: new RecordVerificationResultHandler(repo, uow),
      confirm: new ConfirmRootCauseHandler(repo, uow),
    };
  }

  private now() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private getContext(invId: string) {
    return { ...this.context, investigation_id: invId };
  }

  async startInvestigation(id: string, what: string, where: string, when: string, frequency: string, deviation: string): Promise<void> {
    this.dispatch({ type: 'SET_EXECUTING', payload: true });
    
    const command = {
      investigationId: id,
      context: this.getContext(id),
      problem: { what, where, when, frequency, deviation }
    };
    
    const result = await this.handlers.start.execute(command);
    
    if (result.success) {
      this.dispatch({ type: 'START', payload: { id, title: what, context: `${where} | ${when}` } });
      this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'SYSTEM', content: 'Investigation opened.', timestamp: this.now() }});
      this.dispatch({ type: 'SET_ERROR', payload: null });
    } else {
      this.dispatch({ type: 'SET_ERROR', payload: result.error?.message || 'Failed to start investigation' });
    }
    
    this.dispatch({ type: 'SET_EXECUTING', payload: false });
  }

  async addEvidence(id: string, type: string, source: string, content: string): Promise<void> {
    this.dispatch({ type: 'SET_EXECUTING', payload: true });
    
    const command = {
      investigationId: 'INV-2026-089', // Hardcoding for UI demo since port doesn't pass invId
      context: this.getContext('INV-2026-089'),
      evidence: {
        id,
        type: type as any,
        content,
        provenance: {
          actorType: 'HUMAN' as any,
          referenceId: source,
          timestamp: new Date()
        }
      }
    };
    
    const result = await this.handlers.evidence.execute(command);
    
    if (result.success) {
      this.dispatch({ type: 'ADD_EVIDENCE', payload: { id, type, source, content, timestamp: this.now(), isConfirmed: true } });
      this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'SYSTEM', content: `Evidence recorded: ${type}`, timestamp: this.now() }});
      this.dispatch({ type: 'SET_ERROR', payload: null });
    } else {
      this.dispatch({ type: 'SET_ERROR', payload: result.error?.message || 'Failed to record evidence' });
    }
    this.dispatch({ type: 'SET_EXECUTING', payload: false });
  }

  async formulateHypothesis(id: string, title: string, description: string): Promise<void> {
    this.dispatch({ type: 'SET_EXECUTING', payload: true });
    
    const command = {
      investigationId: 'INV-2026-089',
      context: this.getContext('INV-2026-089'),
      hypothesisId: id,
      description: `${title}: ${description}`
    };
    
    const result = await this.handlers.formulate.execute(command);
    if (result.success) {
      this.dispatch({ type: 'FORMULATE_HYPOTHESIS', payload: { id, title, description, status: 'ACTIVE', confidence: 'LOW' } });
      this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'AGENT', content: `Formulated hypothesis: ${title}`, timestamp: this.now() }});
      this.dispatch({ type: 'SET_ERROR', payload: null });
    } else {
      this.dispatch({ type: 'SET_ERROR', payload: result.error?.message || 'Failed to formulate' });
    }
    this.dispatch({ type: 'SET_EXECUTING', payload: false });
  }

  async scoreHypothesis(id: string, score: number, confidence: 'LOW' | 'MEDIUM' | 'HIGH' | 'CONFIRMED'): Promise<void> {
    this.dispatch({ type: 'SET_EXECUTING', payload: true });
    
    const command = {
      investigationId: 'INV-2026-089',
      context: this.getContext('INV-2026-089'),
      hypothesisId: id,
      score: {
        evidenceFor: score,
        evidenceAgainst: 100 - score,
        likelihood: score
      }
    };
    
    const result = await this.handlers.score.execute(command);
    if (result.success) {
      this.dispatch({ type: 'SCORE_HYPOTHESIS', payload: { id, score, confidence } });
      this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'SYSTEM', content: `Hypothesis scored.`, timestamp: this.now() }});
      this.dispatch({ type: 'SET_ERROR', payload: null });
    } else {
      this.dispatch({ type: 'SET_ERROR', payload: result.error?.message || 'Failed to score' });
    }
    this.dispatch({ type: 'SET_EXECUTING', payload: false });
  }

  async rejectHypothesis(id: string): Promise<void> {
    this.dispatch({ type: 'SET_EXECUTING', payload: true });
    const command = {
      investigationId: 'INV-2026-089',
      context: this.getContext('INV-2026-089'),
      hypothesisId: id
    };
    const result = await this.handlers.reject.execute(command);
    if (result.success) {
      this.dispatch({ type: 'REJECT_HYPOTHESIS', payload: { id } });
      this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'AGENT', content: `Hypothesis rejected based on evidence.`, timestamp: this.now() }});
      this.dispatch({ type: 'SET_ERROR', payload: null });
    } else {
      this.dispatch({ type: 'SET_ERROR', payload: result.error?.message || 'Failed to reject' });
    }
    this.dispatch({ type: 'SET_EXECUTING', payload: false });
  }

  async proposeVerification(id: string, proposedAction: string): Promise<void> {
    this.dispatch({ type: 'SET_EXECUTING', payload: true });
    const testId = Date.now().toString();
    this.lastTestId = testId;
    const command = {
      investigationId: 'INV-2026-089',
      context: this.getContext('INV-2026-089'),
      testId: testId,
      hypothesisId: id,
      parameters: {
        baseline: "Current state",
        proposedChange: proposedAction,
        expectedResult: "Validation of hypothesis"
      }
    };
    
    const result = await this.handlers.propose.execute(command);
    if (result.success) {
      this.dispatch({ type: 'PROPOSE_VERIFICATION', payload: { id: testId, hypothesisId: id, proposedAction, status: 'PROPOSED' } });
      this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'AGENT', content: `Verification required: ${proposedAction}`, timestamp: this.now() }});
      this.dispatch({ type: 'SET_ERROR', payload: null });
    } else {
      this.dispatch({ type: 'SET_ERROR', payload: result.error?.message || 'Failed to propose verification' });
    }
    this.dispatch({ type: 'SET_EXECUTING', payload: false });
  }

  async approveVerification(id: string): Promise<void> {
    this.dispatch({ type: 'SET_EXECUTING', payload: true });
    
    const command = {
      investigationId: 'INV-2026-089',
      context: this.getContext('INV-2026-089'),
      testId: id,
      authorization: {
        approverId: 'human',
        timestamp: new Date(),
        signature: 'mock-sig'
      }
    };
    
    const result = await this.handlers.approve.execute(command);
    if (result.success) {
      this.dispatch({ type: 'APPROVE_VERIFICATION', payload: { id } });
      this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'HUMAN', content: 'Verification approved.', timestamp: this.now() }});
      this.dispatch({ type: 'ADD_MESSAGE', payload: { id: (Date.now() + 1).toString(), sender: 'SYSTEM', content: 'Verification test started.', timestamp: this.now() }});
      this.dispatch({ type: 'SET_ERROR', payload: null });
    } else {
      this.dispatch({ type: 'SET_ERROR', payload: result.error?.message || 'Failed to approve verification' });
    }
    this.dispatch({ type: 'SET_EXECUTING', payload: false });
  }

  async rejectVerification(id: string): Promise<void> {
    this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'HUMAN', content: 'Verification rejected.', timestamp: this.now() }});
  }

  async recordVerificationResult(id: string, result: string, supports: boolean): Promise<void> {
    this.dispatch({ type: 'SET_EXECUTING', payload: true });
    
    const command = {
      investigationId: 'INV-2026-089',
      context: this.getContext('INV-2026-089'),
      testId: id,
      actualResult: result,
      successful: supports
    };
    
    const handlerResult = await this.handlers.recordResult.execute(command);
    if (handlerResult.success) {
      this.dispatch({ type: 'RECORD_VERIFICATION_RESULT', payload: { id, result, supports } });
      this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'SYSTEM', content: `Result: ${result}`, timestamp: this.now() }});
      this.dispatch({ type: 'SET_ERROR', payload: null });
    } else {
      this.dispatch({ type: 'SET_ERROR', payload: handlerResult.error?.message || 'Failed to record result' });
    }
    this.dispatch({ type: 'SET_EXECUTING', payload: false });
  }

  async simulateUserMessage(content: string) {
    this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'HUMAN', content, timestamp: this.now() }});
  }

  async confirmRootCause(id: string): Promise<void> {
    this.dispatch({ type: 'SET_EXECUTING', payload: true });
    
    const command = {
      investigationId: 'INV-2026-089',
      context: this.getContext('INV-2026-089'),
      hypothesisId: id,
      testId: this.lastTestId,
      authorization: {
        approverId: 'human',
        timestamp: new Date(),
        signature: 'mock-sig'
      }
    };
    
    const result = await this.handlers.confirm.execute(command);
    if (result.success) {
      this.dispatch({ type: 'CONFIRM_ROOT_CAUSE', payload: { id } });
      this.dispatch({ type: 'ADD_MESSAGE', payload: { id: Date.now().toString(), sender: 'SYSTEM', content: 'Root cause confirmed. Investigation closed.', timestamp: this.now() }});
      this.dispatch({ type: 'SET_ERROR', payload: null });
    } else {
      this.dispatch({ type: 'SET_ERROR', payload: result.error?.message || 'Failed to confirm root cause' });
    }
    this.dispatch({ type: 'SET_EXECUTING', payload: false });
  }
}
