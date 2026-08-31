
import { IInvestigationRepository, IUnitOfWork, ResultEnvelope } from '@fi/contracts';
import { Investigation, EntityNotFoundError } from '@fi/domain';
import { ConfirmRootCauseCommand } from '../commands/confirm-root-cause.command.js';
import { CommandValidationError } from '../errors/command-validation.error.js';

export class ConfirmRootCauseHandler {
  constructor(
    private readonly repository: IInvestigationRepository<Investigation>,
    private readonly uow: IUnitOfWork
  ) {}

  async execute(command: ConfirmRootCauseCommand): Promise<ResultEnvelope<void>> {
    try {
      if (!command.investigationId) throw new CommandValidationError("investigationId is required");
      if (!command.context || !command.context.tenant_id) throw new CommandValidationError("Valid ExecutionContext is required");
      if (!command.hypothesisId || !command.testId || !command.authorization) throw new CommandValidationError("Missing required fields");

      await this.uow.begin();

      const aggregate = await this.repository.findById(command.investigationId);
      if (!aggregate) {
        throw new EntityNotFoundError('Investigation', command.investigationId);
      }

      aggregate.confirmRootCause(command.hypothesisId, command.testId, command.authorization);

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
