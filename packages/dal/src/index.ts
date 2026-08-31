import { IInvestigationRepository, IUnitOfWork } from '../../contracts/src/index.js';

export class PostgresInvestigationRepository implements IInvestigationRepository {
  public async findById(id: string): Promise<any> {
    return { id };
  }
}

export class PostgresUnitOfWork implements IUnitOfWork {
  public async commit(): Promise<void> {}
  public async rollback(): Promise<void> {}
}
import { InvestigationService } from '../../domain/src/index.js';
