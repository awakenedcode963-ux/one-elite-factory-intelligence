import { IInvestigationRepository, IUnitOfWork } from '../../../../packages/contracts/src/index.js';


export class InMemoryInvestigationRepository implements IInvestigationRepository<any> {
  private store = new Map<string, any>();

  async findById(id: string): Promise<any> {
    const investigation = this.store.get(id);
    return investigation as any;
  }

  async save(investigation: any): Promise<void> {
    this.store.set(investigation.id, investigation);
  }
}

export class InMemoryUnitOfWork implements IUnitOfWork {
  async begin(): Promise<void> {}
  async commit(): Promise<void> {}
  async rollback(): Promise<void> {}
}
