# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server with Turbopack at localhost:3000
npm run build        # Production build
npm run lint         # ESLint
npm test             # Run Vitest tests
npm run setup        # Install deps, generate Prisma client, run migrations
npm run db:reset     # Reset database (destructive)
```

Run a single test:
```bash
npm test -- src/lib/__tests__/file-system.test.ts
```

## Architecture

UIGen is an AI-powered React component generator with live preview. Users describe components via chat, and Claude generates code that renders in real-time.

### Core Flow

1. **Chat Interface** (`src/components/chat/`) - User describes desired component
2. **API Route** (`src/app/api/chat/route.ts`) - Streams AI responses using Vercel AI SDK with Claude
3. **AI Tools** - Two tools exposed to Claude:
   - `str_replace_editor` (`src/lib/tools/str-replace.ts`) - view/create/edit files
   - `file_manager` (`src/lib/tools/file-manager.ts`) - rename/delete files
4. **Virtual File System** (`src/lib/file-system.ts`) - In-memory file system (nothing written to disk)
5. **Preview** (`src/components/preview/PreviewFrame.tsx`) - Renders components in sandboxed iframe

### Key Contexts

- `FileSystemProvider` (`src/lib/contexts/file-system-context.tsx`) - Manages virtual FS state, handles tool calls from AI to update files
- `ChatProvider` (`src/lib/contexts/chat-context.tsx`) - Wraps Vercel AI SDK's `useChat`, syncs file state with API

### Preview Rendering Pipeline

`jsx-transformer.ts` handles live preview:
1. Transforms JSX/TSX files using Babel standalone
2. Creates blob URLs for each transformed file
3. Builds an import map with esm.sh for third-party deps
4. Generates self-contained HTML with React loaded from CDN
5. Renders in sandboxed iframe

### Database

SQLite via Prisma. The database schema is defined in `prisma/schema.prisma` - reference it anytime you need to understand the structure of data stored in the database.

Prisma client generated to `src/generated/prisma/`.

### Authentication

JWT-based auth in `src/lib/auth.ts`. Anonymous users can use the app without saving; authenticated users get persistent projects.

## File Conventions

- Components in `src/components/` grouped by feature (chat, editor, preview, auth, ui)
- Actions (server actions) in `src/actions/`
- UI primitives use Radix UI + shadcn/ui patterns in `src/components/ui/`
- Tests colocated in `__tests__/` directories

## Code Style

- Use comments sparingly. Only comment complex code.
