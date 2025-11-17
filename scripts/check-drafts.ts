/**
 * Check Draft Documents Script
 *
 * Checks for draft documents (prefixed with "drafts.") that might be missing orderRank
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

async function checkDrafts() {
	console.log("\n🔍 Checking for draft documents...\n");

	// Get all draft artworks
	const draftArtworksQuery = `*[_id in path("drafts.**") && _type == "artwork"]{
    _id,
    title,
    orderRank,
    "hasOrderRank": defined(orderRank)
  }`;

	const draftArtworks = await client.fetch(draftArtworksQuery);

	console.log(`📄 Draft Artworks: ${draftArtworks.length}\n`);

	for (const artwork of draftArtworks) {
		const status = artwork.hasOrderRank ? "✅" : "❌ MISSING";
		console.log(`   ${artwork.title || "Untitled"}`);
		console.log(`   ID: ${artwork._id}`);
		console.log(`   OrderRank: ${status} ${artwork.orderRank || ""}`);
		console.log("");
	}

	// Get all draft categories
	const draftCategoriesQuery = `*[_id in path("drafts.**") && _type == "category"]{
    _id,
    title,
    orderRank,
    "hasOrderRank": defined(orderRank)
  }`;

	const draftCategories = await client.fetch(draftCategoriesQuery);

	console.log(`📁 Draft Categories: ${draftCategories.length}\n`);

	for (const category of draftCategories) {
		const status = category.hasOrderRank ? "✅" : "❌ MISSING";
		console.log(`   ${category.title || "Untitled"}`);
		console.log(`   ID: ${category._id}`);
		console.log(`   OrderRank: ${status} ${category.orderRank || ""}`);
		console.log("");
	}

	const totalDrafts = draftArtworks.length + draftCategories.length;
	const draftsWithoutOrderRank = [...draftArtworks, ...draftCategories].filter(
		(d) => !d.hasOrderRank,
	);

	console.log("================================");
	console.log(`\nTotal drafts: ${totalDrafts}`);
	console.log(`Drafts missing orderRank: ${draftsWithoutOrderRank.length}`);

	if (draftsWithoutOrderRank.length > 0) {
		console.log("\n⚠️  Run fix:orderrank to add orderRank to these drafts");
	}
}

checkDrafts();
