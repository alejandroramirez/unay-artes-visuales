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
		setIsNavigating(true);
		startTransition(() => {
			router.push(`/obra/${artwork.slug.current}`);
		});
	};

	const isLoading = isPending || isNavigating;

	return (
		<div
			onClick={handleClick}
			className={`group relative block cursor-pointer overflow-hidden rounded-lg bg-neutral-100 transition-all duration-300 hover:scale-[1.02] ${
				isLoading ? "pointer-events-none opacity-60" : ""
			}`}
		>
			{/* Image container with aspect ratio */}
			<div className="relative aspect-square w-full overflow-hidden">
				<Image
					src={imageUrl}
					alt={artwork.image.alt}
					fill
					className="object-cover transition-transform duration-500 group-hover:scale-105"
					sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
					loading="lazy"
				/>

				{/* Overlay on hover */}
				<div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />

				{/* Loading spinner */}
				{isLoading && (
					<div className="absolute inset-0 z-10 flex items-center justify-center bg-white/20 backdrop-blur-sm">
						<div className="h-8 w-8 animate-spin rounded-full border-3 border-white/30 border-t-white" />
					</div>
				)}
			</div>

			{/* Metadata */}
			<div className="p-4">
				<h3 className="line-clamp-1 font-medium text-neutral-900">
					{artwork.title}
				</h3>

				{/* Author */}
				{artwork.autor && (
					<p className="mt-1 text-neutral-700 text-sm">{artwork.autor}</p>
				)}

				{/* Category and year */}
				{(artwork.category || artwork.year) && (
					<p className="mt-1 text-neutral-600 text-sm">
						{[artwork.category?.title, artwork.year]
							.filter(Boolean)
							.join(" • ")}
					</p>
				)}
			</div>
		</div>
	);
}
