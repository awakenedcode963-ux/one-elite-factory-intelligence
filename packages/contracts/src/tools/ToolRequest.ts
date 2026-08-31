export interface ToolRequest {
  readonly toolName: string;
  readonly parameters: Record<string, unknown>;
}
