import { AgentCapability } from './types';
import { webSearchTool, fetchUrlTool } from './web-search';
import { summarizeTextTool, extractDataTool, analyzeDataTool } from './data-processing';
import { saveMemoryTool, recallMemoryTool, searchMemoryTool } from './memory';
import { analyzeImageTool, screenshotAndAnalyzeTool } from './vision';
import { searchCalendarTool, createCalendarEventTool } from './calendar';
import { voiceConversationTool } from './voice-conversation';

/**
 * Agent Services Registry
 * Central registry of all available agent capabilities and tools
 *
 * New Tools Added:
 * - Web Search: Tavily, Serper, Brave Search APIs
 * - Computer Vision: GPT-4V, Claude Vision
 * - Calendar: Google Calendar integration
 * - Voice: OpenAI Realtime, ElevenLabs, Deepgram, Groq Stack
 */

export const agentCapabilities: AgentCapability[] = [
  {
    id: 'web-research',
    name: 'Web Research',
    description: 'Search the internet, fetch URLs, and gather real-time information',
    tools: [webSearchTool, fetchUrlTool],
    enabled: true,
  },
  {
    id: 'vision',
    name: 'Computer Vision',
    description: 'Analyze images, read text from screenshots, describe visual content',
    tools: [analyzeImageTool, screenshotAndAnalyzeTool],
    enabled: true,
  },
  {
    id: 'calendar',
    name: 'Calendar Management',
    description: 'Search calendar events, create meetings, manage schedule',
    tools: [searchCalendarTool, createCalendarEventTool],
    enabled: false, // Requires OAuth setup
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
  {
    id: 'voice',
    name: 'Voice Conversation',
    description: 'Real-time voice conversations with ultra-low latency',
    tools: [voiceConversationTool],
    enabled: false, // Requires WebSocket frontend implementation
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
export * from './vision';
export * from './calendar';
export * from './voice-conversation';
