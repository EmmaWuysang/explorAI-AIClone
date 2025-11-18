import { NextRequest } from "next/server";
import { PersonaManager } from "@/lib/persona-manager";
import { AIClient } from "@/lib/ai-client";

/**
 * POST /api/chat
 * Handles chat messages and streams AI responses
 */
export async function POST(request: NextRequest) {
	try {
		// Parse request body
		let body;
		try {
			body = await request.json();
		} catch (parseError) {
			return new Response(
				JSON.stringify({ error: "Invalid JSON in request body" }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		const { message, personaId = "default", conversationHistory = [] } = body;

		// Validate message
		if (!message || typeof message !== "string" || !message.trim()) {
			return new Response(
				JSON.stringify({
					error: "Message is required and must be a non-empty string",
				}),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		// Get persona configuration with fallback
		let persona = PersonaManager.getPersona(personaId);

		// If requested persona not found, try default
		if (!persona && personaId !== "default") {
			persona = PersonaManager.getPersona("default");
		}

		// If still no persona, use hardcoded fallback
		if (!persona) {
			persona = {
				id: "default",
				name: "Default Assistant",
				description: "Fallback assistant",
				systemPrompt: "You are a helpful AI assistant.",
				temperature: 0.7,
				maxTokens: 2048,
			};
			console.warn("[API] No persona files found, using hardcoded fallback");
		}

		// Validate API key
		const apiKey = process.env.OPENAI_API_KEY;
		console.log(
			"[API] OPENAI_API_KEY exists:",
			!!apiKey,
			"length:",
			apiKey?.length || 0
		);

		if (!apiKey) {
			return new Response(
				JSON.stringify({
					error:
						"OpenAI API key not configured. Please add OPENAI_API_KEY to your .env file.",
				}),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}

		// Build message array with conversation history
		const messages: Array<{
			role: "system" | "user" | "assistant";
			content: string;
		}> = [];

		// Add system prompt
		if (persona.systemPrompt) {
			messages.push({
				role: "system",
				content: persona.systemPrompt,
			});
		}

		// Add conversation history (if provided)
		if (Array.isArray(conversationHistory)) {
			for (const msg of conversationHistory) {
				if (
					msg.role &&
					msg.content &&
					["user", "assistant"].includes(msg.role)
				) {
					messages.push({
						role: msg.role as "user" | "assistant",
						content: String(msg.content),
					});
				}
			}
		}

		// Add current user message
		messages.push({
			role: "user",
			content: message.trim(),
		});

		console.log("[API] Processing chat request:", {
			personaId: persona.id,
			messageLength: message.length,
			totalMessages: messages.length,
			temperature: persona.temperature || 0.7,
			maxTokens: persona.maxTokens || 2048,
		});

		// Create streaming response
		const stream = new ReadableStream({
			async start(controller) {
				try {
					const modelId = persona.model || "gpt-4o-mini";

					const streamGenerator = AIClient.streamChat(modelId, messages, {
						temperature: persona.temperature ?? 0.7,
						maxTokens: persona.maxTokens ?? 2048,
					});

					for await (const chunk of streamGenerator) {
						if (chunk.error) {
							console.error("[API] Stream error:", chunk.error);
							controller.enqueue(
								new TextEncoder().encode(
									`data: ${JSON.stringify({ error: chunk.error })}\n\n`
								)
							);
							controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
							controller.close();
							return;
						}

						if (chunk.done) {
							controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
							controller.close();
							return;
						}

						if (chunk.content) {
							controller.enqueue(
								new TextEncoder().encode(
									`data: ${JSON.stringify({ content: chunk.content })}\n\n`
								)
							);
						}
					}
				} catch (error) {
					console.error("[API] Error in stream:", error);
					controller.enqueue(
						new TextEncoder().encode(
							`data: ${JSON.stringify({
								error: "Streaming error",
								message:
									error instanceof Error ? error.message : "Unknown error",
							})}\n\n`
						)
					);
					controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
					controller.close();
				}
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache, no-transform",
				Connection: "keep-alive",
				"X-Accel-Buffering": "no",
			},
		});
	} catch (error) {
		console.error("[API] Fatal error in chat endpoint:", error);
		return new Response(
			JSON.stringify({
				error: "Internal server error",
				message: error instanceof Error ? error.message : "Unknown error",
			}),
			{ status: 500, headers: { "Content-Type": "application/json" } }
		);
	}
}
