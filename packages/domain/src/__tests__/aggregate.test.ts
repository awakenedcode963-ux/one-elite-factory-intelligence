import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { Investigation, InvestigationStatus } from '../aggregate.js';
import { ProblemDefinition, EvidenceType, ActorType, GovernanceAuthorization, EvidenceItem } from '../value-objects.js';
import { InvalidStateTransitionError, InvariantViolationError } from '../errors.js';
import { HypothesisStatus, ConfidenceLevel, VerificationStatus } from '../entities.js';

describe('Investigation Aggregate - FI-14.2 Tests', () => {

  const problem: ProblemDefinition = {
    what: 'Pressure drop',
    where: 'Line A',
    when: 'Shift 1',
    frequency: 'Continuous',
    deviation: '5 bar drop'
  };

  const auth: GovernanceAuthorization = {
    approverId: 'human-eng-1',
    timestamp: new Date()
  };

  test('Truth Boundary: AI Score high cannot bypass verification for Root Cause', () => {
    const inv = new Investigation('INV-01', problem);
    
    // Add evidence and hypothesis
    inv.recordEvidence({
      id: 'E1', content: 'Pressure is low', type: EvidenceType.OBSERVATION,
      provenance: { actorType: ActorType.HUMAN, referenceId: 'op1', timestamp: new Date() }
    });
    inv.formulateHypothesis('H1', 'Valve is broken');

    // Score hypothesis extremely high (99%)
    // But since no FACT evidence, it should fail to raise to HIGH
    assert.throws(() => {
      inv.scoreHypothesis('H1', { evidenceFor: 10, evidenceAgainst: 0, likelihood: 99 });
    }, /Cannot raise hypothesis confidence to HIGH without FACT evidence/);

    // Add a FACT evidence
    inv.recordEvidence({
      id: 'E2', content: 'Sensor 5 bar confirmed', type: EvidenceType.FACT,
      provenance: { actorType: ActorType.SYSTEM, referenceId: 's1', timestamp: new Date() }
    });

    // Now scoring high works
    inv.scoreHypothesis('H1', { evidenceFor: 10, evidenceAgainst: 0, likelihood: 99 });
    assert.strictEqual(inv.hypotheses[0].confidenceLevel, ConfidenceLevel.HIGH);

    // Try to confirm root cause without verification test -> fails
    assert.throws(() => {
      inv.confirmRootCause('H1', 'NON_EXISTENT_TEST', auth);
    }, /VerificationTest with ID NON_EXISTENT_TEST not found/);
    
    // Propose test, don't approve it
    inv.proposeVerification('T1', 'H1', { baseline: '5 bar', proposedChange: 'Fix valve', expectedResult: '10 bar' });
    
    assert.throws(() => {
      inv.confirmRootCause('H1', 'T1', auth);
    }, /Root cause confirmation requires a successful evaluated verification test/);
  });

  test('Human Governance Boundary: Cannot record result on unapproved test', () => {
    const inv = new Investigation('INV-02', problem);
    inv.recordEvidence({ id: 'E1', content: 'a', type: EvidenceType.FACT, provenance: { actorType: ActorType.HUMAN, referenceId: 'op1', timestamp: new Date() } });
    inv.formulateHypothesis('H1', 'Desc');
    inv.proposeVerification('T1', 'H1', { baseline: 'b', proposedChange: 'c', expectedResult: 'd' });

    // Agent tries to record result directly -> fails
    assert.throws(() => {
      inv.recordVerificationResult('T1', 'Result', true);
    }, /No verification result may be recorded unless the test has been explicitly approved/);

    // Human approves
    inv.approveVerification('T1', auth);

    // Now it can be recorded
    inv.recordVerificationResult('T1', 'd', true);
    assert.strictEqual(inv.verifications[0].status, VerificationStatus.EVALUATED);
  });

  test('Evidence Integrity: Cannot delete, but can supersede', () => {
    const inv = new Investigation('INV-03', problem);
    inv.recordEvidence({ id: 'E1', content: '210C', type: EvidenceType.FACT, provenance: { actorType: ActorType.HUMAN, referenceId: 'op1', timestamp: new Date() } });

    // Try to record with same ID -> fails
    assert.throws(() => {
      inv.recordEvidence({ id: 'E1', content: '195C', type: EvidenceType.FACT, provenance: { actorType: ActorType.HUMAN, referenceId: 'op1', timestamp: new Date() } });
    }, /Evidence with ID E1 already exists/);

    // Supersede
    inv.supersedeEvidence('E1', { id: 'E2', content: '195C', type: EvidenceType.FACT, provenance: { actorType: ActorType.HUMAN, referenceId: 'op1', timestamp: new Date() } });

    assert.strictEqual(inv.evidence.length, 2);
    
    const e1 = inv.evidence.find(e => e.id === 'E1');
    assert.ok(e1);
    assert.strictEqual(e1.supersededBy, 'E2');

    const e2 = inv.evidence.find(e => e.id === 'E2');
    assert.ok(e2);
    assert.strictEqual(e2.content, '195C');
    
    // Deleting evidence is structurally impossible as no method exists and property is ReadOnlyArray
  });

  test('Aggregate Integrity: Internal state cannot be modified externally', () => {
    const inv = new Investigation('INV-04', problem);
    inv.recordEvidence({ id: 'E1', content: 'a', type: EvidenceType.FACT, provenance: { actorType: ActorType.HUMAN, referenceId: 'op1', timestamp: new Date() } });
    
    // TS prevents this at compile time, but let's cast to any to test runtime protection
    // Oh wait, get evidence() returns a new Array in the aggregate getter, so mutation won't affect internal state
    const evidenceList = inv.evidence as any;
    evidenceList.push({ id: 'HACK', content: 'hacked' });
    
    assert.strictEqual(inv.evidence.length, 1, 'Aggregate state should not be polluted by mutating the getter return value');
  });

  test('Full Lifecycle: Valid End-to-End', () => {
    const inv = new Investigation('INV-05', problem);
    assert.strictEqual(inv.status, InvestigationStatus.INFORMATION_GATHERING);

    inv.recordEvidence({ id: 'E1', content: 'Fact 1', type: EvidenceType.FACT, provenance: { actorType: ActorType.HUMAN, referenceId: 'op1', timestamp: new Date() } });
    assert.strictEqual(inv.status, InvestigationStatus.HYPOTHESIS_FORMATION);

    inv.formulateHypothesis('H1', 'Hypothesis 1');
    inv.scoreHypothesis('H1', { evidenceFor: 5, evidenceAgainst: 0, likelihood: 60 });
    assert.strictEqual(inv.status, InvestigationStatus.VERIFICATION_REQUIRED);

    inv.proposeVerification('T1', 'H1', { baseline: 'a', proposedChange: 'b', expectedResult: 'c' });
    inv.approveVerification('T1', auth);
    inv.recordVerificationResult('T1', 'c', true);
    assert.strictEqual(inv.status, InvestigationStatus.ROOT_CAUSE_SUPPORTED);

    inv.confirmRootCause('H1', 'T1', auth);
    assert.strictEqual(inv.status, InvestigationStatus.ROOT_CAUSE_CONFIRMED);
    assert.strictEqual(inv.hypotheses[0].status, HypothesisStatus.CONFIRMED);
    assert.strictEqual(inv.rootCause?.hypothesisId, 'H1');
  });

  test('Negative: Verification for Rejected Hypothesis', () => {
    const inv = new Investigation('INV-06', problem);
    inv.recordEvidence({ id: 'E1', content: 'a', type: EvidenceType.FACT, provenance: { actorType: ActorType.HUMAN, referenceId: 'op1', timestamp: new Date() } });
    inv.formulateHypothesis('H1', 'Desc');
    inv.rejectHypothesis('H1');

    assert.throws(() => {
      inv.proposeVerification('T1', 'H1', { baseline: 'b', proposedChange: 'c', expectedResult: 'd' });
    }, /Cannot propose verification for a rejected hypothesis/);
  });
});
