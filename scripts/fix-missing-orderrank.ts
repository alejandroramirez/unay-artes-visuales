/**
 * Fix Missing OrderRank Script
 *
 * Finds and fixes artworks that are missing the orderRank field
 */

import { createClient } from "@sanity/client";
import { LexoRank } from "lexorank";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

const client = createClient({
	projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
	dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "",
	apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-10-08",
	token: process.env.SANITY_API_TOKEN,
	useCdn: false,
});

/**
 * Find artworks missing orderRank (including drafts)
 */
async function findMissingOrderRank(): Promise<
	Array<{ _id: string; title: string; _type: string }>
> {
	console.log("\n🔍 Finding documents without orderRank (including drafts)...\n");

	// Check both artworks and categories, including drafts
	const query = `*[(_type == "artwork" || _type == "category") && !defined(orderRank)]{
    _id,
    _type,
    title
  } | order(title asc)`;

	const docs = await client.fetch(query);
	console.log(`Found ${docs.length} document(s) missing orderRank:\n`);

	for (const doc of docs) {
		const isDraft = doc._id.startsWith("drafts.");
		const draftLabel = isDraft ? " [DRAFT]" : "";
		console.log(
			`   - ${doc.title || "Untitled"} (${doc._type})${draftLabel} - ${doc._id}`,
		);
	}

	return docs;
}

/**
 * Get the last orderRank value for a specific type
 */
async function getLastOrderRank(docType: string): Promise<string | null> {
	const query = `*[_type == $type && defined(orderRank)] | order(orderRank desc)[0].orderRank`;
	return await client.fetch(query, { type: docType });
}

/**
 * Fix missing orderRank values
 */
async function fixMissingOrderRank(
	docs: Array<{ _id: string; title: string; _type: string }>,
): Promise<void> {
	console.log("\n🔧 Fixing missing orderRank values...\n");

	// Group by type
	const artworks = docs.filter((d) => d._type === "artwork");
	const categories = docs.filter((d) => d._type === "category");

	// Fix artworks
	if (artworks.length > 0) {
		console.log("📄 Fixing artworks...\n");
		await fixDocuments(artworks, "artwork");
	}

	// Fix categories
	if (categories.length > 0) {
		console.log("\n📁 Fixing categories...\n");
		await fixDocuments(categories, "category");
	}
}

/**
 * Fix documents of a specific type
 */
async function fixDocuments(
	docs: Array<{ _id: string; title: string; _type: string }>,
	docType: string,
): Promise<void> {
	// Get the last orderRank for this type
	const lastOrderRankStr = await getLastOrderRank(docType);

	let lastRank: LexoRank;
	if (lastOrderRankStr) {
		lastRank = LexoRank.parse(lastOrderRankStr);
		console.log(`   Last existing orderRank: ${lastOrderRankStr}`);
	} else {
		// No documents have orderRank yet, start from the beginning
		lastRank = LexoRank.middle();
		console.log("   No existing orderRank found, starting fresh");
	}

	console.log("");

	// Assign orderRank to each missing document
	for (const doc of docs) {
		// Generate next rank
		lastRank = lastRank.genNext();
		const orderRank = lastRank.toString();

		// Update the document
		await client
			.patch(doc._id)
			.set({
				orderRank,
			})
			.commit();

		const isDraft = doc._id.startsWith("drafts.");
		const draftLabel = isDraft ? " [DRAFT]" : "";
		console.log(`   ✓ ${doc.title || "Untitled"}${draftLabel}: ${orderRank}`);
	}
}

/**
 * Main execution
 */
async function main() {
	console.log("🔄 Fix Missing OrderRank\n");
	console.log("================================");

	try {
		// Step 1: Find documents missing orderRank
		const docs = await findMissingOrderRank();

		if (docs.length === 0) {
			console.log(
				"\n✨ All documents have orderRank. Nothing to fix!",
			);
			return;
		}

		// Step 2: Fix missing orderRank values
		await fixMissingOrderRank(docs);

		console.log("\n✅ Successfully fixed all missing orderRank values!");
		console.log(
			`   ${docs.length} document(s) now have proper ordering in Studio`,
		);
	} catch (error) {
		console.error("\n❌ Error fixing orderRank:", error);
		process.exit(1);
	}
}

main();
