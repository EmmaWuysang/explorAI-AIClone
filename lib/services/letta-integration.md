# Letta (MemGPT) Integration Pipeline

## Overview
Letta (formerly MemGPT) is a system for creating stateful LLM agents with long-term memory. It's perfect for building persistent AI assistants that remember context across sessions.

## Why Letta for Stark Industries AI?

1. **Long-term Memory**: Remembers all past conversations indefinitely
2. **Stateful Agents**: Maintains context across sessions
3. **RAG Integration**: Can search through documents and knowledge bases
4. **Tool Use**: Supports custom tools/functions
5. **Multi-user**: Separate memory per user
6. **Self-editing Memory**: Agent can choose what to remember

## Architecture Options

### Option 1: Letta Cloud (Easiest - Recommended for MVP)
```
User → Next.js Frontend → Letta Cloud API → GPT-4/Claude
                             ↓
                        Vector DB (Managed)
```

**Pros:**
- No infrastructure management
- Instant setup
- Managed vector database
- Built-in memory management

**Cons:**
- Monthly cost ($20-100/month)
- Less customization
- Data stored externally

**Setup:**
```bash
# Install Letta CLI
pip install letta

# Create account and get API key
letta configure

# Test connection
letta run
```

```typescript
// Integration code
import { LettaClient } from 'letta-js';

const letta = new LettaClient({
  apiKey: process.env.LETTA_API_KEY,
  baseUrl: 'https://api.letta.com',
});

// Create agent
const agent = await letta.createAgent({
  name: 'Tony Stark',
  persona: 'Genius billionaire playboy philanthropist...',
  human: 'User seeking assistance',
  model: 'gpt-4o',
});

// Send message
const response = await letta.sendMessage(agent.id, {
  message: 'What did we discuss last week about the Arc Reactor?',
});
```

---

### Option 2: Self-Hosted Letta (Full Control)
```
User → Next.js → Letta Server → LLM (OpenAI/Anthropic/Local)
                      ↓
                  PostgreSQL + pgvector
```

**Pros:**
- Full control and customization
- Data stays in your infrastructure
- Can use local models (Llama, Mixtral)
- No per-user API costs

**Cons:**
- Requires server infrastructure
- Database management
- More complex setup

**Setup:**
```bash
# Install Letta
pip install letta

# Install database
brew install postgresql  # or docker

# Start Letta server
letta server
```

```typescript
// Self-hosted integration
const response = await fetch('http://localhost:8283/api/agents/{agent_id}/messages', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${LETTA_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    message: 'Remember to follow up on the Stark Expo plans',
  }),
});
```

---

### Option 3: Hybrid (Best of Both Worlds)
```
User → Next.js → Letta Cloud (for memory) + Direct LLM (for fast responses)
```

**Approach:**
- Use Letta for long-term memory and context
- Use direct OpenAI/Anthropic for fast responses
- Sync important context to Letta after conversations

---

## Implementation Plan

### Phase 1: Basic Integration (Week 1)
- [ ] Set up Letta Cloud account
- [ ] Create Tony Stark agent persona
- [ ] Integrate into existing chat API
- [ ] Test memory persistence

### Phase 2: Enhanced Features (Week 2)
- [ ] Add custom tools to Letta agent
- [ ] Implement RAG for document search
- [ ] Add multi-user support
- [ ] Migrate important conversations to vector memory

### Phase 3: Advanced (Week 3-4)
- [ ] Self-host Letta server
- [ ] Implement custom memory strategies
- [ ] Add voice conversation memory
- [ ] Optimize for low-latency

---

## Code Integration

### 1. Install Dependencies
```bash
npm install @letta/client  # or letta-js
```

### 2. Create Letta Service
```typescript
// lib/services/letta.ts
import { LettaClient } from '@letta/client';

export class LettaService {
  private client: LettaClient;
  private agentId: string;

  constructor() {
    this.client = new LettaClient({
      apiKey: process.env.LETTA_API_KEY!,
    });
  }

  async initialize() {
    // Create or load agent
    const agents = await this.client.listAgents();
    const existingAgent = agents.find(a => a.name === 'tony-stark');

    if (existingAgent) {
      this.agentId = existingAgent.id;
    } else {
      const agent = await this.client.createAgent({
        name: 'tony-stark',
        persona: `You are Tony Stark - genius, billionaire, playboy, philanthropist.
                  You have an eidetic memory and remember every detail of past conversations.
                  You're witty, sarcastic, but ultimately care about helping people.`,
        human: 'A user seeking assistance from Tony Stark',
        model: 'gpt-4o',
        embeddingConfig: {
          model: 'text-embedding-3-small',
        },
      });
      this.agentId = agent.id;
    }
  }

  async chat(userId: string, message: string) {
    const response = await this.client.sendMessage(this.agentId, {
      message,
      userId, // Separate memory per user
    });

    return {
      text: response.messages[0].content,
      memory: response.memory, // What agent remembered
      usage: response.usage,
    };
  }

  async searchMemory(query: string) {
    return await this.client.searchMemory(this.agentId, {
      query,
      limit: 5,
    });
  }

  async addToMemory(fact: string) {
    return await this.client.addMemory(this.agentId, {
      content: fact,
      type: 'core_memory', // or 'archival_memory' for long-term
    });
  }
}
```

### 3. Integrate into Chat API
```typescript
// app/api/chat/route.ts
import { LettaService } from '@/lib/services/letta';

const letta = new LettaService();
await letta.initialize();

export async function POST(req: Request) {
  const { message, userId } = await req.json();

  // Use Letta for memory-enhanced responses
  const response = await letta.chat(userId, message);

  return new Response(response.text, {
    headers: { 'Content-Type': 'text/plain' },
  });
}
```

---

## Cost Analysis

### Letta Cloud Pricing
- **Starter**: $20/month (10k messages, 1 agent)
- **Pro**: $50/month (100k messages, 5 agents)
- **Enterprise**: Custom

### Self-Hosted Costs
- **Database**: $10-30/month (Supabase/Railway)
- **Server**: $5-20/month (Fly.io/Railway)
- **LLM API**: Pay-per-token (OpenAI/Anthropic)

### Recommendation
Start with **Letta Cloud Starter** ($20/month) for MVP, then migrate to self-hosted if usage grows beyond 10k messages/month.

---

## Alternative: Build Custom Memory System

If you want full control without Letta dependency:

```typescript
// Simple vector memory with Supabase
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

export class CustomMemorySystem {
  private supabase;
  private openai;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_KEY!
    );
    this.openai = new OpenAI();
  }

  async remember(userId: string, message: string, response: string) {
    // Generate embedding
    const embedding = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: `${message}\n${response}`,
    });

    // Store in vector database
    await this.supabase.from('memories').insert({
      user_id: userId,
      content: `User: ${message}\nAssistant: ${response}`,
      embedding: embedding.data[0].embedding,
      created_at: new Date().toISOString(),
    });
  }

  async recall(userId: string, query: string, limit = 5) {
    // Generate query embedding
    const queryEmbedding = await this.openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    });

    // Search similar memories
    const { data } = await this.supabase.rpc('search_memories', {
      query_embedding: queryEmbedding.data[0].embedding,
      match_count: limit,
      filter_user_id: userId,
    });

    return data;
  }
}
```

**Pros**: Full control, cheaper at scale
**Cons**: More code to maintain, need to implement memory management strategies

---

## Recommended Approach

1. **Start**: Use **OpenAI Realtime API** for voice + **Letta Cloud** for memory
2. **Scale**: Migrate to self-hosted Letta when reaching 10k+ messages/month
3. **Optimize**: Add custom memory strategies and RAG as needed

This gives you the best balance of speed (OpenAI Realtime), memory (Letta), and development velocity.
