export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (params: Record<string, unknown>) => Promise<ToolResult>;
}

export interface AgentCapability {
  id: string;
  name: string;
  description: string;
  tools: Tool[];
  enabled: boolean;
}
