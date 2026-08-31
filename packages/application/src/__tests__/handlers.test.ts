import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { IInvestigationRepository, IUnitOfWork, ResultEnvelope, ExecutionContext, GovernanceAuthorization } from '@fi/contracts';
import { Investigation, ProblemDefinition, EvidenceType, ActorType } from '@fi/domain';
import { RecordEvidenceHandler } from '../handlers/record-evidence.handler.js';
import { ConfirmRootCauseHandler } from '../handlers/confirm-root-cause.handler.js';
import { FormulateHypothesisHandler } from '../handlers/formulate-hypothesis.handler.js';
import { ProposeVerificationHandler } from '../handlers/propose-verification.handler.js';
import { ApproveVerificationHandler } from '../handlers/approve-verification.handler.js';
import { RecordVerificationResultHandler } from '../handlers/record-verification-result.handler.js';
import { CommandValidationError } from '../errors/command-validation.error.js';

class InMemoryInvestigationRepository implements IInvestigationRepository<Investigation> {
  public store = new Map<string, Investigation>();
  public saveCalledCount = 0;
  public failNextSave = false;

  async findById(id: string): Promise<Investigation> {
    const inv = this.store.get(id);
    if (!inv) throw new Error("Not found inside db port");
    return inv;
  }

  async save(investigation: Investigation): Promise<void> {
    if (this.failNextSave) {
      this.failNextSave = false;
      throw new Error("Repository save failed");
    }
    this.saveCalledCount++;
    this.store.set(investigation.id, investigation);
  }
}

class SafeInMemoryInvestigationRepository extends InMemoryInvestigationRepository {
  async findById(id: string): Promise<Investigation> {
    return this.store.get(id) as any;
  }
}

class InMemoryUnitOfWork implements IUnitOfWork {
  public beginCalledCount = 0;
  public commitCalledCount = 0;
  public rollbackCalledCount = 0;
  public failNextCommit = false;

  async begin(): Promise<void> {
    this.beginCalledCount++;
  }

  async commit(): Promise<void> {
    if (this.failNextCommit) {
      this.failNextCommit = false;
      throw new Error("Commit failed");
    }
    this.commitCalledCount++;
  }

  async rollback(): Promise<void> {
    this.rollbackCalledCount++;
  }
}

describe('Application Handlers', () => {
  const mockContext: ExecutionContext = {
    execution_id: 'e1',
    task_id: 't1',
    agent_id: 'a1',
    agent_type: 'test',
    tenant_id: 'tenant1',
    investigation_id: 'inv1',
    authorized_actor_context: {},
    allowed_tools: [],
    allowed_data_domains: [],
    policy_version: '1.0'
  };

  const problem: ProblemDefinition = { what: 'x', where: 'y', when: 'z', frequency: 'w', deviation: 'v' };

  test('A - Successful execution', async () => {
    const repo = new SafeInMemoryInvestigationRepository();
    const uow = new InMemoryUnitOfWork();
    const inv = new Investigation('INV1', problem);
    repo.store.set('INV1', inv);

    const handler = new RecordEvidenceHandler(repo, uow);
    const result = await handler.execute({
      investigationId: 'INV1',
      context: mockContext,
      evidence: {
        id: 'E1',
        content: 'Observation 1',
        type: EvidenceType.OBSERVATION,
        provenance: { actorType: ActorType.HUMAN, referenceId: 'R1', timestamp: new Date() }
      }
    });

    assert.strictEqual(result.success, true);
    assert.strictEqual(uow.beginCalledCount, 1, 'UoW begin called');
    assert.strictEqual(repo.saveCalledCount, 1, 'Repo save called');
    assert.strictEqual(uow.commitCalledCount, 1, 'UoW commit called');
    assert.strictEqual(uow.rollbackCalledCount, 0, 'UoW rollback NOT called');
  });

  test('B - Domain failure triggers rollback', async () => {
    const repo = new SafeInMemoryInvestigationRepository();
    const uow = new InMemoryUnitOfWork();
    const inv = new Investigation('INV1', problem);
    repo.store.set('INV1', inv);

    const handler = new FormulateHypothesisHandler(repo, uow);
    const result = await handler.execute({
      investigationId: 'INV1',
      context: mockContext,
      hypothesisId: 'H1',
      description: 'Hypothesis'
    });

    assert.strictEqual(result.success, false);
    assert.match((result.error as Error).message, /Cannot transition/, 'Semantic domain error preserved');
    assert.strictEqual(uow.beginCalledCount, 1);
    assert.strictEqual(repo.saveCalledCount, 0, 'Save should not be called');
    assert.strictEqual(uow.rollbackCalledCount, 1, 'UoW rollback called');
  });

  test('C - Repository failure triggers rollback', async () => {
    const repo = new SafeInMemoryInvestigationRepository();
    repo.failNextSave = true;
    const uow = new InMemoryUnitOfWork();
    const inv = new Investigation('INV1', problem);
    repo.store.set('INV1', inv);

    const handler = new RecordEvidenceHandler(repo, uow);
    const result = await handler.execute({
      investigationId: 'INV1',
      context: mockContext,
      evidence: {
        id: 'E1',
        content: 'Observation 1',
        type: EvidenceType.OBSERVATION,
        provenance: { actorType: ActorType.HUMAN, referenceId: 'R1', timestamp: new Date() }
      }
    });

    assert.strictEqual(result.success, false);
    assert.match((result.error as Error).message, /Repository save failed/);
    assert.strictEqual(uow.rollbackCalledCount, 1);
  });

  test('D - Missing Aggregate', async () => {
    const repo = new SafeInMemoryInvestigationRepository();
    const uow = new InMemoryUnitOfWork();

    const handler = new RecordEvidenceHandler(repo, uow);
    const result = await handler.execute({
      investigationId: 'MISSING',
      context: mockContext,
      evidence: {
        id: 'E1',
        content: 'Observation 1',
        type: EvidenceType.OBSERVATION,
        provenance: { actorType: ActorType.HUMAN, referenceId: 'R1', timestamp: new Date() }
      }
    });

    assert.strictEqual(result.success, false);
    assert.match((result.error as Error).message, /Investigation with ID MISSING not found/);
    assert.strictEqual(uow.rollbackCalledCount, 1);
  });

  test('E - Context validation', async () => {
    const repo = new SafeInMemoryInvestigationRepository();
    const uow = new InMemoryUnitOfWork();
    
    const handler = new RecordEvidenceHandler(repo, uow);
    const result = await handler.execute({
      investigationId: 'INV1',
      context: null as any,
      evidence: {} as any
    });

    assert.strictEqual(result.success, false);
    assert.ok(result.error instanceof CommandValidationError);
    assert.strictEqual(uow.beginCalledCount, 0, 'Should reject before UoW begins');
  });

  test('F - Aggregate bypass protection', async () => {
    const repo = new SafeInMemoryInvestigationRepository();
    const uow = new InMemoryUnitOfWork();
    const inv = new Investigation('INV1', problem);
    repo.store.set('INV1', inv);

    const handler = new ConfirmRootCauseHandler(repo, uow);
    const result = await handler.execute({
      investigationId: 'INV1',
      context: mockContext,
      hypothesisId: 'H1',
      testId: 'T1',
      authorization: { approverId: 'a', timestamp: new Date() }
    });

    assert.strictEqual(result.success, false);
    assert.strictEqual(uow.rollbackCalledCount, 1);
  });

  test('G - Result isolation', async () => {
    const repo = new SafeInMemoryInvestigationRepository();
    const uow = new InMemoryUnitOfWork();
    const inv = new Investigation('INV1', problem);
    repo.store.set('INV1', inv);

    const handler = new RecordEvidenceHandler(repo, uow);
    const result = await handler.execute({
      investigationId: 'INV1',
      context: mockContext,
      evidence: {
        id: 'E1',
        content: 'Observation 1',
        type: EvidenceType.OBSERVATION,
        provenance: { actorType: ActorType.HUMAN, referenceId: 'R1', timestamp: new Date() }
      }
    });

    assert.strictEqual((result as any).aggregate, undefined);
  });
});
