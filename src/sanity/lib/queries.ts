import { groq } from "next-sanity";
import type { Image } from "sanity";
import type {
	Artwork,
	ArtworkGridItem,
	Category,
	CategoryWithArtwork,
} from "../types";
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
 * Returns artwork ordered by drag-and-drop order (orderRank), then by creation date
 */
export async function getAllArtwork(): Promise<ArtworkGridItem[]> {
	return client.fetch<ArtworkGridItem[]>(
		groq`*[_type == "artwork"] | order(orderRank asc, _createdAt desc) {
      _id,
      _type,
      title,
      slug,
      image {
        asset,
        alt
      },
      autor,
      "category": category->{
        _id,
        title,
        slug
      },
      year,
      order
    }`,
		{},
		{ next: { revalidate: 60 } },
	);
}

/**
 * Get all artwork for printing labels
 * Returns complete artwork information including dimensions and medium
 * Ordered by drag-and-drop order (orderRank), then by creation date
 */
export async function getAllArtworkForLabels(): Promise<
	Omit<Artwork, "description">[]
> {
	return client.fetch<Omit<Artwork, "description">[]>(
		groq`*[_type == "artwork"] | order(orderRank asc, _createdAt desc) {
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
      autor,
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
		{},
		{ cache: "force-cache" },
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
      autor,
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
		{ next: { revalidate: 60 } },
	);
}

/**
 * Get artwork with navigation info (prev/next artworks in same category)
 * Returns current artwork plus all artworks in the category for navigation
 */
export async function getArtworkWithNavigation(slug: string): Promise<{
	artwork: Artwork | null;
	allArtworksInCategory: Array<{
		_id: string;
		slug: { current: string };
		title: string;
		image: Image & { alt: string };
	}>;
} | null> {
	const result = await client.fetch<{
		artwork: Artwork | null;
		allArtworksInCategory: Array<{
			_id: string;
			slug: { current: string };
			title: string;
			image: Image & { alt: string };
		}>;
	} | null>(
		groq`{
      "artwork": *[_type == "artwork" && slug.current == $slug][0] {
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
        autor,
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
      },
      "allArtworksInCategory": *[_type == "artwork" && category._ref == *[_type == "artwork" && slug.current == $slug][0].category._ref] | order(orderRank asc, _createdAt desc) {
        _id,
        slug,
        title,
        image {
          asset,
          alt
        }
      }
    }`,
		{ slug },
		{ next: { revalidate: 60 } },
	);

	return result;
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
 * Returns categories ordered by drag-and-drop order (orderRank), then alphabetically
 */
export async function getAllCategories(): Promise<Category[]> {
	return client.fetch<Category[]>(
		groq`*[_type == "category"] | order(orderRank asc, title asc) {
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

/**
 * Get all categories that have at least one artwork
 * Returns categories with artwork count and the first artwork image (by order)
 * Used for the homepage category grid
 */
export async function getAllCategoriesWithArtwork(): Promise<
	CategoryWithArtwork[]
> {
	return client.fetch<CategoryWithArtwork[]>(
		groq`*[_type == "category"] {
      _id,
      title,
      slug,
      description,
      order,
      orderRank,
      "artworkCount": count(*[_type == "artwork" && references(^._id)]),
      "sampleImage": coalesce(
        thumbnailArtwork->image,
        *[_type == "artwork" && references(^._id)] | order(orderRank asc, _createdAt desc)[0].image
      )
    }[artworkCount > 0] | order(orderRank asc, title asc)`,
		{},
		{ next: { revalidate: 60 } },
	);
}

/**
 * Get all artwork in a specific category by category slug
 * Returns artwork ordered by drag-and-drop order (orderRank), then by creation date
 */
export async function getArtworksByCategory(
	categorySlug: string,
): Promise<ArtworkGridItem[]> {
	return client.fetch<ArtworkGridItem[]>(
		groq`*[_type == "artwork" && category->slug.current == $categorySlug] | order(orderRank asc, _createdAt desc) {
      _id,
      _type,
      title,
      slug,
      image {
        asset,
        alt
      },
      autor,
      "category": category->{
        _id,
        title,
        slug
      },
      year,
      order
    }`,
		{ categorySlug },
		{ next: { revalidate: 60 } },
	);
}

/**
 * Get category by slug
 * Returns full category details
 */
export async function getCategoryBySlug(
	slug: string,
): Promise<Category | null> {
	return client.fetch<Category | null>(
		groq`*[_type == "category" && slug.current == $slug][0] {
      _id,
      _type,
      _createdAt,
      _updatedAt,
      title,
      slug,
      description,
      order
    }`,
		{ slug },
		{ next: { revalidate: 60 } },
	);
}
