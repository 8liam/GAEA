import { NextRequest, NextResponse } from 'next/server';
import { loadCodePrompt } from '../../utils/prompt-loader';

export const runtime = 'nodejs';

interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

interface CodeRequest {
    messages: Message[];
}

export async function POST(request: NextRequest) {
    try {
        const { messages }: CodeRequest = await request.json();

        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json(
                { error: 'OpenRouter API key not configured' },
                { status: 500 }
            );
        }

        // Load code prompt from XML file
        const systemPrompt = loadCodePrompt();

        // Prepare messages with system prompt
        const messagesWithSystem = [
            { role: 'system' as const, content: systemPrompt },
            ...messages
        ];

        const model = process.env.OPENROUTER_MODEL || 'openrouter/auto';

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000);

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': request.headers.get('origin') || 'http://localhost:3000',
                'X-Title': 'OpenRouter AI Code Generator',
            },
            body: JSON.stringify({
                model,
                messages: messagesWithSystem,
                max_tokens: 2000,
                temperature: 0.7,
            }),
            signal: controller.signal,
        }).finally(() => clearTimeout(timeout));

        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API error:', errorText);
            return NextResponse.json(
                { error: 'Failed to get response from AI', details: safeJson(errorText) },
                { status: response.status }
            );
        }

        const data = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            return NextResponse.json(
                { error: 'No content in AI response' },
                { status: 500 }
            );
        }

        return NextResponse.json({ content });
    } catch (error) {
        console.error('Code API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

function safeJson(text: string) {
    try { return JSON.parse(text); } catch { return text; }
} 