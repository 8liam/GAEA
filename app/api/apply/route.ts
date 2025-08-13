import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

interface ApplyRequest {
    content: string;
}

interface ApplyResult {
    filePath: string;
    routePath?: string;
    embedded?: boolean;
    importName?: string;
}

function parseSingleFileBlock(markdown: string): { filePath: string; language: string; code: string } | null {
    // Expect format:
    // // File: app/components/Some.tsx\n```tsx\n...code...\n```
    const headerMatch = markdown.match(/^[ \t]*\/\/\s*File:\s*(.+)$/m);
    if (!headerMatch) return null;
    const filePath = headerMatch[1].trim();

    // Find the first fenced code block following the header
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

function ensureDirExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function createOrUpdateFile(absolutePath: string, contents: string) {
    ensureDirExists(path.dirname(absolutePath));
    fs.writeFileSync(absolutePath, contents, 'utf-8');
}

function toValidIdentifier(base: string): string {
    // Convert filename to a safe identifier
    const cleaned = base.replace(/[^a-zA-Z0-9_]/g, '_');
    let ident = cleaned;
    if (/^[0-9]/.test(ident)) ident = '_' + ident;
    return ident || 'GeneratedComponent';
}

function extractInnerJsxFromReturn(snippet: string): string {
    const match = snippet.match(/return\s*\(([\s\S]*)\)\s*;?\s*$/);
    if (match) return match[1].trim();
    return snippet.trim();
}

function buildInlineComponentSource(sourceCode: string, generatedName: string): { inlineSource: string; usesFC: boolean } {
    let src = sourceCode;
    // Strip header comment lines like // File: ...
    src = src.replace(/^\s*\/\/\s*File:.*$/m, '').trim();
    // Remove import lines (we will manage needed imports separately)
    src = src.replace(/^\s*import\s+[^;]+;\s*$/gm, '').trim();

    // Replace export patterns with local identifiers
    src = src.replace(/export\s+default\s+function\s+[A-Za-z_][A-Za-z0-9_]*\s*\(/, `function ${generatedName}(`);
    src = src.replace(/export\s+function\s+[A-Za-z_][A-Za-z0-9_]*\s*\(/, `function ${generatedName}(`);
    src = src.replace(/export\s+const\s+[A-Za-z_][A-Za-z0-9_]*\s*=\s*/, `const ${generatedName} = `);
    src = src.replace(/export\s+default\s+/g, '');

    const usesFC = /:\s*FC\s*</.test(src) || /:\s*React\.FC\s*</.test(src);

    const inlineSource = `\n// BEGIN INLINE COMPONENT: ${generatedName}\n${src}\n// END INLINE COMPONENT: ${generatedName}\n`;
    return { inlineSource, usesFC };
}

function ensureReactFCSupportInHome(homeContent: string): string {
    if (!/from\s+'react'/.test(homeContent)) return homeContent; // no react import found
    if (/\bFC\b/.test(homeContent)) return homeContent; // already has FC in imports or types

    const reactImportRegex = /(import\s*\{)([^}]*)(\}\s*from\s*'react'\s*;)/;
    if (reactImportRegex.test(homeContent)) {
        return homeContent.replace(reactImportRegex, (m, p1, p2, p3) => {
            const hasFC = /\bFC\b/.test(p2);
            if (hasFC) return m;
            const trimmed = p2.trim().replace(/\s+$/, '');
            const newList = trimmed ? `${trimmed}, FC` : 'FC';
            return `${p1} ${newList} ${p3}`;
        });
    }

    const useClientIndex = homeContent.indexOf('\n');
    const insertPos = useClientIndex >= 0 ? useClientIndex + 1 : 0;
    const stmt = `import type { FC } from 'react';\n`;
    return homeContent.slice(0, insertPos) + stmt + homeContent.slice(insertPos);
}

function injectInlineComponentIntoHomePage(componentRelPath: string, sourceCode: string): { embedded: boolean; importName?: string } {
    const homePath = path.join(process.cwd(), 'app', 'page.tsx');
    if (!fs.existsSync(homePath)) return { embedded: false };

    let content = fs.readFileSync(homePath, 'utf-8');

    const fileBaseName = path.basename(componentRelPath).replace(/\.(t|j)sx?$/, '');
    const generatedName = 'Generated_' + toValidIdentifier(fileBaseName);

    const { inlineSource, usesFC } = buildInlineComponentSource(sourceCode, generatedName);

    if (usesFC) {
        content = ensureReactFCSupportInHome(content);
    }

    const absoluteComponent = path.join(process.cwd(), componentRelPath);
    const relativeFromHome = path.relative(path.dirname(homePath), absoluteComponent).replace(/\\/g, '/');
    const importPathNoExt = relativeFromHome.replace(/\.(t|j)sx?$/, '');
    const importRegex = new RegExp(`^\n?import[^\n]*from ['"]${importPathNoExt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"];?\n?`, 'm');
    content = content.replace(importRegex, '');

    const homeExportRegex = /\nexport\s+default\s+function\s+Home\s*\(/;
    if (homeExportRegex.test(content)) {
        content = content.replace(homeExportRegex, `\n${inlineSource}\nexport default function Home(`);
    } else {
        content = content + inlineSource;
    }

    const propSnippet = /\blabel\s*:\s*string\b/.test(sourceCode) ? ' label="Preview"' : '';

    const marker = '{/* You can add your main content here */}';
    const usage = `\n        <div className=\"mt-8\"><${generatedName}${propSnippet} /></div>\n`;
    if (content.includes(marker)) {
        content = content.replace(marker, `${marker}\n${usage}`);
    } else {
        content = content.replace(/<\/main>/, `${usage}      </main>`);
    }

    fs.writeFileSync(homePath, content, 'utf-8');
    return { embedded: true, importName: generatedName };
}

export async function POST(req: NextRequest) {
    try {
        const { content }: ApplyRequest = await req.json();
        if (!content || typeof content !== 'string') {
            return NextResponse.json({ error: 'Missing content' }, { status: 400 });
        }

        const parsed = parseSingleFileBlock(content);
        if (!parsed) {
            return NextResponse.json({ error: 'Could not parse single-file code block' }, { status: 400 });
        }

        // Normalize target path and ensure it stays inside /app
        const relRaw = parsed.filePath.replace(/^\/?/, '');
        const appRoot = path.join(process.cwd(), 'app');
        const absTarget = path.resolve(process.cwd(), relRaw);
        if (!absTarget.startsWith(appRoot + path.sep)) {
            return NextResponse.json({ error: 'File path must be under app/' }, { status: 400 });
        }

        const relFilePath = path.relative(process.cwd(), absTarget).replace(/\\/g, '/');

        const result: ApplyResult = { filePath: relFilePath };

        const pageMatch = relFilePath.match(/^app\/(.*)\/page\.(t|j)sx?$/);
        if (pageMatch) {
            try {
                createOrUpdateFile(absTarget, parsed.code);
            } catch {
                return NextResponse.json({ error: 'Write failed (read-only filesystem?)' }, { status: 500 });
            }
            const routeSegment = pageMatch[1];
            result.routePath = '/' + routeSegment.replace(/index$/, '').replace(/\\/g, '/');
            return NextResponse.json(result);
        }

        if (/^app\/components\/.+\.(t|j)sx?$/.test(relFilePath)) {
            const { embedded, importName } = injectInlineComponentIntoHomePage(relFilePath, parsed.code);
            result.embedded = embedded;
            result.importName = importName;
            return NextResponse.json(result);
        }

        try {
            createOrUpdateFile(absTarget, parsed.code);
        } catch {
            return NextResponse.json({ error: 'Write failed (read-only filesystem?)' }, { status: 500 });
        }
        return NextResponse.json(result);
    } catch (err) {
        console.error('Apply API error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 