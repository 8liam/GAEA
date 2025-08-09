# GAEA — Generative AI Next.js + TailwindCSS Component Creation

A modern, open-source playground for generating, previewing, and applying UI code via OpenRouter. Built on Next.js App Router with TypeScript and Tailwind CSS, it streams AI-generated snippets into a live, sandboxed preview and optionally writes pages/components into your app (with safety guards).

- Inline, live preview of the latest code block (return-only JSX) inside the page
- One-click Preview and Apply actions for individual assistant responses
- Safe “Apply Page” flow that writes `app/.../page.tsx` and navigates to it
- Optional inline “Apply Component” flow that injects generated components into `app/page.tsx` for instant viewing (no file writes)
- Hardened APIs (timeouts, better errors) and safe path handling for file writes
- Opinionated prompts that enforce valid TSX and accessible markup

### Tech Stack

- Next.js 15 App Router + TypeScript
- Tailwind CSS (utility-first)
- OpenRouter API for model access

## Features

- **Auto-preview**: The latest assistant code block (a single tsx fenced block containing only the JSX returned by a component) renders inline in `<main>` automatically.
- **Manual controls**: Per-message Preview and Apply actions let you compare multiple outputs.
- **Valid TSX, always**: Prompts instruct the model to self-close void elements (like `<img />`) and add image alt text.
- **Safer file writes**: Path normalization ensures all writes remain under `app/`; friendly error for read-only filesystems.
- **Robust APIs**: Node runtime, request timeouts, improved error details from provider responses.

## Quick Start

- **Requirements**
  - Node.js 18+
  - An OpenRouter API key

- **Setup**
  ```bash
  npm install
  ```

- **Environment**
  Create `.env.local`:
  ```bash
  OPENROUTER_API_KEY=your_key_here
  # Optional, defaults to openrouter/auto:
  OPENROUTER_MODEL=openrouter/auto
  ```

- **Develop**
  ```bash
  npm run dev
  ```

## How It Works

- **Chat UI** (`app/components/Chat.tsx`)
  - Sends messages to `/api/code`
  - Extracts the first tsx fenced block from each assistant response
  - Auto-broadcasts it to the inline preview via BroadcastChannel
  - Provides Preview and Apply actions per message

- **Inline Preview** (`app/components/MainPreview.tsx`)
  - Listens on `ai-preview`
  - Transpiles return-only JSX with Babel (classic runtime + typescript) in an iframe
  - Uses pinned CDN versions of React/ReactDOM/Babel for stability

- **Apply API** (`app/api/apply/route.ts`)
  - Accepts a single-file response marked with `// File: app/...`
  - Pages: writes to disk (normalized path under `app/`) and returns the route
  - Components: injects inline into `app/page.tsx` for preview (no file writes)
  - Guards against path traversal; returns friendly errors on read-only FS

- **Prompts** (`app/config/*.xml`)
  - Code prompt: returns one tsx fenced block that contains only inner JSX for `return (...)`, styled with Tailwind classes; enforces valid TSX (void self-closing, alt text).
  - Decision prompt: orchestration rules for single-file outputs when needed.

## API Endpoints

- `POST /api/code`: Generate code with system prompt (configurable model, timeouts, better error propagation).
- `POST /api/analyze`: Secondary prompt endpoint (same improvements as above).
- `POST /api/apply`: Apply a single-file response to disk (pages) or inject inline (components), with safety checks.

## Configuration

- **Environment variables**
  - `OPENROUTER_API_KEY`: Required
  - `OPENROUTER_MODEL`: Optional (`openrouter/auto` by default)

- **Scripts**
  ```bash
  npm run dev     # Start dev server
  npm run build   # Production build
  npm run start   # Start production server
  npm run lint    # Lint
  ```

## Project Structure

- `app/` Next.js app directory
  - `api/` API routes (code, analyze, apply)
  - `components/` UI and preview components
  - `config/` XML prompt definitions
  - `utils/` prompt loader and markdown rendering
- `public/` Static assets

## Security & Notes

- File writes are Node-runtime only. Many hosts deploy read-only filesystems; the API returns a clear error if writing isn’t possible.
- The preview iframe runs pinned CDN scripts; consider adding `sandbox` attributes and CSP allowances in production.
- Paths are normalized and validated to remain under `app/` before any write.

## Roadmap Ideas

- Snapshot gallery to compare multiple previews side-by-side
- Optional file-backed “Apply Component” mode with safe paths
- Structured telemetry for errors (with request IDs)

## Credits

Open Source project by Liam Grant. Please credit me when forking this work.

## License

MIT License. 