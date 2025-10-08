# Altamed Foundation

A modern web application built with Next.js 15 and Sanity CMS for content management.

## Tech Stack

- **Framework**: Next.js 15 with React 19
- **CMS**: Sanity Studio
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Code Quality**: Biome v2
- **Package Manager**: pnpm

## Getting Started

### Prerequisites

- Node.js (see `.nvmrc` or `package.json` for version)
- pnpm 10.12.4 or higher

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Add your Sanity credentials to `.env`:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=your_dataset
   ```

### Development

Start the development server:

```bash
pnpm dev
```

- **App**: http://localhost:3000
- **Sanity Studio**: http://localhost:3000/studio

### Available Scripts

```bash
pnpm dev            # Start development server with Turbo
pnpm build          # Build for production
pnpm start          # Start production server
pnpm preview        # Build and start production server
pnpm check          # Run Biome linter and formatter
pnpm check:write    # Run Biome with auto-fix
pnpm typecheck      # Run TypeScript type checking
```

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── studio/       # Sanity Studio route
│   ├── layout.tsx
│   └── page.tsx
├── sanity/           # Sanity CMS configuration
│   ├── schemaTypes/  # Content schemas
│   └── lib/          # Sanity client utilities
├── styles/           # Global styles
└── env.js            # Environment variable validation
```

## Environment Variables

All environment variables must be defined in `src/env.js` for validation. Client-side variables require the `NEXT_PUBLIC_` prefix.

## License

Private
