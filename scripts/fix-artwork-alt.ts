/**
 * Fix Artwork Alt Text Script
 *
 * Adds missing alt text to a specific artwork
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

async function fixArtworkAlt(artworkId: string, altText: string) {
	console.log(`\n🔧 Fixing alt text for artwork: ${artworkId}\n`);

	try {
		// Get the current image object
		const artwork = await client.fetch(
			`*[_type == "artwork" && _id == $id][0]{title, image}`,
			{ id: artworkId },
		);

		if (!artwork) {
			console.log("❌ Artwork not found");
			return;
		}

		console.log(`   Artwork: ${artwork.title}`);
		console.log(`   Current alt: ${artwork.image?.alt || "MISSING"}`);
		console.log(`   New alt: ${altText}`);

		// Update the image alt text
		await client
			.patch(artworkId)
			.set({
				"image.alt": altText,
			})
			.commit();

		console.log("\n✅ Alt text updated successfully!");
	} catch (error) {
		console.error("❌ Error updating alt text:", error);
		process.exit(1);
	}
}

// Usage: pnpm tsx scripts/fix-artwork-alt.ts <artworkId> <altText>
const artworkId = process.argv[2];
const altText = process.argv[3];

if (!artworkId || !altText) {
	console.log("Usage: pnpm tsx scripts/fix-artwork-alt.ts <artworkId> <altText>");
	console.log(
		'Example: pnpm tsx scripts/fix-artwork-alt.ts "abc123" "Description of artwork"',
	);
	process.exit(1);
}

fixArtworkAlt(artworkId, altText);
