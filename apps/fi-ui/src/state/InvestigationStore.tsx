import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { InvestigationCommandPort } from './InvestigationCommandPort.js';

export type InvestigationStatus = 
  | 'INFORMATION_GATHERING'
  | 'HYPOTHESIS_FORMATION'
  | 'VERIFICATION_REQUIRED'
  | 'ROOT_CAUSE_SUPPORTED'
  | 'ROOT_CAUSE_CONFIRMED';

export interface EvidenceState {
  id: string;
  type: string;
  source: string;
  content: string;
  timestamp: string;
  isConfirmed: boolean;
}

export interface HypothesisState {
  id: string;
  title: string;
  description: string;
  status: 'ACTIVE' | 'REJECTED' | 'CONFIRMED';
  confidence: 'LOW' | 'MEDIUM' | 'HIGH' | 'CONFIRMED';
  score?: number;
}

export interface VerificationState {
  id: string;
  hypothesisId: string;
  proposedAction: string;
  status: 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  result?: string;
}

export interface ThreadMessage {
  id: string;
  sender: 'HUMAN' | 'SYSTEM' | 'AGENT';
  content: string;
  timestamp: string;
}

export interface InvestigationPresentationState {
  id: string;
  title: string;
  context: string;
  status: InvestigationStatus;
  evidence: EvidenceState[];
  hypotheses: HypothesisState[];
  verifications: VerificationState[];
  thread: ThreadMessage[];
  rootCauseId?: string;
  isExecuting?: boolean;
  error?: string | null;
}

type Action = 
  | { type: 'START', payload: { id: string, title: string, context: string } }
  | { type: 'ADD_EVIDENCE', payload: EvidenceState }
  | { type: 'FORMULATE_HYPOTHESIS', payload: HypothesisState }
  | { type: 'SCORE_HYPOTHESIS', payload: { id: string, score: number, confidence: HypothesisState['confidence'] } }
  | { type: 'REJECT_HYPOTHESIS', payload: { id: string } }
  | { type: 'PROPOSE_VERIFICATION', payload: VerificationState }
  | { type: 'APPROVE_VERIFICATION', payload: { id: string } }
  | { type: 'RECORD_VERIFICATION_RESULT', payload: { id: string, result: string, supports: boolean } }
  | { type: 'CONFIRM_ROOT_CAUSE', payload: { id: string } }
  | { type: 'ADD_MESSAGE', payload: ThreadMessage }
  | { type: 'SET_EXECUTING', payload: boolean }
  | { type: 'SET_ERROR', payload: string | null };

const initialState: InvestigationPresentationState = {
  id: 'INV-000',
  title: 'New Investigation',
  context: 'Unknown Context',
  status: 'INFORMATION_GATHERING',
  evidence: [],
  hypotheses: [],
  verifications: [],
  thread: [],
  isExecuting: false,
  error: null,
};

function reducer(state: InvestigationPresentationState, action: Action): InvestigationPresentationState {
  switch (action.type) {
    case 'SET_EXECUTING':
      return { ...state, isExecuting: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'START':
      return { ...state, id: action.payload.id, title: action.payload.title, context: action.payload.context, status: 'INFORMATION_GATHERING' };
    case 'ADD_MESSAGE':
      return { ...state, thread: [...state.thread, action.payload] };
    case 'ADD_EVIDENCE':
      return { ...state, evidence: [...state.evidence, action.payload] };
    case 'FORMULATE_HYPOTHESIS':
      return { ...state, status: 'HYPOTHESIS_FORMATION', hypotheses: [...state.hypotheses, action.payload] };
    case 'SCORE_HYPOTHESIS':
      return { 
        ...state, 
        hypotheses: state.hypotheses.map(h => h.id === action.payload.id ? { ...h, score: action.payload.score, confidence: action.payload.confidence } : h)
      };
    case 'REJECT_HYPOTHESIS':
      return {
        ...state,
        hypotheses: state.hypotheses.map(h => h.id === action.payload.id ? { ...h, status: 'REJECTED' } : h)
      };
    case 'PROPOSE_VERIFICATION':
      return { ...state, status: 'VERIFICATION_REQUIRED', verifications: [...state.verifications, action.payload] };
    case 'APPROVE_VERIFICATION':
      return {
        ...state,
        verifications: state.verifications.map(v => v.id === action.payload.id ? { ...v, status: 'APPROVED' } : v)
      };
    case 'RECORD_VERIFICATION_RESULT':
      return {
        ...state,
        status: action.payload.supports ? 'ROOT_CAUSE_SUPPORTED' : 'HYPOTHESIS_FORMATION',
        verifications: state.verifications.map(v => v.id === action.payload.id ? { ...v, status: 'COMPLETED', result: action.payload.result } : v)
      };
    case 'CONFIRM_ROOT_CAUSE':
      return {
        ...state,
        status: 'ROOT_CAUSE_CONFIRMED',
        rootCauseId: action.payload.id,
        hypotheses: state.hypotheses.map(h => h.id === action.payload.id ? { ...h, status: 'CONFIRMED', confidence: 'CONFIRMED' } : h)
      };
    default:
      return state;
  }
}

const StateContext = createContext<InvestigationPresentationState>(initialState);
const DispatchContext = createContext<React.Dispatch<Action>>(() => null);

export const InvestigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
};

export const useInvestigationState = () => useContext(StateContext);
export const useInvestigationDispatch = () => useContext(DispatchContext);
