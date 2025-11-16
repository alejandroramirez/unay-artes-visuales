#!/usr/bin/env tsx

/**
 * Sanity Data Backup Script
 *
 * Creates a complete backup of all Sanity CMS data including:
 * - All document types (artworks, categories, etc.)
 * - Document metadata (_id, _type, _createdAt, _updatedAt, _rev)
 * - References and relationships
 * - Full-resolution image files from Sanity CDN
 *
 * Backups are saved with timestamps for easy identification and restoration.
 *
 * Usage:
 *   pnpm backup:sanity [output-dir]
 *
 * Example:
 *   pnpm backup:sanity backups/
 */

import {
	createWriteStream,
	existsSync,
	mkdirSync,
	writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createClient } from "@sanity/client";

// ============================================================================
// CONFIGURATION
// ============================================================================

// Load environment variables from .env file for standalone script execution
import dotenv from "dotenv";

// Load .env and .env.local (Next.js convention)
dotenv.config();
dotenv.config({ path: ".env.local" });

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-10-08";

if (!projectId || !dataset) {
	console.error("❌ Error: Missing Sanity environment variables");
	console.error("   Please ensure .env file contains:");
	console.error("   - NEXT_PUBLIC_SANITY_PROJECT_ID");
	console.error("   - NEXT_PUBLIC_SANITY_DATASET");
	process.exit(1);
}

// Create Sanity client
const client = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: false, // Don't use CDN for backup to ensure fresh data
});

// ============================================================================
// TYPES
// ============================================================================

interface BackupMetadata {
	timestamp: string;
	date: string;
	projectId: string;
	dataset: string;
	apiVersion: string;
	totalDocuments: number;
	documentTypes: Record<string, number>;
	totalImages: number;
	imagesDownloaded: number;
}

interface ImageAsset {
	_id: string;
	_type: string;
	url?: string;
	extension?: string;
	assetId?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate timestamp string for backup folder name
 */
function getTimestamp(): string {
	const now = new Date();
	return (
		now.toISOString().replace(/[:.]/g, "-").replace(/T/, "_").split("Z")[0] ||
		""
	);
}

/**
 * Format date for human-readable metadata
 */
function getFormattedDate(): string {
	return new Date().toISOString();
}

// ============================================================================
// BACKUP FUNCTIONS
// ============================================================================

/**
 * Fetch all documents from Sanity
 */
async function fetchAllDocuments(): Promise<any[]> {
	console.log("📥 Fetching all documents from Sanity...");

	try {
		// Query all documents, including drafts
		const query = '*[!(_id in path("_.**"))]';
		const documents = await client.fetch(query);

		console.log(`✅ Fetched ${documents.length} documents`);
		return documents;
	} catch (error) {
		console.error("❌ Error fetching documents:", error);
		throw error;
	}
}

/**
 * Group documents by type
 */
function groupDocumentsByType(documents: any[]): Record<string, any[]> {
	const grouped: Record<string, any[]> = {};

	for (const doc of documents) {
		const type = doc._type || "unknown";
		if (!grouped[type]) {
			grouped[type] = [];
		}
		grouped[type].push(doc);
	}

	return grouped;
}

/**
 * Download a single image from URL
 */
async function downloadImage(
	url: string,
	outputPath: string,
): Promise<boolean> {
	try {
		const response = await fetch(url);
		if (!response.ok) {
			console.error(`   ⚠️  Failed to download: ${url} (${response.status})`);
			return false;
		}

		const fileStream = createWriteStream(outputPath);

		// Convert web ReadableStream to Node.js stream
		if (response.body) {
			await pipeline(Readable.fromWeb(response.body as any), fileStream);
			return true;
		}

		return false;
	} catch (error) {
		console.error(`   ⚠️  Error downloading ${url}:`, error);
		return false;
	}
}

/**
 * Download all image assets
 */
async function downloadImages(
	imageAssets: ImageAsset[],
	imagesDir: string,
): Promise<number> {
	console.log(`\n📷 Downloading ${imageAssets.length} images...`);

	let downloadedCount = 0;

	for (let i = 0; i < imageAssets.length; i++) {
		const asset = imageAssets[i];
		if (!asset) continue;

		if (!asset.url) {
			console.log(`   ⚠️  Skipping ${asset._id} (no URL)`);
			continue;
		}

		// Create filename from asset ID and extension
		const extension = asset.extension || "jpg";
		const filename = `${asset.assetId || asset._id}.${extension}`;
		const outputPath = resolve(imagesDir, filename);

		// Show progress
		const progress = `[${i + 1}/${imageAssets.length}]`;
		process.stdout.write(`   ${progress} Downloading ${filename}...`);

		const success = await downloadImage(asset.url, outputPath);

		if (success) {
			downloadedCount++;
			process.stdout.write(" ✓\n");
		} else {
			process.stdout.write(" ✗\n");
		}
	}

	console.log(
		`\n✅ Downloaded ${downloadedCount}/${imageAssets.length} images`,
	);
	return downloadedCount;
}

/**
 * Create backup metadata
 */
function createMetadata(
	documents: any[],
	documentsByType: Record<string, any[]>,
	imageStats: { total: number; downloaded: number },
): BackupMetadata {
	const typeCounts: Record<string, number> = {};
	for (const [type, docs] of Object.entries(documentsByType)) {
		typeCounts[type] = docs.length;
	}

	return {
		timestamp: getTimestamp(),
		date: getFormattedDate(),
		projectId: projectId!,
		dataset: dataset!,
		apiVersion,
		totalDocuments: documents.length,
		documentTypes: typeCounts,
		totalImages: imageStats.total,
		imagesDownloaded: imageStats.downloaded,
	};
}

/**
 * Save backup files
 */
function saveBackup(
	documents: any[],
	documentsByType: Record<string, any[]>,
	metadata: BackupMetadata,
	backupDir: string,
): void {
	console.log(`\n💾 Saving backup to: ${backupDir}`);

	// ========================================================================
	// Save complete backup (all documents in one file)
	// ========================================================================
	const allDocsPath = resolve(backupDir, "all-documents.json");
	writeFileSync(allDocsPath, JSON.stringify(documents, null, 2));
	console.log(`   ✓ Saved all documents: all-documents.json`);

	// Save NDJSON format (for Sanity CLI import)
	const ndjsonPath = resolve(backupDir, "all-documents.ndjson");
	const ndjsonContent = documents.map((doc) => JSON.stringify(doc)).join("\n");
	writeFileSync(ndjsonPath, ndjsonContent);
	console.log(`   ✓ Saved NDJSON format: all-documents.ndjson`);

	// ========================================================================
	// Save documents grouped by type
	// ========================================================================
	const byTypeDir = resolve(backupDir, "by-type");
	if (!existsSync(byTypeDir)) {
		mkdirSync(byTypeDir, { recursive: true });
	}

	for (const [type, docs] of Object.entries(documentsByType)) {
		const typePath = resolve(byTypeDir, `${type}.json`);
		writeFileSync(typePath, JSON.stringify(docs, null, 2));
		console.log(`   ✓ Saved ${docs.length} ${type} documents`);
	}

	// ========================================================================
	// Save metadata
	// ========================================================================
	const metadataPath = resolve(backupDir, "backup-metadata.json");
	writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
	console.log(`   ✓ Saved backup metadata`);

	// ========================================================================
	// Create README
	// ========================================================================
	const readme = `# Sanity Data Backup

**Created:** ${metadata.date}
**Project ID:** ${metadata.projectId}
**Dataset:** ${metadata.dataset}
**API Version:** ${metadata.apiVersion}

## Summary

- **Total Documents:** ${metadata.totalDocuments}
- **Total Images:** ${metadata.totalImages}
- **Images Downloaded:** ${metadata.imagesDownloaded}

### Documents by Type

${Object.entries(metadata.documentTypes)
	.map(([type, count]) => `- **${type}:** ${count} documents`)
	.join("\n")}

## Files

- \`all-documents.json\` - All documents in a single JSON array
- \`all-documents.ndjson\` - All documents in NDJSON format (for Sanity CLI import)
- \`by-type/\` - Documents organized by type (artwork, category, etc.)
- \`images/\` - Full-resolution image files downloaded from Sanity CDN
- \`backup-metadata.json\` - Backup metadata and statistics

## Restoration

### Restore Documents

To restore this backup to Sanity, use the Sanity CLI:

\`\`\`bash
# Import to production dataset
sanity dataset import all-documents.ndjson production

# Import to a different dataset
sanity dataset import all-documents.ndjson staging
\`\`\`

**Warning:** Importing will replace existing documents with the same _id. Make sure to backup your current data before restoring.

### Restore Images

Images must be manually re-uploaded to Sanity Studio or uploaded via the Sanity API. The \`images/\` directory contains all original full-resolution files.

## Manual Restoration

You can also manually restore specific document types by importing the JSON files from the \`by-type/\` directory through Sanity Studio or custom scripts.
`;

	const readmePath = resolve(backupDir, "README.md");
	writeFileSync(readmePath, readme);
	console.log(`   ✓ Saved README`);
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
	const args = process.argv.slice(2);
	const outputDir = args[0] || "backups";

	console.log("🚀 Starting Sanity data backup...\n");
	console.log(`   Project ID: ${projectId}`);
	console.log(`   Dataset: ${dataset}`);
	console.log(`   Output directory: ${outputDir}\n`);

	try {
		// Fetch all documents
		const documents = await fetchAllDocuments();

		if (documents.length === 0) {
			console.log("⚠️  No documents found in Sanity. Backup not created.");
			return;
		}

		// Group by type
		const documentsByType = groupDocumentsByType(documents);

		// Extract image assets
		const imageAssets: ImageAsset[] =
			documentsByType["sanity.imageAsset"] || [];

		// Create temporary metadata to get timestamp for backup directory
		const timestamp = getTimestamp();
		const backupDir = resolve(outputDir, `backup_${timestamp}`);

		// Download images if any exist
		let imagesDownloaded = 0;
		if (imageAssets.length > 0) {
			const imagesDir = resolve(backupDir, "images");
			if (!existsSync(imagesDir)) {
				mkdirSync(imagesDir, { recursive: true });
			}
			imagesDownloaded = await downloadImages(imageAssets, imagesDir);
		}

		// Create metadata with image stats
		const metadata = createMetadata(documents, documentsByType, {
			total: imageAssets.length,
			downloaded: imagesDownloaded,
		});

		// Save backup
		saveBackup(documents, documentsByType, metadata, backupDir);

		// Summary
		console.log("\n📊 Backup Summary:");
		console.log(`   Total documents: ${metadata.totalDocuments}`);
		console.log(`   Document types: ${Object.keys(documentsByType).length}`);
		console.log(
			`   Images: ${metadata.imagesDownloaded}/${metadata.totalImages} downloaded`,
		);
		console.log("\n✨ Backup complete!");
	} catch (error) {
		console.error("\n❌ Backup failed:", error);
		process.exit(1);
	}
}

main();
