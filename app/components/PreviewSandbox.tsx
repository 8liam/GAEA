"use client";

import { useEffect, useMemo, useRef } from "react";

interface PreviewSandboxProps {
    open: boolean;
    onClose: () => void;
    content: string; // full assistant message content
}

export default function PreviewSandbox({ open, onClose, content }: PreviewSandboxProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const parsed = useMemo(() => parseSingleFileBlock(content), [content]);
    const code = parsed?.code ?? "";
    const filePath = parsed?.filePath ?? "app/components/PreviewComponent.tsx";

    useEffect(() => {
        if (!open || !iframeRef.current) return;

        const doc = iframeRef.current.contentDocument;
        if (!doc) return;

        const html = buildHtmlForCodePreview(code, filePath);
        doc.open();
        doc.write(html);
        doc.close();
    }, [open, code, filePath]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="relative w-full max-w-4xl rounded-xl bg-[#0b0f1a] border border-white/10 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5">
                    <div className="text-sm text-gray-200 truncate">Preview: {filePath}</div>
                    <button
                        onClick={onClose}
                        className="text-gray-200 text-sm px-3 py-1 rounded bg-white/10 hover:bg-white/20"
                    >
                        Close
                    </button>
                </div>
                <iframe ref={iframeRef} className="w-full h-[70vh] bg-white" />
            </div>
        </div>
    );
}

function parseSingleFileBlock(markdown: string): { filePath: string; language: string; code: string } | null {
    const headerMatch = markdown.match(/^[ \t]*\/\/\s*File:\s*(.+)$/m);
    if (!headerMatch) return null;
    const filePath = headerMatch[1].trim();

    const fenceRegex = /```([\w+\-]*)\n([\s\S]*?)\n```/g;
    let match: RegExpExecArray | null;
    let codeBlock: { language: string; code: string } | null = null;
    while ((match = fenceRegex.exec(markdown)) !== null) {
        const language = (match[1] || 'typescript').trim();
        const code = match[2];
        codeBlock = { language, code };
        break;
    }
    if (!codeBlock) return null;
    return { filePath, language: codeBlock.language, code: codeBlock.code };
}

function guessComponentNameFromCode(code: string, fallback: string): string {
    // Try to find first PascalCase identifier declaration
    const declMatch = code.match(/\b(?:const|let|var|function|class)\s+([A-Z][A-Za-z0-9_]*)/);
    if (declMatch) return declMatch[1];
    return fallback;
}

function buildHtmlForCodePreview(code: string, filePath: string): string {
    const fileBase = filePath.split('/').pop()?.replace(/\.(t|j)sx?$/, '') || 'PreviewComponent';
    const guessed = guessComponentNameFromCode(code, fileBase);

    // Preprocess source: remove imports/exports and try to expose a component as window.__Exported
    let src = code
        .replace(/^\s*\/\/\s*File:.*$/m, '')
        .replace(/^\s*import\s+[^;]+;\s*$/gm, '')
        .replace(/export\s+default\s+function\s+([A-Za-z_][A-Za-z0-9_]*)?\s*\(/, 'function $1 (')
        .replace(/export\s+function\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/, 'function $1(')
        .replace(/export\s+const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*/, 'const $1 = ')
        .replace(/export\s+default\s+/g, '');

    // Append setter for window.__Exported
    src += `\n;try{window.__Exported = typeof ${guessed} !== 'undefined' ? ${guessed} : window.__Exported;}catch(e){}`;

    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Preview</title>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>html,body,#root{height:100%;margin:0;padding:0}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="text/babel" data-type="module" data-presets="typescript,react">${src}</script>
    <script type="text/javascript">
      const root = ReactDOM.createRoot(document.getElementById('root'));
      if (window.__Exported) {
        try { root.render(React.createElement(window.__Exported)); }
        catch (e) { root.render(React.createElement('pre', null, String(e.stack || e.message || e))); }
      } else {
        root.render(React.createElement('div', {style:{padding:16}}, 'No export detected to render.'));
      }
    </script>
  </body>
</html>`;
    return html;
} 