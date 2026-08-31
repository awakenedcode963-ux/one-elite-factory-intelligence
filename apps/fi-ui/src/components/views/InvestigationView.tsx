import React, { useMemo } from 'react';
import { InvestigationShell } from '../layout/InvestigationShell.js';
import { IntelligenceThread } from '../layout/IntelligenceThread.js';
import { ArtifactBoard } from '../layout/ArtifactBoard.js';
import { GovernanceOverlay } from '../layout/GovernanceOverlay.js';
import { EvidenceCard } from '../artifacts/EvidenceCard.js';
import { HypothesisCard } from '../artifacts/HypothesisCard.js';
import { Button } from '../ui/Button.js';
import { Badge } from '../ui/Badge.js';
import { ThemeProvider } from '../../providers/ThemeProvider.js';
import { InvestigationProvider, useInvestigationState, useInvestigationDispatch } from '../../state/InvestigationStore.js';
import { MockCommandAdapter } from '../../state/MockCommandAdapter.js';
import { RealApplicationCommandAdapter } from '../../state/RealApplicationCommandAdapter.js';
import { InMemoryInvestigationRepository, InMemoryUnitOfWork } from '../../state/InMemoryInvestigationRepository.js';

const InvestigationContent = () => {
  const state = useInvestigationState();
  const dispatch = useInvestigationDispatch();
  const adapter = useMemo(() => {
    const repo = new InMemoryInvestigationRepository();
    const uow = new InMemoryUnitOfWork();
    return new RealApplicationCommandAdapter(dispatch, repo, uow);
  }, [dispatch]);

  const showGovernance = state.status === 'VERIFICATION_REQUIRED';
  const pendingVerification = state.verifications.find(v => v.status === 'PROPOSED');

  const header = (
    <>
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight">{state.id}</span>
          <span className="text-xs text-slate-500">{state.context}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={state.status === 'ROOT_CAUSE_CONFIRMED' ? 'default' : 'pending'}>{state.status}</Badge>
        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-medium">
          AE
        </div>
      </div>
    </>
  );

  const thread = (
    <IntelligenceThread>
      {state.thread.map(msg => (
        <div key={msg.id} className={`flex flex-col space-y-1 ${msg.sender === 'HUMAN' ? 'items-end' : 'items-start'}`}>
          {msg.sender === 'SYSTEM' ? (
            <div className="flex items-center gap-2">
              <Badge variant="info">SYSTEM</Badge>
              <span className="text-xs text-slate-500">{msg.content}</span>
            </div>
          ) : (
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
              msg.sender === 'HUMAN' 
                ? 'rounded-se-sm bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900' 
                : 'rounded-ss-sm bg-white border border-slate-200 text-slate-900 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100'
            }`}>
              {msg.content}
            </div>
          )}
          <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
        </div>
      ))}
      
      {/* Dev Controls for Mock Journey */}
      <div className="pt-8 pb-4 border-t border-slate-200 dark:border-slate-800 mt-8 space-y-2">
        <span className="text-[10px] uppercase font-bold text-slate-400">Mock Journey Controls</span>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => adapter.startInvestigation('INV-2026-089', 'Wall thickness below specification', 'Extrusion Line 3', 'Shift 1', 'Continuous', '-0.5 mm')}>1. Start</Button>
          <Button variant="outline" size="sm" onClick={() => adapter.simulateUserMessage('We are seeing repeated wall thickness variations on Line 3. Extruder temperature was oscillating earlier.')}>2. User Input</Button>
          <Button variant="outline" size="sm" onClick={() => adapter.addEvidence('EV-1', 'SCADA_LOG', 'Extrusion Line 3', 'Zone 4 temperature oscillating between 185°C and 200°C (Setpoint: 190°C) continuously since 07:30 AM.')}>3. Evidence 1</Button>
          <Button variant="outline" size="sm" onClick={() => adapter.addEvidence('EV-2', 'OPERATOR_OBSERVATION', 'Shift Supervisor', 'Wall thickness drops below minimum specification (3.2mm) intermittently.')}>4. Evidence 2</Button>
          <Button variant="outline" size="sm" onClick={() => adapter.formulateHypothesis('HYP-1', 'Heater Band Failure on Zone 4', 'The heater band is partially shorted or failing.')}>5. Hypothesis 1</Button>
          <Button variant="outline" size="sm" onClick={() => adapter.scoreHypothesis('HYP-1', 85, 'MEDIUM')}>6. Score HYP-1</Button>
          <Button variant="outline" size="sm" onClick={() => adapter.formulateHypothesis('HYP-2', 'Material Moisture Content High', 'PVC blend was not dried properly.')}>7. Hypothesis 2</Button>
          <Button variant="outline" size="sm" onClick={() => adapter.rejectHypothesis('HYP-2')}>8. Reject HYP-2</Button>
          <Button variant="outline" size="sm" onClick={() => adapter.proposeVerification('HYP-1', 'Check the electrical resistance of the Zone 4 heater band to confirm failure. This requires pausing the line.')}>9. Propose Verification</Button>
          <Button variant="outline" size="sm" onClick={() => adapter.recordVerificationResult(pendingVerification?.id || '', 'Resistance measured at 12 ohms (Expected: 45 ohms). Heater band is shorted.', true)}>10. Record Result</Button>
          <Button variant="outline" size="sm" onClick={() => adapter.confirmRootCause('HYP-1')}>11. Confirm Root Cause</Button>
        </div>
      </div>
    </IntelligenceThread>
  );

  const board = (
    <ArtifactBoard>
      <div className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Evidence</h2>
        {state.evidence.length === 0 && <span className="text-xs text-slate-400 italic">No evidence recorded.</span>}
        {state.evidence.map(ev => (
          <EvidenceCard 
            key={ev.id}
            type={ev.type}
            source={ev.source}
            content={ev.content}
            timestamp={`Recorded ${ev.timestamp}`}
            isConfirmed={ev.isConfirmed}
            className={state.status === 'ROOT_CAUSE_CONFIRMED' ? 'opacity-80' : ''}
          />
        ))}
      </div>

      <div className="space-y-4 lg:col-span-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Hypotheses</h2>
        {state.hypotheses.length === 0 && <span className="text-xs text-slate-400 italic">No hypotheses formulated.</span>}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {state.hypotheses.map(hyp => (
            <HypothesisCard 
              key={hyp.id}
              title={hyp.title}
              description={hyp.description}
              status={hyp.status}
              confidence={hyp.confidence}
              score={hyp.score}
              className={state.status === 'ROOT_CAUSE_CONFIRMED' && hyp.status !== 'CONFIRMED' ? 'opacity-40 grayscale' : ''}
            />
          ))}
        </div>
      </div>
    </ArtifactBoard>
  );

  const overlay = showGovernance && pendingVerification ? (
    <GovernanceOverlay>
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Approve Verification Test</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          The system proposes: {pendingVerification.proposedAction}
        </p>
        <div className="flex items-center gap-3 pt-4">
          <Button variant="secondary" className="flex-1" onClick={() => adapter.rejectVerification(pendingVerification.id)}>Reject</Button>
          <Button variant="primary" className="flex-1 bg-amber-600 hover:bg-amber-700 text-white" onClick={() => adapter.approveVerification(pendingVerification.id)}>Authorize Test</Button>
        </div>
      </div>
    </GovernanceOverlay>
  ) : null;

  return (
    <InvestigationShell 
      header={header}
      thread={thread}
      board={board}
      overlay={overlay}
    />
  );
};

export const InvestigationView = () => (
  <ThemeProvider defaultTheme="system">
    <InvestigationProvider>
      <InvestigationContent />
    </InvestigationProvider>
  </ThemeProvider>
);
