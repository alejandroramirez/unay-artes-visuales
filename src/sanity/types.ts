import type { PortableTextBlock } from "next-sanity";
import type { Image } from "sanity";

/**
 * TypeScript types for Sanity CMS schemas
 * These types match the schema definitions in src/sanity/schemaTypes/
 */

export interface Category {
	_id: string;
	_type: "category";
	_createdAt: string;
	_updatedAt: string;
	title: string;
	slug: {
		current: string;
	};
	description?: string;
	thumbnailArtwork?: {
		_ref: string;
		_type: "reference";
	};
	order?: number;
}

export interface Artwork {
	_id: string;
	_type: "artwork";
	_createdAt: string;
	_updatedAt: string;
	title: string;
	slug: {
		current: string;
	};
	image: Image & {
		alt: string;
	};
	description?: PortableTextBlock[];
	autor?: string;
	category?: Category;
	year?: string;
	dimensions?: string;
	medium?: string;
	order?: number;
}

/**
 * Simplified artwork type for gallery grid (without full description)
 */
export interface ArtworkGridItem {
	_id: string;
	_type: "artwork";
	title: string;
	slug: {
		current: string;
	};
	image: Image & {
		alt: string;
	};
	autor?: string;
	category?: {
		_id: string;
		title: string;
		slug: {
			current: string;
		};
	};
	year?: string;
	order?: number;
}

/**
 * Category with artwork count and sample image
 * Used for the homepage category grid
 */
export interface CategoryWithArtwork {
	_id: string;
	title: string;
	slug: {
		current: string;
	};
	description?: string;
	order?: number;
	artworkCount: number;
	sampleImage?: Image & {
		alt: string;
	};
}
