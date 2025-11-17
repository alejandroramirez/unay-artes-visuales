/**
 * Manual Homepage Revalidation Script
 *
 * Triggers Next.js ISR revalidation for the homepage
 * Useful after bulk updates or changes that don't trigger automatic revalidation
 */

import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

const REVALIDATE_SECRET =
	process.env.SANITY_REVALIDATE_SECRET ||
	"42781763f0d8ed80779e15926953993b605b67a5d413e1c3795273cb71ca00c7";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

/**
 * Trigger revalidation using the manual revalidation endpoint
 */
async function triggerRevalidation() {
	console.log("🔄 Triggering homepage revalidation...\n");

	const path = process.argv[2] || "/";

	try {
		const url = new URL("/api/revalidate-manual", BASE_URL);
		url.searchParams.set("secret", REVALIDATE_SECRET);
		url.searchParams.set("path", path);

		const response = await fetch(url.toString(), {
			method: "GET",
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Revalidation failed: ${response.status} ${response.statusText}\n${errorText}`,
			);
		}

		const result = await response.json();
		console.log(`✅ Path "${path}" revalidated successfully!`);
		console.log("\nResponse:", JSON.stringify(result, null, 2));
		console.log(
			"\n💡 The cache has been cleared. Visit the site to see updated content.",
		);
	} catch (error) {
		console.error("❌ Revalidation failed:", error);
		console.error(
			"\n💡 Make sure the Next.js development server is running (pnpm dev)",
		);
		process.exit(1);
	}
}

triggerRevalidation();
