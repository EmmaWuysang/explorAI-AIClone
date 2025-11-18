import { Tool, ToolResult } from './types';

/**
 * Memory Service
 * Enables the AI to store and retrieve contextual information across sessions
 */

interface MemoryItem {
  id: string;
  key: string;
  value: unknown;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class MemoryStore {
  private store: Map<string, MemoryItem> = new Map();
  private readonly STORAGE_KEY = 'explorAI-memory';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const items: MemoryItem[] = JSON.parse(stored);
        items.forEach((item) => this.store.set(item.key, item));
      }
    } catch (error) {
      console.error('[Memory] Failed to load from storage:', error);
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;

    try {
      const items = Array.from(this.store.values());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('[Memory] Failed to save to storage:', error);
    }
  }

  set(key: string, value: unknown, metadata?: Record<string, unknown>): void {
    const item: MemoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      key,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.store.set(key, item);
    this.saveToStorage();
  }

  get(key: string): unknown | null {
    const item = this.store.get(key);
    return item ? item.value : null;
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  delete(key: string): boolean {
    const result = this.store.delete(key);
    if (result) {
      this.saveToStorage();
    }
    return result;
  }

  clear(): void {
    this.store.clear();
    this.saveToStorage();
  }

  search(query: string): MemoryItem[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.store.values()).filter((item) =>
      item.key.toLowerCase().includes(lowerQuery)
    );
  }

  getAll(): MemoryItem[] {
    return Array.from(this.store.values());
  }
}

const memoryStore = new MemoryStore();

export const saveMemoryTool: Tool = {
  name: 'save_memory',
  description: 'Save information to long-term memory for future reference',
  parameters: {
    key: {
      type: 'string',
      description: 'Unique identifier for the memory',
      required: true,
    },
    value: {
      type: 'any',
      description: 'The data to store',
      required: true,
    },
    metadata: {
      type: 'object',
      description: 'Additional metadata about the memory',
      required: false,
    },
  },
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    const { key, value, metadata } = params;

    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Key must be a non-empty string');
      }

      memoryStore.set(key, value, metadata as Record<string, unknown>);

      return {
        success: true,
        data: {
          key,
          stored: true,
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save memory',
      };
    }
  },
};

export const recallMemoryTool: Tool = {
  name: 'recall_memory',
  description: 'Retrieve previously stored information from memory',
  parameters: {
    key: {
      type: 'string',
      description: 'The identifier of the memory to retrieve',
      required: true,
    },
  },
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    const { key } = params;

    try {
      if (!key || typeof key !== 'string') {
        throw new Error('Key must be a non-empty string');
      }

      const value = memoryStore.get(key);

      if (value === null) {
        return {
          success: false,
          error: `No memory found for key: ${key}`,
        };
      }

      return {
        success: true,
        data: {
          key,
          value,
          found: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to recall memory',
      };
    }
  },
};

export const searchMemoryTool: Tool = {
  name: 'search_memory',
  description: 'Search through stored memories by keyword',
  parameters: {
    query: {
      type: 'string',
      description: 'The search query',
      required: true,
    },
  },
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    const { query } = params;

    try {
      if (!query || typeof query !== 'string') {
        throw new Error('Query must be a non-empty string');
      }

      const results = memoryStore.search(query);

      return {
        success: true,
        data: {
          query,
          results: results.map((item) => ({
            key: item.key,
            value: item.value,
            timestamp: item.timestamp,
          })),
          count: results.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search memory',
      };
    }
  },
};

export { memoryStore };
