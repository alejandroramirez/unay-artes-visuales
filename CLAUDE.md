# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Unay Artes Visuales is a visual arts portfolio/gallery website built with Next.js 15 and Sanity CMS. The site showcases artwork in a beautiful, responsive grid layout with detailed views for each piece. The project uses React 19, TypeScript, Tailwind CSS v4, and Biome v2 for linting/formatting.

### Target User
The site owner is non-technical, so Sanity Studio must be user-friendly and intuitive. The focus is on simplicity, maintainability, and showcasing artwork with minimal UI distractions.

### Language
**Primary Language**: Mexican Spanish (es-MX)
- All frontend content, UI text, and metadata must be in Spanish
- Sanity Studio can remain in English for developer convenience
- SEO content (meta tags, descriptions) in Spanish

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

## Project Requirements

### Required Features

#### 1. Sanity Schema - Artwork Content Type
Create a comprehensive artwork schema with the following fields:
- **Title** (string, required)
- **Description/Artist Statement** (text, rich text support)
- **Image** (image with alt text, required)
- **Category/Collection** (reference, e.g., "Grabados", "Pinturas")
- **Year Created** (number or string)
- **Dimensions** (string, e.g., "24 x 36 inches")
- **Medium/Technique** (string, e.g., "Oil on canvas")
- **Order/Sort Number** (number, for manual ordering within collections)

#### 2. Frontend Pages
- **Homepage/Gallery Grid**: Masonry or standard grid layout showing all artwork
- **Detail View**: Modal or dedicated page showing full-size image with metadata

#### 3. Key Functionality
- Responsive grid that works on mobile/tablet/desktop
- Lazy loading for images
- Smooth transitions between grid and detail views
- Keyboard navigation:
  - ESC to close detail view
  - Arrow keys to navigate between artworks
- SEO optimization with proper meta tags

#### 4. Sanity Studio
- User-friendly interface for non-technical users
- Intuitive artwork management (add/edit/delete)
- Image upload with drag-and-drop support
- Preview capabilities
- Clear field labels and helpful descriptions

### Technical Requirements
- ✅ Use Next.js App Router
- ✅ Implement proper TypeScript types for Sanity schemas
- ✅ Optimize images using Sanity's image pipeline (next-sanity integration)
- ✅ Deploy-ready for Vercel
- ✅ Environment variables properly configured and validated

### Acceptance Criteria
- ✅ Non-technical user can add/edit/delete artwork from Sanity Studio
- ✅ Grid displays artwork beautifully on all screen sizes
- ✅ Clicking artwork shows detail view with full information
- ✅ Images load quickly and are properly optimized
- ✅ Site is performant (good Lighthouse scores)
- ✅ Clean, maintainable code with comments where needed

### Design Principles
- **Simplicity First**: Prioritize simplicity and maintainability over complex features
- **Content Focus**: Minimal UI distractions - let the artwork shine
- **Performance**: Fast loading times and smooth interactions
- **Accessibility**: Keyboard navigation, proper alt text, semantic HTML

## Architecture

### Next.js + Sanity Integration

- **Sanity Studio**: Mounted at `/studio` route via `src/app/studio/[[...tool]]/page.tsx`
- **Sanity Config**: Root-level `sanity.config.ts` defines the Studio configuration with `basePath: "/studio"`
- **Schema Types**: Defined in `src/sanity/schemaTypes/`
  - Primary schema: `artwork` (title, image, description, category, year, dimensions, medium, order)
  - Supporting schema: `category` (for organizing artwork into collections)
  - Legacy schemas (author, post, blockContent) should be removed/replaced
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
- **Design Approach**: Minimal, clean UI that emphasizes artwork over interface elements

### Code Quality Tools

- **Biome v2.3.1**: Handles formatting, linting, and import organization
  - Custom rule: `useSortedClasses` for functions `clsx`, `cva`, `cn`
  - Import organization runs automatically with `biome check --write`
  - CSS parser with `tailwindDirectives` enabled for Tailwind CSS v4 support
- **TypeScript**: Strict mode enabled with `noUncheckedIndexedAccess`

## Important Notes

- Package manager: **pnpm** (required, specified in package.json)
- Next.js runs with Turbo mode enabled for development
- All new client-side environment variables must be prefixed with `NEXT_PUBLIC_`

## Git Commit Guidelines

- **Never include Claude attribution** (no "🤖 Generated with Claude Code" or "Co-Authored-By: Claude")
- **Group related changes logically**: Commit files together that represent a cohesive unit of work (e.g., feature implementation, bug fix, refactor)
- Write clear, concise commit messages that explain the purpose of the changes
