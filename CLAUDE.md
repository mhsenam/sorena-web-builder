# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI Site Builder application that generates complete websites from user prompts. The system uses Next.js 14 with App Router to provide a web interface where users can describe their website needs, and the application generates a complete website codebase that can be exported as a ZIP file.

## Current Project Status

**⚠️ IMPORTANT: This project is currently in the documentation phase. No actual code has been implemented yet. The architecture and specifications below describe the planned implementation.**

## Architecture

### Tech Stack
- **Frontend:** Next.js 14 (App Router) + React Server/Client Components + Tailwind CSS
- **Backend:** Next.js Route Handlers (no separate server), streaming AI responses
- **AI Layer:** LLM integration (OpenAI) for generating page structure, components and styles
- **State Management:** Zustand or React Query on client + optional KV for history
- **Export:** In-memory file generation and ZIP output using `jszip`
- **Language Support:** Persian (fa) and English (en)

### Core Data Flow
1. User submits a prompt with configuration (framework, theme, sections, language)
2. Backend calls AI model to generate a `SitePlan` JSON structure
3. Codegen system converts `SitePlan` to actual files based on selected framework
4. Files can be previewed live and exported as ZIP

## Development Commands

### Initial Setup
```bash
npm create next-app@latest . --typescript --tailwind --app --eslint
npm install openai jszip zod
npm install --save-dev @types/node
```

### Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Run Production Build
```bash
npm start
```

### Linting & Type Checking
```bash
npm run lint
npm run type-check  # Add this script to package.json: "tsc --noEmit"
```

## Project Structure

```
/app
  /api
    /generate/route.ts        # AI site generation endpoint
    /export/route.ts          # ZIP export endpoint
  /preview
    page.tsx                  # Live preview UI
  page.tsx                    # Landing + form
  layout.tsx
/components
  PromptForm.tsx
  LivePreview.tsx
  SectionEditor.tsx
  ExportButtons.tsx
/lib
  ai.ts                       # AI model calls + streaming
  prompts.ts                  # AI prompt templates
  codegen.ts                  # File generation from JSON
  zip.ts                      # ZIP creation with jszip
  validation.ts               # Zod schemas
/styles
  globals.css
```

## Key API Routes

- **POST /api/generate** - Generates site plan and files from user prompt
  - Input: BuildRequest (intent, framework, theme, sections, language, brand)
  - Output: SitePlan + GeneratedFiles
  
- **POST /api/export** - Creates ZIP file from generated files
  - Input: Array of files
  - Output: ZIP blob

## Data Contracts

### BuildRequest
```typescript
{
  intent: string;              // User's description
  framework: "vanilla"|"react"|"next";
  theme: { primary: string; secondary?: string; font?: string; dark?: boolean };
  sections: Array<"hero"|"features"|"menu"|"gallery"|"pricing"|"contact"|"faq">;
  language: "fa"|"en";
  brand?: { name?: string; tone?: "formal"|"casual"|"playful" };
}
```

### SitePlan (AI Output)
```typescript
{
  meta: { title: string; description: string; language: string };
  assets: { images: Array<{id:string; prompt?:string; url?:string}> };
  sections: Array<{
    id: string;
    type: string;
    props: Record<string, any>;
  }>;
  style: { colors: Record<string,string>; font?: string };
}
```

### GeneratedFiles (Export Format)
```typescript
{
  files: Array<{ path: string; content: string }>;
}
```

## Environment Variables

Required:
- `OPENAI_API_KEY` - OpenAI API key for AI model access

Create a `.env.local` file:
```bash
OPENAI_API_KEY=your_key_here
```

## Implementation Priorities

When implementing this project, follow this order:

1. **Setup & Configuration**
   - Initialize Next.js project with TypeScript and Tailwind
   - Install dependencies (openai, jszip, zod)
   - Configure environment variables

2. **Data Validation Layer** (`/lib/validation.ts`)
   - Implement Zod schemas for BuildRequest and SitePlan
   - Add validation middleware for API routes

3. **AI Integration** (`/lib/ai.ts`, `/lib/prompts.ts`)
   - Set up OpenAI client
   - Create prompt templates
   - Implement generateSitePlan function with JSON response format

4. **Code Generation** (`/lib/codegen.ts`)
   - Start with vanilla HTML/CSS/JS generator
   - Add React component generator
   - Add Next.js App Router generator

5. **API Routes**
   - Implement `/api/generate/route.ts`
   - Implement `/api/export/route.ts` with jszip

6. **Frontend Components**
   - Build PromptForm component
   - Create LivePreview component
   - Add ExportButtons component

7. **Pages**
   - Implement landing page with form
   - Create preview page with live rendering

## Important Implementation Notes

### AI Integration
- Uses OpenAI's JSON response format for structured output
- System prompts enforce strict JSON conforming to TypeScript types
- Temperature set to 0.7 for balanced creativity/consistency
- Model: `gpt-4o-mini` for cost efficiency

### Code Generation
- Framework-specific generators in `/lib/codegen.ts`
- Vanilla: Generates HTML, CSS, JS files
- React: Creates component-based structure with JSX
- Next.js: Scaffolds App Router structure with TypeScript

### Security Considerations
- Input validation using Zod schemas
- Rate limiting: 3 requests per minute per IP
- Input length restrictions (1000 character limit)
- Response caching for identical prompts

### Styling Approach
- Prefer Tailwind utility classes over inline styles
- Semantic HTML structure
- Accessibility considerations in generated code
- RTL support for Persian language

## Testing Strategy
- Unit tests for codegen functions with deterministic SitePlan inputs
- Contract testing: Validate AI JSON output with `zod.safeParse`
- Visual QA: HTML/CSS snapshots with `@testing-library/react` + `jest`

## Common Development Tasks

### Adding a New Section Type
1. Add the type to BuildRequest sections enum
2. Update AI prompts to handle the new section
3. Add rendering logic in codegen for each framework
4. Create preview component for the section

### Debugging AI Responses
1. Check API logs for raw AI response
2. Validate JSON structure with zod.safeParse
3. Ensure prompt includes all required fields
4. Test with lower temperature for consistency

### Optimizing Bundle Size
1. Use dynamic imports for heavy components
2. Lazy load preview components
3. Minimize AI response tokens
4. Use production builds for testing