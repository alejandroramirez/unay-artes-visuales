"use client";

import Image from "next/image";
import { useState } from "react";

interface ArtworkImageViewerProps {
	imageUrl: string;
	alt: string;
	blurDataUrl?: string;
}

/**
 * ArtworkImageViewer component
 * Displays artwork image with loading indicator
 */
export function ArtworkImageViewer({
	imageUrl,
	alt,
	blurDataUrl,
}: ArtworkImageViewerProps) {
	const [isLoading, setIsLoading] = useState(true);

	return (
		<div className="relative aspect-square w-full overflow-hidden lg:col-span-2">
			{/* Loading spinner */}
			{isLoading && (
				<div className="absolute inset-0 z-10 flex items-center justify-center">
					<div className="h-12 w-12 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-600" />
				</div>
			)}

			<Image
				src={imageUrl}
				alt={alt}
				fill
				className="object-contain object-top"
				sizes="(max-width: 1024px) 100vw, 66vw"
				priority
				placeholder={blurDataUrl ? "blur" : "empty"}
				blurDataURL={blurDataUrl}
				onLoad={() => setIsLoading(false)}
			/>
		</div>
	);
}
