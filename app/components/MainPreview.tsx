"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function MainPreview() {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [code, setCode] = useState<string>("");

    useEffect(() => {
        const channel = new BroadcastChannel("ai-preview");
        const handler = (event: MessageEvent<{ code?: string; filePath?: string }>) => {
            const data = event.data;
            if (typeof data?.code === "string") {
                setCode(data.code);
            }
        };
        channel.onmessage = handler;
        return () => {
            channel.onmessage = null;
            channel.close();
        };
    }, []);

    const html = useMemo(() => buildHtmlForSnippet(code), [code]);

    useEffect(() => {
        if (!iframeRef.current) return;
        const doc = iframeRef.current.contentDocument;
        if (!doc) return;
        doc.open();
        doc.write(html);
        doc.close();
    }, [html]);

    return (
        <div className="">

            <iframe ref={iframeRef} className="w-full max-h-screen min-h-screen" />
        </div>
    );
}

function extractInnerJsxFromReturn(snippet: string): string {
    // If the snippet includes return(...), extract inside; else use snippet as-is
    const match = snippet.match(/return\s*\(([\s\S]*)\)\s*;?\s*$/);
    if (match) return match[1].trim();
    return snippet.trim();
}

function buildHtmlForSnippet(snippet: string): string {
    const inner = extractInnerJsxFromReturn(snippet);
    // Build source that defines Preview and exposes it
    const src = `function Preview(){return (${inner});}` + `\n;window.__Exported = Preview;`;

    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="https://unpkg.com/@babel/standalone@7.26.3/babel.min.js"></script>
    <script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>html,body,#root{height:100%;margin:0;padding:0;background:black;color:white}</style>
  </head>
  <body>
    <div id="root"></div>
    <script>
      try {
        var transformed = Babel.transform(${JSON.stringify(src)}, { filename: 'preview.tsx', presets: [["react", { runtime: "classic" }], "typescript"] }).code;
        // Expose React in scope for classic runtime
        window.React = window.React || React;
        // Evaluate the transpiled code to define Preview and window.__Exported
        (0, eval)(transformed);
        var root = ReactDOM.createRoot(document.getElementById('root'));
        if (window.__Exported) {
          root.render(React.createElement(window.__Exported));
        } else {
          root.render(React.createElement('div', {style:{padding:16}}, 'Nothing to render.'));
        }
      } catch (e) {
        var pre = document.createElement('pre');
        pre.textContent = String(e && (e.stack || e.message || e));
        document.body.appendChild(pre);
      }
    </script>
  </body>
</html>`;
} 