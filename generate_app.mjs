import fs from 'fs';
import path from 'path';

const src = 'packages/application/src';

const commands = [
  { name: 'record-evidence', cls: 'RecordEvidence', payload: 'evidence: EvidenceItem;' },
  { name: 'supersede-evidence', cls: 'SupersedeEvidence', payload: 'oldEvidenceId: string;\n  newEvidence: EvidenceItem;' },
  { name: 'formulate-hypothesis', cls: 'FormulateHypothesis', payload: 'hypothesisId: string;\n  description: string;' },
  { name: 'score-hypothesis', cls: 'ScoreHypothesis', payload: 'hypothesisId: string;\n  score: HypothesisScoreVector;' },
  { name: 'reject-hypothesis', cls: 'RejectHypothesis', payload: 'hypothesisId: string;' },
  { name: 'propose-verification', cls: 'ProposeVerification', payload: 'testId: string;\n  hypothesisId: string;\n  parameters: VerificationTestParameters;' },
  { name: 'approve-verification', cls: 'ApproveVerification', payload: 'testId: string;\n  authorization: GovernanceAuthorization;' },
  { name: 'record-verification-result', cls: 'RecordVerificationResult', payload: 'testId: string;\n  actualResult: string;\n  successful: boolean;' },
  { name: 'confirm-root-cause', cls: 'ConfirmRootCause', payload: 'hypothesisId: string;\n  testId: string;\n  authorization: GovernanceAuthorization;' }
];

// Errors
fs.writeFileSync(`${src}/errors/command-validation.error.ts`, `
export class CommandValidationError extends Error {
  constructor(message: string) {
    super(\`Command Validation Error: \${message}\`);
    this.name = this.constructor.name;
  }
}
`);
fs.writeFileSync(`${src}/errors/concurrency-conflict.error.ts`, `
export class ConcurrencyConflictError extends Error {
  constructor(message: string) {
    super(\`Concurrency Conflict: \${message}\`);
    this.name = this.constructor.name;
  }
}
`);

// Commands
commands.forEach(cmd => {
  fs.writeFileSync(`${src}/commands/${cmd.name}.command.ts`, `
import { ExecutionContext } from '@fi/contracts';
import { EvidenceItem, HypothesisScoreVector, GovernanceAuthorization } from '@fi/domain';
import { VerificationTestParameters } from '@fi/domain';

export interface ${cmd.cls}Command {
  readonly investigationId: string;
  readonly context: ExecutionContext;
  readonly ${cmd.payload.replace(/\n/g, '\n  readonly ')}
}
`);
});

// Handlers
commands.forEach(cmd => {
  const methodCall = cmd.cls === 'RecordEvidence' ? 'command.evidence' :
                     cmd.cls === 'SupersedeEvidence' ? 'command.oldEvidenceId, command.newEvidence' :
                     cmd.cls === 'FormulateHypothesis' ? 'command.hypothesisId, command.description' :
                     cmd.cls === 'ScoreHypothesis' ? 'command.hypothesisId, command.score' :
                     cmd.cls === 'RejectHypothesis' ? 'command.hypothesisId' :
                     cmd.cls === 'ProposeVerification' ? 'command.testId, command.hypothesisId, command.parameters' :
                     cmd.cls === 'ApproveVerification' ? 'command.testId, command.authorization' :
                     cmd.cls === 'RecordVerificationResult' ? 'command.testId, command.actualResult, command.successful' :
                     cmd.cls === 'ConfirmRootCause' ? 'command.hypothesisId, command.testId, command.authorization' : '';

  const validation = cmd.cls === 'RecordEvidence' ? `if (!command.evidence) throw new CommandValidationError("evidence is required");` :
                     cmd.cls === 'SupersedeEvidence' ? `if (!command.oldEvidenceId || !command.newEvidence) throw new CommandValidationError("Missing required fields");` :
                     cmd.cls === 'FormulateHypothesis' ? `if (!command.hypothesisId || !command.description) throw new CommandValidationError("Missing required fields");` :
                     cmd.cls === 'ScoreHypothesis' ? `if (!command.hypothesisId || !command.score) throw new CommandValidationError("Missing required fields");` :
                     cmd.cls === 'RejectHypothesis' ? `if (!command.hypothesisId) throw new CommandValidationError("Missing required fields");` :
                     cmd.cls === 'ProposeVerification' ? `if (!command.testId || !command.hypothesisId || !command.parameters) throw new CommandValidationError("Missing required fields");` :
                     cmd.cls === 'ApproveVerification' ? `if (!command.testId || !command.authorization) throw new CommandValidationError("Missing required fields");` :
                     cmd.cls === 'RecordVerificationResult' ? `if (!command.testId || typeof command.successful !== 'boolean') throw new CommandValidationError("Missing required fields");` :
                     cmd.cls === 'ConfirmRootCause' ? `if (!command.hypothesisId || !command.testId || !command.authorization) throw new CommandValidationError("Missing required fields");` : '';

  fs.writeFileSync(`${src}/handlers/${cmd.name}.handler.ts`, `
import { IInvestigationRepository, IUnitOfWork, ResultEnvelope } from '@fi/contracts';
import { Investigation, EntityNotFoundError } from '@fi/domain';
import { ${cmd.cls}Command } from '../commands/${cmd.name}.command.js';
import { CommandValidationError } from '../errors/command-validation.error.js';

export class ${cmd.cls}Handler {
  constructor(
    private readonly repository: IInvestigationRepository<Investigation>,
    private readonly uow: IUnitOfWork
  ) {}

  async execute(command: ${cmd.cls}Command): Promise<ResultEnvelope<void>> {
    try {
      if (!command.investigationId) throw new CommandValidationError("investigationId is required");
      if (!command.context || !command.context.tenant_id) throw new CommandValidationError("Valid ExecutionContext is required");
      ${validation}

      await this.uow.begin();

      const aggregate = await this.repository.findById(command.investigationId);
      if (!aggregate) {
        throw new EntityNotFoundError('Investigation', command.investigationId);
      }

      aggregate.${cmd.cls.charAt(0).toLowerCase() + cmd.cls.slice(1)}(${methodCall});

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
`);
});

// Queries Readme
fs.writeFileSync(`${src}/queries/README.md`, '# Queries\nRead-only queries are deferred.');

// Index
const cmdExports = commands.map(c => `export * from './commands/${c.name}.command.js';`).join('\n');
const hndExports = commands.map(c => `export * from './handlers/${c.name}.handler.js';`).join('\n');
fs.writeFileSync(`${src}/index.ts`, `
export * from './errors/command-validation.error.js';
export * from './errors/concurrency-conflict.error.js';
${cmdExports}
${hndExports}
`);

// Package.json
fs.writeFileSync(`packages/application/package.json`, JSON.stringify({
  name: "@fi/application",
  version: "1.0.0",
  type: "module",
  main: "src/index.ts",
  dependencies: {
    "@fi/domain": "workspace:*",
    "@fi/contracts": "workspace:*"
  }
}, null, 2));

console.log('Generated files successfully');
