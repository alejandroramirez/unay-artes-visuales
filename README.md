# Unay Artes Visuales

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

4. **Create a new Sanity project:**

   a. Go to [Sanity.io](https://www.sanity.io/) and sign in or create an account

   b. Create a new project:
      - Click "Create Project" in the Sanity dashboard
      - Name your project (e.g., "Unay Artes Visuales")
      - Choose a plan (Free tier available)
      - Note your Project ID

   c. Create a dataset:
      - In your project settings, create a new dataset
      - Name it `production` (or your preferred name)
      - Choose "Public" mode for development (can be changed later)

5. Add your Sanity credentials to `.env`:
   ```env
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_from_sanity
   NEXT_PUBLIC_SANITY_DATASET=production
   NEXT_PUBLIC_SANITY_API_VERSION=2025-10-08
   ```

### Development

Start the development server:

```bash
pnpm dev
```

- **App**: http://localhost:3000
- **Sanity Studio**: http://localhost:3000/studio

#### First-Time Sanity Setup

After starting the dev server for the first time:

1. Navigate to http://localhost:3000/studio
2. Log in with your Sanity account
3. The content schemas (Author, Post, Category) will be automatically deployed
4. Start creating content through the Studio interface

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

## Deployment

### Deploying to Vercel

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Import your repository in [Vercel](https://vercel.com):
   - Click "Add New Project"
   - Select your repository
   - Vercel will auto-detect Next.js settings

3. Configure environment variables in Vercel:
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env` file:
     - `NEXT_PUBLIC_SANITY_PROJECT_ID`
     - `NEXT_PUBLIC_SANITY_DATASET`
     - `NEXT_PUBLIC_SANITY_API_VERSION`

4. Deploy:
   - Click "Deploy"
   - Vercel will build and deploy your application
   - Future commits will trigger automatic deployments

5. **Configure CORS in Sanity:**
   - Go to [Sanity Manage](https://www.sanity.io/manage)
   - Select your project
   - Navigate to API → CORS Origins
   - Add your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - Also add `http://localhost:3000` for local development

## License

Private
