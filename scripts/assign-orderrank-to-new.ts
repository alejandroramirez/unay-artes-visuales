#!/usr/bin/env tsx

/**
 * Assign orderRank to documents that don't have it yet
 *
 * This script preserves existing orderRank values and only assigns
 * orderRank to documents that are missing it. New documents are
 * placed at the end of the list.
 *
 * Usage:
 *   pnpm tsx scripts/assign-orderrank-to-new.ts
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { LexoRank } from "lexorank";

// Load environment variables
config({ path: ".env.local" });

const client = createClient({
	projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
	dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "",
	apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-10-08",
	token: process.env.SANITY_API_TOKEN,
	useCdn: false,
});

interface Document {
	_id: string;
	_type: string;
	title?: string;
	orderRank?: string;
	_createdAt: string;
}

async function assignOrderRankToNew(type: "artwork" | "category") {
	console.log(`\n📁 Processing ${type}...`);

	// 1. Fetch documents WITH orderRank (sorted)
	const documentsWithRank = await client.fetch<Document[]>(
		`*[_type == $type && defined(orderRank)] | order(orderRank asc) {
      _id,
      _type,
      title,
      orderRank,
      _createdAt
    }`,
		{ type },
	);

	// 2. Fetch documents WITHOUT orderRank (sorted by creation date)
	const documentsWithoutRank = await client.fetch<Document[]>(
		`*[_type == $type && !defined(orderRank)] | order(_createdAt asc) {
      _id,
      _type,
      title,
      orderRank,
      _createdAt
    }`,
		{ type },
	);

	if (documentsWithoutRank.length === 0) {
		console.log(`  ✓ All ${type} documents already have orderRank`);
		return;
	}

	console.log(`  Found ${documentsWithRank.length} with orderRank`);
	console.log(`  Found ${documentsWithoutRank.length} without orderRank`);

	// 3. Find the last orderRank value to append after
	let lexoRank: LexoRank;

	if (documentsWithRank.length > 0) {
		// Start after the last existing rank
		const lastRank = documentsWithRank[documentsWithRank.length - 1].orderRank!;
		lexoRank = LexoRank.parse(lastRank);
		console.log(`  📍 Last existing orderRank: ${lastRank}`);
		console.log(`  📝 New documents will be added after existing ones`);
	} else {
		// No existing ranks, start from minimum
		lexoRank = LexoRank.min();
		console.log(`  📍 Starting from minimum rank`);
	}

	// 4. Assign orderRank to documents without it
	const transaction = client.transaction();

	for (const doc of documentsWithoutRank) {
		// Generate next rank
		lexoRank = lexoRank.genNext().genNext();

		console.log(
			`  + ${doc.title || doc._id}: orderRank=${lexoRank.toString()}`,
		);

		transaction.patch(doc._id, {
			set: { orderRank: lexoRank.toString() },
		});
	}

	// 5. Commit transaction
	console.log(`  💾 Committing changes...`);
	await transaction.commit();
	console.log(
		`  ✅ Assigned orderRank to ${documentsWithoutRank.length} ${type} documents`,
	);
}

async function main() {
	console.log("🔄 Assigning orderRank to new documents...");
	console.log("This will preserve existing order and add new documents at the end\n");

	try {
		// Check for API token
		if (!process.env.SANITY_API_TOKEN) {
			console.error("❌ Error: SANITY_API_TOKEN not found in .env.local");
			console.log("\nPlease add your Sanity API token to .env.local:");
			console.log("SANITY_API_TOKEN=your_token_here");
			console.log("\nYou can create a token at: https://www.sanity.io/manage");
			process.exit(1);
		}

		// Process categories first
		await assignOrderRankToNew("category");

		// Then process artworks
		await assignOrderRankToNew("artwork");

		console.log("\n✅ Assignment completed successfully!");
		console.log(
			"\nNew documents now have orderRank values and will appear at the end.",
		);
		console.log("You can now reorder them via drag-and-drop in Sanity Studio.");
	} catch (error) {
		console.error("\n❌ Assignment failed:");
		console.error(error);
		process.exit(1);
	}
}

// Run assignment
main();
