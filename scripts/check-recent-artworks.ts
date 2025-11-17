/**
 * Check Recent Artworks Script
 *
 * Shows recently created or updated artworks and their orderRank status
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

async function checkRecentArtworks() {
	console.log("\n🔍 Checking recently created artworks...\n");

	// Get artworks created in the last 24 hours
	const query = `*[_type == "artwork"] | order(_createdAt desc)[0...10]{
    _id,
    _createdAt,
    _updatedAt,
    title,
    orderRank,
    "hasOrderRank": defined(orderRank)
  }`;

	const artworks = await client.fetch(query);

	console.log(`Most recent 10 artworks:\n`);

	for (const artwork of artworks) {
		const created = new Date(artwork._createdAt).toLocaleString();
		const updated = new Date(artwork._updatedAt).toLocaleString();
		const status = artwork.hasOrderRank ? "✅" : "❌ MISSING";

		console.log(`📄 ${artwork.title}`);
		console.log(`   Created: ${created}`);
		console.log(`   Updated: ${updated}`);
		console.log(`   OrderRank: ${status} ${artwork.orderRank || ""}`);
		console.log("");
	}

	// Count total artworks
	const total = await client.fetch(`count(*[_type == "artwork"])`);
	const withOrderRank = await client.fetch(
		`count(*[_type == "artwork" && defined(orderRank)])`,
	);

	console.log("================================");
	console.log(`\nTotal artworks: ${total}`);
	console.log(`With orderRank: ${withOrderRank}`);
	console.log(`Missing orderRank: ${total - withOrderRank}`);
}

checkRecentArtworks();
