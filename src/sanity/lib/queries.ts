import { groq } from "next-sanity";
import type { Artwork, ArtworkGridItem, Category } from "../types";
import { client } from "./client";

/**
 * GROQ queries for fetching artwork and categories from Sanity CMS
 * These queries are optimized to fetch only the data needed for each use case
 */

// ============================================================================
// ARTWORK QUERIES
// ============================================================================

/**
 * Get all artwork for the gallery grid
 * Returns artwork ordered by manual order field, then by creation date
 */
export async function getAllArtwork(): Promise<ArtworkGridItem[]> {
	return client.fetch<ArtworkGridItem[]>(
		groq`*[_type == "artwork"] | order(order asc, _createdAt desc) {
      _id,
      _type,
      title,
      slug,
      image {
        asset,
        alt
      },
      "category": category->{
        _id,
        title
      },
      year,
      order
    }`,
	);
}

/**
 * Get a single artwork by its slug
 * Returns full artwork details including description for detail view
 */
export async function getArtworkBySlug(slug: string): Promise<Artwork | null> {
	return client.fetch<Artwork | null>(
		groq`*[_type == "artwork" && slug.current == $slug][0] {
      _id,
      _type,
      _createdAt,
      _updatedAt,
      title,
      slug,
      image {
        asset,
        alt
      },
      description,
      "category": category->{
        _id,
        _type,
        _createdAt,
        _updatedAt,
        title,
        slug,
        description,
        order
      },
      year,
      dimensions,
      medium,
      order
    }`,
		{ slug },
	);
}

/**
 * Get all artwork slugs for static path generation
 * Used by Next.js to pre-generate pages at build time
 */
export async function getAllArtworkSlugs(): Promise<string[]> {
	const slugs = await client.fetch<{ slug: { current: string } }[]>(
		groq`*[_type == "artwork" && defined(slug.current)] {
      "slug": slug
    }`,
	);

	return slugs.map((item) => item.slug.current);
}

// ============================================================================
// CATEGORY QUERIES
// ============================================================================

/**
 * Get all categories
 * Returns categories ordered by manual order field, then alphabetically
 */
export async function getAllCategories(): Promise<Category[]> {
	return client.fetch<Category[]>(
		groq`*[_type == "category"] | order(order asc, title asc) {
      _id,
      _type,
      _createdAt,
      _updatedAt,
      title,
      slug,
      description,
      order
    }`,
	);
}
