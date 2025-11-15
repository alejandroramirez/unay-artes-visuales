/**
 * Migration script to convert existing 'order' number field to 'orderRank' string field
 * This preserves the current ordering of documents while enabling drag-and-drop reordering
 */

import { createClient } from "@sanity/client";
import { config } from "dotenv";
import { LexoRank } from "lexorank";

// Load environment variables
config({ path: ".env.local" });

const client = createClient({
	projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "",
	dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "",
	apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-10-08",
	token: process.env.SANITY_API_TOKEN,
	useCdn: false,
});

interface Document {
	_id: string;
	_type: string;
	title?: string;
	order?: number;
	orderRank?: string;
}

async function migrateType(type: "artwork" | "category") {
	console.log(`\n📁 Migrating ${type}...`);

	// 1. Fetch all documents of this type, sorted by 'order' field
	const documents = await client.fetch<Document[]>(
		`*[_type == $type] | order(order asc, _createdAt asc) {
      _id,
      _type,
      title,
      order,
      orderRank
    }`,
		{ type },
	);

	if (documents.length === 0) {
		console.log(`  ℹ️  No ${type} documents found`);
		return;
	}

	console.log(`  Found ${documents.length} documents`);

	// 2. Generate LexoRank values
	let lexoRank = LexoRank.min();
	const transaction = client.transaction();

	for (const doc of documents) {
		// Generate next rank (with buffer for future insertions)
		lexoRank = lexoRank.genNext().genNext();

		console.log(
			`  ${doc.title || doc._id}: order=${doc.order ?? "none"} → orderRank=${lexoRank.toString()}`,
		);

		transaction.patch(doc._id, {
			set: { orderRank: lexoRank.toString() },
		});
	}

	// 3. Commit transaction
	console.log(`  💾 Committing changes...`);
	await transaction.commit();
	console.log(`  ✅ ${type} migration completed`);
}

async function migrate() {
	console.log("🔄 Starting orderRank migration...");
	console.log(
		"This will preserve your existing order while enabling drag-and-drop\n",
	);

	try {
		// Check for API token
		if (!process.env.SANITY_API_TOKEN) {
			console.error("❌ Error: SANITY_API_TOKEN not found in .env.local");
			console.log("\nPlease add your Sanity API token to .env.local:");
			console.log("SANITY_API_TOKEN=your_token_here");
			console.log("\nYou can create a token at: https://www.sanity.io/manage");
			process.exit(1);
		}

		// Migrate categories first (usually fewer documents)
		await migrateType("category");

		// Then migrate artworks
		await migrateType("artwork");

		console.log("\n✅ Migration completed successfully!");
		console.log(
			"\nYour documents now have orderRank values and the plugin error should be gone.",
		);
		console.log("The original 'order' field is still intact as a backup.");
	} catch (error) {
		console.error("\n❌ Migration failed:");
		console.error(error);
		process.exit(1);
	}
}

// Run migration
migrate();
