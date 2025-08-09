"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MarkdownRenderer } from '../utils/markdown-renderer';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

function extractFirstJsxBlock(content: string): { code: string; filePath?: string } | null {
    const headerMatch = content.match(/^[ \t]*\/\/\s*File:\s*(.+)$/m);
    const filePath = headerMatch?.[1]?.trim();
    // Prefer ```tsx or ```jsx blocks
    const fence = content.match(/```(tsx|jsx)\n([\s\S]*?)\n```/);
    if (fence && fence[2]) return { code: fence[2], filePath };
    // Fallback: any fenced block
    const anyFence = content.match(/```[\w+\-]*\n([\s\S]*?)\n```/);
    if (anyFence && anyFence[1]) return { code: anyFence[1], filePath };
    return null;
}

function hasJsxFence(content: string): boolean {
    return /```(tsx|jsx)\n([\s\S]*?)\n```/.test(content) || /```[\w+\-]*\n([\s\S]*?)\n```/.test(content);
}

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [applyingIndex, setApplyingIndex] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Persistent preview channel
    const previewChannelRef = useRef<BroadcastChannel | null>(null);
    useEffect(() => {
        previewChannelRef.current = new BroadcastChannel('ai-preview');
        return () => {
            try { previewChannelRef.current?.close(); } catch { }
            previewChannelRef.current = null;
        };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input.trim() };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();
            const assistantMessage: Message = {
                role: 'assistant',
                content: data.content,
            };
            setMessages((prev) => [...prev, assistantMessage]);

            // Auto-preview latest code block if present
            const snippet = extractFirstJsxBlock(assistantMessage.content);
            if (snippet) {
                try {
                    previewChannelRef.current?.postMessage({ code: snippet.code, filePath: snippet.filePath });
                } catch {
                    const channel = new BroadcastChannel('ai-preview');
                    channel.postMessage({ code: snippet.code, filePath: snippet.filePath });
                    setTimeout(() => channel.close(), 500);
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                role: 'assistant',
                content:
                    'Sorry, I encountered an error. Please try again or check your connection.',
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const clearChat = () => setMessages([]);

    const hasSingleFileBlock = (text: string): boolean => /(^|\n)\s*\/\/\s*File:\s*app\//.test(text) && /```[\s\S]*```/.test(text);
    const isPagePath = (text: string): boolean => /(^|\n)\s*\/\/\s*File:\s*app\/.+\/page\.(t|j)sx?\b/.test(text);

    const applyGeneratedCode = async (index: number) => {
        try {
            setApplyingIndex(index);
            const msg = messages[index];
            const res = await fetch('/api/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: msg.content }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'Failed to apply code');
            }

            const filePath: string = data.filePath;
            const routePath: string | undefined = data.routePath;

            let confirmation = `Applied to \
- ${'`' + filePath + '`'}`;
            if (routePath) {
                confirmation += `\n\nVisit: [${routePath}](${routePath})`;
            }

            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: confirmation },
            ]);

            if (routePath) router.push(routePath);
        } catch (err) {
            console.error('Apply failed:', err);
            setMessages((prev) => [
                ...prev,
                { role: 'assistant', content: 'Apply failed. ' + (err as Error).message },
            ]);
        } finally {
            setApplyingIndex(null);
        }
    };

    const previewMessage = (index: number) => {
        const msg = messages[index];
        const snippet = extractFirstJsxBlock(msg.content);
        if (!snippet) return;
        try {
            previewChannelRef.current?.postMessage({ code: snippet.code, filePath: snippet.filePath });
        } catch {
            const channel = new BroadcastChannel('ai-preview');
            channel.postMessage({ code: snippet.code, filePath: snippet.filePath });
            setTimeout(() => channel.close(), 500);
        }
    };

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-[#0b0f1a] via-[#0f1629] to-[#0b0f1a] text-gray-100">
            {/* Subtle gradient glow backdrop */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(88,101,242,0.25),rgba(88,101,242,0)_60%)] blur-2xl" />
                <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.2),rgba(99,102,241,0)_60%)] blur-2xl" />
            </div>

            <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4">
                {/* Header - transparent, glassy */}
                <header className="sticky top-0 z-10 ">
                    <div className="flex items-center justify-between p-2">
                        <button
                            onClick={clearChat}
                            className="rounded-lg bg-white/5 backdrop-blur-sm px-3 py-2 text-sm text-gray-200 hover:bg-white/10 border border-white/10 transition-colors"
                        >
                            Clear Chat
                        </button>
                    </div>
                </header>

                {/* Messages */}
                <main className="relative flex-1 overflow-y-auto py-6">
                    {messages.length === 0 && !isLoading && (
                        <div className="mt-16 text-center text-gray-400">
                            <p className="text-sm">
                                Describe the component or section you want to create.
                            </p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {messages.map((message, index) => {
                            const isUser = message.role === 'user';
                            const hasFile = hasSingleFileBlock(message.content);
                            const pageMsg = hasFile && isPagePath(message.content);
                            const showPreview = !isUser && hasJsxFence(message.content);
                            return (
                                <div
                                    key={index}
                                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    {isUser ? (
                                        <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-gradient-to-br from-indigo-600/80 to-violet-600/80 text-white backdrop-blur-md shadow-lg">
                                            <p className="whitespace-pre-wrap leading-relaxed">
                                                {message.content}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="w-full">
                                            {(showPreview || pageMsg) && (
                                                <div className="mb-2 flex justify-end gap-2">
                                                    {showPreview && (
                                                        <button
                                                            onClick={() => previewMessage(index)}
                                                            className="rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-200 hover:bg-white/10 border border-white/10 transition-colors"
                                                        >
                                                            Preview
                                                        </button>
                                                    )}
                                                    {pageMsg && (
                                                        <button
                                                            onClick={() => applyGeneratedCode(index)}
                                                            disabled={applyingIndex === index}
                                                            className="rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-200 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-60"
                                                        >
                                                            {applyingIndex === index ? 'Applying…' : 'Apply & Open Page'}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            <MarkdownRenderer content={message.content} />
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="w-full">
                                    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-gray-100 backdrop-blur-md shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <span className="h-2 w-2 animate-bounce rounded-full bg-gray-300" />
                                            <span
                                                className="h-2 w-2 animate-bounce rounded-full bg-gray-300"
                                                style={{ animationDelay: '0.12s' }}
                                            />
                                            <span
                                                className="h-2 w-2 animate-bounce rounded-full bg-gray-300"
                                                style={{ animationDelay: '0.24s' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div ref={messagesEndRef} />
                </main>

                {/* Input Bar - glassmorphism with gradient ring on focus */}
                <footer className="sticky bottom-0 z-10 mb-4 rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md shadow-xl">
                    <div className="flex items-stretch gap-2">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Describe your component"
                            rows={1}
                            disabled={isLoading}
                            className="h-12 flex-1 resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-3 text-gray-100 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-indigo-500/60"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim() || isLoading}
                            className="h-12 inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-medium text-white shadow-lg shadow-indigo-900/30 transition-all hover:shadow-indigo-900/40 disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-60"
                        >
                            Send
                        </button>
                    </div>

                </footer>
            </div>
        </div>
    );
}