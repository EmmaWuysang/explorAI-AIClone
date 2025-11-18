import OpenAI from "openai";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface StreamChunk {
  content?: string;
  done?: boolean;
  error?: string;
}

export class AIClient {
  static async *streamChat(
    modelId: string,
    messages: ChatMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
    } = {}
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      yield {
        error:
          "OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.",
      };
      return;
    }

    const openai = new OpenAI({ apiKey });

    try {
      const stream = await openai.chat.completions.create({
        model: modelId,
        messages: messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2048,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          yield { content };
        }
      }

      yield { done: true };
    } catch (error) {
      console.error("[AI Client] OpenAI API error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      yield {
        error: `OpenAI API error: ${errorMessage}`,
      };
    }
  }
}