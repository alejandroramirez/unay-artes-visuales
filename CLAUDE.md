# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application built with the T3 Stack, integrated with Sanity CMS for content management. The project uses React 19, TypeScript, Tailwind CSS v4, and Biome v2 for linting/formatting.

## Development Commands

```bash
# Development
pnpm dev              # Start Next.js dev server with Turbo

# Build & Production
pnpm build           # Build the application
pnpm start           # Start production server
pnpm preview         # Build and start production server

# Code Quality
pnpm check           # Run Biome linter and formatter checks
pnpm check:write     # Run Biome and auto-fix issues
pnpm check:unsafe    # Run Biome with unsafe fixes
pnpm typecheck       # Run TypeScript type checking
```

## Architecture

### Next.js + Sanity Integration

- **Sanity Studio**: Mounted at `/studio` route via `src/app/studio/[[...tool]]/page.tsx`
- **Sanity Config**: Root-level `sanity.config.ts` defines the Studio configuration with `basePath: "/studio"`
- **Schema Types**: Defined in `src/sanity/schemaTypes/` (author, post, category, blockContent)
- **Sanity Client**: Configured in `src/sanity/lib/client.ts` using next-sanity

### Environment Variables

- **Schema Validation**: Environment variables are validated using `@t3-oss/env-nextjs` in `src/env.js`
- **Required Sanity Variables**:
  - `NEXT_PUBLIC_SANITY_PROJECT_ID`
  - `NEXT_PUBLIC_SANITY_DATASET`
  - `NEXT_PUBLIC_SANITY_API_VERSION` (defaults to "2025-10-08")
- **Adding New Variables**: Update both `src/env.js` schema and `.env.example`

### Path Aliases

- `~/*` maps to `./src/*` (configured in `tsconfig.json`)

### Styling

- **Tailwind CSS v4**: Uses new `@theme` directive in `src/styles/globals.css`
- **Note**: Biome v2.2.5 flags `@theme` as unknown; this will be resolved in v2.3

### Code Quality Tools

- **Biome v2.2.5**: Handles formatting, linting, and import organization
  - Custom rule: `useSortedClasses` for functions `clsx`, `cva`, `cn`
  - Import organization runs automatically with `biome check --write`
- **TypeScript**: Strict mode enabled with `noUncheckedIndexedAccess`

## Important Notes

- Package manager: **pnpm** (required, specified in package.json)
- Next.js runs with Turbo mode enabled for development
- All new client-side environment variables must be prefixed with `NEXT_PUBLIC_`

## Git Commit Guidelines

- **Never include Claude attribution** (no "🤖 Generated with Claude Code" or "Co-Authored-By: Claude")
- **Group related changes logically**: Commit files together that represent a cohesive unit of work (e.g., feature implementation, bug fix, refactor)
- Write clear, concise commit messages that explain the purpose of the changes
