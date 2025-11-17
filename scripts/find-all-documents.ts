/**
 * Find All Documents Script
 *
 * Lists ALL documents in the dataset, including any type
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

async function findAllDocuments() {
	console.log("\n🔍 Finding ALL documents in dataset...\n");

	// Get all document types
	const typesQuery = `array::unique(*[]._type)`;
	const types = await client.fetch(typesQuery);

	console.log(`Found ${types.length} document types:\n`);

	let grandTotal = 0;
	let totalWithOrderRank = 0;
	let totalMissingOrderRank = 0;

	for (const type of types) {
		const countQuery = `count(*[_type == $type])`;
		const count = await client.fetch(countQuery, { type });

		const withOrderRankQuery = `count(*[_type == $type && defined(orderRank)])`;
		const withOrderRank = await client.fetch(withOrderRankQuery, { type });

		const missingOrderRank = count - withOrderRank;

		console.log(`   ${type}: ${count} total`);
		if (withOrderRank > 0 || missingOrderRank > 0) {
			console.log(
				`      ✅ With orderRank: ${withOrderRank}, ❌ Missing: ${missingOrderRank}`,
			);
		}

		grandTotal += count;
		totalWithOrderRank += withOrderRank;
		totalMissingOrderRank += missingOrderRank;
	}

	console.log("\n================================");
	console.log(`\n📊 Total Documents: ${grandTotal}`);
	console.log(`✅ With orderRank: ${totalWithOrderRank}`);
	console.log(`❌ Missing orderRank: ${totalMissingOrderRank}`);

	// List documents missing orderRank
	if (totalMissingOrderRank > 0) {
		console.log("\n📋 Documents missing orderRank:\n");
		const missingQuery = `*[!defined(orderRank) && (_type == "artwork" || _type == "category")]{
      _id,
      _type,
      title
    }`;
		const missing = await client.fetch(missingQuery);
		for (const doc of missing) {
			console.log(
				`   - ${doc.title || "Untitled"} (${doc._type}) - ${doc._id}`,
			);
		}
	}
}

findAllDocuments();
