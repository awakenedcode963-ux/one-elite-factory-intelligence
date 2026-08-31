import { PostgresInvestigationRepository, PostgresUnitOfWork } from '../../dal/src/index.js';
import { InvestigationService } from '../../domain/src/index.js';
import { Sandbox } from '../../agent-runtime/src/index.js';

export function bootstrap() {
  const repo = new PostgresInvestigationRepository();
  const uow = new PostgresUnitOfWork();
  const service = new InvestigationService(repo, uow);
  return { service };
}
