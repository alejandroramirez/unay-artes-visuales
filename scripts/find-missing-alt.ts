/**
 * Find Artworks Missing Alt Text
 *
 * Finds all artworks that have an image but are missing alt text
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

async function findMissingAlt() {
	console.log("\n🔍 Finding artworks with missing alt text...\n");

	const query = `*[_type == "artwork" && defined(image.asset) && !defined(image.alt)]{
    _id,
    title,
    "hasImage": defined(image.asset._ref)
  } | order(title asc)`;

	const artworks = await client.fetch(query);

	console.log(`Found ${artworks.length} artwork(s) missing alt text:\n`);

	for (const artwork of artworks) {
		console.log(`   - ${artwork.title} (${artwork._id})`);
	}

	if (artworks.length > 0) {
		console.log("\n💡 To fix these, you can:");
		console.log("   1. Edit each artwork in Sanity Studio");
		console.log(
			"   2. Use the fix-artwork-alt.ts script for individual fixes",
		);
		console.log(
			'      Example: pnpm tsx scripts/fix-artwork-alt.ts "<id>" "Alt text"',
		);
	} else {
		console.log("\n✅ All artworks have alt text!");
	}
}

findMissingAlt();
