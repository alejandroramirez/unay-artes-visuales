import { createClient } from "@sanity/client";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env.local" });

const client = createClient({
	projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
	dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
	apiVersion: "2025-10-08",
	useCdn: false,
});

async function checkCategory() {
	console.log("Checking all categories...\n");

	// Fetch all categories
	const categories = await client.fetch(
		`*[_type == "category"] | order(title asc) {
      _id,
      title,
      slug,
      "artworkCount": count(*[_type == "artwork" && references(^._id)])
    }`,
	);

	console.log("Categories:");
	for (const cat of categories) {
		console.log(`- ${cat.title} (${cat._id}): ${cat.artworkCount} artworks`);
	}

	// Check one artwork from each category
	console.log("\nChecking artwork references...\n");
	for (const cat of categories) {
		const artwork = await client.fetch(
			`*[_type == "artwork" && references($categoryId)][0] {
        _id,
        title,
        "categoryRef": category->_id,
        "categoryTitle": category->title
      }`,
			{ categoryId: cat._id },
		);

		if (artwork) {
			console.log(
				`✓ ${cat.title}: Found artwork "${artwork.title}" (refs: ${artwork.categoryRef})`,
			);
		} else {
			console.log(
				`✗ ${cat.title}: No artworks found that reference this category`,
			);
		}
	}
}

checkCategory().catch(console.error);
