# OrderRank Management Guide

This document explains how document ordering works in this project using the `@sanity/orderable-document-list` plugin.

## Overview

OrderRank is a special field that enables drag-and-drop ordering of documents in Sanity Studio. It uses the [LexoRank](https://github.com/kvandake/lexorank-ts) algorithm, which allows inserting documents between any two existing documents without reordering all others.

## How OrderRank Works

### Automatic Initialization (Studio UI)

When you create a document through the Sanity Studio interface:
- The `orderRankField()` automatically generates an `orderRank` value
- New documents are placed at the end of the list by default
- You can immediately drag-and-drop to reorder them

**No manual intervention needed for Studio-created documents.**

### Manual Assignment (Programmatic Creation)

When you create documents programmatically (via API, scripts, imports):
- You **MUST manually assign** an `orderRank` value
- The automatic initialization only works in the Studio UI
- Use the utility functions provided in `/src/sanity/lib/orderRank.ts`

## Document Types with OrderRank

- **Artwork** (`artwork`) - Orderable
- **Category** (`category`) - Orderable

## Using the Utility Module

We provide a centralized utility module at `/src/sanity/lib/orderRank.ts` with helpful functions:

### Get Next OrderRank

```typescript
import { createClient } from "@sanity/client";
import { getNextOrderRank } from "../src/sanity/lib/orderRank.js";

const client = createClient({
  // ... your config
});

// Get the next orderRank for a new artwork
const orderRank = await getNextOrderRank(client, "artwork");

// Create document with orderRank
await client.create({
  _type: "artwork",
  title: "New Artwork",
  orderRank, // Places document at end of list
  // ... other fields
});
```

### Batch Creation with Sequential Ranks

```typescript
import { getSequentialOrderRanks } from "../src/sanity/lib/orderRank.js";

// Generate 10 orderRank values
const ranks = await getSequentialOrderRanks(client, "artwork", 10);

// Create multiple documents
const artworks = [...]; // your array of artworks
const docs = artworks.map((artwork, index) => ({
  _type: "artwork",
  orderRank: ranks[index],
  ...artwork
}));

await client.transaction().create(docs).commit();
```

### Find Missing OrderRanks

```typescript
import { findDocumentsMissingOrderRank } from "../src/sanity/lib/orderRank.js";

// Find all documents missing orderRank
const missing = await findDocumentsMissingOrderRank(client, null);

// Find only artworks missing orderRank
const missingArtworks = await findDocumentsMissingOrderRank(client, "artwork");
```

## Available Scripts

### `pnpm check:orderrank`

Check which documents are missing orderRank values:

```bash
pnpm check:orderrank
```

**Output:**
```
📄 Artworks:
   Total: 155
   With orderRank: 153
   Missing orderRank: 2
      - Sin título (1dcb16c3-d460-4f12-b628-a975911351ce)
      - Sin título (7b9047df-5b95-4fba-b11f-09dab711ec4d)
```

### `pnpm fix:orderrank`

Automatically fix all documents missing orderRank:

```bash
pnpm fix:orderrank
```

**What it does:**
1. Finds all documents missing `orderRank`
2. Generates sequential orderRank values
3. Assigns them to the documents
4. Places them at the end of their respective lists

**When to use:**
- After importing data from Excel/JSON
- After duplicating documents in Studio
- When you see "X/Y documents have no order" warning in Studio
- After programmatic document creation

## Fixing OrderRank Issues

### Issue: "X/Y documents have no order" Warning in Studio

**Symptoms:**
- Warning banner appears at `/studio/structure/orderable-artwork` or `/studio/structure/orderable-category`
- Some documents can't be drag-and-dropped

**Solutions:**

**Option 1: Run Fix Script (Recommended)**
```bash
pnpm fix:orderrank
```

**Option 2: Use Studio "Reset Order" Feature**
1. Go to the orderable list in Studio
2. Click the menu (⋮) in the top-right
3. Select "Reset Order"
4. Confirm the action

**Option 3: Manual Fix for Single Document**
```typescript
import { assignOrderRank } from "../src/sanity/lib/orderRank.js";

// Fix a specific document
await assignOrderRank(client, "document-id-here", "artwork");
```

### Issue: Imported Documents Missing OrderRank

**Symptoms:**
- Data imported from Excel/JSON appears in Studio
- Documents don't appear in orderable lists
- Can't drag-and-drop imported documents

**Solution:**

Make sure your import script uses the orderRank utility:

```typescript
import { getSequentialOrderRanks } from "../src/sanity/lib/orderRank.js";

// In your import script
const orderRanks = await getSequentialOrderRanks(
  client,
  "artwork",
  artworksToImport.length
);

const documents = artworksToImport.map((artwork, index) => ({
  _type: "artwork",
  orderRank: orderRanks[index],
  // ... other fields
}));
```

**Already imported without orderRank?**
```bash
pnpm fix:orderrank
```

## Best Practices

### ✅ DO

- **Use utility functions** from `/src/sanity/lib/orderRank.ts` for all programmatic creation
- **Run `pnpm fix:orderrank`** after bulk imports or migrations
- **Check orderRank** before deploying data import scripts to production
- **Test ordering** in Studio after programmatic document creation

### ❌ DON'T

- Don't manually set `orderRank` to simple numbers (1, 2, 3) - use LexoRank
- Don't skip orderRank when creating documents programmatically
- Don't modify `orderRank` manually unless you understand LexoRank format
- Don't remove the `orderRankField()` from schema definitions

## GROQ Queries with OrderRank

All queries that fetch orderable documents should order by `orderRank`:

```groq
// Correct - Orders by orderRank, then fallback to _createdAt
*[_type == "artwork"] | order(orderRank asc, _createdAt desc) {
  _id,
  title,
  orderRank
}

// Also correct - Just orderRank if all documents have it
*[_type == "artwork"] | order(orderRank) {
  _id,
  title
}

// ⚠️ Incorrect - Missing orderRank ordering
*[_type == "artwork"] | order(_createdAt desc) {
  _id,
  title
}
```

## Technical Details

### LexoRank Format

OrderRank values are strings in this format:
- Example: `0|hzzzzz:`
- Parts: `bucket|rank:`
- Buckets: `0`, `1`, `2` (for rebalancing)
- Rank: Base-36 string that sorts lexicographically

### Why LexoRank?

Traditional ordering (1, 2, 3) requires renumbering all documents when inserting between two items. LexoRank solves this:

```
Document A: 0|a:
Document B: 0|m:     ← Can insert between A and B
Document C: 0|z:

Insert between A and B:
Document A: 0|a:
New Doc:    0|g:     ← Sorts between 'a' and 'm'
Document B: 0|m:
Document C: 0|z:
```

### Spacing Strategy

Our utility uses `.genNext().genNext()` to leave buffer space:

```typescript
// This creates gaps for future insertions
rank = rank.genNext().genNext();
```

This ensures you can insert documents between any two items without running out of ranks.

## Troubleshooting

### "Cannot read properties of undefined (reading 'orderRank')"

**Cause:** Document exists but is missing `orderRank` field

**Fix:**
```bash
pnpm fix:orderrank
```

### Drag-and-Drop Not Working

**Possible causes:**
1. Document is missing `orderRank`
2. Using wrong Studio view (not using orderable list)
3. Insufficient permissions

**Fix:**
1. Run `pnpm check:orderrank` to verify all documents have orderRank
2. Ensure you're viewing the document through the orderable list desk item
3. Check your Sanity auth token has write permissions

### OrderRank Values Not Updating After Script

**Cause:** Client cache not invalidated

**Fix:**
```bash
# Refresh Studio in browser (hard refresh)
Cmd/Ctrl + Shift + R
```

## Migration Guide

If you have existing documents without orderRank:

### Step 1: Run Check Script

```bash
pnpm check:orderrank
```

### Step 2: Run Fix Script

```bash
pnpm fix:orderrank
```

### Step 3: Verify in Studio

1. Open Studio at `/studio`
2. Go to Artwork or Categories
3. Verify drag-and-drop works
4. Check that all documents appear

### Step 4: Adjust Order (Optional)

Drag and drop documents to your preferred order.

## API Reference

See `/src/sanity/lib/orderRank.ts` for full API documentation.

### Key Functions

- `getNextOrderRank(client, type)` - Get next orderRank for a document type
- `getSequentialOrderRanks(client, type, count)` - Get N sequential orderRanks
- `findDocumentsMissingOrderRank(client, type?)` - Find documents without orderRank
- `assignOrderRank(client, documentId, type)` - Fix a single document
- `fixMissingOrderRanks(client, type)` - Fix all documents of a type

## Resources

- [@sanity/orderable-document-list Plugin](https://www.sanity.io/plugins/orderable-document-list)
- [LexoRank Algorithm](https://github.com/kvandake/lexorank-ts)
- [Sanity Studio Structure](https://www.sanity.io/docs/structure-builder)
