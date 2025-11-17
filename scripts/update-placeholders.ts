/**
 * Update Placeholder Images Script
 *
 * This script replaces old placeholder images with a new white background
 * placeholder that says "El autor no proporcionó evidencia fotográfica"
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

/**
 * Create new white placeholder image
 */
async function createNewPlaceholder(): Promise<{
	_ref: string;
	_type: string;
}> {
	console.log("\n📝 Creating new placeholder image...");

	// Create a white placeholder with Spanish text
	const placeholderSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#FFFFFF"/>
  <text x="400" y="280" font-family="Arial, sans-serif" font-size="28" text-anchor="middle" fill="#666" font-weight="normal">
    El autor no proporcionó
  </text>
  <text x="400" y="320" font-family="Arial, sans-serif" font-size="28" text-anchor="middle" fill="#666" font-weight="normal">
    evidencia fotográfica
  </text>
</svg>`;

	// Upload as a file
	const buffer = Buffer.from(placeholderSvg, "utf-8");
	const asset = await client.assets.upload("image", buffer, {
		filename: "placeholder-no-photo.svg",
		contentType: "image/svg+xml",
	});

	console.log(`   ✓ New placeholder created (ID: ${asset._id})`);

	return {
		_type: "image",
		_ref: asset._id,
	};
}

/**
 * Find all old placeholder images
 */
async function findOldPlaceholders(): Promise<Array<{ _id: string }>> {
	console.log("\n🔍 Finding old placeholder images...");

	const query = `*[_type == "sanity.imageAsset" && (
    originalFilename == "placeholder-import.svg" ||
    originalFilename match "placeholder*"
  )]{ _id, originalFilename, url }`;

	const placeholders = await client.fetch(query);
	console.log(`   Found ${placeholders.length} old placeholder(s)`);

	for (const p of placeholders) {
		console.log(`   - ${p.originalFilename} (${p._id})`);
	}

	return placeholders;
}

/**
 * Find all artworks using placeholder images
 */
async function findArtworksWithPlaceholders(
	placeholderIds: string[],
): Promise<Array<{ _id: string; title: string }>> {
	console.log("\n🎨 Finding artworks with placeholder images...");

	const query = `*[_type == "artwork" && image.asset._ref in $placeholderIds]{
    _id,
    title
  }`;

	const artworks = await client.fetch(query, { placeholderIds });
	console.log(`   Found ${artworks.length} artwork(s) using placeholders`);

	for (const artwork of artworks) {
		console.log(`   - ${artwork.title}`);
	}

	return artworks;
}

/**
 * Update artworks to use new placeholder
 */
async function updateArtworks(
	artworkIds: string[],
	newPlaceholder: { _ref: string; _type: string },
): Promise<void> {
	console.log("\n🔄 Updating artworks...");

	for (const artworkId of artworkIds) {
		await client
			.patch(artworkId)
			.set({
				image: {
					_type: "image",
					asset: {
						_type: "reference",
						_ref: newPlaceholder._ref,
					},
				},
			})
			.commit();

		console.log(`   ✓ Updated artwork ${artworkId}`);
	}
}

/**
 * Delete old placeholder images
 */
async function deleteOldPlaceholders(placeholderIds: string[]): Promise<void> {
	console.log("\n🗑️  Deleting old placeholder images...");

	for (const id of placeholderIds) {
		try {
			await client.delete(id);
			console.log(`   ✓ Deleted ${id}`);
		} catch (error) {
			console.log(`   ⚠️  Could not delete ${id} (may still be in use)`);
		}
	}
}

/**
 * Main execution
 */
async function main() {
	console.log("🔄 Updating Placeholder Images\n");
	console.log("================================");

	try {
		// Step 1: Find old placeholders
		const oldPlaceholders = await findOldPlaceholders();

		if (oldPlaceholders.length === 0) {
			console.log("\n✨ No old placeholders found. Nothing to update!");
			return;
		}

		const oldPlaceholderIds = oldPlaceholders.map((p) => p._id);

		// Step 2: Find artworks using old placeholders
		const artworks = await findArtworksWithPlaceholders(oldPlaceholderIds);

		if (artworks.length === 0) {
			console.log(
				"\n✨ No artworks using placeholders. Cleaning up old placeholders...",
			);
			await deleteOldPlaceholders(oldPlaceholderIds);
			console.log("\n✅ Done!");
			return;
		}

		// Step 3: Create new placeholder
		const newPlaceholder = await createNewPlaceholder();

		// Step 4: Update artworks
		const artworkIds = artworks.map((a) => a._id);
		await updateArtworks(artworkIds, newPlaceholder);

		// Step 5: Delete old placeholders
		await deleteOldPlaceholders(oldPlaceholderIds);

		console.log("\n✅ Successfully updated all placeholder images!");
		console.log(
			`   ${artworks.length} artwork(s) now use the new placeholder design`,
		);
	} catch (error) {
		console.error("\n❌ Error updating placeholders:", error);
		process.exit(1);
	}
}

main();
