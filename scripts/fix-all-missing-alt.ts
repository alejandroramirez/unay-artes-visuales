/**
 * Fix All Missing Alt Text Script
 *
 * Automatically adds alt text (using title) to all artworks missing it
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

async function fixAllMissingAlt() {
	console.log("\n🔧 Fixing all artworks with missing alt text...\n");

	const query = `*[_type == "artwork" && defined(image.asset) && !defined(image.alt)]{
    _id,
    title
  } | order(title asc)`;

	const artworks = await client.fetch(query);

	console.log(`Found ${artworks.length} artwork(s) to fix\n`);

	if (artworks.length === 0) {
		console.log("✅ All artworks already have alt text!");
		return;
	}

	let fixed = 0;
	let failed = 0;

	for (const artwork of artworks) {
		try {
			await client
				.patch(artwork._id)
				.set({
					"image.alt": artwork.title,
				})
				.commit();

			console.log(`   ✓ ${artwork.title}`);
			fixed++;
		} catch (error) {
			console.log(`   ✗ ${artwork.title} - ${error}`);
			failed++;
		}
	}

	console.log(`\n✅ Fixed ${fixed} artwork(s)`);
	if (failed > 0) {
		console.log(`⚠️  Failed to fix ${failed} artwork(s)`);
	}
}

fixAllMissingAlt();
