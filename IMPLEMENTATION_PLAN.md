# Implementation Plan - Unay Artes Visuales

## Overview
This document outlines the step-by-step implementation plan for building the visual arts portfolio website with all required features.

## Phase 1: Sanity Schema & Studio Setup

### 1.1 Create Category Schema
**File**: `src/sanity/schemaTypes/categoryType.ts`

**Purpose**: Define collections/categories for organizing artwork (e.g., "Grabados", "Pinturas")

**Fields**:
- `title` (string, required) - Category name
- `slug` (slug, required) - URL-friendly identifier
- `description` (text, optional) - Brief description of the category
- `order` (number, optional) - Manual ordering for categories

**Studio Config**: Enable preview, add helpful descriptions

---

### 1.2 Create Artwork Schema
**File**: `src/sanity/schemaTypes/artworkType.ts`

**Purpose**: Main content type for individual artworks

**Fields**:
- `title` (string, required) - Artwork title
- `slug` (slug, required, auto-generated from title) - URL-friendly identifier
- `image` (image, required) - Main artwork image with:
  - Alt text field (required for accessibility)
  - Hotspot/crop enabled for flexible cropping
- `description` (array/block content) - Rich text for artist statement
- `category` (reference to category) - Link to category/collection
- `year` (string or number) - Year created
- `dimensions` (string) - e.g., "24 x 36 inches" or "61 x 91 cm"
- `medium` (string) - e.g., "Oil on canvas", "Digital print"
- `order` (number) - Manual sorting within category

**Studio Config**:
- Add helpful field descriptions
- Set up preview with image thumbnail
- Configure validation rules (required fields)
- Add placeholder text for guidance

---

### 1.3 Remove Legacy Schemas
**Files to update**:
- `src/sanity/schemaTypes/index.ts` - Remove author, post, blockContent imports
- Delete: `authorType.ts`, `postType.ts`, `blockContentType.ts`

**Purpose**: Clean up boilerplate schemas that aren't needed for this project

---

### 1.4 Configure Studio Structure
**File**: `src/sanity/structure.ts`

**Purpose**: Create intuitive navigation for non-technical users

**Structure**:
```
Studio Navigation:
├── Artwork (main focus, list view with image previews)
├── Categories (simple list)
└── Settings (optional, for site-wide config)
```

**Features**:
- Default to artwork list on studio load
- Show image thumbnails in list view
- Add helpful icons for each section
- Configure default ordering (by order field, then by date)

---

## Phase 2: TypeScript Types & Data Fetching

### 2.1 Generate TypeScript Types
**Tool**: Use `sanity-codegen` or manually create types

**File**: `src/sanity/types.ts`

**Types to create**:
```typescript
type Category = {
  _id: string
  _type: 'category'
  title: string
  slug: { current: string }
  description?: string
  order?: number
}

type Artwork = {
  _id: string
  _type: 'artwork'
  title: string
  slug: { current: string }
  image: SanityImageAsset
  description?: PortableTextBlock[]
  category?: Category
  year?: string | number
  dimensions?: string
  medium?: string
  order?: number
}
```

---

### 2.2 Create Query Utilities
**File**: `src/sanity/lib/queries.ts`

**Queries to create**:

1. **Get All Artwork** (for gallery grid)
   ```groq
   *[_type == "artwork"] | order(order asc, _createdAt desc) {
     _id, title, slug, image, category->, year, order
   }
   ```

2. **Get Artwork by Slug** (for detail view)
   ```groq
   *[_type == "artwork" && slug.current == $slug][0] {
     _id, title, slug, image, description, category->, year, dimensions, medium, order
   }
   ```

3. **Get Artwork by Category** (for filtering)
   ```groq
   *[_type == "artwork" && category._ref == $categoryId] | order(order asc, _createdAt desc) {
     _id, title, slug, image, category->, year, order
   }
   ```

4. **Get All Categories**
   ```groq
   *[_type == "category"] | order(order asc, title asc) {
     _id, title, slug, order
   }
   ```

**Create helper functions**:
- `getAllArtwork()`
- `getArtworkBySlug(slug: string)`
- `getArtworkByCategory(categoryId: string)`
- `getAllCategories()`

---

### 2.3 Set Up Image URL Builder
**File**: `src/sanity/lib/image.ts` (update existing)

**Features**:
- Configure Sanity image CDN
- Add helper for generating responsive image URLs
- Support for different sizes (thumbnail, medium, large, full)
- Auto-format (WebP with JPEG fallback)
- Quality optimization

---

## Phase 3: Frontend - Gallery Grid

### 3.1 Build Gallery Grid Layout
**File**: `src/app/page.tsx`

**Features**:
- Responsive grid using Tailwind CSS Grid
- Mobile: 1 column
- Tablet: 2-3 columns
- Desktop: 3-4 columns
- Optional: Masonry layout for varied image sizes

**Data Fetching**:
- Server component fetching from Sanity
- Error handling and loading states

---

### 3.2 Create Artwork Card Component
**File**: `src/components/ArtworkCard.tsx`

**Features**:
- Image with aspect ratio preservation
- Hover effect (subtle scale/overlay)
- Title overlay or below image
- Link to detail view
- Lazy loading support

---

### 3.3 Implement Lazy Loading
**Approach**: Use Next.js Image component with `loading="lazy"`

**Optimization**:
- Blur placeholder using Sanity's LQIP (Low Quality Image Placeholder)
- Progressive loading
- Intersection Observer for scroll-based loading

---

## Phase 4: Frontend - Detail View

### 4.1 Create Detail View Component
**Decision**: Modal vs. Dedicated Page

**Recommended**: Modal with URL state (best UX for gallery browsing)

**File**: `src/components/ArtworkModal.tsx`

**Features**:
- Full-size image display
- Metadata sidebar or overlay:
  - Title
  - Year
  - Dimensions
  - Medium
  - Description/Artist statement
  - Category
- Close button
- Backdrop click to close
- Smooth enter/exit animations

**Alternative**: Dedicated page at `/artwork/[slug]`

---

### 4.2 Add Smooth Transitions
**Library**: Framer Motion or CSS transitions

**Transitions**:
- Gallery → Detail: Fade + scale
- Detail → Gallery: Reverse animation
- Image loading: Fade in when ready

---

### 4.3 Implement Keyboard Navigation
**File**: Custom hook `src/hooks/useKeyboardNav.ts`

**Keys**:
- `ESC` - Close detail view
- `Left Arrow` - Previous artwork
- `Right Arrow` - Next artwork
- `Home` - First artwork (optional)
- `End` - Last artwork (optional)

**Implementation**:
- Add event listeners on modal mount
- Clean up on unmount
- Focus management for accessibility

---

## Phase 5: Filtering & Search

### 5.1 Add Category Filter
**File**: `src/components/CategoryFilter.tsx`

**Features**:
- Horizontal pill-style buttons or dropdown
- "All" option to show all artwork
- Active state styling
- URL state management (query params)

**Implementation**:
- Client component with state management
- Filter artwork array or refetch from Sanity
- Smooth transition when filtering

---

### 5.2 Optional: Search Functionality
**File**: `src/components/SearchBar.tsx`

**Features** (if time permits):
- Search by title, medium, or description
- Real-time filtering
- Clear search button

---

## Phase 6: Optimization

### 6.1 Image Optimization
**Tasks**:
- Configure Next.js Image component properly
- Use Sanity's image CDN with optimal parameters:
  - Auto format (WebP)
  - Quality: 80-85
  - Responsive sizes
- Add blur placeholders
- Lazy load below-the-fold images

---

### 6.2 SEO Implementation
**Files**:
- `src/app/layout.tsx` - Global metadata
- `src/app/page.tsx` - Homepage metadata
- `src/app/artwork/[slug]/page.tsx` - Dynamic metadata

**Metadata to add**:
- Title tags (with artwork name)
- Meta descriptions
- Open Graph images (artwork image)
- Twitter cards
- Canonical URLs
- JSON-LD structured data for artwork

---

### 6.3 Performance Optimization
**Tasks**:
- Code splitting (automatic with Next.js)
- Minimize client-side JavaScript
- Optimize bundle size
- Add loading states
- Implement proper caching headers
- Use React Server Components where possible

---

## Phase 7: Polish & Testing

### 7.1 Loading States & Error Handling
**Components**:
- `src/components/LoadingSpinner.tsx`
- `src/components/ErrorMessage.tsx`
- `src/app/error.tsx` - Error boundary
- `src/app/loading.tsx` - Loading UI

---

### 7.2 Accessibility
**Checklist**:
- [ ] All images have alt text (enforced in schema)
- [ ] Semantic HTML (main, section, article, figure)
- [ ] ARIA labels for interactive elements
- [ ] Keyboard navigation works completely
- [ ] Focus visible styles
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader testing

---

### 7.3 Responsive Testing
**Devices to test**:
- Mobile: 375px, 414px
- Tablet: 768px, 1024px
- Desktop: 1280px, 1920px

**Features to verify**:
- Grid layout adapts properly
- Images scale correctly
- Touch interactions work (tap, swipe)
- Modal/detail view works on mobile

---

### 7.4 Lighthouse Audit
**Target Scores**:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 100

**Common issues to fix**:
- Image optimization
- Unused JavaScript
- Missing meta tags
- Accessibility issues

---

### 7.5 Studio Usability Testing
**Test with non-technical user**:
- [ ] Can they add a new artwork?
- [ ] Can they upload and crop an image?
- [ ] Can they edit existing artwork?
- [ ] Can they delete artwork?
- [ ] Can they create categories?
- [ ] Is the interface intuitive?

**Improvements to add**:
- Field descriptions
- Example text
- Preview functionality
- Clear error messages

---

## Phase 8: Documentation & Deployment

### 8.1 Code Documentation
**Tasks**:
- Add JSDoc comments to components
- Document complex functions
- Add README sections for:
  - Content management workflow
  - Local development setup
  - Deployment process

---

### 8.2 Deployment to Vercel
**Steps**:
1. Push to GitHub
2. Connect to Vercel
3. Configure environment variables
4. Deploy
5. Add production URL to Sanity CORS
6. Test production deployment

---

## Implementation Order Summary

**Week 1: Foundation**
1. Sanity schemas (category, artwork)
2. Remove legacy schemas
3. Configure Studio structure
4. Generate TypeScript types
5. Create query utilities

**Week 2: Core Features**
6. Build gallery grid
7. Create artwork card component
8. Implement lazy loading
9. Create detail view (modal or page)
10. Add keyboard navigation

**Week 3: Enhancement**
11. Add category filtering
12. Implement smooth transitions
13. Optimize images
14. Add SEO metadata
15. Implement loading states

**Week 4: Polish & Launch**
16. Accessibility audit
17. Responsive testing
18. Lighthouse optimization
19. Studio usability testing
20. Documentation
21. Deploy to Vercel
22. Final testing

---

## Success Criteria

At the end of implementation, verify:
- ✅ Non-technical user can manage artwork via Sanity Studio
- ✅ Gallery displays beautifully on all devices
- ✅ Detail view shows full artwork with all metadata
- ✅ Images load fast and look great
- ✅ Keyboard navigation works smoothly
- ✅ Lighthouse scores meet targets
- ✅ Code is clean and maintainable
- ✅ Site is deployed and accessible

---

## Next Steps

Start with **Phase 1.1: Create Category Schema** and work through each phase sequentially. Each phase builds on the previous one, ensuring a solid foundation for the final product.
