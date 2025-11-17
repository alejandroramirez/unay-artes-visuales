/**
 * Check All OrderRank Script
 *
 * Checks orderRank status for all document types
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

async function checkOrderRank() {
	console.log("\n🔍 Checking orderRank for all documents\n");
	console.log("================================\n");

	// Check artworks
	const artworksQuery = `{
    "total": count(*[_type == "artwork"]),
    "withOrderRank": count(*[_type == "artwork" && defined(orderRank)]),
    "missing": *[_type == "artwork" && !defined(orderRank)]{_id, title}
  }`;

	const artworks = await client.fetch(artworksQuery);

	console.log("📄 Artworks:");
	console.log(`   Total: ${artworks.total}`);
	console.log(
		`   With orderRank: ${artworks.withOrderRank} (${artworks.total - artworks.missing.length} expected)`,
	);
	console.log(`   Missing orderRank: ${artworks.missing.length}`);
	if (artworks.missing.length > 0) {
		for (const doc of artworks.missing) {
			console.log(`      - ${doc.title} (${doc._id})`);
		}
	}
	console.log("");

	// Check categories
	const categoriesQuery = `{
    "total": count(*[_type == "category"]),
    "withOrderRank": count(*[_type == "category" && defined(orderRank)]),
    "missing": *[_type == "category" && !defined(orderRank)]{_id, title}
  }`;

	const categories = await client.fetch(categoriesQuery);

	console.log("📁 Categories:");
	console.log(`   Total: ${categories.total}`);
	console.log(
		`   With orderRank: ${categories.withOrderRank} (${categories.total - categories.missing.length} expected)`,
	);
	console.log(`   Missing orderRank: ${categories.missing.length}`);
	if (categories.missing.length > 0) {
		for (const doc of categories.missing) {
			console.log(`      - ${doc.title} (${doc._id})`);
		}
	}
	console.log("");

	const totalMissing = artworks.missing.length + categories.missing.length;
	const totalDocs = artworks.total + categories.total;

	console.log("================================");
	console.log(
		`\n📊 Summary: ${totalMissing}/${totalDocs} documents missing orderRank`,
	);

	if (totalMissing > 0) {
		console.log("\n⚠️  Run the appropriate fix script to resolve this:");
		console.log("   pnpm tsx scripts/fix-missing-orderrank.ts");
	} else {
		console.log("\n✅ All documents have orderRank!");
	}
}

checkOrderRank();
