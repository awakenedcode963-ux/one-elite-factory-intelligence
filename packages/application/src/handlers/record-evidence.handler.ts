
import { IInvestigationRepository, IUnitOfWork, ResultEnvelope } from '@fi/contracts';
import { Investigation, EntityNotFoundError } from '@fi/domain';
import { RecordEvidenceCommand } from '../commands/record-evidence.command.js';
import { CommandValidationError } from '../errors/command-validation.error.js';

export class RecordEvidenceHandler {
  constructor(
    private readonly repository: IInvestigationRepository<Investigation>,
    private readonly uow: IUnitOfWork
  ) {}

  async execute(command: RecordEvidenceCommand): Promise<ResultEnvelope<void>> {
    try {
      if (!command.investigationId) throw new CommandValidationError("investigationId is required");
      if (!command.context || !command.context.tenant_id) throw new CommandValidationError("Valid ExecutionContext is required");
      if (!command.evidence) throw new CommandValidationError("evidence is required");

      await this.uow.begin();

      const aggregate = await this.repository.findById(command.investigationId);
      if (!aggregate) {
        throw new EntityNotFoundError('Investigation', command.investigationId);
      }

      aggregate.recordEvidence(command.evidence);

      await this.repository.save(aggregate);
      await this.uow.commit();

      return { success: true };
    } catch (error) {
      try {
        await this.uow.rollback();
      } catch (rollbackError) {
        (error as any).rollbackError = rollbackError;
      }
      return { success: false, error: error as Error };
    }
  }
}
