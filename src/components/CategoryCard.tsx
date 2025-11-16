"use client";

import Image from "next/image";
import Link from "next/link";
import { getGridImageUrl } from "~/sanity/lib/image";
import type { CategoryWithArtwork } from "~/sanity/types";

interface CategoryCardProps {
	category: CategoryWithArtwork;
}

/**
 * CategoryCard component for category grid on homepage
 * Displays category with sample image and text below
 * Uses Link for instant navigation with prefetching
 */
export function CategoryCard({ category }: CategoryCardProps) {
	// Get image URL if sample image exists
	const imageUrl = category.sampleImage
		? getGridImageUrl(category.sampleImage, 800)
		: null;

	return (
		<Link
			href={`/categoria/${category.slug.current}`}
			className="group relative block transition-opacity duration-300 hover:opacity-90"
			prefetch={true}
		>
			{/* Image container with aspect ratio */}
			<div className="relative aspect-square w-full overflow-hidden">
				{imageUrl ? (
					<Image
						src={imageUrl}
						alt={category.title}
						fill
						className="object-cover"
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
						loading="lazy"
					/>
				) : (
					<div className="absolute inset-0 bg-neutral-100" />
				)}
			</div>

			{/* Metadata */}
			<div className="pt-3">
				<h3 className="line-clamp-1 text-sm" style={{ color: "#1a1a1a" }}>
					{category.title}
				</h3>

				{/* Artwork count */}
				<p className="mt-1 text-sm" style={{ color: "#999999" }}>
					{category.artworkCount}{" "}
					{category.artworkCount === 1 ? "obra" : "obras"}
				</p>
			</div>
		</Link>
	);
}
