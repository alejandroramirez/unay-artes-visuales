import type { SanityClient } from "@sanity/client";
import { LexoRank } from "lexorank";

/**
 * OrderRank Utility Module
 *
 * Centralized utilities for managing orderRank field values.
 * OrderRank is used by @sanity/orderable-document-list for drag-and-drop ordering.
 *
 * IMPORTANT:
 * - Documents created in Sanity Studio UI automatically get orderRank
 * - Documents created programmatically MUST manually set orderRank
 * - This utility provides helpers for programmatic document creation
 */

export type OrderableDocumentType = "artwork" | "category";

/**
 * Get the last orderRank value for a specific document type
 *
 * @param client - Sanity client instance (must have read permissions)
 * @param type - Document type ("artwork" or "category")
 * @returns Last orderRank string, or null if no documents exist
 */
export async function getLastOrderRank(
	client: SanityClient,
	type: OrderableDocumentType,
): Promise<string | null> {
	const query = `*[_type == $type && defined(orderRank)] | order(orderRank desc)[0].orderRank`;
	return await client.fetch<string | null>(query, { type });
}

/**
 * Generate the next orderRank value for a document type
 *
 * This function:
 * 1. Fetches the last orderRank for the given type
 * 2. Generates the next rank using LexoRank algorithm
 * 3. Returns a string that will sort after all existing documents
 *
 * @param client - Sanity client instance (must have read permissions)
 * @param type - Document type ("artwork" or "category")
 * @returns New orderRank string to assign to the document
 *
 * @example
 * ```typescript
 * const orderRank = await getNextOrderRank(client, "artwork");
 * await client.create({
 *   _type: "artwork",
 *   title: "New Artwork",
 *   orderRank, // Ensures document appears at end of list
 *   // ... other fields
 * });
 * ```
 */
export async function getNextOrderRank(
	client: SanityClient,
	type: OrderableDocumentType,
): Promise<string> {
	const lastOrderRankStr = await getLastOrderRank(client, type);

	let rank: LexoRank;
	if (lastOrderRankStr) {
		// Parse existing rank and generate next
		rank = LexoRank.parse(lastOrderRankStr).genNext();
	} else {
		// No documents exist yet, start from middle
		rank = LexoRank.middle();
	}

	return rank.toString();
}

/**
 * Generate multiple sequential orderRank values
 *
 * Useful for batch document creation. Generates N sequential orderRank values
 * that will place documents at the end of the list in order.
 *
 * @param client - Sanity client instance (must have read permissions)
 * @param type - Document type ("artwork" or "category")
 * @param count - Number of orderRank values to generate
 * @returns Array of orderRank strings
 *
 * @example
 * ```typescript
 * const ranks = await getSequentialOrderRanks(client, "artwork", 3);
 * const docs = artworks.map((artwork, index) => ({
 *   _type: "artwork",
 *   orderRank: ranks[index],
 *   ...artwork
 * }));
 * ```
 */
export async function getSequentialOrderRanks(
	client: SanityClient,
	type: OrderableDocumentType,
	count: number,
): Promise<string[]> {
	if (count <= 0) return [];

	const lastOrderRankStr = await getLastOrderRank(client, type);

	let rank: LexoRank;
	if (lastOrderRankStr) {
		rank = LexoRank.parse(lastOrderRankStr);
	} else {
		rank = LexoRank.min();
	}

	const ranks: string[] = [];
	for (let i = 0; i < count; i++) {
		// Generate next rank with spacing for future insertions
		rank = rank.genNext().genNext();
		ranks.push(rank.toString());
	}

	return ranks;
}

/**
 * Find all documents of a type that are missing orderRank
 *
 * @param client - Sanity client instance (must have read permissions)
 * @param type - Document type to check, or null to check all orderable types
 * @returns Array of documents missing orderRank
 */
export async function findDocumentsMissingOrderRank(
	client: SanityClient,
	type: OrderableDocumentType | null = null,
): Promise<Array<{ _id: string; _type: string; title: string }>> {
	const typeFilter = type
		? `_type == "${type}"`
		: '(_type == "artwork" || _type == "category")';

	const query = `*[${typeFilter} && !defined(orderRank)] {
    _id,
    _type,
    title
  } | order(title asc)`;

	return await client.fetch(query);
}

/**
 * Assign orderRank to a document that's missing it
 *
 * @param client - Sanity client instance (must have write permissions)
 * @param documentId - Document _id to update
 * @param type - Document type
 * @returns The assigned orderRank value
 */
export async function assignOrderRank(
	client: SanityClient,
	documentId: string,
	type: OrderableDocumentType,
): Promise<string> {
	const orderRank = await getNextOrderRank(client, type);

	await client.patch(documentId).set({ orderRank }).commit();

	return orderRank;
}

/**
 * Fix all documents missing orderRank for a specific type
 *
 * @param client - Sanity client instance (must have write permissions)
 * @param type - Document type to fix
 * @returns Number of documents fixed
 */
export async function fixMissingOrderRanks(
	client: SanityClient,
	type: OrderableDocumentType,
): Promise<number> {
	const docs = await findDocumentsMissingOrderRank(client, type);

	if (docs.length === 0) return 0;

	// Generate sequential ranks for all missing documents
	const ranks = await getSequentialOrderRanks(client, type, docs.length);

	// Assign ranks to documents
	for (let i = 0; i < docs.length; i++) {
		const rank = ranks[i];
		const doc = docs[i];
		if (!rank || !doc) continue;

		await client.patch(doc._id).set({ orderRank: rank }).commit();
	}

	return docs.length;
}
