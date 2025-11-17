/**
 * Check Artwork Script
 *
 * Checks the status of a specific artwork by title
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

async function checkArtwork(title: string) {
	console.log(`\n🔍 Searching for artwork: "${title}"\n`);

	const query = `*[_type == "artwork" && title match $title]{
    _id,
    _rev,
    title,
    orderRank,
    "hasImage": defined(image.asset._ref),
    "imageRef": image.asset._ref,
    category->{
      _id,
      title,
      slug
    }
  }`;

	const artworks = await client.fetch(query, { title: `*${title}*` });

	if (artworks.length === 0) {
		console.log(`❌ No artwork found matching "${title}"`);
		return;
	}

	console.log(`Found ${artworks.length} artwork(s):\n`);

	for (const artwork of artworks) {
		console.log(`📄 ${artwork.title}`);
		console.log(`   ID: ${artwork._id}`);
		console.log(`   OrderRank: ${artwork.orderRank || "❌ MISSING"}`);
		console.log(`   Has Image: ${artwork.hasImage ? "✅" : "❌"}`);
		if (artwork.imageRef) {
			console.log(`   Image Ref: ${artwork.imageRef}`);
		}
		console.log(`   Category: ${artwork.category?.title || "None"}`);
		console.log("");
	}
}

const searchTerm = process.argv[2] || "Efímera";
checkArtwork(searchTerm);
