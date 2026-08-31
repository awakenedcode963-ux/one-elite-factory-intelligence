import { ExecutionContext } from '../../contracts/src/index.js';
import { AgentDefinition } from '../../agents/src/index.js';
import { Tool } from '../../tools/src/index.js';

export class Sandbox {
  constructor(private definition: AgentDefinition, private tools: Tool[]) {}
}
