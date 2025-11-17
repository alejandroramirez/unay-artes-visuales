#!/usr/bin/env tsx

/**
 * Sanity Data Import Script
 *
 * Imports transformed Excel data into Sanity CMS.
 * - Checks for existing documents to avoid duplicates
 * - Creates categories first, then artworks
 * - Automatically assigns orderRank for drag-and-drop ordering
 * - Reports what was created vs skipped
 *
 * IMPORTANT: Artworks require images. This script creates artwork documents
 * WITHOUT images, which you must add manually through Sanity Studio.
 *
 * Usage:
 *   pnpm import:data [data-dir]
 *
 * Example:
 *   pnpm import:data data/
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@sanity/client";
import { LexoRank } from "lexorank";

// ============================================================================
// CONFIGURATION
// ============================================================================

// Load environment variables
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-10-08";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !dataset) {
	console.error("❌ Error: Missing Sanity environment variables");
	console.error("   Please ensure .env file contains:");
	console.error("   - NEXT_PUBLIC_SANITY_PROJECT_ID");
	console.error("   - NEXT_PUBLIC_SANITY_DATASET");
	console.error("   - SANITY_API_TOKEN (required for write operations)");
	process.exit(1);
}

if (!token) {
	console.error("❌ Error: Missing SANITY_API_TOKEN");
	console.error("   You need a write token to import data. Get one from:");
	console.error(`   https://www.sanity.io/manage/personal/tokens`);
	process.exit(1);
}

// Create Sanity client with write permissions
const client = createClient({
	projectId,
	dataset,
	apiVersion,
	token,
	useCdn: false,
});

// ============================================================================
// TYPES
// ============================================================================

interface Category {
	title: string;
	slug: string;
	description?: string;
}

interface Artwork {
	title: string;
	slug: string;
	autor: string;
	apartado: string;
	category: string; // Category slug
	dimensions: string;
	medium: string;
	notes?: string;
}

interface ImportStats {
	categoriesCreated: number;
	categoriesSkipped: number;
	artworksCreated: number;
	artworksSkipped: number;
	errors: string[];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create or get placeholder image asset
 */
async function getPlaceholderImage(): Promise<{ _ref: string; _type: string }> {
	// Check if placeholder already exists
	const query =
		'*[_type == "sanity.imageAsset" && originalFilename == "placeholder-import.svg"][0]';
	const existing = await client.fetch(query);

	if (existing) {
		console.log("   ✓ Using existing placeholder image");
		return {
			_type: "image",
			_ref: existing._id,
		};
	}

	// Create a white placeholder with Spanish text
	const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#FFFFFF"/>
  <text x="400" y="280" font-family="Arial, sans-serif" font-size="28" text-anchor="middle" fill="#666" font-weight="normal">
    El autor no proporcionó
  </text>
  <text x="400" y="320" font-family="Arial, sans-serif" font-size="28" text-anchor="middle" fill="#666" font-weight="normal">
    evidencia fotográfica
  </text>
</svg>`;

	console.log("   📤 Uploading placeholder image...");

	// Upload as a file
	const buffer = Buffer.from(placeholderSvg, "utf-8");
	const asset = await client.assets.upload("image", buffer, {
		filename: "placeholder-import.svg",
		contentType: "image/svg+xml",
	});

	console.log("   ✓ Placeholder image created");

	return {
		_type: "image",
		_ref: asset._id,
	};
}

/**
 * Get the last orderRank for a document type
 */
async function getLastOrderRank(
	type: "category" | "artwork",
): Promise<LexoRank> {
	const query =
		"*[_type == $type && defined(orderRank)] | order(orderRank desc) [0].orderRank";
	const lastRank = await client.fetch(query, { type });

	if (lastRank) {
		return LexoRank.parse(lastRank);
	}

	// No existing ranks, start from minimum
	return LexoRank.min();
}

/**
 * Check if a category exists by slug
 */
async function categoryExists(slug: string): Promise<string | null> {
	const query = '*[_type == "category" && slug.current == $slug][0]._id';
	const result = await client.fetch(query, { slug });
	return result || null;
}

/**
 * Check if an artwork exists by slug
 */
async function artworkExists(slug: string): Promise<boolean> {
	const query = '*[_type == "artwork" && slug.current == $slug][0]._id';
	const result = await client.fetch(query, { slug });
	return !!result;
}

/**
 * Create a category in Sanity
 */
async function createCategory(
	category: Category,
	orderRank: string,
): Promise<string> {
	const doc = {
		_type: "category",
		title: category.title,
		slug: {
			_type: "slug",
			current: category.slug,
		},
		orderRank,
		...(category.description && { description: category.description }),
	};

	const result = await client.create(doc);
	return result._id;
}

/**
 * Create an artwork in Sanity (with placeholder image)
 */
async function createArtwork(
	artwork: Artwork,
	categoryId: string | null,
	placeholderImage: { _ref: string; _type: string },
	orderRank: string,
): Promise<void> {
	const doc = {
		_type: "artwork",
		title: artwork.title,
		slug: {
			_type: "slug",
			current: artwork.slug,
		},
		autor: artwork.autor || undefined,
		apartado: artwork.apartado || undefined,
		...(categoryId && {
			category: {
				_type: "reference",
				_ref: categoryId,
			},
		}),
		dimensions: artwork.dimensions || undefined,
		medium: artwork.medium || undefined,
		orderRank,
		image: {
			_type: "image",
			asset: placeholderImage,
			alt: artwork.title, // Use artwork title as alt text
		},
	};

	await client.create(doc);
}

// ============================================================================
// IMPORT FUNCTIONS
// ============================================================================

/**
 * Import categories
 */
async function importCategories(
	categories: Category[],
	stats: ImportStats,
): Promise<Map<string, string>> {
	console.log(`\n📁 Importing ${categories.length} categories...`);

	const categoryMap = new Map<string, string>(); // slug -> _id

	// Get last orderRank to continue from
	let orderRank = await getLastOrderRank("category");

	for (let i = 0; i < categories.length; i++) {
		const category = categories[i];
		if (!category) continue;

		const progress = `[${i + 1}/${categories.length}]`;

		try {
			// Check if category already exists
			const existingId = await categoryExists(category.slug);

			if (existingId) {
				console.log(
					`   ${progress} ⊘ Skipped: "${category.title}" (already exists)`,
				);
				categoryMap.set(category.slug, existingId);
				stats.categoriesSkipped++;
			} else {
				// Generate next orderRank
				orderRank = orderRank.genNext().genNext();

				// Create new category
				const newId = await createCategory(category, orderRank.toString());
				console.log(`   ${progress} ✓ Created: "${category.title}"`);
				categoryMap.set(category.slug, newId);
				stats.categoriesCreated++;
			}
		} catch (error) {
			const errorMsg = `Failed to import category "${category.title}": ${error}`;
			console.error(`   ${progress} ✗ ${errorMsg}`);
			stats.errors.push(errorMsg);
		}
	}

	return categoryMap;
}

/**
 * Import artworks
 */
async function importArtworks(
	artworks: Artwork[],
	categoryMap: Map<string, string>,
	stats: ImportStats,
): Promise<void> {
	console.log(`\n🖼️  Importing ${artworks.length} artworks...`);
	console.log("   ⚠️  Note: Artworks will be created with a PLACEHOLDER image.");
	console.log(
		"   You must replace placeholder images with actual artwork images in Sanity Studio.\n",
	);

	// Get or create placeholder image
	const placeholderImage = await getPlaceholderImage();

	// Get last orderRank to continue from
	let orderRank = await getLastOrderRank("artwork");

	for (let i = 0; i < artworks.length; i++) {
		const artwork = artworks[i];
		if (!artwork) continue;

		const progress = `[${i + 1}/${artworks.length}]`;

		try {
			// Check if artwork already exists
			const exists = await artworkExists(artwork.slug);

			if (exists) {
				console.log(
					`   ${progress} ⊘ Skipped: "${artwork.title}" (already exists)`,
				);
				stats.artworksSkipped++;
			} else {
				// Get category ID if category is specified
				const categoryId = artwork.category
					? categoryMap.get(artwork.category.toLowerCase()) || null
					: null;

				if (artwork.category && !categoryId) {
					console.log(
						`   ${progress} ⚠️  Warning: Category "${artwork.category}" not found for "${artwork.title}"`,
					);
				}

				// Generate next orderRank
				orderRank = orderRank.genNext().genNext();

				// Create new artwork (with placeholder image)
				await createArtwork(
					artwork,
					categoryId,
					placeholderImage,
					orderRank.toString(),
				);
				console.log(`   ${progress} ✓ Created: "${artwork.title}"`);
				stats.artworksCreated++;
			}
		} catch (error) {
			const errorMsg = `Failed to import artwork "${artwork.title}": ${error}`;
			console.error(`   ${progress} ✗ ${errorMsg}`);
			stats.errors.push(errorMsg);
		}
	}
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
	const args = process.argv.slice(2);
	const dataDir = args[0] || "data";

	console.log("🚀 Starting Sanity data import...\n");
	console.log(`   Project ID: ${projectId}`);
	console.log(`   Dataset: ${dataset}`);
	console.log(`   Data directory: ${dataDir}\n`);

	const stats: ImportStats = {
		categoriesCreated: 0,
		categoriesSkipped: 0,
		artworksCreated: 0,
		artworksSkipped: 0,
		errors: [],
	};

	try {
		// ====================================================================
		// Load data files
		// ====================================================================
		const categoriesPath = resolve(dataDir, "categories.json");
		const artworksPath = resolve(dataDir, "artworks.json");

		if (!existsSync(categoriesPath)) {
			console.error(`❌ Error: categories.json not found at ${categoriesPath}`);
			console.error(
				"   Run 'pnpm transform:data' first to generate data files.",
			);
			process.exit(1);
		}

		if (!existsSync(artworksPath)) {
			console.error(`❌ Error: artworks.json not found at ${artworksPath}`);
			console.error(
				"   Run 'pnpm transform:data' first to generate data files.",
			);
			process.exit(1);
		}

		console.log("📖 Loading data files...");
		const categories: Category[] = JSON.parse(
			readFileSync(categoriesPath, "utf-8"),
		);
		const artworks: Artwork[] = JSON.parse(readFileSync(artworksPath, "utf-8"));

		console.log(`   ✓ Loaded ${categories.length} categories`);
		console.log(`   ✓ Loaded ${artworks.length} artworks`);

		// ====================================================================
		// Import categories first (needed for artwork references)
		// ====================================================================
		const categoryMap = await importCategories(categories, stats);

		// ====================================================================
		// Import artworks
		// ====================================================================
		await importArtworks(artworks, categoryMap, stats);

		// ====================================================================
		// Summary
		// ====================================================================
		console.log("\n📊 Import Summary:");
		console.log("\nCategories:");
		console.log(`   ✓ Created: ${stats.categoriesCreated}`);
		console.log(`   ⊘ Skipped: ${stats.categoriesSkipped}`);
		console.log(
			`   Total: ${stats.categoriesCreated + stats.categoriesSkipped}`,
		);

		console.log("\nArtworks:");
		console.log(`   ✓ Created: ${stats.artworksCreated}`);
		console.log(`   ⊘ Skipped: ${stats.artworksSkipped}`);
		console.log(`   Total: ${stats.artworksCreated + stats.artworksSkipped}`);

		if (stats.errors.length > 0) {
			console.log(`\n⚠️  Errors: ${stats.errors.length}`);
			for (const error of stats.errors) {
				console.log(`   - ${error}`);
			}
		}

		console.log("\n⚠️  IMPORTANT: Next Steps");
		console.log("   1. Go to Sanity Studio (/studio)");
		console.log(
			'   2. Look for artworks with the white placeholder image that says "El autor no proporcionó evidencia fotográfica"',
		);
		console.log("   3. For each artwork:");
		console.log(
			"      - Replace the placeholder with the actual artwork image",
		);
		console.log("      - Alt text is already set to the artwork title");
		console.log("   4. Publish the documents");

		console.log("\n✨ Import complete!");
	} catch (error) {
		console.error("\n❌ Import failed:", error);
		process.exit(1);
	}
}

main();
