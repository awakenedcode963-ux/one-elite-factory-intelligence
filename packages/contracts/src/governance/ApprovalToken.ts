export interface ApprovalToken {
  readonly tenant_id: string;
  readonly investigation_id: string;
  readonly operation: string;
  readonly target_version: string;
  readonly fingerprint: string;
  readonly actor: string;
}
