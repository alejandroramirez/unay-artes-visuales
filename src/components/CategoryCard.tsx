"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getGridImageUrl } from "~/sanity/lib/image";
import type { CategoryWithArtwork } from "~/sanity/types";

interface CategoryCardProps {
	category: CategoryWithArtwork;
}

/**
 * CategoryCard component for category grid on homepage
 * Displays category with sample image and text below
 * Shows loading feedback during navigation
 */
export function CategoryCard({ category }: CategoryCardProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [isNavigating, setIsNavigating] = useState(false);

	const handleClick = () => {
		setIsNavigating(true);
		startTransition(() => {
			router.push(`/categoria/${category.slug.current}`);
		});
	};

	const isLoading = isPending || isNavigating;

	// Get image URL if sample image exists
	const imageUrl = category.sampleImage
		? getGridImageUrl(category.sampleImage, 800)
		: null;

	return (
		<div
			onClick={handleClick}
			className={`group relative block cursor-pointer transition-opacity duration-300 hover:opacity-90 ${
				isLoading ? "pointer-events-none opacity-60" : ""
			}`}
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
					{category.title}
				</h3>

				{/* Artwork count */}
				<p className="mt-1 text-sm" style={{ color: "#999999" }}>
					{category.artworkCount}{" "}
					{category.artworkCount === 1 ? "obra" : "obras"}
				</p>
			</div>
		</div>
	);
}
