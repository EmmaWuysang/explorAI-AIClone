/**
 * Low-Latency Voice Conversation APIs
 *
 * Best Options (as of 2024-2025):
 *
 * 1. **OpenAI Realtime API** (RECOMMENDED - Lowest Latency)
 *    - WebSocket-based real-time voice conversation
 *    - ~300ms latency
 *    - Supports GPT-4o Realtime with function calling
 *    - Built-in turn detection (VAD - Voice Activity Detection)
 *    - Cost: $0.06/min input, $0.24/min output
 *    - Setup: OPENAI_API_KEY
 *
 * 2. **ElevenLabs Conversational AI**
 *    - Ultra-low latency voice conversations
 *    - ~250-400ms latency
 *    - High-quality voice cloning
 *    - Supports custom agents with tools/knowledge
 *    - Cost: Pay-per-character + conversation minutes
 *    - Setup: ELEVENLABS_API_KEY
 *
 * 3. **Deepgram Voice Agent API**
 *    - End-to-end voice agent platform
 *    - ~200-400ms latency
 *    - Integrated STT + LLM + TTS
 *    - Function calling support
 *    - Cost: $0.0043/min STT + TTS pricing
 *    - Setup: DEEPGRAM_API_KEY
 *
 * 4. **Hume AI EVI (Empathic Voice Interface)**
 *    - Emotion-aware voice conversations
 *    - ~500ms latency
 *    - Detects and responds to emotional cues
 *    - WebSocket-based
 *    - Cost: $0.03/min
 *    - Setup: HUME_API_KEY
 *
 * 5. **Vapi.ai**
 *    - Voice AI platform for phone/web
 *    - ~300-500ms latency
 *    - Built-in telephony integration
 *    - Function calling and webhooks
 *    - Cost: $0.05/min + provider costs
 *    - Setup: VAPI_API_KEY
 *
 * 6. **Retell AI**
 *    - Conversational Voice AI
 *    - ~400ms latency
 *    - Custom LLM integration
 *    - Phone & web support
 *    - Setup: RETELL_API_KEY
 *
 * 7. **Assembly AI LeMUR + Real-time STT**
 *    - Combination approach (STT + LLM + TTS separately)
 *    - ~500-800ms total latency
 *    - More control, modular
 *    - Setup: ASSEMBLYAI_API_KEY + TTS provider
 *
 * 8. **Groq + Deepgram + CartesiaAI** (DIY Stack)
 *    - Ultra-fast LLM inference with Groq
 *    - Low-latency STT with Deepgram
 *    - Fast TTS with Cartesia
 *    - ~300-500ms total latency
 *    - Most customizable
 *
 * COMPARISON TABLE:
 *
 * | Provider          | Latency | Quality | Features           | Cost/min | Best For                |
 * |-------------------|---------|---------|--------------------|---------:|-------------------------|
 * | OpenAI Realtime   | 300ms   | ⭐⭐⭐⭐⭐ | Function calling   | $0.30    | Full-featured apps      |
 * | ElevenLabs        | 300ms   | ⭐⭐⭐⭐⭐ | Voice cloning      | $0.20    | Premium voice quality   |
 * | Deepgram Agent    | 300ms   | ⭐⭐⭐⭐   | Integrated stack   | $0.10    | Cost-effective          |
 * | Hume EVI          | 500ms   | ⭐⭐⭐⭐   | Emotion detection  | $0.03    | Empathic interactions   |
 * | Vapi.ai           | 400ms   | ⭐⭐⭐⭐   | Telephony          | $0.15    | Phone integrations      |
 * | Groq Stack        | 400ms   | ⭐⭐⭐⭐   | Full control       | $0.08    | Custom implementations  |
 */

import { Tool, ToolResult } from './types';

export interface VoiceConversationConfig {
  provider: 'openai' | 'elevenlabs' | 'deepgram' | 'hume' | 'vapi' | 'groq-stack';
  voice?: string;
  model?: string;
  instructions?: string;
  tools?: any[];
  temperature?: number;
  turnDetection?: {
    type: 'server_vad' | 'none';
    threshold?: number;
    silenceDurationMs?: number;
  };
}

/**
 * OpenAI Realtime API - WebSocket Connection
 * Best overall option for low-latency voice with function calling
 */
export class OpenAIRealtimeVoice {
  private ws: WebSocket | null = null;
  private config: VoiceConversationConfig;

  constructor(config: VoiceConversationConfig) {
    this.config = {
      voice: 'alloy', // alloy, echo, fable, onyx, nova, shimmer
      model: 'gpt-4o-realtime-preview-2024-10-01',
      turnDetection: {
        type: 'server_vad',
        threshold: 0.5,
        silenceDurationMs: 700,
      },
      ...config,
    };
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = 'wss://api.openai.com/v1/realtime?model=' + this.config.model;

      // Note: In browser, WebSocket doesn't support headers directly
      // This would need to be proxied through a server endpoint
      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        // Configure session
        this.ws?.send(JSON.stringify({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: this.config.instructions,
            voice: this.config.voice,
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            turn_detection: this.config.turnDetection,
            tools: this.config.tools,
            temperature: this.config.temperature || 0.8,
          },
        }));
        resolve();
      };

      this.ws.onerror = (error) => reject(error);
    });
  }

  sendAudio(audioData: ArrayBuffer | Uint8Array): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      // Convert to base64
      const bytes = audioData instanceof ArrayBuffer ? new Uint8Array(audioData) : audioData;
      const binary = Array.from(bytes).map(b => String.fromCharCode(b)).join('');
      const base64 = btoa(binary);

      this.ws.send(JSON.stringify({
        type: 'input_audio_buffer.append',
        audio: base64,
      }));
    }
  }

  commitAudio(): void {
    this.ws?.send(JSON.stringify({
      type: 'input_audio_buffer.commit',
    }));
  }

  onMessage(callback: (event: any) => void): void {
    if (this.ws) {
      this.ws.onmessage = (messageEvent) => {
        const event = JSON.parse(messageEvent.data);
        callback(event);
      };
    }
  }

  disconnect(): void {
    this.ws?.close();
  }
}

/**
 * ElevenLabs Conversational AI
 * Best for ultra-high quality voice and voice cloning
 */
export class ElevenLabsConversation {
  private agentId: string;

  constructor(agentId: string) {
    this.agentId = agentId;
  }

  async startConversation(): Promise<WebSocket> {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation?agent_id=${this.agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        },
      }
    );

    const data = await response.json();
    const ws = new WebSocket(data.websocket_url);

    return ws;
  }

  async createAgent(config: {
    name: string;
    prompt: string;
    voiceId: string;
    firstMessage?: string;
  }): Promise<string> {
    const response = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        conversation_config: {
          agent: {
            prompt: {
              prompt: config.prompt,
            },
            first_message: config.firstMessage,
          },
        },
        platform_settings: {
          ...config,
        },
      }),
    });

    const data = await response.json();
    return data.agent_id;
  }
}

/**
 * Deepgram Voice Agent
 * Great cost-performance balance
 */
export class DeepgramVoiceAgent {
  async createAgent(config: {
    name: string;
    instructions: string;
    voice?: string;
    llm?: string;
  }): Promise<string> {
    const response = await fetch('https://api.deepgram.com/v1/agents', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: config.name,
        instructions: config.instructions,
        voice: config.voice || 'aura-asteria-en',
        llm: config.llm || 'gpt-4o-mini',
      }),
    });

    const data = await response.json();
    return data.agent_id;
  }

  connectWebSocket(agentId: string): WebSocket {
    return new WebSocket(
      `wss://agent.deepgram.com/agent/${agentId}/ws?authorization=Token%20${process.env.DEEPGRAM_API_KEY}`
    );
  }
}

/**
 * Groq + Deepgram + Cartesia Stack
 * Most customizable, very fast
 */
export class GroqVoiceStack {
  // Deepgram for STT (Speech-to-Text)
  async transcribeAudio(audioBuffer: ArrayBuffer | Uint8Array): Promise<string> {
    // Convert to Blob for proper fetch body type
    const buffer: ArrayBuffer = audioBuffer instanceof Uint8Array
      ? (audioBuffer.buffer.slice(audioBuffer.byteOffset, audioBuffer.byteOffset + audioBuffer.byteLength) as ArrayBuffer)
      : audioBuffer;
    const blob = new Blob([buffer], { type: 'audio/wav' });

    const response = await fetch('https://api.deepgram.com/v1/listen', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': 'audio/wav',
      },
      body: blob,
    });

    const data = await response.json();
    return data.results.channels[0].alternatives[0].transcript;
  }

  // Groq for ultra-fast LLM inference
  async getResponse(text: string, conversationHistory: any[]): Promise<string> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Ultra-fast inference
        messages: [
          ...conversationHistory,
          { role: 'user', content: text },
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Cartesia for ultra-low latency TTS
  async textToSpeech(text: string, voiceId: string = 'default'): Promise<Buffer> {
    const response = await fetch('https://api.cartesia.ai/tts/bytes', {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.CARTESIA_API_KEY!,
        'Cartesia-Version': '2024-06-10',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id: 'sonic-english',
        transcript: text,
        voice: {
          mode: 'id',
          id: voiceId,
        },
        output_format: {
          container: 'wav',
          encoding: 'pcm_s16le',
          sample_rate: 24000,
        },
      }),
    });

    return Buffer.from(await response.arrayBuffer());
  }
}

/**
 * Voice Conversation Tool for AI Agent
 */
export const voiceConversationTool: Tool = {
  name: 'voice_conversation',
  description: 'Initiate or manage a voice conversation with the user. Supports ultra-low latency real-time voice interaction.',
  parameters: {
    action: {
      type: 'string',
      description: 'Action: "start", "stop", "status"',
      required: true,
    },
    provider: {
      type: 'string',
      description: 'Voice provider: "openai", "elevenlabs", "deepgram", "groq-stack"',
      required: false,
      default: 'openai',
    },
    instructions: {
      type: 'string',
      description: 'Instructions for the voice agent',
      required: false,
    },
  },
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    const { action, provider = 'openai', instructions } = params;

    try {
      // Implementation would go here
      // This is a placeholder showing the structure

      return {
        success: true,
        data: {
          action,
          provider,
          status: 'Voice conversation feature requires WebSocket implementation on frontend',
          documentation: 'See lib/services/voice-conversation.ts for implementation details',
        },
        metadata: {
          timestamp: Date.now(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Voice conversation failed',
      };
    }
  },
};
