"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

interface ArtworkImageViewerProps {
	imageUrl: string;
	alt: string;
	blurDataUrl?: string;
}

/**
 * ArtworkImageViewer component
 * Displays artwork image with click-to-expand full-page view
 * Shows loading indicator while image loads
 */
export function ArtworkImageViewer({
	imageUrl,
	alt,
	blurDataUrl,
}: ArtworkImageViewerProps) {
	const [isFullView, setIsFullView] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isAnimatingIn, setIsAnimatingIn] = useState(false);

	// Trigger animation when full view opens
	useEffect(() => {
		if (isFullView) {
			// Small delay to trigger CSS transition
			requestAnimationFrame(() => {
				setIsAnimatingIn(true);
			});
		} else {
			setIsAnimatingIn(false);
		}
	}, [isFullView]);

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
					className="object-contain"
					sizes="(max-width: 1024px) 100vw, 66vw"
					priority
					placeholder={blurDataUrl ? "blur" : "empty"}
					blurDataURL={blurDataUrl}
					onLoad={() => setIsLoading(false)}
				/>
			</div>

			{/* Full-page view overlay */}
			{isFullView && (
				<div
					className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 transition-opacity duration-300 ${
						isAnimatingIn ? "opacity-100" : "opacity-0"
					}`}
					onClick={() => setIsFullView(false)}
				>
					<div
						className={`relative h-full w-full transition-transform duration-300 ${
							isAnimatingIn ? "scale-100" : "scale-95"
						}`}
					>
						<Image
							src={imageUrl}
							alt={alt}
							fill
							className="object-contain"
							sizes="100vw"
							priority
							placeholder={blurDataUrl ? "blur" : "empty"}
							blurDataURL={blurDataUrl}
						/>
					</div>
				</div>
			)}
		</>
	);
}
