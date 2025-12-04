"use client";

import { useState, FormEvent, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Copy, ImagePlus, X } from "lucide-react";
import { useStore } from "@/lib/store";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import "katex/dist/katex.min.css";

interface StreamingMessage {
	id: string;
	text: string;
	isComplete: boolean;
}

interface ImageAttachment {
	id: string;
	url: string;
	file: File;
}

const MessageBubble = ({
	message,
	isUser,
	personaName,
}: {
	message: any;
	isUser: boolean;
	personaName: string;
}) => {
	const [showActions, setShowActions] = useState(false);
	const [copied, setCopied] = useState(false);

	const copyToClipboard = () => {
		navigator.clipboard.writeText(message.content);
		setCopied(true);
		setTimeout(() => setCopied(false), 1500);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.2,
				ease: [0.25, 0.1, 0.25, 1]
			}}
			className={`flex ${isUser ? "justify-end" : "justify-start"} group`}
			onMouseEnter={() => setShowActions(true)}
			onMouseLeave={() => setShowActions(false)}>
			<div
				className={`max-w-[85%] rounded-xl px-4 py-3 relative ${
					isUser ? "modern-message-user" : "modern-message"
				}`}>
				{!isUser && (
					<div className="flex items-center justify-between mb-2">
						<div className="flex items-center gap-2">
							<div
								className="power-indicator"
								style={{ width: "5px", height: "5px" }}
							/>
							<span
								className="text-xs font-medium"
								style={{ color: "rgb(var(--color-text-tertiary))" }}>
								{personaName}
							</span>
						</div>
						{/* Copy button inside message */}
						<motion.button
							initial={{ opacity: 0 }}
							animate={{ opacity: showActions ? 1 : 0 }}
							transition={{ duration: 0.15 }}
							onClick={copyToClipboard}
							className="p-1 rounded hover:bg-white/5 transition-colors"
							title={copied ? "Copied!" : "Copy message"}>
							<Copy
								className="w-3 h-3"
								style={{
									color: copied
										? "rgb(var(--color-accent))"
										: "rgb(var(--color-text-muted))"
								}}
							/>
						</motion.button>
					</div>
				)}
				<div
					className="text-[15px] leading-relaxed prose prose-invert prose-sm max-w-none"
					style={{
						color: isUser
							? "rgb(var(--color-text-primary))"
							: "rgb(var(--color-text-primary))",
						fontFamily:
							'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
						letterSpacing: "-0.01em",
					}}>
					{isUser ? (
						<p className="whitespace-pre-wrap break-words m-0">{message.content}</p>
					) : (
						<ReactMarkdown
							remarkPlugins={[
								[remarkMath, { singleDollarTextMath: true }],
								remarkGfm
							]}
							rehypePlugins={[
								[rehypeKatex, {
									strict: false,
									trust: true,
									output: 'html'
								}],
								rehypeHighlight
							]}
							components={{
								p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
								code: ({ className, children, ...props }) => {
									const isInline = !className;
									return isInline ? (
										<code className="px-1.5 py-0.5 rounded text-sm" style={{ background: 'rgba(var(--color-bg-tertiary), 0.8)' }} {...props}>
											{children}
										</code>
									) : (
										<code className={className} {...props}>
											{children}
										</code>
									);
								},
								pre: ({ children }) => (
									<pre className="rounded-lg p-3 overflow-x-auto text-sm my-2" style={{ background: 'rgba(var(--color-bg-tertiary), 0.8)' }}>
										{children}
									</pre>
								),
							}}
						>
							{message.content}
						</ReactMarkdown>
					)}
				</div>
				<p
					className="text-xs mt-2"
					style={{
						color: "rgb(var(--color-text-muted))",
						fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
					}}>
					{new Date(message.timestamp).toLocaleTimeString([], {
						hour: "2-digit",
						minute: "2-digit",
					})}
				</p>
			</div>
		</motion.div>
	);
};

export default function Chatbox() {
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [streamingMessage, setStreamingMessage] =
		useState<StreamingMessage | null>(null);
	const [isFocused, setIsFocused] = useState(false);
	const [personaName, setPersonaName] = useState("Assistant");
	const [imageAttachments, setImageAttachments] = useState<ImageAttachment[]>([]);
	const [showGlow, setShowGlow] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const {
		conversations,
		activeConversationId,
		activePersonaId,
		createConversation,
		addMessage,
		setAgentStatus,
		setIsStreaming,
	} = useStore();

	// Fetch persona name when activePersonaId changes
	useEffect(() => {
		const fetchPersonaName = async () => {
			try {
				const response = await fetch(`/api/personas/${activePersonaId}`);
				if (response.ok) {
					const data = await response.json();
					setPersonaName(data.persona?.name || "Assistant");
				}
			} catch {
				setPersonaName("Assistant");
			}
		};
		fetchPersonaName();
	}, [activePersonaId]);

	const activeConversation = conversations.find(
		(c) => c.id === activeConversationId
	);
	const messages = useMemo(
		() => activeConversation?.messages || [],
		[activeConversation]
	);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages, streamingMessage]);

	useEffect(() => {
		// Create initial conversation if none exists
		if (conversations.length === 0) {
			createConversation(activePersonaId);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Helper function to convert File to base64
	const fileToBase64 = (file: File): Promise<string> => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => {
				const result = reader.result as string;
				// Remove the data:image/...;base64, prefix
				const base64 = result.split(',')[1];
				resolve(base64);
			};
			reader.onerror = (error) => reject(error);
		});
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if ((!input.trim() && imageAttachments.length === 0) || isLoading) return;

		let conversationId = activeConversationId;
		if (!conversationId) {
			conversationId = createConversation(activePersonaId);
		}

		const userMessageContent = input.trim();
		setInput("");
		setIsLoading(true);
		setAgentStatus({ isThinking: true });

		// Convert images to base64
		const images: Array<{ mimeType: string; data: string }> = [];
		for (const attachment of imageAttachments) {
			try {
				const base64Data = await fileToBase64(attachment.file);
				images.push({
					mimeType: attachment.file.type,
					data: base64Data,
				});
				// Revoke the object URL to free memory
				URL.revokeObjectURL(attachment.url);
			} catch (error) {
				console.error('Error converting image to base64:', error);
			}
		}

		// Clear attachments after processing
		setImageAttachments([]);

		// Add user message (with note about images if any)
		const messageContent = images.length > 0
			? `${userMessageContent}${userMessageContent ? '\n' : ''}[${images.length} image${images.length > 1 ? 's' : ''} attached]`
			: userMessageContent;

		addMessage(conversationId, {
			role: "user",
			content: messageContent || '[Image attached]',
		});

		const streamId = `${Date.now()}-stream`;
		setStreamingMessage({
			id: streamId,
			text: "",
			isComplete: false,
		});

		setIsStreaming(true, streamId);

		try {
			const conversationHistory = messages.map((msg) => ({
				role: msg.role,
				content: msg.content,
			}));

			const response = await fetch("/api/chat", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					message: userMessageContent || "What's in this image?",
					personaId: activePersonaId,
					conversationHistory,
					images: images.length > 0 ? images : undefined,
				}),
			});

			if (!response.ok) {
				let errorMessage = `Failed to get response (${response.status})`;
				try {
					const errorData = await response.json();
					errorMessage = errorData.error || errorMessage;
				} catch {
					errorMessage = response.statusText || errorMessage;
				}
				throw new Error(errorMessage);
			}

			if (!response.body) {
				throw new Error("No response body");
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let accumulatedText = "";

			while (true) {
				const { done, value } = await reader.read();

				if (done) {
					if (accumulatedText.trim()) {
						addMessage(conversationId!, {
							role: "assistant",
							content: accumulatedText,
						});
					}
					setStreamingMessage(null);
					setIsLoading(false);
					setAgentStatus({ isThinking: false });
					setIsStreaming(false);
					// Trigger glow fade animation
					setShowGlow(true);
					setTimeout(() => setShowGlow(false), 3000);
					break;
				}

				const chunk = decoder.decode(value, { stream: true });
				const lines = chunk.split("\n");

				for (const line of lines) {
					if (line.startsWith("data: ")) {
						const data = line.slice(6).trim();

						if (data === "[DONE]") {
							if (accumulatedText.trim()) {
								addMessage(conversationId!, {
									role: "assistant",
									content: accumulatedText,
								});
							}
							setStreamingMessage(null);
							setIsLoading(false);
							setAgentStatus({ isThinking: false });
							setIsStreaming(false);
							// Trigger glow fade animation
							setShowGlow(true);
							setTimeout(() => setShowGlow(false), 3000);
							return;
						}

						try {
							const parsed = JSON.parse(data);

							if (parsed.error) {
								addMessage(conversationId!, {
									role: "assistant",
									content: parsed.error,
								});
								setStreamingMessage(null);
								setIsLoading(false);
								setAgentStatus({ isThinking: false });
								setIsStreaming(false);
								return;
							}

							if (parsed.content) {
								accumulatedText += parsed.content;
								setStreamingMessage({
									id: streamId,
									text: accumulatedText,
									isComplete: false,
								});
							}
						} catch (e) {
							// Skip invalid JSON
						}
					}
				}
			}
		} catch (error) {
			console.error("Error sending message:", error);
			addMessage(conversationId!, {
				role: "assistant",
				content:
					error instanceof Error
						? error.message
						: "Sorry, there was an error processing your message. Please try again.",
			});
			setStreamingMessage(null);
			setAgentStatus({ isThinking: false });
			setIsStreaming(false);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col h-full relative z-10">
			{/* Scanlines overlay */}
			<div className="scanlines" />

			{/* Messages Container */}
			<div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 min-h-0 relative z-10">
				{messages.length === 0 && !streamingMessage ? (
					<div className="h-full" />
				) : (
					<>
						<AnimatePresence mode="sync">
							{messages.map((message) => (
								<MessageBubble
									key={message.id}
									message={message}
									isUser={message.role === "user"}
									personaName={personaName}
								/>
							))}
						</AnimatePresence>

						<AnimatePresence mode="wait">
							{streamingMessage && (
								<motion.div
									key="streaming"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0 }}
									transition={{
										duration: 0.15,
										ease: [0.25, 0.1, 0.25, 1]
									}}
									className="flex justify-start">
									<div className="max-w-[85%] rounded-xl px-4 py-3 modern-message gemini-border ai-thinking">
										<div className="flex items-center gap-2 mb-2">
											<div
												className="power-indicator"
												style={{ width: "5px", height: "5px" }}
											/>
											<span
												className="text-xs font-medium"
												style={{ color: "rgb(var(--color-text-tertiary))" }}>
												{personaName}
											</span>
										</div>
										<p
											className="text-[15px] leading-relaxed whitespace-pre-wrap break-words"
											style={{
												color: "rgb(var(--color-text-primary))",
												fontFamily:
													'-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
												letterSpacing: "-0.01em",
											}}>
											{streamingMessage.text}
											<motion.span
												animate={{ opacity: [0.4, 1, 0.4] }}
												transition={{
													duration: 1.2,
													repeat: Infinity,
													ease: "easeInOut",
												}}
												className="inline-block ml-0.5 w-0.5 h-4 align-middle"
												style={{ background: "rgb(var(--color-accent))" }}
											/>
										</p>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</>
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Input Form */}
			<div
				className="shrink-0 p-6 border-t relative z-10"
				style={{ borderColor: "rgba(var(--color-border), 0.1)" }}>
				<form onSubmit={handleSubmit} className="relative">
					{/* Image attachments preview */}
					{imageAttachments.length > 0 && (
						<div className="flex gap-2 mb-3 flex-wrap">
							{imageAttachments.map((img) => (
								<div key={img.id} className="relative group">
									{/* eslint-disable-next-line @next/next/no-img-element */}
									<img
										src={img.url}
										alt="Attachment"
										className="w-16 h-16 object-cover rounded-lg border"
										style={{ borderColor: 'rgba(var(--color-border), 0.3)' }}
									/>
									<button
										type="button"
										onClick={() => {
											URL.revokeObjectURL(img.url);
											setImageAttachments(prev => prev.filter(a => a.id !== img.id));
										}}
										className="absolute -top-2 -right-2 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
										style={{ background: 'rgb(var(--color-error))' }}
									>
										<X className="w-3 h-3 text-white" />
									</button>
								</div>
							))}
						</div>
					)}

					<div className="relative flex items-center gap-3">
						{/* Hidden file input */}
						<input
							type="file"
							ref={fileInputRef}
							accept="image/*"
							multiple
							className="hidden"
							onChange={(e) => {
								const files = Array.from(e.target.files || []);
								const newAttachments = files.map(file => ({
									id: `${Date.now()}-${Math.random()}`,
									url: URL.createObjectURL(file),
									file,
								}));
								setImageAttachments(prev => [...prev, ...newAttachments]);
								e.target.value = '';
							}}
						/>

						{/* Image upload button */}
						<motion.button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className="shrink-0 p-3.5 rounded-lg transition-colors"
							style={{
								background: 'rgba(var(--color-bg-tertiary), 0.8)',
								color: 'rgb(var(--color-text-tertiary))'
							}}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							title="Upload image"
						>
							<ImagePlus className="w-5 h-5" />
						</motion.button>

						<div className={`flex-1 rounded-lg input-wrapper ${isFocused ? "focused" : ""} ${showGlow && !isFocused ? "glow-fade" : ""}`}>
							<input
								type="text"
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onFocus={() => setIsFocused(true)}
								onBlur={() => setIsFocused(false)}
								onPaste={(e) => {
									const items = Array.from(e.clipboardData.items);
									const imageItems = items.filter(item => item.type.startsWith('image/'));
									if (imageItems.length > 0) {
										e.preventDefault();
										const newAttachments = imageItems.map(item => {
											const file = item.getAsFile();
											if (file) {
												return {
													id: `${Date.now()}-${Math.random()}`,
													url: URL.createObjectURL(file),
													file,
												};
											}
											return null;
										}).filter(Boolean) as ImageAttachment[];
										setImageAttachments(prev => [...prev, ...newAttachments]);
									}
								}}
								placeholder={`Message ${personaName}...`}
								className="w-full px-4 py-3.5 rounded-lg focus:outline-none transition-all duration-200 modern-input"
								disabled={isLoading}
							/>
						</div>
						<motion.button
							type="submit"
							disabled={(!input.trim() && imageAttachments.length === 0) || isLoading}
							className="shrink-0 p-3.5 rounded-lg modern-button disabled:opacity-40 disabled:cursor-not-allowed"
							whileHover={{ scale: (input.trim() || imageAttachments.length > 0) && !isLoading ? 1.02 : 1 }}
							whileTap={{ scale: (input.trim() || imageAttachments.length > 0) && !isLoading ? 0.98 : 1 }}>
							{isLoading ? (
								<Loader2 className="w-5 h-5 animate-spin" />
							) : (
								<Send className="w-5 h-5" />
							)}
						</motion.button>
					</div>
				</form>
			</div>
		</div>
	);
}
