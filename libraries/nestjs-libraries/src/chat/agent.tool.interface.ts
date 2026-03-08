import { Tool } from '@mastra/core/tools';

// Generic Tool type that accepts any schema types
export type ToolReturn = Tool<any, any, any, any, any, any, any>;

export interface AgentToolInterface {
  name: string;
  run(): ToolReturn;
}
