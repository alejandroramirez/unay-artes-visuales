/**
 * Detailed Artwork Check Script
 *
 * Checks all fields and validation status of a specific artwork
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

async function checkArtworkDetail(title: string) {
	console.log(`\n🔍 Detailed check for artwork: "${title}"\n`);

	const query = `*[_type == "artwork" && title match $title][0]{
    _id,
    _rev,
    _createdAt,
    _updatedAt,
    title,
    slug,
    orderRank,
    image,
    description,
    autor,
    category->{
      _id,
      title,
      slug
    },
    apartado,
    year,
    dimensions,
    medium,
    order
  }`;

	const artwork = await client.fetch(query, { title: `*${title}*` });

	if (!artwork) {
		console.log(`❌ No artwork found matching "${title}"`);
		return;
	}

	console.log(`📄 ${artwork.title}`);
	console.log(`   ID: ${artwork._id}`);
	console.log(`   Created: ${new Date(artwork._createdAt).toLocaleString()}`);
	console.log(`   Updated: ${new Date(artwork._updatedAt).toLocaleString()}`);
	console.log("");

	// Check required fields
	console.log("Required Fields:");
	console.log(
		`   Title: ${artwork.title ? "✅" : "❌"} ${artwork.title || "MISSING"}`,
	);
	console.log(
		`   Slug: ${artwork.slug?.current ? "✅" : "❌"} ${artwork.slug?.current || "MISSING"}`,
	);
	console.log(
		`   Image: ${artwork.image?.asset?._ref ? "✅" : "❌"} ${artwork.image?.asset?._ref || "MISSING"}`,
	);
	console.log(
		`   Image Alt: ${artwork.image?.alt ? "✅" : "❌"} ${artwork.image?.alt || "MISSING"}`,
	);
	console.log("");

	// Check optional fields
	console.log("Optional Fields:");
	console.log(
		`   OrderRank: ${artwork.orderRank ? "✅" : "❌"} ${artwork.orderRank || "MISSING"}`,
	);
	console.log(
		`   Category: ${artwork.category?.title ? "✅" : "⚠️"} ${artwork.category?.title || "Not set"}`,
	);
	console.log(
		`   Apartado: ${artwork.apartado ? "✅" : "⚠️"} ${artwork.apartado || "Not set"}`,
	);
	console.log(
		`   Autor: ${artwork.autor ? "✅" : "⚠️"} ${artwork.autor || "Not set"}`,
	);
	console.log(
		`   Year: ${artwork.year ? "✅" : "⚠️"} ${artwork.year || "Not set"}`,
	);
	console.log(
		`   Dimensions: ${artwork.dimensions ? "✅" : "⚠️"} ${artwork.dimensions || "Not set"}`,
	);
	console.log(
		`   Medium: ${artwork.medium ? "✅" : "⚠️"} ${artwork.medium || "Not set"}`,
	);
	console.log("");

	// Check for issues
	const issues = [];
	if (!artwork.slug?.current) issues.push("Missing slug");
	if (!artwork.image?.asset?._ref) issues.push("Missing image");
	if (!artwork.image?.alt) issues.push("Missing image alt text");
	if (!artwork.orderRank) issues.push("Missing orderRank");

	if (issues.length > 0) {
		console.log("⚠️  Issues Found:");
		for (const issue of issues) {
			console.log(`   - ${issue}`);
		}
	} else {
		console.log("✅ No issues found!");
	}
}

const searchTerm = process.argv[2] || "Sin título";
checkArtworkDetail(searchTerm);
