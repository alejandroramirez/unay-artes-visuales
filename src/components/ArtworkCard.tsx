"use client";

import Image from "next/image";
import Link from "next/link";
import { getGridImageUrl } from "~/sanity/lib/image";
import type { ArtworkGridItem } from "~/sanity/types";

interface ArtworkCardProps {
	artwork: ArtworkGridItem;
}

/**
 * ArtworkCard component for gallery grid
 * Displays artwork thumbnail with title and metadata
 * Optimized for performance with Next.js Image and lazy loading
 * Uses Link for instant navigation with prefetching
 */
export function ArtworkCard({ artwork }: ArtworkCardProps) {
	const imageUrl = getGridImageUrl(artwork.image, 800);

	const handleClick = () => {
		// Save current category and scroll position for return navigation
		if (artwork.category) {
			sessionStorage.setItem(
				"artworkReturnCategory",
				artwork.category.slug.current,
			);
			sessionStorage.setItem(
				"artworkReturnCategoryTitle",
				artwork.category.title,
			);
			sessionStorage.setItem(
				"categoryScrollPosition",
				window.scrollY.toString(),
			);
		}
	};

	return (
		<Link
			href={`/obra/${artwork.slug.current}`}
			onClick={handleClick}
			className="group relative block transition-opacity duration-300 hover:opacity-90"
			prefetch={true}
		>
			{/* Image container with aspect ratio */}
			<div className="relative aspect-square w-full overflow-hidden">
				<Image
					src={imageUrl}
					alt={artwork.image.alt}
					fill
					className="object-cover"
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
					loading="lazy"
				/>
			</div>

			{/* Metadata */}
			<div className="pt-3">
				<h3 className="line-clamp-1 text-sm" style={{ color: "#1a1a1a" }}>
					{artwork.title}
				</h3>

				{/* Author */}
				{artwork.autor && (
					<p className="mt-1 text-sm" style={{ color: "#999999" }}>
						{artwork.autor}
					</p>
				)}
			</div>
		</Link>
	);
}
