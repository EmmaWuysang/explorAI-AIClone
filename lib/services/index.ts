import { AgentCapability } from './types';
import { webSearchTool, fetchUrlTool } from './web-search';
import { summarizeTextTool, extractDataTool, analyzeDataTool } from './data-processing';
import { saveMemoryTool, recallMemoryTool, searchMemoryTool } from './memory';

/**
 * Agent Services Registry
 * Central registry of all available agent capabilities and tools
 */

export const agentCapabilities: AgentCapability[] = [
  {
    id: 'web-research',
    name: 'Web Research',
    description: 'Search the internet and fetch information from URLs',
    tools: [webSearchTool, fetchUrlTool],
    enabled: true,
  },
  {
    id: 'data-processing',
    name: 'Data Processing',
    description: 'Analyze, summarize, and extract information from data',
    tools: [summarizeTextTool, extractDataTool, analyzeDataTool],
    enabled: true,
  },
  {
    id: 'memory',
    name: 'Memory',
    description: 'Store and retrieve contextual information across sessions',
    tools: [saveMemoryTool, recallMemoryTool, searchMemoryTool],
    enabled: true,
  },
];

export const getAllTools = () => {
  return agentCapabilities
    .filter((cap) => cap.enabled)
    .flatMap((cap) => cap.tools);
};

export const getToolByName = (name: string) => {
  const allTools = getAllTools();
  return allTools.find((tool) => tool.name === name);
};

export const executeToolByName = async (
  toolName: string,
  params: Record<string, unknown>
) => {
  const tool = getToolByName(toolName);

  if (!tool) {
    return {
      success: false,
      error: `Tool not found: ${toolName}`,
    };
  }

  try {
    return await tool.execute(params);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Tool execution failed',
    };
  }
};

// Export all tools for use in components
export * from './types';
export * from './web-search';
export * from './data-processing';
export * from './memory';
