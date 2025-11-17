/**
 * Fix Missing OrderRank Script
 *
 * Finds and fixes documents that are missing the orderRank field
 * Uses the centralized orderRank utility module for consistency
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import {
	findDocumentsMissingOrderRank,
	fixMissingOrderRanks,
} from "../src/sanity/lib/orderRank.js";

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
 * Main execution
 */
async function main() {
	console.log("🔄 Fix Missing OrderRank\n");
	console.log("================================");

	try {
		// Find all documents missing orderRank
		console.log(
			"\n🔍 Finding documents without orderRank (including drafts)...\n",
		);
		const docs = await findDocumentsMissingOrderRank(client, null);

		if (docs.length === 0) {
			console.log("✨ All documents have orderRank. Nothing to fix!\n");
			return;
		}

		console.log(`Found ${docs.length} document(s) missing orderRank:\n`);

		// Display missing documents
		for (const doc of docs) {
			const isDraft = doc._id.startsWith("drafts.");
			const draftLabel = isDraft ? " [DRAFT]" : "";
			console.log(
				`   - ${doc.title || "Untitled"} (${doc._type})${draftLabel}`,
			);
		}

		console.log("\n🔧 Fixing missing orderRank values...\n");

		// Fix artworks
		const artworks = docs.filter((d) => d._type === "artwork");
		if (artworks.length > 0) {
			console.log("📄 Fixing artworks...");
			const fixedArtworks = await fixMissingOrderRanks(client, "artwork");
			console.log(`   ✓ Fixed ${fixedArtworks} artwork(s)\n`);
		}

		// Fix categories
		const categories = docs.filter((d) => d._type === "category");
		if (categories.length > 0) {
			console.log("📁 Fixing categories...");
			const fixedCategories = await fixMissingOrderRanks(client, "category");
			console.log(`   ✓ Fixed ${fixedCategories} category(s)\n`);
		}

		console.log("✅ Successfully fixed all missing orderRank values!");
		console.log(
			`   ${docs.length} document(s) now have proper ordering in Studio\n`,
		);
	} catch (error) {
		console.error("\n❌ Error fixing orderRank:", error);
		process.exit(1);
	}
}

main();
