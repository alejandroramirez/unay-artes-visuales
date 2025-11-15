#!/usr/bin/env tsx

/**
 * Excel Data Transformation Script
 *
 * Transforms FICHAS_TECNICAS.xlsx into Sanity-compatible JSON/CSV formats.
 * This script can be reused whenever a new Excel file with the same structure is received.
 *
 * Usage:
 *   pnpm transform:data [input-file] [output-dir]
 *
 * Example:
 *   pnpm transform:data FICHAS_TECNICAS.xlsx data/
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import XLSX from "xlsx";

// ============================================================================
// TYPES
// ============================================================================

interface ExcelRow {
	APARTADO: string;
	PRACTICA: string;
	ALUMNO: string;
	"¿PARTICIPAS? SI/NO": string;
	NOMBRE_OBRA: string;
	MEDIDAS: string;
	TECNICA: string;
	Columna1?: string;
}

interface ArtworkData {
	title: string;
	slug: string;
	autor: string;
	apartado: string;
	category: string; // Will be matched to Sanity category reference
	dimensions: string;
	medium: string;
	notes?: string;
}

interface DataQualityIssue {
	row: number;
	field: string;
	issue: string;
	value: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const APARTADO_MAPPING: Record<string, string> = {
	PINTURA: "Pintura",
	FOTOGRAFIA: "Fotografía",
	FOTOGRAFÍA: "Fotografía",
	GRAFICA: "Gráfica",
	GRÁFICA: "Gráfica",
};

// Photo sizes and special dimensions to keep as-is
const PRESERVE_DIMENSIONS = ["6x4", "media carta"];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate URL-friendly slug from title
 */
function generateSlug(title: string): string {
	return title
		.toLowerCase()
		.normalize("NFD") // Decompose accented characters
		.replace(/[\u0300-\u036f]/g, "") // Remove diacritics
		.replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric except spaces and hyphens
		.trim()
		.replace(/\s+/g, "-") // Replace spaces with hyphens
		.replace(/-+/g, "-") // Replace multiple hyphens with single
		.substring(0, 96); // Limit to 96 chars as per Sanity schema
}

/**
 * Normalize apartado value to title case
 */
function normalizeApartado(apartado: unknown): string {
	if (!apartado) return "";
	const apartadoStr = String(apartado);
	const normalized = apartadoStr.toUpperCase().trim();
	return APARTADO_MAPPING[normalized] || apartadoStr;
}

/**
 * Format dimensions to cm format
 * - Converts measurements to "X x Y cm" format
 * - Preserves "6x4" (photo sizes)
 * - Preserves word dimensions like "Media Carta"
 */
function formatDimensions(medidas: unknown): string {
	if (!medidas) return "";
	const medidasStr = String(medidas);
	if (medidasStr === "NO") return "";

	const trimmed = medidasStr.trim();
	const lowerTrimmed = trimmed.toLowerCase();

	// Check if it's a special dimension to preserve
	if (PRESERVE_DIMENSIONS.some((preserve) => lowerTrimmed.includes(preserve))) {
		return trimmed;
	}

	// Check if it's a word dimension (contains letters beyond "cm", "x", numbers, spaces, periods)
	const hasWordDimension = /[a-zA-Z]/.test(
		trimmed.replace(/cm/gi, "").replace(/x/gi, ""),
	);
	if (hasWordDimension) {
		return trimmed;
	}

	// Already has "cm" suffix - just clean up spacing
	if (/cm\s*$/i.test(trimmed)) {
		return trimmed
			.replace(/\s*x\s*/gi, " x ")
			.replace(/\s*cm\s*$/i, " cm")
			.trim();
	}

	// Add "cm" suffix to numeric dimensions
	// Match patterns like: "80x61", "50 x 35", "46.5x63.5", "60 cm x 50 cm"
	if (/^\d+\.?\d*\s*x\s*\d+\.?\d*/.test(trimmed)) {
		return `${trimmed.replace(/\s*x\s*/gi, " x ").trim()} cm`;
	}

	// Return as-is if we can't parse it
	return trimmed;
}

/**
 * Clean and validate title
 */
function cleanTitle(title: unknown): string | null {
	if (!title) return null;
	const titleStr = String(title);
	if (titleStr === "NO" || titleStr.trim() === "") return null;
	return titleStr.trim();
}

/**
 * Clean and format category (PRACTICA)
 */
function cleanCategory(practica: unknown): string {
	if (!practica) return "";
	const practicaStr = String(practica);
	if (practicaStr === "NO") return "";

	// Normalize to title case
	return practicaStr
		.toLowerCase()
		.split(" ")
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(" ");
}

// ============================================================================
// MAIN TRANSFORMATION
// ============================================================================

function transformData(inputFile: string, outputDir: string): void {
	console.log("📖 Reading Excel file:", inputFile);

	// Read the Excel file
	const workbook = XLSX.readFile(inputFile);
	const sheetName = workbook.SheetNames[0];
	if (!sheetName) {
		throw new Error("No sheets found in Excel file");
	}
	const worksheet = workbook.Sheets[sheetName];
	if (!worksheet) {
		throw new Error(`Worksheet "${sheetName}" not found`);
	}

	// Convert to JSON (only first 8 columns as specified)
	const rawData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

	console.log(`📊 Total rows in Excel: ${rawData.length}`);

	// Track data quality issues
	const issues: DataQualityIssue[] = [];
	const artworks: ArtworkData[] = [];
	const categoriesSet = new Set<string>();
	const apartadosSet = new Set<string>();

	// Transform each row
	rawData.forEach((row, index) => {
		const rowNumber = index + 2; // Excel row number (header is row 1)

		// Filter: Only include entries where participation is "SI"
		const participation = row["¿PARTICIPAS? SI/NO"]
			?.toString()
			.toUpperCase()
			.trim();
		if (participation !== "SI") {
			return; // Skip non-participating entries
		}

		// Clean and validate title
		const title = cleanTitle(row.NOMBRE_OBRA);
		if (!title) {
			issues.push({
				row: rowNumber,
				field: "NOMBRE_OBRA",
				issue: "Missing or invalid title",
				value: row.NOMBRE_OBRA || "N/A",
			});
			return; // Skip entries without valid title
		}

		// Transform fields
		const apartado = normalizeApartado(row.APARTADO);
		const category = cleanCategory(row.PRACTICA);
		const autor = row.ALUMNO ? String(row.ALUMNO).trim() : "";
		const dimensions = formatDimensions(row.MEDIDAS);
		const medium = row.TECNICA ? String(row.TECNICA).trim() : "";
		const notes = row.Columna1 ? String(row.Columna1).trim() : undefined;

		// Generate slug
		const slug = generateSlug(title);

		// Track unique values
		if (apartado) apartadosSet.add(apartado);
		if (category) categoriesSet.add(category);

		// Validate apartado
		if (!apartado || !Object.values(APARTADO_MAPPING).includes(apartado)) {
			issues.push({
				row: rowNumber,
				field: "APARTADO",
				issue: "Unknown apartado value",
				value: row.APARTADO || "N/A",
			});
		}

		// Create artwork object
		const artwork: ArtworkData = {
			title,
			slug,
			autor,
			apartado,
			category,
			dimensions,
			medium,
		};

		// Add notes if present
		if (notes) {
			artwork.notes = notes;
		}

		artworks.push(artwork);
	});

	console.log(`✅ Transformed ${artworks.length} artworks`);
	console.log(`⚠️  Found ${issues.length} data quality issues`);

	// Create output directory if it doesn't exist
	if (!existsSync(outputDir)) {
		mkdirSync(outputDir, { recursive: true });
	}

	// ========================================================================
	// OUTPUT: JSON Array
	// ========================================================================
	const jsonPath = resolve(outputDir, "artworks.json");
	writeFileSync(jsonPath, JSON.stringify(artworks, null, 2));
	console.log(`💾 Saved JSON: ${jsonPath}`);

	// ========================================================================
	// OUTPUT: NDJSON (Newline-Delimited JSON)
	// ========================================================================
	const ndjsonPath = resolve(outputDir, "artworks.ndjson");
	const ndjsonContent = artworks.map((a) => JSON.stringify(a)).join("\n");
	writeFileSync(ndjsonPath, ndjsonContent);
	console.log(`💾 Saved NDJSON: ${ndjsonPath}`);

	// ========================================================================
	// OUTPUT: CSV
	// ========================================================================
	const csvPath = resolve(outputDir, "artworks.csv");
	const csvWorksheet = XLSX.utils.json_to_sheet(artworks);
	const csvContent = XLSX.utils.sheet_to_csv(csvWorksheet);
	writeFileSync(csvPath, csvContent);
	console.log(`💾 Saved CSV: ${csvPath}`);

	// ========================================================================
	// OUTPUT: Categories List
	// ========================================================================
	const categories = Array.from(categoriesSet)
		.sort()
		.map((title) => ({
			title,
			slug: generateSlug(title),
		}));
	const categoriesPath = resolve(outputDir, "categories.json");
	writeFileSync(categoriesPath, JSON.stringify(categories, null, 2));
	console.log(
		`💾 Saved categories list: ${categoriesPath} (${categories.length} unique)`,
	);

	// ========================================================================
	// OUTPUT: Apartados List
	// ========================================================================
	const apartados = Array.from(apartadosSet).sort();
	const apartadosPath = resolve(outputDir, "apartados.json");
	writeFileSync(apartadosPath, JSON.stringify(apartados, null, 2));
	console.log(
		`💾 Saved apartados list: ${apartadosPath} (${apartados.length} unique)`,
	);

	// ========================================================================
	// OUTPUT: Data Quality Report
	// ========================================================================
	if (issues.length > 0) {
		const reportPath = resolve(outputDir, "data-quality-issues.json");
		writeFileSync(reportPath, JSON.stringify(issues, null, 2));
		console.log(`⚠️  Saved data quality report: ${reportPath}`);

		console.log("\n📋 Data Quality Issues:");
		issues.forEach((issue) => {
			console.log(
				`   Row ${issue.row}: ${issue.field} - ${issue.issue} (value: "${issue.value}")`,
			);
		});
	}

	// ========================================================================
	// SUMMARY
	// ========================================================================
	console.log("\n📊 Transformation Summary:");
	console.log(`   Total rows processed: ${rawData.length}`);
	console.log(`   Artworks created: ${artworks.length}`);
	console.log(`   Unique categories: ${categories.length}`);
	console.log(`   Unique apartados: ${apartados.length}`);
	console.log(`   Data quality issues: ${issues.length}`);
	console.log("\n✨ Transformation complete!");
}

// ============================================================================
// CLI EXECUTION
// ============================================================================

const args = process.argv.slice(2);
const inputFile = args[0] || "FICHAS_TECNICAS.xlsx";
const outputDir = args[1] || "data";

console.log("🚀 Starting data transformation...\n");
console.log(`   Input file: ${inputFile}`);
console.log(`   Output directory: ${outputDir}\n`);

try {
	transformData(inputFile, outputDir);
} catch (error) {
	console.error("❌ Error during transformation:", error);
	process.exit(1);
}
