const fs = require('fs');

const path = 'packages/domain/src/__tests__/rehydration.test.ts';
let content = fs.readFileSync(path, 'utf8');

// We have appended the test at the very end. Let's remove the last test.
// First remove the last test, and add it before the last `});`
const testContent = `
  test('Test 7: Invalid structural snapshot', () => {
    const invalidSnapshot = getBaseSnapshot();
    (invalidSnapshot as any).problem = undefined;
    
    assert.throws(() => {
      Investigation.rehydrate(invalidSnapshot);
    }, TypeError);
  });
`;

// we have appended it outside, let's just write the whole file properly.
content = `
import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { 
  Investigation, 
  InvestigationStatus,
  InvestigationSnapshot 
} from '../index.js';
import { EvidenceType, ActorType } from '../value-objects.js';

describe('Investigation Rehydration', () => {
  const getBaseSnapshot = (): InvestigationSnapshot => ({
    id: 'INV-123',
    status: InvestigationStatus.INFORMATION_GATHERING,
    problem: { what: 'x', where: 'y', when: 'z', frequency: 'w', deviation: 'v' },
    evidence: [],
    hypotheses: [],
    verifications: []
  });

  test('Test 1 & 2: State preservation & No InvestigationOpened event', () => {
    const snapshot = getBaseSnapshot();
    const inv = Investigation.rehydrate(snapshot);

    assert.strictEqual(inv.id, 'INV-123');
    assert.strictEqual(inv.status, InvestigationStatus.INFORMATION_GATHERING);
    assert.deepStrictEqual(inv.problem, snapshot.problem);
    
    // Rule A: No events
    assert.strictEqual(inv.domainEvents.length, 0, 'Rehydration MUST NOT emit any events');
  });

  test('Test 3 & 4: Closed-state restoration and Post-rehydration terminal protection', () => {
    const snapshot = getBaseSnapshot();
    snapshot.status = InvestigationStatus.ROOT_CAUSE_CONFIRMED;
    snapshot.rootCause = {
      hypothesisId: 'H1',
      verificationTestId: 'T1',
      confirmedBy: 'ADMIN',
      confirmedAt: new Date()
    };

    const inv = Investigation.rehydrate(snapshot);
    assert.strictEqual(inv.status, InvestigationStatus.ROOT_CAUSE_CONFIRMED);

    // Rule C & D: Mutation must fail due to terminal state lock
    assert.throws(() => {
      inv.recordEvidence({
        id: 'E1', content: 'test', type: EvidenceType.FACT,
        provenance: { actorType: ActorType.HUMAN, referenceId: 'R', timestamp: new Date() }
      });
    }, /closed/i);
  });

  test('Test 5 & 6: Snapshot aliasing attack (shallow & nested)', () => {
    const snapshot = getBaseSnapshot();
    snapshot.evidence = [{
      id: 'E1', content: 'C', type: EvidenceType.FACT, 
      provenance: { actorType: ActorType.HUMAN, referenceId: 'R', timestamp: new Date() }
    }];

    const inv = Investigation.rehydrate(snapshot);
    
    // Mutate snapshot
    snapshot.id = 'HACKED';
    snapshot.status = InvestigationStatus.ROOT_CAUSE_CONFIRMED;
    (snapshot.evidence[0] as any).content = 'HACKED_CONTENT';
    (snapshot.evidence[0] as any).provenance.referenceId = 'HACKED_REF';

    // Verify aggregate is isolated
    assert.strictEqual(inv.id, 'INV-123');
    assert.strictEqual(inv.status, InvestigationStatus.INFORMATION_GATHERING);
    assert.strictEqual(inv.evidence[0].content, 'C');
    assert.strictEqual(inv.evidence[0].provenance.referenceId, 'R');
  });

  test('Test 7: Invalid structural snapshot', () => {
    const invalidSnapshot = getBaseSnapshot();
    (invalidSnapshot as any).problem = undefined;
    
    assert.throws(() => {
      Investigation.rehydrate(invalidSnapshot);
    }, TypeError);
  });
});
`;

fs.writeFileSync(path, content);
