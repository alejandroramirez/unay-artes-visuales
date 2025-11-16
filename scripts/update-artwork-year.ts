#!/usr/bin/env tsx

/**
 * Update Artwork Year Script
 *
 * Updates all artworks in Sanity CMS to add year: "2025"
 *
 * Usage:
 *   pnpm tsx scripts/update-artwork-year.ts
 */

import { createClient } from "@sanity/client";
import dotenv from "dotenv";

// Load environment variables
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
	console.error("   You need a write token to update data. Get one from:");
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

async function main() {
	console.log("🚀 Starting artwork year update...\n");
	console.log(`   Project ID: ${projectId}`);
	console.log(`   Dataset: ${dataset}\n`);

	try {
		// Fetch all artworks
		const artworks = await client.fetch<
			Array<{ _id: string; title: string; year?: string }>
		>('*[_type == "artwork"]{ _id, title, year }');

		console.log(`📊 Found ${artworks.length} artworks\n`);

		if (artworks.length === 0) {
			console.log("✨ No artworks to update!");
			return;
		}

		let updated = 0;
		let skipped = 0;

		// Update each artwork
		for (let i = 0; i < artworks.length; i++) {
			const artwork = artworks[i];
			if (!artwork) continue;

			const progress = `[${i + 1}/${artworks.length}]`;

			// Skip if already has year set
			if (artwork.year) {
				console.log(
					`   ${progress} ⊘ Skipped: "${artwork.title}" (already has year: ${artwork.year})`,
				);
				skipped++;
				continue;
			}

			// Update the artwork
			await client.patch(artwork._id).set({ year: "2025" }).commit();

			console.log(`   ${progress} ✓ Updated: "${artwork.title}"`);
			updated++;
		}

		console.log("\n📊 Update Summary:");
		console.log(`   ✓ Updated: ${updated}`);
		console.log(`   ⊘ Skipped: ${skipped}`);
		console.log(`   Total: ${artworks.length}`);
		console.log("\n✨ Update complete!");
	} catch (error) {
		console.error("\n❌ Update failed:", error);
		process.exit(1);
	}
}

main();
