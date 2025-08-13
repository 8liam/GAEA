"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function MainPreview() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [code, setCode] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);

  useEffect(() => {
    const channel = new BroadcastChannel("ai-preview");
    const handler = (event: MessageEvent<{ code?: string; filePath?: string; loading?: boolean }>) => {
      const data = event.data;
      if (typeof data?.code === "string") {
        setCode(data.code);
      }
      if (typeof data?.loading === "boolean") {
        setIsThinking(Boolean(data.loading));
      }
    };
    channel.onmessage = handler;
    return () => {
      channel.onmessage = null;
      channel.close();
    };
  }, []);

  const html = useMemo(() => buildHtmlForSnippet(code, isThinking), [code, isThinking]);

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

function buildHtmlForSnippet(snippet: string, showRainbow: boolean): string {
  const extracted = extractInnerJsxFromReturn(snippet);
  const inner = extracted && extracted.length > 0 ? extracted : '<div />';
  const shouldRainbow = !!showRainbow;
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
    <style>
      html,body,#root{height:100%;margin:0;padding:0;background:black;color:white}
    .frame{padding:8px;border-radius:14px;height:100%;box-sizing:border-box;}
    .inner{height:100%;width:100%;border-radius:12px;overflow:hidden;background:transparent}
      ${shouldRainbow ? `
      @keyframes rb {
        0%{background-position:0% 50%}
        100%{background-position:200% 50%}
      }
      .rainbow{background:linear-gradient(90deg,#615fff,#e12afb);background-size:200% 100%;animation:rb 8s linear infinite;filter:saturate(120%)}
      ` : ''}
    </style>
  </head>
  <body>
    <div class="frame ${shouldRainbow ? 'rainbow' : ''}">
      <div id="root" class="inner"></div>
    </div>
    <script>
      try {
        var transformed = Babel.transform(${JSON.stringify(src)}, { filename: 'preview.tsx', presets: [["react", { runtime: "classic" }], "typescript"] }).code;
        window.React = window.React || React;
        (0, eval)(transformed);
        var root = ReactDOM.createRoot(document.getElementById('root'));
        if (window.__Exported) {
          root.render(React.createElement(window.__Exported));
        } else {
          root.render(React.createElement('div', {style:{height:'100%', width:'100%'}}));
        }
      } catch (e) {
        try {
          var rootFallback = ReactDOM.createRoot(document.getElementById('root'));
          rootFallback.render(React.createElement('div', {style:{height:'100%', width:'100%'}}));
        } catch(_) {}
      }
    </script>
  </body>
</html>`;
}