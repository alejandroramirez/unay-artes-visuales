/**
 * Count All Documents Script
 *
 * Counts all documents including drafts
 */

import { createClient } from "@sanity/client";
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

async function countAllDocs() {
	console.log("\n📊 Counting all documents...\n");

	// Count artworks (published only)
	const artworksCount = await client.fetch(
		`count(*[_type == "artwork" && !(_id in path("drafts.**"))])`,
	);
	console.log(`📄 Published Artworks: ${artworksCount}`);

	// Count artwork drafts
	const artworkDraftsCount = await client.fetch(
		`count(*[_type == "artwork" && _id in path("drafts.**")])`,
	);
	console.log(`📝 Artwork Drafts: ${artworkDraftsCount}`);

	// Count categories (published only)
	const categoriesCount = await client.fetch(
		`count(*[_type == "category" && !(_id in path("drafts.**"))])`,
	);
	console.log(`📁 Published Categories: ${categoriesCount}`);

	// Count category drafts
	const categoryDraftsCount = await client.fetch(
		`count(*[_type == "category" && _id in path("drafts.**")])`,
	);
	console.log(`📝 Category Drafts: ${categoryDraftsCount}`);

	// Total for artworks
	const totalArtworks = artworksCount + artworkDraftsCount;
	console.log(`\n📄 Total Artworks (published + drafts): ${totalArtworks}`);

	// Total for categories
	const totalCategories = categoriesCount + categoryDraftsCount;
	console.log(`📁 Total Categories (published + drafts): ${totalCategories}`);

	// Grand total
	const grandTotal = totalArtworks + totalCategories;
	console.log(`\n🎯 Grand Total: ${grandTotal}`);

	// Check orderRank status for all
	const allDocsWithOrderRank = await client.fetch(
		`count(*[(_type == "artwork" || _type == "category") && defined(orderRank)])`,
	);
	const allDocsTotal = await client.fetch(
		`count(*[_type == "artwork" || _type == "category"])`,
	);

	console.log(`\n✅ With orderRank: ${allDocsWithOrderRank}/${allDocsTotal}`);
	console.log(`❌ Missing orderRank: ${allDocsTotal - allDocsWithOrderRank}`);
}

countAllDocs();
