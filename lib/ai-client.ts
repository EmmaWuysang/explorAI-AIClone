import { GoogleGenAI } from "@google/genai";

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
    const apiKey = process.env.GOOGLE_API_KEY;

    if (!apiKey) {
      yield {
        error:
          "Google API key not configured. Please add GOOGLE_API_KEY to your .env file.",
      };
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    try {
      // Extract system instruction from messages
      const systemMessage = messages.find((m) => m.role === "system");
      const systemInstruction = systemMessage?.content;

      // Build conversation history for Gemini format
      // Filter out system messages and convert to Gemini's format
      const history: Array<{
        role: "user" | "model";
        parts: Array<{ text: string }>;
      }> = [];

      const conversationMessages = messages.filter((m) => m.role !== "system");

      // All messages except the last one go into history
      for (let i = 0; i < conversationMessages.length - 1; i++) {
        const msg = conversationMessages[i];
        history.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      }

      // Get the last message as the current user message
      const lastMessage = conversationMessages[conversationMessages.length - 1];

      if (!lastMessage || lastMessage.role !== "user") {
        yield { error: "No user message found" };
        return;
      }

      // Create chat session with history and system instruction
      const chat = ai.chats.create({
        model: modelId,
        history: history,
        config: {
          systemInstruction: systemInstruction,
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxTokens ?? 2048,
        },
      });

      // Stream the response
      const stream = await chat.sendMessageStream({
        message: lastMessage.content,
      });

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          yield { content: text };
        }
      }

      yield { done: true };
    } catch (error) {
      console.error("[AI Client] Gemini API error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      yield {
        error: `Gemini API error: ${errorMessage}`,
      };
    }
  }
}
