import { Tool, ToolResult } from './types';

/**
 * Web Search Service - Enhanced with multiple provider support
 * Providers: Tavily (best for AI), Serper (Google results), Brave Search
 *
 * Setup:
 * - Add TAVILY_API_KEY to .env (recommended - get from https://tavily.com)
 * - Or SERPER_API_KEY from https://serper.dev
 * - Or BRAVE_API_KEY from https://brave.com/search/api/
 */

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  score?: number;
}

export const webSearchTool: Tool = {
  name: 'web_search',
  description: 'Search the internet for current information, news, research, or real-time data. Best for: latest news, current events, technical documentation, research papers.',
  parameters: {
    query: {
      type: 'string',
      description: 'The search query - be specific for better results',
      required: true,
    },
    maxResults: {
      type: 'number',
      description: 'Maximum number of results to return (1-10)',
      required: false,
      default: 5,
    },
    searchDepth: {
      type: 'string',
      description: 'Search depth: "basic" for quick results, "advanced" for comprehensive',
      required: false,
      default: 'basic',
    },
  },
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    const { query, maxResults = 5, searchDepth = 'basic' } = params;

    try {
      // Try Tavily first (best for AI applications)
      if (process.env.TAVILY_API_KEY) {
        return await searchWithTavily(query as string, maxResults as number, searchDepth as string);
      }

      // Fallback to Serper (Google results)
      if (process.env.SERPER_API_KEY) {
        return await searchWithSerper(query as string, maxResults as number);
      }

      // Fallback to Brave Search
      if (process.env.BRAVE_API_KEY) {
        return await searchWithBrave(query as string, maxResults as number);
      }

      // No API keys configured
      return {
        success: false,
        error: 'No search API configured. Add TAVILY_API_KEY, SERPER_API_KEY, or BRAVE_API_KEY to .env file.',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      };
    }
  },
};

// Tavily Search - Optimized for AI
async function searchWithTavily(query: string, maxResults: number, depth: string): Promise<ToolResult> {
  const response = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      max_results: maxResults,
      search_depth: depth,
      include_answer: true,
      include_raw_content: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Tavily API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    success: true,
    data: {
      query,
      answer: data.answer, // AI-generated answer from search results
      results: data.results.map((r: any) => ({
        title: r.title,
        url: r.url,
        snippet: r.content,
        score: r.score,
      })),
      provider: 'Tavily',
    },
    metadata: {
      timestamp: Date.now(),
      resultCount: data.results.length,
    },
  };
}

// Serper - Google Search Results
async function searchWithSerper(query: string, maxResults: number): Promise<ToolResult> {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': process.env.SERPER_API_KEY!,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      q: query,
      num: maxResults,
    }),
  });

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    success: true,
    data: {
      query,
      results: data.organic?.map((r: any) => ({
        title: r.title,
        url: r.link,
        snippet: r.snippet,
      })) || [],
      provider: 'Serper (Google)',
    },
    metadata: {
      timestamp: Date.now(),
      resultCount: data.organic?.length || 0,
    },
  };
}

// Brave Search API
async function searchWithBrave(query: string, maxResults: number): Promise<ToolResult> {
  const response = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${maxResults}`,
    {
      headers: {
        'X-Subscription-Token': process.env.BRAVE_API_KEY!,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Brave API error: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    success: true,
    data: {
      query,
      results: data.web?.results?.map((r: any) => ({
        title: r.title,
        url: r.url,
        snippet: r.description,
      })) || [],
      provider: 'Brave Search',
    },
    metadata: {
      timestamp: Date.now(),
      resultCount: data.web?.results?.length || 0,
    },
  };
}

export const fetchUrlTool: Tool = {
  name: 'fetch_url',
  description: 'Fetch and extract clean text content from any URL. Works with articles, documentation, blogs, and web pages.',
  parameters: {
    url: {
      type: 'string',
      description: 'The URL to fetch and extract content from',
      required: true,
    },
  },
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    const { url } = params;

    try {
      // Use Jina Reader API - free, fast, and reliable
      const jinaUrl = `https://r.jina.ai/${url}`;
      const response = await fetch(jinaUrl, {
        headers: {
          'Accept': 'application/json',
          'X-Return-Format': 'markdown',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          url,
          content: data.content || data.data,
          title: data.title,
          description: data.description,
          markdown: true,
        },
        metadata: {
          timestamp: Date.now(),
          provider: 'Jina Reader',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch URL',
      };
    }
  },
};
