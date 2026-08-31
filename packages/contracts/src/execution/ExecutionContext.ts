export interface ExecutionContext {
  readonly execution_id: string;
  readonly task_id: string;
  readonly agent_id: string;
  readonly agent_type: string;
  readonly tenant_id: string;
  readonly investigation_id: string;
  readonly authorized_actor_context: Readonly<Record<string, unknown>>;
  readonly allowed_tools: ReadonlyArray<string>;
  readonly allowed_data_domains: ReadonlyArray<string>;
  readonly policy_version: string;
}
