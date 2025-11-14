"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface ArtworkImageViewerProps {
	imageUrl: string;
	alt: string;
}

/**
 * ArtworkImageViewer component
 * Displays artwork image with click-to-expand full-page view
 */
export function ArtworkImageViewer({ imageUrl, alt }: ArtworkImageViewerProps) {
	const [isFullView, setIsFullView] = useState(false);

	// Handle ESC key to close full view
	useEffect(() => {
		if (!isFullView) return;

		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setIsFullView(false);
			}
		};

		document.addEventListener("keydown", handleEscape);
		// Prevent body scroll when full view is open
		document.body.style.overflow = "hidden";

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "";
		};
	}, [isFullView]);

	return (
		<>
			{/* Regular image view */}
			<div
				className="relative aspect-square w-full cursor-zoom-in overflow-hidden rounded-lg bg-neutral-100 lg:col-span-2"
				onClick={() => setIsFullView(true)}
			>
				<Image
					src={imageUrl}
					alt={alt}
					fill
					className="object-contain"
					sizes="(max-width: 1024px) 100vw, 66vw"
					priority
				/>
			</div>

			{/* Full-page view overlay */}
			{isFullView && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
					onClick={() => setIsFullView(false)}
				>
					<div className="relative h-full w-full">
						<Image
							src={imageUrl}
							alt={alt}
							fill
							className="object-contain"
							sizes="100vw"
							priority
						/>
					</div>
				</div>
			)}
		</>
	);
}
