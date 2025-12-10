import { NextRequest } from "next/server";
import { PersonaManager } from "@/lib/persona-manager";
import { AIClient } from "@/lib/ai-client";
import { tools } from "@/lib/ai/tools/definitions";
import { toolRegistry } from "@/lib/ai/tools/registry";

/**
 * POST /api/chat
 * Handles chat messages and streams AI responses
 */
export async function POST(request: NextRequest) {
	try {
		let body;
		try {
			body = await request.json();
		} catch (parseError) {
			return new Response(
				JSON.stringify({ error: "Invalid JSON in request body" }),
				{ status: 400, headers: { "Content-Type": "application/json" } }
			);
		}

		const { message, personaId = "default", conversationHistory = [], images = [], dashboardContext } = body;

		// Validation logic
		if (!message || typeof message !== "string" || !message.trim()) {
			return new Response(JSON.stringify({ error: "Message required" }), { status: 400 });
		}

		let persona = PersonaManager.getPersona(personaId) || PersonaManager.getPersona("default");
		if (!persona) {
			persona = {
				id: "default",
				name: "Default",
				description: "Default fallback persona",
				systemPrompt: "You are a helpful AI.",
				temperature: 0.7,
				maxTokens: 2048
			};
		}

		const apiKey = process.env.GOOGLE_API_KEY;
		if (!apiKey) return new Response(JSON.stringify({ error: "No API Key" }), { status: 500 });


		const messages: Array<{ role: "system" | "user" | "assistant"; content: string; }> = [];

		let finalSystemPrompt = persona.systemPrompt || "You are a helpful AI assistant.";
		if (dashboardContext) {
			finalSystemPrompt += `\n\nCRITICAL CONTEXT: You are active in ${dashboardContext}. Only answer relevant questions.`;
		}

		messages.push({ role: "system", content: finalSystemPrompt });

		if (Array.isArray(conversationHistory)) {
			for (const msg of conversationHistory) {
				if (["user", "assistant"].includes(msg.role)) {
					messages.push({ role: msg.role as "user" | "assistant", content: String(msg.content) });
				}
			}
		}

		messages.push({ role: "user", content: message.trim() });

		const stream = new ReadableStream({
			async start(controller) {
				try {
					const modelId = persona!.model || "gemini-2.0-flash";

					// First pass: Call model with tools
					let currentStream = AIClient.streamChat(modelId, messages, {
						temperature: persona!.temperature ?? 0.7,
						maxTokens: persona!.maxTokens ?? 2048,
						images: images,
						tools: tools as any[]
					});

					// We need to track if we are in a tool call loop
					// For simplicity in this iteration, we handle ONE round of tool execution (User -> AI -> Tool -> AI -> User)

					let toolCallsToExecute: any[] = [];
					let fullText = "";

					for await (const chunk of currentStream) {
						if (chunk.toolCalls) {
							toolCallsToExecute.push(...chunk.toolCalls);
						}
						if (chunk.content) {
							fullText += chunk.content;
							// Stream partial text if any (usually null if tool calling)
							controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: chunk.content })}\n\n`));
						}
						if (chunk.error) {
							throw new Error(chunk.error);
						}
					}

					// If we have tool calls, execute them
					if (toolCallsToExecute.length > 0) {
						// Notify client we are executing specific tools?
						// For now, let's keep it invisible or send a specialized event if needed.

						// 1. Add the tool calls to history as "model" response
						// But `messages` array in `AIClient` expects `assistant` role content.
						// The structure of `messages` in `AIClient` is generic `content: string`. 
						// To support function calling history properly, `AIClient` needs to support `parts`.
						// Since `AIClient` converts everything to `parts` anyway, we might need to modify `AIClient` 
						// OR we just append the result as a user message "System Tool Output: ..." to trick it for now
						// IF we want to strictly follow Gemini multi-turn chat with tools.

						// Hack for stability: Append the tool result as a SYSTEM message or USER message representing the tool.
						// "Tool execution result: ..."

						for (const call of toolCallsToExecute) {
							const fn = toolRegistry[call.name];
							if (fn) {
								try {
									console.log(`[API] Executing tool ${call.name}`);
									// Inform client?
									controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: `\n\n_Executing ${call.name}..._\n\n` })}\n\n`));

									const result = await fn(call.args, { dashboardContext });

									// Add result to messages context
									// We effectively extend the conversation
									messages.push({
										role: "assistant",
										content: `Checking... (Tool ${call.name} called)`
									});
									messages.push({
										role: "user",
										content: `Tool '${call.name}' returned: ${JSON.stringify(result)}`
									});

								} catch (e) {
									messages.push({
										role: "user",
										content: `Tool '${call.name}' failed: ${e}`
									});
								}
							}
						}

						// 2. Call model again with new history (Second pass)
						currentStream = AIClient.streamChat(modelId, messages, {
							temperature: 0.7,
							maxTokens: 2048,
							// Don't pass tools again to prevent infinite loops? or pass them if multi-step allowed.
							// Let's passed them just in case.
							tools: tools as any[]
						});

						for await (const chunk of currentStream) {
							if (chunk.content) {
								controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: chunk.content })}\n\n`));
							}
						}
					}

					controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
					controller.close();

				} catch (error) {
					console.error("[API] Stream error:", error);
					controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ error: String(error) })}\n\n`));
					controller.close();
				}
			}
		});

		return new Response(stream, { headers: { "Content-Type": "text/event-stream" } });

	} catch (error) {
		return new Response(JSON.stringify({ error: "Server Error" }), { status: 500 });
	}
}
