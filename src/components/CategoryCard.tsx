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
 * Displays category with blurred background image and title overlay
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
			className={`group relative block aspect-square cursor-pointer overflow-hidden rounded-lg bg-neutral-200 transition-all duration-300 hover:scale-[1.02] ${
				isLoading ? "pointer-events-none opacity-60" : ""
			}`}
		>
			{/* Background image (blurred) */}
			{imageUrl && (
				<div className="absolute inset-0">
					<Image
						src={imageUrl}
						alt={category.title}
						fill
						className="object-cover transition-transform duration-500 group-hover:scale-105"
						sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
						loading="lazy"
					/>
					{/* Blur effect */}
					<div className="absolute inset-0 backdrop-blur-md" />
				</div>
			)}

			{/* Dark overlay for text contrast */}
			<div className="absolute inset-0 bg-black/40 transition-colors duration-300 group-hover:bg-black/50" />

			{/* Content */}
			<div className="relative flex h-full flex-col items-center justify-center p-6 text-center">
				<h2 className="font-bold text-2xl text-white drop-shadow-lg sm:text-3xl">
					{category.title}
				</h2>
				<p className="mt-2 text-sm text-white/90 drop-shadow">
					{category.artworkCount}{" "}
					{category.artworkCount === 1 ? "obra" : "obras"}
				</p>
			</div>

			{/* Loading spinner */}
			{isLoading && (
				<div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 backdrop-blur-sm">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
				</div>
			)}
		</div>
	);
}
