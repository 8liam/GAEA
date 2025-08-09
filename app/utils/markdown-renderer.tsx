'use client';

import { ReactElement } from 'react';
import CodeBlock from '../components/CodeBlock';

interface MarkdownRendererProps {
    content: string;
}

type Block =
    | { type: 'code'; language: string; code: string }
    | { type: 'text'; text: string };

export function MarkdownRenderer({ content }: MarkdownRendererProps): ReactElement {
    // First, parse fenced code blocks
    let blocks = parseContentToBlocks(content);
    // Then, post-process text blocks to extract any HTML code blocks
    blocks = blocks.flatMap((block) =>
        block.type === 'text' ? splitHtmlCodeBlocks(block.text) : [block]
    );

    return (
        <div className="w-full space-y-4">
            {blocks.map((block, idx) => {
                if (block.type === 'code') {
                    return (
                        <CodeBlock key={idx} code={block.code} language={block.language || 'typescript'} />
                    );
                }
                // text block
                return (
                    <div
                        key={idx}
                        className="whitespace-pre-wrap leading-relaxed text-gray-100"
                        dangerouslySetInnerHTML={{ __html: formatText(block.text) }}
                    />
                );
            })}
        </div>
    );
}

function parseContentToBlocks(markdown: string): Block[] {
    const lines = markdown.replace(/\r\n?/g, '\n').split('\n');
    const blocks: Block[] = [];
    let inCode = false;
    let codeLang = '';
    let codeLines: string[] = [];
    let textLines: string[] = [];

    const pushText = () => {
        if (textLines.length) {
            blocks.push({ type: 'text', text: textLines.join('\n') });
            textLines = [];
        }
    };

    const pushCode = () => {
        blocks.push({ type: 'code', language: codeLang || 'typescript', code: codeLines.join('\n') });
        codeLines = [];
        codeLang = '';
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const fenceMatch = line.match(/^\s*```\s*([\w+\-]*)\s*$/);

        if (fenceMatch) {
            if (!inCode) {
                // entering code fence
                inCode = true;
                codeLang = fenceMatch[1] || '';
                // flush any pending text
                pushText();
            } else {
                // exiting code fence
                inCode = false;
                pushCode();
            }
            continue;
        }

        if (inCode) {
            codeLines.push(line);
        } else {
            textLines.push(line);
        }
    }

    // flush trailing buffers
    if (inCode && codeLines.length) {
        pushCode();
    }
    if (textLines.length) {
        pushText();
    }

    return blocks;
}

// Split HTML code blocks inside a text block into separate CodeBlock entries
function splitHtmlCodeBlocks(text: string): Block[] {
    const blocks: Block[] = [];
    let lastIndex = 0;
    const regex = /<pre><code(?: class=\"language-([\w+\-]+)\")?>([\s\S]*?)<\/code><\/pre>|<code(?: class=\"language-([\w+\-]+)\")?>([\s\S]*?)<\/code>/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        const matchStart = match.index;
        const matchEnd = regex.lastIndex;

        // Push preceding text
        if (matchStart > lastIndex) {
            blocks.push({ type: 'text', text: text.slice(lastIndex, matchStart) });
        }

        const lang = match[1] || match[3] || 'typescript';
        const codeContent = unescapeHtml((match[2] || match[4] || '').trim());
        blocks.push({ type: 'code', language: lang, code: codeContent });

        lastIndex = matchEnd;
    }

    // Remaining text
    if (lastIndex < text.length) {
        blocks.push({ type: 'text', text: text.slice(lastIndex) });
    }

    return blocks;
}

function unescapeHtml(s: string): string {
    return s
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
}

function formatText(text: string): string {
    return text
        // Escape basic HTML to avoid injection, then re-insert our formatting
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // Bold **text**
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
        // Italic *text*
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
        // Inline code `code`
        .replace(/`([^`]+)`/g, '<code class="bg-gray-700 dark:bg-gray-600 px-1.5 py-0.5 rounded text-sm font-mono text-gray-100">$1</code>')
        // Links [text](url)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-400 hover:text-blue-300 underline" target="_blank" rel="noopener noreferrer">$1</a>')
        // Line breaks
        .replace(/\n/g, '<br>');
} 