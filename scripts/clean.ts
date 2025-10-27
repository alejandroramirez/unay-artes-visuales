/**
 * Clean script to delete all artwork and categories from Sanity
 * Run with: pnpm clean
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

async function clean() {
	console.log("🧹 Starting cleanup process...");

	try {
		// Check if token exists
		if (!process.env.SANITY_API_TOKEN) {
			console.error("\n❌ Error: SANITY_API_TOKEN not found in environment");
			process.exit(1);
		}

		// Delete all artwork
		console.log("\n🗑️  Deleting all artwork...");
		const artworkResult = await client.delete({
			query: '*[_type == "artwork"]',
		});
		console.log(`   ✓ Deleted ${artworkResult.results.length} artworks`);

		// Delete all categories
		console.log("\n🗑️  Deleting all categories...");
		const categoryResult = await client.delete({
			query: '*[_type == "category"]',
		});
		console.log(`   ✓ Deleted ${categoryResult.results.length} categories`);

		console.log("\n✅ Cleanup completed successfully!");
		console.log(
			"\n💡 You can now run 'pnpm seed' to populate with fresh data.\n",
		);
	} catch (error) {
		console.error("\n❌ Error during cleanup:", error);
		process.exit(1);
	}
}

clean();
