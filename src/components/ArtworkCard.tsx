"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getGridImageUrl } from "~/sanity/lib/image";
import type { ArtworkGridItem } from "~/sanity/types";

interface ArtworkCardProps {
	artwork: ArtworkGridItem;
}

/**
 * ArtworkCard component for gallery grid
 * Displays artwork thumbnail with title and metadata
 * Optimized for performance with Next.js Image and lazy loading
 * Shows loading feedback during navigation
 */
export function ArtworkCard({ artwork }: ArtworkCardProps) {
	const imageUrl = getGridImageUrl(artwork.image, 800);
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [isNavigating, setIsNavigating] = useState(false);

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

		setIsNavigating(true);
		startTransition(() => {
			router.push(`/obra/${artwork.slug.current}`);
		});
	};

	const isLoading = isPending || isNavigating;

	return (
		<div
			onClick={handleClick}
			className={`group relative block cursor-pointer transition-opacity duration-300 hover:opacity-90 ${
				isLoading ? "pointer-events-none opacity-60" : ""
			}`}
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

				{/* Loading spinner */}
				{isLoading && (
					<div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90">
						<div
							className="h-8 w-8 animate-spin rounded-full border-3 border-t-transparent"
							style={{ borderColor: "#1a1a1a", borderTopColor: "transparent" }}
						/>
					</div>
				)}
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
		</div>
	);
}
