'use client';

import { useState } from 'react';

interface CodeBlockProps {
    code: string;
    language?: string;
    filename?: string;
}

export default function CodeBlock({ code, language = 'typescript', filename }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    return (
        <div className="my-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-hidden shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                    {filename && (
                        <span className="text-sm text-gray-600 dark:text-gray-300 font-mono">
                            {filename}
                        </span>
                    )}
                    {language && (
                        <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium">
                            {language}
                        </span>
                    )}
                </div>
                <button
                    onClick={copyToClipboard}
                    className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>

            {/* Code content */}
            <div className="p-4 overflow-x-auto bg-gray-50 dark:bg-gray-800">
                <pre className="text-sm leading-relaxed font-mono text-gray-800 dark:text-gray-200">
                    <code className={`language-${language}`}>
                        {code}
                    </code>
                </pre>
            </div>
        </div>
    );
} 